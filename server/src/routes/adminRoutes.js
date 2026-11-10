import express from 'express';
import {
  getDashboardStats,
  getAllCards,
  getAllStudents,
  approveCard,
  rejectCard,
  revokeCard,
  reissueCard,
  createAdmin,
  getAllAdmins,
  getCorrectionRequests,
  reviewCorrectionRequest,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';
import { requireOrganization, requireOrgRoles } from '../middleware/organizationAccess.js';

const router = express.Router();

// All admin routes strictly enforce admin role authorization
router.use(protect);
router.use(restrictTo('admin', 'main_admin', 'mid_admin'));
router.use(requireOrganization);

router.get('/stats', getDashboardStats);
router.get('/dashboard-stats', getDashboardStats);
router.get('/cards', getAllCards);
router.get('/students', getAllStudents);
router.get('/corrections', getCorrectionRequests);
router.patch('/corrections/:studentId/:requestId/:action(approve|reject)', reviewCorrectionRequest);
router.patch('/cards/:id/approve', approveCard);
router.patch('/cards/:id/reject', rejectCard);
router.patch('/cards/:id/revoke', revokeCard);
router.post('/cards/:id/reissue', reissueCard);
router.get('/admins', requireOrgRoles('main_admin'), getAllAdmins);
router.post('/create-admin', requireOrgRoles('main_admin'), createAdmin);

export default router;

