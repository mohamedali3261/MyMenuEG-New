import { Router } from 'express';
import { createPayment, handleCallback, getPaymentStatus } from '../controllers/paymentController';
import { authenticateToken } from '../middleware/auth';
const router = Router();
// Public routes
router.post('/callback', handleCallback);
router.get('/status/:orderId', getPaymentStatus);
// Protected routes
router.post('/create', authenticateToken, createPayment);
export default router;
