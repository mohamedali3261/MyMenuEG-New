import { Router } from 'express';
import { getStats } from '../controllers/statController';
import { authenticateToken } from '../middleware/auth';
const router = Router();
router.get('/', authenticateToken, getStats);
export default router;
