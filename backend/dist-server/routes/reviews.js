import { Router } from 'express';
import { getProductReviews, createReview, getAllReviews, updateReviewStatus, deleteReview } from '../controllers/reviewController';
import { authenticateToken, authenticateCustomer } from '../middleware/auth';
import { hasPermission } from '../middleware/permissions';
import { rateLimit } from 'express-rate-limit';
const router = Router();
// Rate limiter for review submissions
const reviewLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 reviews per hour per IP
    message: { error: 'Too many reviews. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
// Public routes
router.get('/product', getProductReviews);
router.post('/', reviewLimiter, authenticateCustomer, createReview);
// Admin routes
router.get('/', authenticateToken, hasPermission('products:read'), getAllReviews);
router.patch('/:id/status', authenticateToken, hasPermission('products:write'), updateReviewStatus);
router.delete('/:id', authenticateToken, hasPermission('products:delete'), deleteReview);
export default router;
