import { Router } from 'express';
import { getCoupons, validateCoupon, upsertCoupon, deleteCoupon } from '../controllers/couponController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public validation
router.post('/validate', validateCoupon);

// Admin routes
router.get('/', authenticateToken, getCoupons);
router.post('/', authenticateToken, upsertCoupon);
router.delete('/:id', authenticateToken, deleteCoupon);

export default router;
