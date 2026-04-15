import { Router } from 'express';
import { getCategories, upsertCategory, deleteCategory } from '../controllers/categoryController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticateToken, upsertCategory);
router.delete('/:id', authenticateToken, deleteCategory);

export default router;
