import prisma from '../lib/prisma';
import { removeFile } from '../utils/fileUtils';
import { getQueryParam } from '../utils/helpers';
import { logAudit } from '../services/auditService';
export const getSlides = async (req, res) => {
    try {
        const page_id = getQueryParam(req.query.page_id);
        const where = {};
        if (page_id) {
            if (page_id === 'home') {
                where.page_id = null;
            }
            else {
                where.page_id = page_id;
            }
        }
        const slides = await prisma.hero_slides.findMany({
            where,
            orderBy: { order_index: 'asc' }
        });
        res.json(slides);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch slides' });
    }
};
export const upsertSlide = async (req, res) => {
    try {
        const input = req.body;
        const slideId = input.id || `SLD-${Date.now()}`;
        const existedBefore = Boolean(input.id && await prisma.hero_slides.findUnique({
            where: { id: String(input.id) },
            select: { id: true }
        }));
        const page_id = input.page_id || null;
        const slide = await prisma.hero_slides.upsert({
            where: { id: slideId },
            create: {
                id: slideId,
                image_url: input.image_url || '',
                title_ar: input.title_ar || '',
                title_en: input.title_en || '',
                subtitle_ar: input.subtitle_ar || '',
                subtitle_en: input.subtitle_en || '',
                btn_text_ar: input.btn_text_ar || '',
                btn_text_en: input.btn_text_en || '',
                btn_link: input.btn_link || '',
                order_index: input.order_index || 0,
                page_id: page_id
            },
            update: {
                image_url: input.image_url || '',
                title_ar: input.title_ar || '',
                title_en: input.title_en || '',
                subtitle_ar: input.subtitle_ar || '',
                subtitle_en: input.subtitle_en || '',
                btn_text_ar: input.btn_text_ar || '',
                btn_text_en: input.btn_text_en || '',
                btn_link: input.btn_link || '',
                order_index: input.order_index || 0,
                page_id: page_id
            }
        });
        await logAudit(existedBefore ? 'update_slide' : 'create_slide', req.user?.username || 'system', `${existedBefore ? 'Updated' : 'Created'} slide: ${slideId}`);
        res.json({ success: true, id: slideId });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save slide' });
    }
};
export const deleteSlide = async (req, res) => {
    try {
        const { id } = req.params;
        const slide = await prisma.hero_slides.findUnique({ where: { id: String(id) } });
        if (slide) {
            removeFile(slide.image_url);
        }
        await prisma.hero_slides.delete({ where: { id: String(id) } });
        await logAudit('delete_slide', req.user?.username || 'system', `Deleted slide: ${String(id)}`);
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete slide' });
    }
};
