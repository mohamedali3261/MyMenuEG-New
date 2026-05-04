import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { logger } from '../utils/logger';
import { validatedJwtSecret, validatedRefreshSecret } from '../middleware/auth';
import { logAudit } from '../services/auditService';
import { resilientRequest } from '../services/resilientHttpService';

const ACCESS_TOKEN_TTL = (process.env.ACCESS_TOKEN_TTL || '15m') as SignOptions['expiresIn'];
const REFRESH_TOKEN_TTL = (process.env.REFRESH_TOKEN_TTL || '7d') as SignOptions['expiresIn'];
const CUSTOMER_ACCESS_TOKEN_TTL = (process.env.CUSTOMER_ACCESS_TOKEN_TTL || '12h') as SignOptions['expiresIn'];
const isProduction = process.env.NODE_ENV === 'production';
const REFRESH_COOKIE_NAME = 'refresh_token';

const safeParsePermissions = (value: string | null) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const parseCookie = (cookieHeader: string | undefined, key: string): string | null => {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';').map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(`${key}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(key.length + 1));
};

const buildPayload = (admin: {
  id: string;
  username: string;
  is_super_admin: boolean | null;
  permissions: string | null;
}) => ({
  id: admin.id,
  username: admin.username,
  is_super_admin: !!admin.is_super_admin,
  permissions: safeParsePermissions(admin.permissions),
});

const signAccessToken = (payload: ReturnType<typeof buildPayload>) =>
  jwt.sign(payload, validatedJwtSecret, { expiresIn: ACCESS_TOKEN_TTL });

const signRefreshToken = (payload: { id: string; username: string }) =>
  jwt.sign(payload, validatedRefreshSecret, { expiresIn: REFRESH_TOKEN_TTL });

const setRefreshCookie = (res: Response, refreshToken: string) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/api/v1/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const hashToken = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

// Calculate expiry date from TTL string (e.g., '7d' -> Date)
const getExpiryDate = (ttl: string): Date => {
  const unit = ttl.slice(-1);
  const value = parseInt(ttl.slice(0, -1));
  const now = new Date();
  
  switch (unit) {
    case 'd': return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
    case 'h': return new Date(now.getTime() + value * 60 * 60 * 1000);
    case 'm': return new Date(now.getTime() + value * 60 * 1000);
    default: return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
};

const saveRefreshToken = async (
  adminId: string, 
  refreshToken: string, 
  req: Request
) => {
  const tokenHash = hashToken(refreshToken);
  const expiresAt = getExpiryDate(REFRESH_TOKEN_TTL as string);
  
  // Delete any existing tokens for this admin (single session per user)
  await prisma.refresh_tokens.deleteMany({
    where: { admin_id: adminId }
  });
  
  await prisma.refresh_tokens.create({
    data: {
      admin_id: adminId,
      token_hash: tokenHash,
      user_agent: req.headers['user-agent']?.substring(0, 500),
      ip_address: req.ip || req.socket.remoteAddress,
      expires_at: expiresAt,
    }
  }).catch((err) => {
    // If unique constraint violation, try to update existing
    if (err.code === 'P2002') {
      return prisma.refresh_tokens.updateMany({
        where: { admin_id: adminId, token_hash: tokenHash },
        data: {
          user_agent: req.headers['user-agent']?.substring(0, 500),
          ip_address: req.ip || req.socket.remoteAddress,
          expires_at: expiresAt,
        }
      });
    }
    throw err;
  });
};

const getRefreshToken = async (adminId: string, tokenHash: string) => {
  return prisma.refresh_tokens.findFirst({
    where: {
      admin_id: adminId,
      token_hash: tokenHash,
      expires_at: { gt: new Date() }
    }
  });
};

const clearRefreshToken = async (adminId: string, tokenHash?: string) => {
  if (tokenHash) {
    await prisma.refresh_tokens.deleteMany({
      where: { admin_id: adminId, token_hash: tokenHash }
    });
  } else {
    await prisma.refresh_tokens.deleteMany({
      where: { admin_id: adminId }
    });
  }
};

// Cleanup expired tokens (can be called periodically)
export const cleanupExpiredTokens = async () => {
  const result = await prisma.refresh_tokens.deleteMany({
    where: { expires_at: { lt: new Date() } }
  });
  logger.info(`Cleaned up ${result.count} expired refresh tokens`);
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, email } = req.body;

    // Plan 0 Hardening: Restrict registration
    const adminCount = await prisma.admins.count();
    const isFirstAdmin = adminCount === 0;
    const actor = (req as any).user;

    if (!isFirstAdmin && (!actor || !actor.is_super_admin)) {
      await logAudit('register_rejected', actor?.username || 'anonymous', 'Unauthorized admin registration attempt');
      return res.status(403).json({ error: 'التسجيل متاح فقط من قبل المسؤول' });
    }

    if (typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ error: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });
    }

    const existsUsername = await prisma.admins.findUnique({ where: { username } });
    if (existsUsername) {
      return res.status(400).json({ error: 'اسم المستخدم مسجل بالفعل' });
    }

    const existsEmail = await prisma.admins.findFirst({ where: { email } });
    if (existsEmail) {
      return res.status(400).json({ error: 'البريد الإلكتروني مسجل بالفعل' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newId = `adm-${Date.now()}`;

    await prisma.admins.create({
      data: {
        id: newId,
        username: username.trim(),
        password: hashedPassword,
        email,
        permissions: JSON.stringify(['orders', 'products', 'categories', 'customers', 'coupons', 'pages', 'slides']),
        is_super_admin: false,
        is_active: true
      }
    });

    logger.info(`New admin registered: ${username}`);

    res.json({ success: true, message: 'تم إنشاء الحساب بنجاح!' });
  } catch (err) {
    logger.error('Registration error:', err);
    res.status(500).json({ error: 'فشل في التسجيل' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    // Support login with either username or email
    const isEmail = username && username.includes('@');
    let admin;
    try {
      admin = isEmail
        ? await prisma.admins.findFirst({ where: { email: username } })
        : await prisma.admins.findUnique({ where: { username } });
    } catch (err) {
      // Fix invalid last_login values
      await prisma.admins.updateMany({
        where: { last_login: { lt: new Date('1900-01-01') } },
        data: { last_login: null }
      });
      admin = isEmail
        ? await prisma.admins.findFirst({ where: { email: username } })
        : await prisma.admins.findUnique({ where: { username } });
    }

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      logger.warn(`Failed login attempt for: ${username}`);
      return res.status(401).json({ error: 'خطأ في اسم المستخدم أو كلمة المرور' });
    }

    if (!admin.is_active) {
      return res.status(401).json({ error: 'الحساب معطل' });
    }

    const payload = buildPayload(admin);
    const token = signAccessToken(payload);
    const refreshToken = signRefreshToken({ id: admin.id, username: admin.username });
    
    await saveRefreshToken(admin.id, refreshToken, req);
    setRefreshCookie(res, refreshToken);

    // Update last login
    await prisma.admins.update({
      where: { id: admin.id },
      data: { last_login: new Date() }
    });

    logger.info(`Admin logged in: ${username}`);

    res.json({
      success: true,
      token,
      user: payload
    });
  } catch (err) {
    logger.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = parseCookie(req.headers.cookie, REFRESH_COOKIE_NAME);
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, validatedRefreshSecret) as { id: string; username: string };
    const tokenHash = hashToken(refreshToken);
    const storedToken = await getRefreshToken(decoded.id, tokenHash);

    if (!storedToken) {
      await clearRefreshToken(decoded.id);
      logger.warn(`Invalid refresh token used for user: ${decoded.id}`);
      return res.status(401).json({ error: 'Refresh token revoked or expired' });
    }

    const admin = await prisma.admins.findUnique({
      where: { id: decoded.id },
    });

    if (!admin || admin.username !== decoded.username) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    if (!admin.is_active) {
      return res.status(401).json({ error: 'Account is disabled' });
    }

    const payload = buildPayload(admin);
    const token = signAccessToken(payload);
    const rotatedRefresh = signRefreshToken({ id: admin.id, username: admin.username });
    
    await saveRefreshToken(admin.id, rotatedRefresh, req);
    setRefreshCookie(res, rotatedRefresh);

    return res.json({
      success: true,
      token,
      user: payload,
    });
  } catch (err) {
    logger.error('Token refresh error:', err);
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = parseCookie(req.headers.cookie, REFRESH_COOKIE_NAME);
  if (refreshToken) {
    const decoded = jwt.decode(refreshToken) as { id?: string } | null;
    if (decoded?.id) {
      await clearRefreshToken(decoded.id, hashToken(refreshToken));
      logger.info(`Admin logged out: ${decoded.id}`);
    }
  }

  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/api/v1/auth',
  });
  res.json({ success: true });
};

export const getAdminById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    // Authorization check: Only super admins or the admin themselves can fetch details
    if (!req.user.is_super_admin && req.user.id !== id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const admin = await prisma.admins.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        is_super_admin: true,
        is_active: true,
        permissions: true,
        created_at: true,
        last_login: true
      }
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({
      ...admin,
      permissions: safeParsePermissions(admin.permissions)
    });
  } catch (err) {
    logger.error('Failed to fetch admin:', err);
    res.status(500).json({ error: 'Failed to fetch admin' });
  }
};

export const getAllAdmins = async (req: any, res: Response) => {
  try {
    if (!req.user.is_super_admin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const admins = await prisma.admins.findMany({
      select: {
        id: true,
        username: true,
        is_super_admin: true,
        is_active: true,
        permissions: true,
        created_at: true
      },
      orderBy: { created_at: 'desc' }
    });
    
    const formatted = admins.map((a: { id: string; username: string; is_super_admin: boolean | null; is_active: boolean | null; permissions: string | null; created_at: Date }) => ({
      ...a,
      permissions: safeParsePermissions(a.permissions)
    }));
    
    res.json(formatted);
  } catch (err) {
    logger.error('Failed to fetch admins:', err);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
};

export const createAdmin = async (req: any, res: Response) => {
  try {
    if (!req.user.is_super_admin) {
      await logAudit('create_admin_rejected', req.user?.username || 'system', 'Unauthorized create admin attempt');
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const { username, password, permissions, email } = req.body;
    
    // Validation
    if (typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const exists = await prisma.admins.findUnique({ where: { username } });
    if (exists) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newId = `adm-${Date.now()}`;

    await prisma.admins.create({
      data: {
        id: newId,
        username: username.trim(),
        password: hashedPassword,
        email: email || null,
        permissions: JSON.stringify(permissions || []),
        is_super_admin: false
      }
    });

    await logAudit(
      'create_admin',
      req.user?.username || 'system',
      `Created admin: ${username.trim()} (${newId})`
    );
    logger.info(`Admin created: ${username} by ${req.user.username}`);

    res.json({ success: true, id: newId });
  } catch (err) {
    logger.error('Failed to create admin:', err);
    res.status(500).json({ error: 'Failed to create admin' });
  }
};

export const updateAdmin = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { username, password, permissions, is_active } = req.body;
    
    // Validation
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid admin id' });
    }
    if (username !== undefined && (typeof username !== 'string' || username.trim().length < 3)) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    if (password !== undefined && (typeof password !== 'string' || password.length < 8)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (permissions !== undefined && !Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Permissions must be an array' });
    }

    if (!req.user.is_super_admin && req.user.id !== id) {
      await logAudit('update_admin_rejected', req.user?.username || 'system', `Unauthorized update attempt for admin ${id}`);
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Check if new username is already taken by another user
    if (username) {
      const existing = await prisma.admins.findFirst({
        where: {
          username,
          id: { not: id }
        }
      });
      if (existing) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    }

    const data: any = {};
    if (username) data.username = username.trim();
    if (password) {
      data.password = await bcrypt.hash(password, 12);
    }
    if (permissions && req.user.is_super_admin) {
      data.permissions = JSON.stringify(permissions);
    }
    if (is_active !== undefined && req.user.is_super_admin) {
      data.is_active = Boolean(is_active);
    }

    await prisma.admins.update({
      where: { id },
      data
    });

    await logAudit(
      'update_admin',
      req.user?.username || 'system',
      `Updated admin: ${id}`
    );
    logger.info(`Admin updated: ${id} by ${req.user.username}`);

    res.json({ success: true });
  } catch (err) {
    logger.error(`Failed to update admin ${req.params.id}`, err);
    res.status(500).json({ error: (err as Error).message || 'Failed to update admin' });
  }
};

export const deleteAdmin = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user.is_super_admin) {
      await logAudit('delete_admin_rejected', req.user?.username || 'system', `Unauthorized delete attempt for admin ${id}`);
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (id === 'admin-1') {
      return res.status(400).json({ error: 'Cannot delete super admin' });
    }
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Delete refresh tokens first
    await prisma.refresh_tokens.deleteMany({ where: { admin_id: id } });
    await prisma.admins.delete({ where: { id } });
    
    await logAudit(
      'delete_admin',
      req.user?.username || 'system',
      `Deleted admin: ${id}`
    );
    logger.info(`Admin deleted: ${id} by ${req.user.username}`);
    res.json({ success: true });
  } catch (err) {
    logger.error('Failed to delete admin:', err);
    res.status(500).json({ error: 'Failed to delete admin' });
  }
};

// --- Google OAuth Login (using tokeninfo endpoint, no library needed) ---
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    // Verify token with Google's public endpoint
    const tokenInfoRes = await resilientRequest<any>({
      service: 'google-oauth',
      method: 'GET',
      url: `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
    });

    if (tokenInfoRes.status < 200 || tokenInfoRes.status >= 300) {
      logger.warn('Invalid Google token');
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const tokenInfo = tokenInfoRes.data as any;

    if (tokenInfo.email_verified !== 'true' && tokenInfo.email_verified !== true) {
      return res.status(401).json({ error: 'Google email not verified' });
    }

    const email = tokenInfo.email as string;
    if (!email) {
      return res.status(401).json({ error: 'No email in Google token' });
    }

    // Find admin by email (only existing admins can log in via Google)
    const admin = await prisma.admins.findFirst({ where: { email } });

    if (!admin) {
      logger.warn(`Google login attempt for unknown email: ${email}`);
      return res.status(401).json({ error: 'No admin account found for this email. Please contact the administrator.' });
    }

    if (!admin.is_active) {
      return res.status(401).json({ error: 'Account is disabled' });
    }

    const payload = buildPayload(admin);
    const token = signAccessToken(payload);
    const refreshToken = signRefreshToken({ id: admin.id, username: admin.username });

    await saveRefreshToken(admin.id, refreshToken, req);
    setRefreshCookie(res, refreshToken);

    // Update last login
    await prisma.admins.update({
      where: { id: admin.id },
      data: { last_login: new Date() }
    });

    logger.info(`Admin logged in via Google: ${admin.username} (${email})`);

    res.json({
      success: true,
      token,
      user: payload
    });
  } catch (err) {
    logger.error('Google login error:', err);
    res.status(500).json({ error: 'Google login failed' });
  }
};

