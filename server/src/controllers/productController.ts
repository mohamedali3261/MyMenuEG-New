import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { removeFile } from '../utils/fileUtils';
import { logAudit } from '../services/auditService';
import { productSchema } from '../utils/schemas';
import { cacheInvalidateScope, cacheResolveSWR } from '../services/cacheService';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const parsedPage = parseInt(req.query.page as string, 10);
    const parsedLimit = parseInt(req.query.limit as string, 10);
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : 20;
    const category_id = req.query.category_id as string;
    const page_id = req.query.page_id as string;
    const q = String(req.query.q || '').trim();
    const cacheKey = JSON.stringify({
      page,
      limit,
      category_id: category_id || 'all',
      page_id: page_id || 'all',
      q,
    });

    const skip = (page - 1) * limit;

    const where: any = {};
    if (category_id && category_id !== 'all') where.category_id = category_id;
    if (page_id && page_id !== 'all') where.page_id = page_id;
    if (q.length > 0) {
      where.OR = [
        { name_ar: { contains: q } },
        { name_en: { contains: q } },
        { description_ar: { contains: q } }
      ];
    }

    const payload = await cacheResolveSWR(
      'productsList',
      cacheKey,
      async () => {
        const [products, total] = await Promise.all([
          prisma.products.findMany({
            where,
            skip,
            take: limit,
            orderBy: { id: 'desc' },
            include: {
              product_specs: true,
              product_images: true,
              product_quantity_prices: true,
              product_variants: true,
              product_detail_items: {
                orderBy: { order_index: 'asc' }
              },
              categories: true
            }
          }),
          prisma.products.count({ where })
        ]);

        const fullProducts = products.map(p => ({
          ...p,
          cat_name_ar: p.categories?.name_ar,
          cat_name_en: p.categories?.name_en,
          specs: p.product_specs,
          images: p.product_images.map(img => img.url),
          quantity_prices: p.product_quantity_prices,
          variants: p.product_variants,
          detail_items: p.product_detail_items,
        }));

        return JSON.stringify({
          products: fullProducts,
          total,
          pages: Math.ceil(total / limit),
          currentPage: page
        });
      },
      90,
      420
    );

    res.json(JSON.parse(payload));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cacheKey = String(id);
    const payload = await cacheResolveSWR(
      'productById',
      cacheKey,
      async () => {
        const product = await prisma.products.findUnique({
          where: { id: String(id) },
          include: {
            product_specs: true,
            product_images: true,
            product_quantity_prices: true,
            product_variants: true,
            product_detail_items: {
              orderBy: { order_index: 'asc' }
            }
          }
        });

        if (!product) {
          throw new Error('PRODUCT_NOT_FOUND');
        }

        const formatted = {
          ...product,
          specs: product.product_specs,
          images: product.product_images.map((img) => img.url),
          quantity_prices: product.product_quantity_prices,
          variants: product.product_variants,
          detail_items: product.product_detail_items
        };
        return JSON.stringify(formatted);
      },
      120,
      600
    );

    res.json(JSON.parse(payload));
  } catch (err) {
    if (err instanceof Error && err.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ error: 'Product not found' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const upsertProduct = async (req: Request, res: Response) => {
  try {
    const input = productSchema.parse(req.body);
    const productId = input.id || `prod-${Date.now()}`;
    const primaryImage = input.images && input.images.length > 0 ? input.images[0] : '';

    // Simplified upsert using Prisma transaction to handle relations
    await prisma.$transaction(async (tx) => {
      // 1. Delete relations
      await tx.product_specs.deleteMany({ where: { product_id: productId } });
      await tx.product_images.deleteMany({ where: { product_id: productId } });
      await tx.product_quantity_prices.deleteMany({ where: { product_id: productId } });
      await tx.product_variants.deleteMany({ where: { product_id: productId } });
      await tx.product_detail_items.deleteMany({ where: { product_id: productId } });

      // 2. Upsert base product
      await tx.products.upsert({
        where: { id: productId },
        create: {
          id: productId,
          name_ar: input.name_ar,
          name_en: input.name_en,
          description_ar: input.description_ar,
          description_en: input.description_en,
          price: input.price,
          old_price: input.old_price || 0,
          stock: input.stock,
          category_id: input.category_id,
          page_id: input.page_id,
          status: input.status || 'active',
          is_best_seller: !!input.is_best_seller,
          image_url: primaryImage,
          shipping_info_ar: input.shipping_info_ar || '',
          shipping_info_en: input.shipping_info_en || '',
          warranty_info_ar: input.warranty_info_ar || '',
          warranty_info_en: input.warranty_info_en || '',
          carton_details_ar: input.carton_details_ar || '',
          carton_details_en: input.carton_details_en || '',
          brand_ar: input.brand_ar || '',
          brand_en: input.brand_en || '',
          material_ar: input.material_ar || '',
          material_en: input.material_en || '',
          dimensions_ar: input.dimensions_ar || '',
          dimensions_en: input.dimensions_en || '',
          usage_notes_ar: input.usage_notes_ar || '',
          usage_notes_en: input.usage_notes_en || '',
          template_key: input.template_key || '',
          video_url: input.video_url || ''
        },
        update: {
          name_ar: input.name_ar,
          name_en: input.name_en,
          description_ar: input.description_ar,
          description_en: input.description_en,
          price: input.price,
          old_price: input.old_price || 0,
          stock: input.stock,
          category_id: input.category_id,
          page_id: input.page_id,
          status: input.status || 'active',
          is_best_seller: !!input.is_best_seller,
          image_url: primaryImage,
          shipping_info_ar: input.shipping_info_ar || '',
          shipping_info_en: input.shipping_info_en || '',
          warranty_info_ar: input.warranty_info_ar || '',
          warranty_info_en: input.warranty_info_en || '',
          carton_details_ar: input.carton_details_ar || '',
          carton_details_en: input.carton_details_en || '',
          brand_ar: input.brand_ar || '',
          brand_en: input.brand_en || '',
          material_ar: input.material_ar || '',
          material_en: input.material_en || '',
          dimensions_ar: input.dimensions_ar || '',
          dimensions_en: input.dimensions_en || '',
          usage_notes_ar: input.usage_notes_ar || '',
          usage_notes_en: input.usage_notes_en || '',
          template_key: input.template_key || '',
          video_url: input.video_url || ''
        }
      });

      // 3. Re-create relations
      if (input.specs && Array.isArray(input.specs)) {
        await tx.product_specs.createMany({
          data: input.specs.map((s) => ({
            product_id: productId,
            key_ar: s.key_ar,
            key_en: s.key_en,
            val_ar: s.val_ar,
            val_en: s.val_en
          }))
        });
      }

      if (input.images && Array.isArray(input.images)) {
        await tx.product_images.createMany({
          data: input.images.map((img: string) => ({
            product_id: productId,
            url: img
          }))
        });
      }

      if (input.quantity_prices && Array.isArray(input.quantity_prices)) {
        await tx.product_quantity_prices.createMany({
          data: input.quantity_prices.map((qp) => ({
            product_id: productId,
            quantity_label: qp.quantity_label,
            price: qp.price,
            old_price: qp.old_price || 0
          }))
        });
      }

      if (input.variants && Array.isArray(input.variants)) {
        await tx.product_variants.createMany({
          data: input.variants.map((variant) => ({
            product_id: productId,
            label_ar: variant.label_ar || '',
            label_en: variant.label_en || '',
            sku: variant.sku || '',
            price: variant.price,
            old_price: variant.old_price || 0,
            stock: variant.stock || 0,
            is_default: !!variant.is_default,
            image_url: variant.image_url || ''
          }))
        });
      }

      if (input.detail_items && Array.isArray(input.detail_items)) {
        await tx.product_detail_items.createMany({
          data: input.detail_items.map((item, index) => ({
            product_id: productId,
            label_ar: item.label_ar || '',
            label_en: item.label_en || '',
            value_ar: item.value_ar || '',
            value_en: item.value_en || '',
            order_index: item.order_index ?? index
          }))
        });
      }
    });

    await cacheInvalidateScope('productsList');
    await cacheInvalidateScope('productById');
    await cacheInvalidateScope('categories');
    await cacheInvalidateScope('pages');
    await cacheInvalidateScope('pagesBySlug');

    res.json({ success: true, id: productId });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: err.errors.map((e: any) => e.message)
      });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to save product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // 1. Fetch product with images to know what to delete from disk
    const product = await prisma.products.findUnique({
      where: { id: String(id) },
      include: { product_images: true }
    });

    if (product) {
        // Delete primary image
        removeFile(product.image_url);
        // Delete gallery images
        (product as any).product_images.forEach((img: any) => removeFile(img.url));
    }

    // 2. Delete from DB (relations cascade)
    await prisma.products.delete({ where: { id: String(id) } });
    await cacheInvalidateScope('productsList');
    await cacheInvalidateScope('productById');
    await cacheInvalidateScope('categories');
    await cacheInvalidateScope('pages');
    await cacheInvalidateScope('pagesBySlug');
    
    // 3. Log Audit
    await logAudit('delete_product', (req as any).user.username, `Deleted product: ${id}`);
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

export const updateProductStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status?: string };

    if (!status || !['active', 'draft', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const existing = await prisma.products.findUnique({ where: { id: String(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await prisma.products.update({
      where: { id: String(id) },
      data: { status }
    });

    await cacheInvalidateScope('productsList');
    await cacheInvalidateScope('productById');

    await logAudit('update_product_status', (req as any).user.username, `Updated product status: ${id} -> ${status}`);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product status' });
  }
};
