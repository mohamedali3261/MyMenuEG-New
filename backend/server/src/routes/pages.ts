import { Router } from 'express';
import { getPages, getPageBySlug, upsertPage, deletePage, reorderPages, incrementPageView } from '../controllers/pageController';
import { authenticateToken } from '../middleware/auth';
import { hasPermission } from '../middleware/permissions';

const router = Router();

router.get('/', getPages);
router.get('/:slug', getPageBySlug);
router.post('/', authenticateToken, hasPermission('pages:write'), upsertPage);
router.post('/reorder', authenticateToken, hasPermission('pages:write'), reorderPages);
router.post('/:id/view', incrementPageView);
router.delete('/:id', authenticateToken, hasPermission('pages:delete'), deletePage);

export default router;