// --- Customer Email/Password Register ---
export const customerRegister = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
    }
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'الاسم مطلوب' });
    }

    const existsEmail = await prisma.customers.findUnique({ where: { email } });
    if (existsEmail) {
      return res.status(400).json({ error: 'البريد الإلكتروني مسجل بالفعل' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const customer = await prisma.customers.create({
      data: {
        email,
        password: hashedPassword,
        name: name.trim(),
      }
    });

    const token = jwt.sign(
      { id: customer.id, email: customer.email, type: 'customer' },
      validatedJwtSecret,
      { expiresIn: CUSTOMER_ACCESS_TOKEN_TTL }
    );

    logger.info(`Customer registered: ${email}`);

    res.json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح!',
      token,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        governorate: customer.governorate,
        city: customer.city,
        address: customer.address,
        avatar: customer.avatar
      }
    });
  } catch (err) {
    logger.error('Customer registration error:', err);
    res.status(500).json({ error: 'فشل في التسجيل' });
  }
};

// --- Customer Email/Password Login ---
export const customerLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
    }

    const customer = await prisma.customers.findUnique({ where: { email } });

    if (!customer || !customer.password) {
      return res.status(401).json({ error: 'خطأ في البريد الإلكتروني أو كلمة المرور' });
    }

    if (customer.is_active === false) {
      return res.status(403).json({ error: 'هذا الحساب معطل. يرجى التواصل مع الإدارة' });
    }

    if (!(await bcrypt.compare(password, customer.password))) {
      return res.status(401).json({ error: 'خطأ في البريد الإلكتروني أو كلمة المرور' });
    }

    const token = jwt.sign(
      { id: customer.id, email: customer.email, type: 'customer' },
      validatedJwtSecret,
      { expiresIn: CUSTOMER_ACCESS_TOKEN_TTL }
    );

    logger.info(`Customer logged in: ${email}`);

    res.json({
      success: true,
      token,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        governorate: customer.governorate,
        city: customer.city,
        address: customer.address,
        avatar: customer.avatar
      }
    });
  } catch (err) {
    logger.error('Customer login error:', err);
    res.status(500).json({ error: 'فشل تسجيل الدخول' });
  }
};

