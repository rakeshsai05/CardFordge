/**
 * Wrapper for async Express route handlers.
 * Eliminates repetitive try/catch blocks by automatically passing rejections to next(err).
 *
 * @param {Function} fn - Asynchronous controller function
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

