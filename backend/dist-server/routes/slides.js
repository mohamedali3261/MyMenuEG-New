import { Router } from 'express';
import { getSlides, upsertSlide, deleteSlide } from '../controllers/slideController';
import { authenticateToken } from '../middleware/auth';
import { hasPermission } from '../middleware/permissions';
const router = Router();
router.get('/', getSlides);
router.post('/', authenticateToken, hasPermission('slides:write'), upsertSlide);
router.delete('/:id', authenticateToken, hasPermission('slides:delete'), deleteSlide);
export default router;
