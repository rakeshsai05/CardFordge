import multer from 'multer';
import { AppError } from '../utils/customError.js';

// Memory storage keeps the image buffer in memory
const storage = multer.memoryStorage();

// File filter: Only accept JPEG, PNG, or WebP
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (JPEG, PNG, WebP) are permitted for profile avatars.', 400), false);
  }
};

export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter,
});

