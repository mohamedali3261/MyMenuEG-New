import { Router } from 'express';
import { createOrder, trackOrder, checkNewOrders, getAllOrders, updateOrderStatus, deleteOrder } from '../controllers/orderController';
import { authenticateToken } from '../middleware/auth';
import { rateLimit } from 'express-rate-limit';

const router = Router();

const createOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: { error: 'Too many order attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const trackOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  message: { error: 'Too many tracking attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/', createOrderLimiter, createOrder);
router.get('/track/:id', trackOrderLimiter, trackOrder);
router.get('/new-check', trackOrderLimiter, checkNewOrders);

// Admin routes
router.get('/', authenticateToken, getAllOrders);
router.put('/:id/status', authenticateToken, updateOrderStatus);
router.delete('/:id', authenticateToken, deleteOrder);

export default router;
