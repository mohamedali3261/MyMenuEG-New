import { Router } from 'express';
import { authenticateToken, authenticateCustomer } from '../middleware/auth';
import { getAllCustomers, getCustomerDetails, updateCustomer, deleteCustomer, updateMyDelivery, sendNotification, getMyNotifications, markNotificationRead, markAllNotificationsRead, broadcastNotification } from '../controllers/customerController';
import { rateLimit } from 'express-rate-limit';
import { hasPermission } from '../middleware/permissions';

const router = Router();

const customerActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many customer requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.patch('/me/delivery', authenticateCustomer, updateMyDelivery);
router.get('/me/notifications', authenticateCustomer, getMyNotifications);
router.patch('/me/notifications/:notificationId/read', authenticateCustomer, markNotificationRead);
router.patch('/me/notifications/read-all', authenticateCustomer, markAllNotificationsRead);
router.post('/broadcast', authenticateToken, hasPermission('notifications:write'), broadcastNotification);
router.get('/', authenticateToken, hasPermission('customers:read'), getAllCustomers);
router.get('/:id', authenticateToken, hasPermission('customers:read'), getCustomerDetails);
router.post('/:id/notify', authenticateToken, hasPermission('notifications:write'), customerActionLimiter, sendNotification);
router.patch('/:id', authenticateToken, hasPermission('customers:write'), updateCustomer);
router.delete('/:id', authenticateToken, hasPermission('customers:delete'), deleteCustomer);

export default router;
