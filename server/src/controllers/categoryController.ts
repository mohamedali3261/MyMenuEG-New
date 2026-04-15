import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { removeFile } from '../utils/fileUtils';
import { cacheInvalidateScope, cacheResolveSWR } from '../services/cacheService';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
    const parsedPage = parseInt(req.query.page as string, 10);
    const parsedLimit = parseInt(req.query.limit as string, 10);
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : 20;
    const skip = (page - 1) * limit;
    const cacheKey = hasPagination ? `page:${page}:limit:${limit}` : 'all';

    const payload = await cacheResolveSWR(
      'categories',
      cacheKey,
      async () => {
        if (!hasPagination) {
          const categories = await prisma.categories.findMany();
          return JSON.stringify(categories);
        }

        const [categories, total] = await Promise.all([
          prisma.categories.findMany({
            skip,
            take: limit,
            orderBy: { id: 'desc' },
          }),
          prisma.categories.count(),
        ]);

        return JSON.stringify({
          categories,
          total,
          pages: Math.ceil(total / limit),
          currentPage: page,
        });
      },
      120,
      600
    );

    res.json(JSON.parse(payload));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const upsertCategory = async (req: Request, res: Response) => {
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

    await cacheInvalidateScope('categories');

    res.json({ success: true, id: catId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save category' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
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
    await cacheInvalidateScope('categories');
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};
