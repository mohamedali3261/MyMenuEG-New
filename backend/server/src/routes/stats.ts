import { Router } from 'express';
import { getStats, getSidebarCounts } from '../controllers/statController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getStats);
router.get('/sidebar-counts', authenticateToken, getSidebarCounts);

export default router;
