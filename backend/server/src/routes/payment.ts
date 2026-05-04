import { Router } from 'express';
import { createPayment, handleCallback, handleFawryCallback, getPaymentStatus } from '../controllers/paymentController';
import { authenticateToken, authenticateAny } from '../middleware/auth';

const router = Router();

// Public callbacks (secured by Paymob/Fawry signatures internally)
router.post('/callback', handleCallback);
router.post('/callback/fawry', handleFawryCallback);

// Secured routes
router.get('/status/:orderId', authenticateAny, getPaymentStatus);
router.post('/create', authenticateAny, createPayment);

// Admin routes
router.post('/create-admin', authenticateToken, createPayment);

export default router;
