import { Router } from 'express';
import { getAllAdmins, getAdminById, createAdmin, updateAdmin, deleteAdmin } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { hasPermission } from '../middleware/permissions';

const router = Router();

router.use(authenticateToken);

router.get('/', hasPermission('admins:read'), getAllAdmins);
router.get('/:id', hasPermission('admins:read'), getAdminById);
router.post('/', hasPermission('admins:write'), createAdmin);
router.put('/:id', hasPermission('admins:write'), updateAdmin);
router.delete('/:id', hasPermission('admins:delete'), deleteAdmin);

export default router;
