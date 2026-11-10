import { AppError } from '../utils/customError.js';

/**
 * Handles Mongoose CastError (e.g. invalid MongoDB ObjectId).
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid resource identifier: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handles MongoDB duplicate key errors (code 11000).
 */
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const value = err.keyValue ? err.keyValue[field] : '';
  const message = `Duplicate value: '${value}' for ${field}. Please use another value.`;
  return new AppError(message, 409);
};

/**
 * Handles Mongoose Schema validation errors.
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handles JWT verification errors.
 */
const handleJWTError = () =>
  new AppError('Invalid authentication token. Please sign in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your authentication session has expired. Please sign in again.', 401);

/**
 * Global Express Error Handling Middleware.
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err };
  error.message = err.message;
  error.name = err.name;

  // Transform specific database/token errors into friendly AppErrors
  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    return res.status(error.statusCode).json({
      success: false,
      status: error.status,
      message: error.message || err.message,
      stack: err.stack,
      error: err,
    });
  }

  // Production Error Response
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      success: false,
      status: error.status,
      message: error.message,
    });
  }

  // Generic Programming / Unhandled System Bug
  console.error('[UNHANDLED ERROR CRASH]:', err);
  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'An unexpected internal server error occurred.',
  });
};

