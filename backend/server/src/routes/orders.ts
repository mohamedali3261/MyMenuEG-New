import { Router } from 'express';
import { createOrder, trackOrder, checkNewOrders, getAllOrders, updateOrderStatus, deleteOrder, getMyOrders } from '../controllers/orderController';
import { authenticateToken, authenticateCustomer } from '../middleware/auth';
import { rateLimit } from 'express-rate-limit';
import { hasPermission } from '../middleware/permissions';

const router = Router();

const createOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
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

// Customer routes
router.get('/my-orders', authenticateCustomer, getMyOrders);

// Admin routes
router.get('/', authenticateToken, hasPermission('orders:read'), getAllOrders);
router.put('/:id/status', authenticateToken, hasPermission('orders:write'), updateOrderStatus);
router.delete('/:id', authenticateToken, hasPermission('orders:delete'), deleteOrder);

export default router;
