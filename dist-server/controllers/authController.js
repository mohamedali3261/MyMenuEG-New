import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
}
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
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        const admin = await prisma.admins.findUnique({
            where: { username }
        });
        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const payload = {
            id: admin.id,
            username: admin.username,
            is_super_admin: !!admin.is_super_admin,
            permissions: safeParsePermissions(admin.permissions)
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
        res.json({
            success: true,
            token,
            user: payload
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch admins' });
    }
};
export const createAdmin = async (req, res) => {
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create admin' });
    }
};
export const updateAdmin = async (req, res) => {
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
        const data = { username };
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update admin' });
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
        await prisma.admins.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete admin' });
    }
};