// --- Customer Token Refresh ---
export const customerRefresh = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = (Array.isArray(authHeader) ? authHeader[0] : authHeader)?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    // Verify token (must still be valid)
    let decoded: any;
    try {
      decoded = jwt.verify(token, validatedJwtSecret) as any;
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    if (!decoded || decoded.type !== 'customer') {
      return res.status(401).json({ error: 'Not a customer token' });
    }

    const customer = await prisma.customers.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, phone: true, governorate: true, city: true, address: true, avatar: true, is_active: true }
    });

    if (!customer) {
      return res.status(401).json({ error: 'Customer not found' });
    }

    if (customer.is_active === false) {
      return res.status(403).json({ error: 'هذا الحساب معطل. يرجى التواصل مع الإدارة' });
    }

    const newToken = jwt.sign(
      { id: customer.id, email: customer.email, type: 'customer' },
      validatedJwtSecret,
      { expiresIn: CUSTOMER_ACCESS_TOKEN_TTL }
    );

    return res.json({
      success: true,
      token: newToken,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        governorate: customer.governorate,
        city: customer.city,
        address: customer.address,
        avatar: customer.avatar
      }
    });
  } catch (err) {
    logger.error('Customer refresh error:', err);
    res.status(401).json({ error: 'Refresh failed' });
  }
};

