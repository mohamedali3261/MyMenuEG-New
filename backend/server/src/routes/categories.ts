import { Router } from 'express';
import { getCategories, upsertCategory, deleteCategory } from '../controllers/categoryController';
import { authenticateToken } from '../middleware/auth';
import { hasPermission } from '../middleware/permissions';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticateToken, hasPermission('categories:write'), upsertCategory);
router.delete('/:id', authenticateToken, hasPermission('categories:delete'), deleteCategory);

export default router;
