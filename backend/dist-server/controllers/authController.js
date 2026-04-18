import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { logger } from '../utils/logger';
import { validatedJwtSecret, validatedRefreshSecret } from '../middleware/auth';
const ACCESS_TOKEN_TTL = (process.env.ACCESS_TOKEN_TTL || '15m');
const REFRESH_TOKEN_TTL = (process.env.REFRESH_TOKEN_TTL || '7d');
const isProduction = process.env.NODE_ENV === 'production';
const REFRESH_COOKIE_NAME = 'refresh_token';
const safeParsePermissions = (value) => {
    if (!value)
        return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
};
const parseCookie = (cookieHeader, key) => {
    if (!cookieHeader)
        return null;
    const parts = cookieHeader.split(';').map((part) => part.trim());
    const match = parts.find((part) => part.startsWith(`${key}=`));
    if (!match)
        return null;
    return decodeURIComponent(match.slice(key.length + 1));
};
const buildPayload = (admin) => ({
    id: admin.id,
    username: admin.username,
    is_super_admin: !!admin.is_super_admin,
    permissions: safeParsePermissions(admin.permissions),
});
const signAccessToken = (payload) => jwt.sign(payload, validatedJwtSecret, { expiresIn: ACCESS_TOKEN_TTL });
const signRefreshToken = (payload) => jwt.sign(payload, validatedRefreshSecret, { expiresIn: REFRESH_TOKEN_TTL });
const setRefreshCookie = (res, refreshToken) => {
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/api/v1/auth',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};
const hashToken = (value) => crypto.createHash('sha256').update(value).digest('hex');
// Calculate expiry date from TTL string (e.g., '7d' -> Date)
const getExpiryDate = (ttl) => {
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
const saveRefreshToken = async (adminId, refreshToken, req) => {
    const tokenHash = hashToken(refreshToken);
    const expiresAt = getExpiryDate(REFRESH_TOKEN_TTL);
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
    });
};
const getRefreshToken = async (adminId, tokenHash) => {
    return prisma.refresh_tokens.findFirst({
        where: {
            admin_id: adminId,
            token_hash: tokenHash,
            expires_at: { gt: new Date() }
        }
    });
};
const clearRefreshToken = async (adminId, tokenHash) => {
    if (tokenHash) {
        await prisma.refresh_tokens.deleteMany({
            where: { admin_id: adminId, token_hash: tokenHash }
        });
    }
    else {
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
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await prisma.admins.findUnique({
            where: { username }
        });
        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            logger.warn(`Failed login attempt for username: ${username}`);
            return res.status(401).json({ error: 'Invalid username or password' });
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
        logger.info(`Admin logged in: ${username}`);
        res.json({
            success: true,
            token,
            user: payload
        });
    }
    catch (err) {
        logger.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
};
export const refresh = async (req, res) => {
    try {
        const refreshToken = parseCookie(req.headers.cookie, REFRESH_COOKIE_NAME);
        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token required' });
        }
        const decoded = jwt.verify(refreshToken, validatedRefreshSecret);
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
    }
    catch (err) {
        logger.error('Token refresh error:', err);
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
};
export const logout = async (req, res) => {
    const refreshToken = parseCookie(req.headers.cookie, REFRESH_COOKIE_NAME);
    if (refreshToken) {
        const decoded = jwt.decode(refreshToken);
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
export const getAdminById = async (req, res) => {
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
    }
    catch (err) {
        logger.error('Failed to fetch admin:', err);
        res.status(500).json({ error: 'Failed to fetch admin' });
    }
};
export const getAllAdmins = async (req, res) => {
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
        const formatted = admins.map((a) => ({
            ...a,
            permissions: safeParsePermissions(a.permissions)
        }));
        res.json(formatted);
    }
    catch (err) {
        logger.error('Failed to fetch admins:', err);
        res.status(500).json({ error: 'Failed to fetch admins' });
    }
};
export const createAdmin = async (req, res) => {
    try {
        if (!req.user.is_super_admin) {
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
        logger.info(`Admin created: ${username} by ${req.user.username}`);
        res.json({ success: true, id: newId });
    }
    catch (err) {
        logger.error('Failed to create admin:', err);
        res.status(500).json({ error: 'Failed to create admin' });
    }
};
export const updateAdmin = async (req, res) => {
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
        const data = {};
        if (username)
            data.username = username.trim();
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
        logger.info(`Admin updated: ${id} by ${req.user.username}`);
        res.json({ success: true });
    }
    catch (err) {
        logger.error(`Failed to update admin ${req.params.id}`, err);
        res.status(500).json({ error: err.message || 'Failed to update admin' });
    }
};
export const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user.is_super_admin) {
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
        logger.info(`Admin deleted: ${id} by ${req.user.username}`);
        res.json({ success: true });
    }
    catch (err) {
        logger.error('Failed to delete admin:', err);
        res.status(500).json({ error: 'Failed to delete admin' });
    }
};
