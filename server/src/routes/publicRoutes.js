import express from 'express';
import { getJoinInfo } from '../controllers/publicController.js';
const router = express.Router();
router.get('/organizations/:code', getJoinInfo);
export default router;
