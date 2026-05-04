import { Router } from 'express';
import { getCoupons, validateCoupon, upsertCoupon, deleteCoupon } from '../controllers/couponController';
import { authenticateToken } from '../middleware/auth';
import { hasPermission } from '../middleware/permissions';

const router = Router();

// Public validation
router.post('/validate', validateCoupon);

// Admin routes
router.get('/', authenticateToken, hasPermission('coupons:read'), getCoupons);
router.post('/', authenticateToken, hasPermission('coupons:write'), upsertCoupon);
router.delete('/:id', authenticateToken, hasPermission('coupons:delete'), deleteCoupon);

export default router;
