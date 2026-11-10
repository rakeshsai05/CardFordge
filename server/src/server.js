import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

// Config & Database
dotenv.config();
import { connectDB } from './config/db.js';
import { seedDefaultAdmin } from './utils/seedAdmin.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { AppError } from './utils/customError.js';

// Route Modules
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import idCardRoutes from './routes/idCardRoutes.js';
import verifyRoutes from './routes/verifyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import platformOwnerRoutes from './routes/platformOwnerRoutes.js';

// Catch uncaught exceptions before doing anything else
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]:', err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. Security HTTP Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. CORS Configuration
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. HTTP Request Logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 4. Rate Limiting (Protects API against brute-force attacks)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Max 300 requests per 15 minutes per IP
  message: {
    success: false,
    message: 'Too many requests received from this IP address. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// 5. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 6. Mount Core API Routes
app.use('/api/health', healthRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/platform-owner', platformOwnerRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/id-cards', idCardRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/admin', adminRoutes);

// 7. Handle Undefined Routes (404)
app.all('*', (req, res, next) => {
  next(new AppError(`The requested endpoint '${req.originalUrl}' does not exist on this server.`, 404));
});

// 8. Centralized Error Handling Middleware
app.use(errorHandler);

// 9. Start Server and Connect Database
const startServer = async () => {
  // Start HTTP Listener immediately
  const server = app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`  CardForge API Server active on PORT: ${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`===================================================`);
  });

  // Seed owner/demo accounts whenever MongoDB first becomes available,
  // including after the connection recovers from a startup DNS/network issue.
  mongoose.connection.on('connected', () => {
    seedDefaultAdmin();
  });
  connectDB();

  // Handle unhandled Promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('[UNHANDLED REJECTION]:', err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();
