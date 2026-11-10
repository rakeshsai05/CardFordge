import express from 'express';
import { getProfile, updateProfile, uploadPhoto } from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';
import { uploadAvatar } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All student routes require valid student role authentication
router.use(protect);
router.use(restrictTo('student', 'general_user'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/photo', uploadAvatar.single('photo'), uploadPhoto);

export default router;

