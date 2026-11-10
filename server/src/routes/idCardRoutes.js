import express from 'express';
import { applyForCard, getMyCard, getAvailableTemplates, bulkGenerateCards } from '../controllers/idCardController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/available-templates', restrictTo('student', 'general_user', 'admin', 'main_admin', 'mid_admin'), getAvailableTemplates);
router.post('/bulk-generate', restrictTo('admin', 'main_admin', 'mid_admin'), bulkGenerateCards);
router.post('/apply', restrictTo('student', 'general_user', 'admin', 'main_admin', 'mid_admin'), applyForCard);
router.get('/my-card', restrictTo('student', 'general_user', 'admin', 'main_admin', 'mid_admin'), getMyCard);

export default router;

