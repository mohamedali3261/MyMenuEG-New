import prisma from '../lib/prisma';
import { cacheInvalidateScope, cacheResolveSWR } from '../services/cacheService';
import { getQueryParam, getQueryInt } from '../utils/helpers';
import { removeFile } from '../utils/fileUtils';
import { logAudit } from '../services/auditService';
export const getPages = async (req, res) => {
    try {
        const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
        const page = getQueryInt(req.query.page, 1, 1);
        const limit = getQueryInt(req.query.limit, 20, 1, 100);
        const skip = (page - 1) * limit;
        const cacheKey = hasPagination ? `page:${page}:limit:${limit}` : 'all';
        const payload = await cacheResolveSWR('pages', cacheKey, async () => {
            if (!hasPagination) {
                const pages = await prisma.store_pages.findMany({
                    orderBy: { order_index: 'asc' }
                });
                return JSON.stringify(pages);
            }
            const [pages, total] = await Promise.all([
                prisma.store_pages.findMany({
                    skip,
                    take: limit,
                    orderBy: { order_index: 'asc' },
                }),
                prisma.store_pages.count(),
            ]);
            return JSON.stringify({
                pages,
                total,
                pagesCount: Math.ceil(total / limit),
                currentPage: page,
            });
        }, 120, 600);
        res.json(JSON.parse(payload));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch pages' });
    }
};
export const getPageBySlug = async (req, res) => {
    try {
        const slug = String(getQueryParam(req.params.slug) || '').trim();
        if (!slug) {
            return res.status(400).json({ error: 'Slug is required' });
        }
        const payload = await cacheResolveSWR('pagesBySlug', slug, async () => {
            const page = await prisma.store_pages.findFirst({
                where: {
                    slug,
                    OR: [{ status: null }, { status: { not: 'draft' } }],
                },
            });
            if (!page) {
                throw new Error('PAGE_NOT_FOUND');
            }
            return JSON.stringify(page);
        }, 120, 600);
        res.json(JSON.parse(payload));
    }
    catch (err) {
        if (err instanceof Error && err.message === 'PAGE_NOT_FOUND') {
            return res.status(404).json({ error: 'Page not found' });
        }
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch page' });
    }
};
export const upsertPage = async (req, res) => {
    try {
        const input = req.body;
        const pageId = input.id || `PAGE-${Date.now()}`;
        const existedBefore = Boolean(input.id && await prisma.store_pages.findUnique({
            where: { id: String(input.id) },
            select: { id: true }
        }));
        let slug = input.slug || '';
        if (!slug) {
            slug = input.name_en.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-');
        }
        const page = await prisma.store_pages.upsert({
            where: { id: pageId },
            create: {
                id: pageId,
                name_ar: input.name_ar,
                name_en: input.name_en,
                slug: slug,
                is_dynamic: input.is_dynamic !== undefined ? !!input.is_dynamic : true,
                show_in_navbar: input.show_in_navbar !== undefined ? !!input.show_in_navbar : true,
                order_index: input.order_index || 0,
                status: input.status || 'active',
                meta_title: input.meta_title || null,
                meta_desc: input.meta_desc || null,
                banner_url: input.banner_url || null,
                banner_size: input.banner_size || 'medium',
                spotlight_product_id: input.spotlight_product_id || null,
                countdown_end_date: input.countdown_end_date ? new Date(input.countdown_end_date) : null,
                show_search: input.show_search !== undefined ? !!input.show_search : false,
                image_url: input.image_url || null
            },
            update: {
                name_ar: input.name_ar,
                name_en: input.name_en,
                slug: slug,
                is_dynamic: input.is_dynamic !== undefined ? !!input.is_dynamic : true,
                show_in_navbar: input.show_in_navbar !== undefined ? !!input.show_in_navbar : true,
                order_index: input.order_index || 0,
                status: input.status || 'active',
                meta_title: input.meta_title || null,
                meta_desc: input.meta_desc || null,
                banner_url: input.banner_url || null,
                banner_size: input.banner_size || 'medium',
                spotlight_product_id: input.spotlight_product_id || null,
                countdown_end_date: input.countdown_end_date ? new Date(input.countdown_end_date) : null,
                show_search: input.show_search !== undefined ? !!input.show_search : false,
                image_url: input.image_url || null
            }
        });
        await cacheInvalidateScope('pages');
        await cacheInvalidateScope('pagesBySlug');
        await logAudit(existedBefore ? 'update_page' : 'create_page', req.user?.username || 'system', `${existedBefore ? 'Updated' : 'Created'} page: ${pageId}`);
        res.json({ success: true, id: pageId });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save page' });
    }
};
export const incrementPageView = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.store_pages.update({
            where: { id: String(id) },
            data: { views: { increment: 1 } }
        });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to increment view' });
    }
};
export const deletePage = async (req, res) => {
    try {
        const { id } = req.params;
        const page = await prisma.store_pages.findUnique({
            where: { id: String(id) },
            select: { banner_url: true }
        });
        if (page?.banner_url) {
            removeFile(page.banner_url);
        }
        await prisma.store_pages.delete({ where: { id: String(id) } });
        await cacheInvalidateScope('pages');
        await cacheInvalidateScope('pagesBySlug');
        await logAudit('delete_page', req.user?.username || 'system', `Deleted page: ${String(id)}`);
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete page' });
    }
};
export const reorderPages = async (req, res) => {
    try {
        const { pages } = req.body; // Expects an array: [{ id: 'PAGE-1', order_index: 0 }, { id: 'PAGE-2', order_index: 1 }]
        if (!Array.isArray(pages)) {
            return res.status(400).json({ error: 'Invalid input' });
        }
        await prisma.$transaction(pages.map((p) => prisma.store_pages.update({
            where: { id: p.id },
            data: { order_index: p.order_index },
        })));
        await cacheInvalidateScope('pages');
        await cacheInvalidateScope('pagesBySlug');
        await logAudit('reorder_pages', req.user?.username || 'system', `Reordered ${pages.length} pages`);
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to reorder pages' });
    }
};
