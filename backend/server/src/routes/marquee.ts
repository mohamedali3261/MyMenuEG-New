import { Router } from 'express';
import { getMarqueeLogos, saveMarqueeLogo, deleteMarqueeLogo, getMarqueeSettings, saveMarqueeSettings } from '../controllers/marqueeController';
import { authenticateToken } from '../middleware/auth';
import { hasPermission } from '../middleware/permissions';

const router = Router();

router.get('/', getMarqueeLogos);
router.post('/', authenticateToken, hasPermission('settings:write'), saveMarqueeLogo);
router.delete('/:id', authenticateToken, hasPermission('settings:write'), deleteMarqueeLogo);

router.get('/settings', getMarqueeSettings);
router.post('/settings', authenticateToken, hasPermission('settings:write'), saveMarqueeSettings);

export default router;
