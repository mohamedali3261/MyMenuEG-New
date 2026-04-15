import { Router } from 'express';
import { login, logout, refresh } from '../controllers/authController';
import { validateBody } from '../middleware/validate';
import { loginSchema } from '../utils/schemas';

const router = Router();

router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
