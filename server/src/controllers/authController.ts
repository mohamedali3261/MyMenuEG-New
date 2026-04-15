import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
const ACCESS_TOKEN_TTL = (process.env.ACCESS_TOKEN_TTL || '15m') as SignOptions['expiresIn'];
const REFRESH_TOKEN_TTL = (process.env.REFRESH_TOKEN_TTL || '7d') as SignOptions['expiresIn'];
const isProduction = process.env.NODE_ENV === 'production';
const REFRESH_COOKIE_NAME = 'refresh_token';
const refreshStoreKey = (adminId: string) => `auth_refresh_${adminId}`;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET is required');
}

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
  jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });

const signRefreshToken = (payload: { id: string; username: string }) =>
  jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL });

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

const saveRefreshTokenHash = async (adminId: string, refreshToken: string) => {
  await prisma.settings.upsert({
    where: { key_name: refreshStoreKey(adminId) },
    create: {
      key_name: refreshStoreKey(adminId),
      value: hashToken(refreshToken),
    },
    update: {
      value: hashToken(refreshToken),
    },
  });
};

const getRefreshTokenHash = async (adminId: string) => {
  const record = await prisma.settings.findUnique({
    where: { key_name: refreshStoreKey(adminId) },
  });
  return record?.value || null;
};

const clearRefreshTokenHash = async (adminId: string) => {
  await prisma.settings.deleteMany({
    where: { key_name: refreshStoreKey(adminId) },
  });
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    const admin = await prisma.admins.findUnique({
      where: { username }
    });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const payload = buildPayload(admin);
    const token = signAccessToken(payload);
    const refreshToken = signRefreshToken({ id: admin.id, username: admin.username });
    await saveRefreshTokenHash(admin.id, refreshToken);
    setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      token,
      user: payload
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = parseCookie(req.headers.cookie, REFRESH_COOKIE_NAME);
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: string; username: string };
    const storedHash = await getRefreshTokenHash(decoded.id);

    if (!storedHash || storedHash !== hashToken(refreshToken)) {
      await clearRefreshTokenHash(decoded.id);
      return res.status(401).json({ error: 'Refresh token revoked' });
    }

    const admin = await prisma.admins.findUnique({
      where: { id: decoded.id },
    });

    if (!admin || admin.username !== decoded.username) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const payload = buildPayload(admin);
    const token = signAccessToken(payload);
    const rotatedRefresh = signRefreshToken({ id: admin.id, username: admin.username });
    await saveRefreshTokenHash(admin.id, rotatedRefresh);
    setRefreshCookie(res, rotatedRefresh);

    return res.json({
      success: true,
      token,
      user: payload,
    });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

export const logout = async (_req: Request, res: Response) => {
  const refreshToken = parseCookie(_req.headers.cookie, REFRESH_COOKIE_NAME);
  if (refreshToken) {
    const decoded = jwt.decode(refreshToken) as { id?: string } | null;
    if (decoded?.id) {
      await clearRefreshTokenHash(decoded.id);
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
        permissions: true,
        created_at: true
      },
      orderBy: { created_at: 'desc' }
    });
    
    const formatted = admins.map(a => ({
      ...a,
      permissions: safeParsePermissions(a.permissions)
    }));
    
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
};

export const createAdmin = async (req: any, res: Response) => {
  try {
    if (!req.user.is_super_admin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const { username, password, permissions } = req.body;
    if (typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ error: 'Invalid username' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const exists = await prisma.admins.findUnique({ where: { username } });
    if (exists) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newId = `adm-${Date.now()}`;

    await prisma.admins.create({
      data: {
        id: newId,
        username,
        password: hashedPassword,
        permissions: JSON.stringify(permissions || []),
        is_super_admin: false
      }
    });

    res.json({ success: true, id: newId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create admin' });
  }
};

export const updateAdmin = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { username, password, permissions } = req.body;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid admin id' });
    }
    if (username !== undefined && (typeof username !== 'string' || username.trim().length < 3)) {
      return res.status(400).json({ error: 'Invalid username' });
    }
    if (password !== undefined && (typeof password !== 'string' || password.length < 8)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (permissions !== undefined && !Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Permissions must be an array' });
    }

    if (!req.user.is_super_admin && req.user.id !== id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    if (!req.user.is_super_admin && permissions) {
       return res.status(403).json({ error: 'Sub-admins cannot modify their own permissions' });
    }

    const data: any = { username };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    if (permissions && req.user.is_super_admin) {
      data.permissions = JSON.stringify(permissions);
    }

    await prisma.admins.update({
      where: { id },
      data
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update admin' });
  }
};

export const deleteAdmin = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user.is_super_admin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (id === 'admin-1') {
      return res.status(400).json({ error: 'Cannot delete super admin' });
    }

    await prisma.admins.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete admin' });
  }
};
