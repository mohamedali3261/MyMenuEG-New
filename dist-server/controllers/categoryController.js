import prisma from '../lib/prisma';
import { removeFile } from '../utils/fileUtils';
export const getCategories = async (req, res) => {
    try {
        const categories = await prisma.categories.findMany();
        res.json(categories);
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
        // Check if category has icon to delete
        const category = await prisma.categories.findUnique({
            where: { id: String(id) },
            select: { icon: true }
        });
        if (category && category.icon) {
            removeFile(category.icon);
        }
        await prisma.categories.delete({ where: { id: String(id) } });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete category' });
    }
};
