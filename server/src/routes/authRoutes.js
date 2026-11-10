import express from 'express';
import mongoose from 'mongoose';
import { register, registerAdmin, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Avoid Mongoose's long buffering timeout and return a useful setup message.
router.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is temporarily unavailable. Check /api/health and the MongoDB Atlas IP access list, then retry sign-in.',
    });
  }
  next();
});

router.post('/register', register);
router.post('/register-admin', registerAdmin);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;

