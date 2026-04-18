import prisma from '../lib/prisma';
import { cacheSetSWR } from './cacheService';
import { logger } from '../utils/logger';
export const warmupCache = async () => {
    try {
        // Main lists frequently hit on home/admin startup
        const [pages, categories, products, totalProducts] = await Promise.all([
            prisma.store_pages.findMany({ orderBy: { order_index: 'asc' } }),
            prisma.categories.findMany(),
            prisma.products.findMany({
                take: 20,
                orderBy: { id: 'desc' },
                include: {
                    product_specs: true,
                    product_images: true,
                    product_quantity_prices: true,
                    product_variants: true,
                    product_detail_items: { orderBy: { order_index: 'asc' } },
                    categories: true,
                },
            }),
            prisma.products.count(),
        ]);
        await cacheSetSWR('pages', 'all', JSON.stringify(pages), 120, 600);
        await cacheSetSWR('categories', 'all', JSON.stringify(categories), 120, 600);
        const productsPayload = {
            products: products.map((p) => ({
                ...p,
                cat_name_ar: p.categories?.name_ar,
                cat_name_en: p.categories?.name_en,
                specs: p.product_specs,
                images: p.product_images.map((img) => img.url),
                quantity_prices: p.product_quantity_prices,
                variants: p.product_variants,
                detail_items: p.product_detail_items,
            })),
            total: totalProducts,
            pages: Math.ceil(totalProducts / 20),
            currentPage: 1,
        };
        const productsKey = JSON.stringify({
            page: 1,
            limit: 20,
            category_id: 'all',
            page_id: 'all',
            q: '',
        });
        await cacheSetSWR('productsList', productsKey, JSON.stringify(productsPayload), 90, 420);
        logger.info('Cache warmup completed');
    }
    catch (err) {
        logger.warn(`Cache warmup skipped: ${String(err)}`);
    }
};
let warmupInterval = null;
export const startPeriodicWarmup = (intervalMs) => {
    if (intervalMs <= 0)
        return;
    if (warmupInterval)
        return;
    warmupInterval = setInterval(() => {
        void warmupCache();
    }, intervalMs);
    logger.info(`Periodic cache warmup enabled every ${intervalMs}ms`);
};
export const stopPeriodicWarmup = () => {
    if (!warmupInterval)
        return;
    clearInterval(warmupInterval);
    warmupInterval = null;
};
