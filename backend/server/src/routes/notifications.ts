import { Router } from 'express';
import { getCustomerNotifications, markAsRead } from '../controllers/notificationController';
import { rateLimit } from 'express-rate-limit';

const router = Router();

const notificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  message: { error: 'Too many notification requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/customer', notificationLimiter, getCustomerNotifications);
router.put('/read', notificationLimiter, markAsRead);

export default router;
