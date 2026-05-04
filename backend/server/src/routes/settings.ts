import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingController';
import { authenticateToken } from '../middleware/auth';
import { hasPermission } from '../middleware/permissions';

const router = Router();

router.get('/', getSettings);
router.post('/', authenticateToken, hasPermission('settings:write'), updateSettings);

export default router;