// --- Customer Google Login (no library needed) ---
export const customerGoogleLogin = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    const tokenInfoRes = await resilientRequest<any>({
      service: 'google-oauth',
      method: 'GET',
      url: `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
    });

    if (tokenInfoRes.status < 200 || tokenInfoRes.status >= 300) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const tokenInfo = tokenInfoRes.data as any;

    if (tokenInfo.email_verified !== 'true' && tokenInfo.email_verified !== true) {
      return res.status(401).json({ error: 'Google email not verified' });
    }

    const email = tokenInfo.email as string;
    const name = (tokenInfo.name || email.split('@')[0]) as string;
    const googleId = tokenInfo.sub as string;
    const avatar = tokenInfo.picture as string | undefined;

    if (!email) {
      return res.status(401).json({ error: 'No email in Google token' });
    }

    // Check if Google login is enabled
    const googleEnabledSetting = await prisma.settings.findUnique({ where: { key_name: 'google_login_enabled' } });
    if (!googleEnabledSetting || googleEnabledSetting.value !== 'true') {
      return res.status(403).json({ error: 'Google login is disabled' });
    }

    // Find or create customer
    let customer = await prisma.customers.findFirst({ where: { email } });

    if (customer && customer.is_active === false) {
      return res.status(403).json({ error: 'هذا الحساب معطل. يرجى التواصل مع الإدارة' });
    }

    if (!customer) {
      customer = await prisma.customers.create({
        data: {
          email,
          name,
          google_id: googleId,
          avatar
        }
      });
    } else {
      // Update name/avatar if changed
      if (customer.name !== name || customer.avatar !== avatar) {
        customer = await prisma.customers.update({
          where: { id: customer.id },
          data: { name, avatar, google_id: googleId }
        });
      }
    }

    // Generate JWT token for customer
    const token = jwt.sign(
      { id: customer.id, email: customer.email, type: 'customer' },
      validatedJwtSecret,
      { expiresIn: CUSTOMER_ACCESS_TOKEN_TTL }
    );

    logger.info(`Customer logged in via Google: ${email}`);

    res.json({
      success: true,
      token,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        governorate: customer.governorate,
        city: customer.city,
        address: customer.address,
        avatar: customer.avatar
      }
    });
  } catch (err) {
    logger.error('Customer Google login error:', err);
    res.status(500).json({ error: 'Google login failed' });
  }
};
