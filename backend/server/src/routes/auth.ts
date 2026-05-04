import { Router } from 'express';
import { login, logout, refresh, googleLogin, customerGoogleLogin, customerRegister, customerLogin, customerRefresh, register } from '../controllers/authController';
import { validateBody } from '../middleware/validate';
import { loginSchema } from '../utils/schemas';
import { optionalAuthenticateToken } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

router.post('/register', optionalAuthenticateToken, register);
router.post('/login', validateBody(loginSchema), login);
router.post('/google', googleLogin);
router.post('/customer/register', customerRegister);
router.post('/customer/login', customerLogin);
router.post('/customer/google', customerGoogleLogin);
router.post('/customer/refresh', customerRefresh);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Public auth settings (for login page to know if Google is enabled)
router.get('/settings', async (req, res) => {
  try {
    const googleEnabled = await prisma.settings.findUnique({ where: { key_name: 'google_login_enabled' } });
    const googleClientId = await prisma.settings.findUnique({ where: { key_name: 'google_client_id' } });
    res.json({
      google_login_enabled: googleEnabled?.value === 'true',
      google_client_id: googleClientId?.value || ''
    });
  } catch {
    res.json({ google_login_enabled: false, google_client_id: '' });
  }
});

export default router;
