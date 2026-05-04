import { Router } from 'express';
import { getSvgMarquee, saveSvgMarquee, createSvgMarqueeItem, updateSvgMarqueeItem, deleteSvgMarqueeItem } from '../controllers/svgMarqueeController';
import { authenticateToken } from '../middleware/auth';
import { hasPermission } from '../middleware/permissions';

const router = Router();

router.get('/', getSvgMarquee);
router.post('/', authenticateToken, hasPermission('settings:write'), saveSvgMarquee);

router.post('/items', authenticateToken, hasPermission('settings:write'), createSvgMarqueeItem);
router.put('/items/:id', authenticateToken, hasPermission('settings:write'), updateSvgMarqueeItem);
router.delete('/items/:id', authenticateToken, hasPermission('settings:write'), deleteSvgMarqueeItem);

export default router;
