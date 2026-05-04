import prisma from '../lib/prisma';
import { removeFile, removeDirectory } from '../utils/fileUtils';
import { cacheInvalidateScope, cacheResolveSWR } from '../services/cacheService';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logAudit } from '../services/auditService';
const __cfname = fileURLToPath(import.meta.url);
const __cdirname = path.dirname(__cfname);
/** Convert a name to a safe folder name: lowercase, spaces → hyphens, strip non-ascii */
export const toFolderName = (name) => name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '').slice(0, 60) || 'unnamed';
const UPLOADS_BASE = path.join(__cdirname, '../../../../uploads/products');
import { getQueryInt } from '../utils/helpers';
export const getCategories = async (req, res) => {
    try {
        const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
        const page = getQueryInt(req.query.page, 1, 1);
        const limit = getQueryInt(req.query.limit, 20, 1, 100);
        const skip = (page - 1) * limit;
        const cacheKey = hasPagination ? `page:${page}:limit:${limit}` : 'all';
        const payload = await cacheResolveSWR('categories', cacheKey, async () => {
            if (!hasPagination) {
                const categories = await prisma.categories.findMany({
                    select: {
                        id: true,
                        name_ar: true,
                        name_en: true,
                        icon: true,
                        status: true
                    }
                });
                return JSON.stringify(categories);
            }
            const [categories, total] = await Promise.all([
                prisma.categories.findMany({
                    skip,
                    take: limit,
                    orderBy: { id: 'desc' },
                    select: {
                        id: true,
                        name_ar: true,
                        name_en: true,
                        icon: true,
                        status: true,
                        subtitle_ar: true,
                        subtitle_en: true
                    }
                }),
                prisma.categories.count(),
            ]);
            return JSON.stringify({
                categories,
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
            });
        }, 120, 600);
        res.json(JSON.parse(payload));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};
export const upsertCategory = async (req, res) => {
    try {
        const input = req.body;
        const catId = input.id || `CAT-${Date.now()}`;
        const existedBefore = Boolean(input.id && await prisma.categories.findUnique({
            where: { id: String(input.id) },
            select: { id: true }
        }));
        const category = await prisma.categories.upsert({
            where: { id: catId },
            create: {
                id: catId,
                name_ar: input.name_ar,
                name_en: input.name_en,
                subtitle_ar: input.subtitle_ar,
                subtitle_en: input.subtitle_en,
                icon: input.icon || 'Package',
                status: input.status || 'active'
            },
            update: {
                name_ar: input.name_ar,
                name_en: input.name_en,
                subtitle_ar: input.subtitle_ar,
                subtitle_en: input.subtitle_en,
                icon: input.icon || 'Package',
                status: input.status || 'active'
            }
        });
        await cacheInvalidateScope('categories');
        // Auto-create uploads folder for this category
        const folderName = toFolderName(input.name_en || input.name_ar || catId);
        const categoryDir = path.join(UPLOADS_BASE, folderName);
        await fs.promises.mkdir(categoryDir, { recursive: true });
        await logAudit(existedBefore ? 'update_category' : 'create_category', req.user?.username || 'system', `${existedBefore ? 'Updated' : 'Created'} category: ${catId}`);
        res.json({ success: true, id: catId });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save category' });
    }
};
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        // Fetch category details to know the folder name
        const category = await prisma.categories.findUnique({
            where: { id: String(id) },
            select: { icon: true, name_en: true, name_ar: true }
        });
        if (category && category.icon) {
            removeFile(category.icon);
        }
        // Delete all product images that belong to this category
        const products = await prisma.products.findMany({
            where: { category_id: String(id) },
            include: { product_images: true, product_variants: true }
        });
        for (const product of products) {
            removeFile(product.image_url);
            product.product_images.forEach((img) => removeFile(img.url));
            product.product_variants.forEach((v) => removeFile(v.image_url));
        }
        // Delete the category's upload folder
        if (category) {
            const folderName = toFolderName(category.name_en || category.name_ar || String(id));
            await removeDirectory(`products/${folderName}`);
        }
        await prisma.categories.delete({ where: { id: String(id) } });
        await cacheInvalidateScope('categories');
        await logAudit('delete_category', req.user?.username || 'system', `Deleted category: ${String(id)}`);
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete category' });
    }
};
