import prisma from '../lib/prisma';
export const getPages = async (req, res) => {
    try {
        const pages = await prisma.store_pages.findMany({
            orderBy: { order_index: 'asc' }
        });
        res.json(pages);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch pages' });
    }
};
export const getPageBySlug = async (req, res) => {
    try {
        const slug = String(req.params.slug || '').trim();
        if (!slug) {
            return res.status(400).json({ error: 'Slug is required' });
        }
        const page = await prisma.store_pages.findFirst({
            where: {
                slug,
                OR: [{ status: null }, { status: { not: 'draft' } }],
            },
        });
        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }
        res.json(page);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch page' });
    }
};
export const upsertPage = async (req, res) => {
    try {
        const input = req.body;
        const pageId = input.id || `PAGE-${Date.now()}`;
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
                meta_desc: input.meta_desc || null
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
                meta_desc: input.meta_desc || null
            }
        });
        res.json({ success: true, id: pageId });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save page' });
    }
};
export const deletePage = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.store_pages.delete({ where: { id: String(id) } });
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
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to reorder pages' });
    }
};
