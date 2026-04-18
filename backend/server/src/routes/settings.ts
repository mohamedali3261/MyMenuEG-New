import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', getSettings);
router.post('/', authenticateToken, updateSettings);

export default router;
