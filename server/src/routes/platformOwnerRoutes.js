import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';
import { listOrganizations, setOrganizationStatus } from '../controllers/platformOwnerController.js';

const router = express.Router();
router.use(protect, restrictTo('platform_owner'));
router.get('/organizations', listOrganizations);
router.patch('/organizations/:id/status', setOrganizationStatus);
export default router;
