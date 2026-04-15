import { Router } from 'express';
import { getAllAdmins, createAdmin, updateAdmin, deleteAdmin } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getAllAdmins);
router.post('/', createAdmin);
router.put('/:id', updateAdmin);
router.delete('/:id', deleteAdmin);

export default router;
