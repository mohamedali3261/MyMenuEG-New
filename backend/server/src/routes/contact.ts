import { Router } from 'express';
import { submitContact, getContacts, updateContactStatus } from '../controllers/contactController';
import { authenticateToken } from '../middleware/auth';
import { hasPermission } from '../middleware/permissions';
import { rateLimit } from 'express-rate-limit';

const router = Router();

// Rate limiter for contact form (prevent spam)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 submissions per hour per IP
  message: { error: 'Too many submissions. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public route - submit contact form
router.post('/', contactLimiter, submitContact);

// Admin routes - require authentication
router.get('/', authenticateToken, hasPermission('customers:read'), getContacts);
router.patch('/:id/status', authenticateToken, hasPermission('customers:write'), updateContactStatus);

export default router;
