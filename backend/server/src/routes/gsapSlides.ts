import { Router } from 'express';
import { getGsapSlides, saveGsapSlides, deleteGsapSlide } from '../controllers/gsapSliderController';
import { authenticateToken } from '../middleware/auth';
import { hasPermission } from '../middleware/permissions';

const router = Router();

router.get('/', getGsapSlides);
router.post('/', authenticateToken, hasPermission('settings:write'), saveGsapSlides);
router.delete('/:id', authenticateToken, hasPermission('settings:write'), deleteGsapSlide);

export default router;
