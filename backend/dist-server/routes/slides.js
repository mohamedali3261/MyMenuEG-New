import { Router } from 'express';
import { getSlides, upsertSlide, deleteSlide } from '../controllers/slideController';
import { authenticateToken } from '../middleware/auth';
const router = Router();
router.get('/', getSlides);
router.post('/', authenticateToken, upsertSlide);
router.delete('/:id', authenticateToken, deleteSlide);
export default router;
