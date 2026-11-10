import express from 'express';
import { verifyCard, logGateTap } from '../controllers/verifyController.js';

const router = express.Router();

// Public Edge Verification Route (Zero Auth Required)
router.get('/:verificationId', verifyCard);

// Smart Gate Tap NFC Check-in
router.post('/:verificationId/gate-tap', logGateTap);

export default router;

