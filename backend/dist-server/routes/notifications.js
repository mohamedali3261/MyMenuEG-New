import { Router } from 'express';
import { getCustomerNotifications, markAsRead } from '../controllers/notificationController';
import { rateLimit } from 'express-rate-limit';
import { authenticateCustomer } from '../middleware/auth';
const router = Router();
const notificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 120,
    message: { error: 'Too many notification requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
router.post('/customer', authenticateCustomer, notificationLimiter, getCustomerNotifications);
router.put('/read', authenticateCustomer, notificationLimiter, markAsRead);
export default router;
