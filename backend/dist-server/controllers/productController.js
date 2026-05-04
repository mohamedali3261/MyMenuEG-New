import prisma from '../lib/prisma';
import { removeFile } from '../utils/fileUtils';
import { logAudit } from '../services/auditService';
import { productSchema } from '../utils/schemas';
import { cacheInvalidateScope, cacheResolveSWR } from '../services/cacheService';
import { getQueryParam, getQueryInt } from '../utils/helpers';
export const getProducts = async (req, res) => {
    try {
        const page = getQueryInt(req.query.page, 1, 1);
        const limit = getQueryInt(req.query.limit, 20, 1, 100);
        const category_id = getQueryParam(req.query.category_id);
        const page_id = getQueryParam(req.query.page_id);
        const q = String(getQueryParam(req.query.q) || '').trim();
        const cacheKey = JSON.stringify({
            page,
            limit,
            category_id: category_id || 'all',
            page_id: page_id || 'all',
            q,
        });
        const skip = (page - 1) * limit;
        const where = {};
        if (category_id && category_id !== 'all')
            where.category_id = category_id;
        if (page_id && page_id !== 'all')
            where.page_id = page_id;
        if (q.length > 0) {
            where.OR = [
                { name_ar: { contains: q } },
                { name_en: { contains: q } },
                { description_ar: { contains: q } },
                { description_en: { contains: q } }
            ];
        }
        const payload = await cacheResolveSWR('productsList', cacheKey, async () => {
            const [products, total] = await Promise.all([
                prisma.products.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { created_at: 'desc' },
                    select: {
                        id: true,
                        name_ar: true,
                        name_en: true,
                        price: true,
                        old_price: true,
                        image_url: true,
                        category_id: true,
                        status: true,
                        stock: true,
                        is_best_seller: true,
                        categories: {
                            select: {
                                name_ar: true,
                                name_en: true
                            }
                        },
                        product_variants: {
                            take: 1, // Only need first variant for fallback image
                            include: {
                                product_variant_images: true
                            }
                        }
                    }
                }),
                prisma.products.count({ where })
            ]);
            const fullProducts = products.map((p) => {
                const variants = p.product_variants.map((v) => ({
                    ...v,
                    images: v.product_variant_images?.map((img) => img.url) || []
                }));
                // Image Fallback Logic
                let finalImageUrl = p.image_url;
                if (!finalImageUrl && variants.length > 0) {
                    const firstVariantWithImages = variants.find((v) => v.images && v.images.length > 0);
                    if (firstVariantWithImages) {
                        finalImageUrl = firstVariantWithImages.images[0];
                    }
                    else if (variants[0].image_url) {
                        finalImageUrl = variants[0].image_url;
                    }
                }
                return {
                    id: p.id,
                    name_ar: p.name_ar,
                    name_en: p.name_en,
                    price: p.price,
                    old_price: p.old_price,
                    image_url: finalImageUrl,
                    status: p.status,
                    stock: p.stock,
                    is_best_seller: p.is_best_seller,
                    category_id: p.category_id,
                    cat_name_ar: p.categories?.name_ar,
                    cat_name_en: p.categories?.name_en
                };
            });
            return JSON.stringify({
                products: fullProducts,
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            });
        }, 90, 420);
        res.json(JSON.parse(payload));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = String(id);
        const payload = await cacheResolveSWR('productById', cacheKey, async () => {
            const product = await prisma.products.findUnique({
                where: { id: String(id) },
                include: {
                    product_specs: true,
                    product_images: true,
                    product_quantity_prices: true,
                    product_variants: {
                        include: {
                            product_variant_images: true
                        }
                    },
                    product_detail_items: {
                        orderBy: { order_index: 'asc' }
                    },
                    product_faqs: {
                        orderBy: { order_index: 'asc' }
                    },
                    fbt_main: {
                        include: {
                            related_product: true
                        }
                    },
                    bundle_parent: {
                        include: {
                            linked_product: true
                        }
                    },
                    categories: true
                }
            });
            if (!product) {
                throw new Error('PRODUCT_NOT_FOUND');
            }
            const variants = product.product_variants.map((v) => ({
                ...v,
                images: v.product_variant_images.map((img) => img.url)
            }));
            // Image Fallback Logic
            let finalImageUrl = product.image_url;
            if (!finalImageUrl && variants.length > 0) {
                const firstVariantWithImages = variants.find((v) => v.images && v.images.length > 0);
                if (firstVariantWithImages) {
                    finalImageUrl = firstVariantWithImages.images[0];
                }
                else if (variants[0].image_url) {
                    finalImageUrl = variants[0].image_url;
                }
            }
            const formatted = {
                ...product,
                image_url: finalImageUrl,
                cat_name_ar: product.categories?.name_ar,
                cat_name_en: product.categories?.name_en,
                specs: product.product_specs,
                images: product.product_images.map((img) => img.url || ''),
                quantity_prices: product.product_quantity_prices,
                variants,
                detail_items: product.product_detail_items,
                faqs: product.product_faqs,
                fbt_products: product.fbt_main?.map((fbt) => fbt.related_product).filter(Boolean) || [],
                bundle_items: product.bundle_parent?.map((b) => ({
                    product_id: b.product_id,
                    quantity: b.quantity,
                    discount: b.discount || 0,
                    product: b.linked_product
                })) || []
            };
            return JSON.stringify(formatted);
        }, 120, 600);
        res.json(JSON.parse(payload));
    }
    catch (err) {
        if (err instanceof Error && err.message === 'PRODUCT_NOT_FOUND') {
            return res.status(404).json({ error: 'Product not found' });
        }
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};
export const upsertProduct = async (req, res) => {
    try {
        const input = productSchema.parse(req.body);
        const productId = input.id || `prod-${Date.now()}`;
        const primaryImage = input.images && input.images.length > 0 ? input.images[0] : '';
        const existedBefore = Boolean(input.id && await prisma.products.findUnique({
            where: { id: String(input.id) },
            select: { id: true }
        }));
        // Simplified upsert using Prisma transaction to handle relations
        await prisma.$transaction(async (tx) => {
            // 1. Delete relations
            await tx.product_specs.deleteMany({ where: { product_id: productId } });
            await tx.product_images.deleteMany({ where: { product_id: productId } });
            await tx.product_quantity_prices.deleteMany({ where: { product_id: productId } });
            await tx.product_variants.deleteMany({ where: { product_id: productId } });
            await tx.product_detail_items.deleteMany({ where: { product_id: productId } });
            await tx.product_faqs.deleteMany({ where: { product_id: productId } });
            await tx.product_fbt.deleteMany({ where: { product_id: productId } });
            await tx.product_bundle_items.deleteMany({ where: { bundle_id: productId } });
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
                    video_url: input.video_url || '',
                    allow_custom_print: !!input.allow_custom_print
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
                    video_url: input.video_url || '',
                    allow_custom_print: !!input.allow_custom_print
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
                    data: input.images.map((img) => ({
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
                for (const variant of input.variants) {
                    const createdVariant = await tx.product_variants.create({
                        data: {
                            product_id: productId,
                            label_ar: variant.label_ar || '',
                            label_en: variant.label_en || '',
                            sku: variant.sku || '',
                            price: variant.price,
                            old_price: variant.old_price || 0,
                            stock: variant.stock || 0,
                            is_default: !!variant.is_default,
                            image_url: variant.image_url || (variant.images && variant.images.length > 0 ? variant.images[0] : ''),
                            option_group: variant.option_group || '',
                            color_value: variant.color_value || '',
                            size_value: variant.size_value || '',
                            color_ar: variant.color_ar || '',
                            color_en: variant.color_en || '',
                            size_ar: variant.size_ar || '',
                            size_en: variant.size_en || '',
                            swatch_value: variant.swatch_value || '',
                            sort_order: variant.sort_order || 0
                        }
                    });
                    if (variant.images && Array.isArray(variant.images)) {
                        await tx.product_variant_images.createMany({
                            data: variant.images.map((img) => ({
                                variant_id: createdVariant.id,
                                url: img
                            }))
                        });
                    }
                }
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
            if (input.faqs && Array.isArray(input.faqs)) {
                await tx.product_faqs.createMany({
                    data: input.faqs.map((faq, index) => ({
                        product_id: productId,
                        question_ar: faq.question_ar || '',
                        question_en: faq.question_en || '',
                        answer_ar: faq.answer_ar || '',
                        answer_en: faq.answer_en || '',
                        order_index: faq.order_index ?? index
                    }))
                });
            }
            if (input.fbt_ids && Array.isArray(input.fbt_ids)) {
                await tx.product_fbt.createMany({
                    data: input.fbt_ids.map((relatedId) => ({
                        product_id: productId,
                        related_prod_id: relatedId
                    }))
                });
            }
            if (input.bundle_items && Array.isArray(input.bundle_items)) {
                await tx.product_bundle_items.createMany({
                    data: input.bundle_items.map((item) => ({
                        bundle_id: productId,
                        product_id: item.product_id,
                        quantity: item.quantity || 1,
                        discount: item.discount || 0
                    }))
                });
            }
        });
        await cacheInvalidateScope('productsList');
        await cacheInvalidateScope('productById');
        await cacheInvalidateScope('categories');
        await cacheInvalidateScope('pages');
        await cacheInvalidateScope('pagesBySlug');
        await logAudit(existedBefore ? 'update_product' : 'create_product', req.user?.username || 'system', `${existedBefore ? 'Updated' : 'Created'} product: ${productId}`);
        res.json({ success: true, id: productId });
    }
    catch (err) {
        if (err.name === 'ZodError') {
            const errors = err.errors || err.issues || [];
            return res.status(400).json({
                error: 'Validation failed',
                details: Array.isArray(errors) ? errors.map((e) => e.message) : ['Validation Error']
            });
        }
        console.error(err);
        res.status(500).json({ error: 'Failed to save product' });
    }
};
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        // 1. Fetch product with images to know what to delete from disk
        const product = await prisma.products.findUnique({
            where: { id: String(id) },
            include: { product_images: true, product_variants: true }
        });
        if (product) {
            // Delete primary image
            removeFile(product.image_url);
            // Delete gallery images
            product.product_images.forEach((img) => removeFile(img.url));
            // Delete variant images
            product.product_variants.forEach((v) => removeFile(v.image_url));
        }
        // 2. Delete from DB (relations cascade)
        await prisma.customer_wishlists.deleteMany({ where: { product_id: String(id) } });
        await prisma.customer_carts.deleteMany({ where: { product_id: String(id) } });
        await prisma.products.delete({ where: { id: String(id) } });
        await cacheInvalidateScope('productsList');
        await cacheInvalidateScope('productById');
        await cacheInvalidateScope('categories');
        await cacheInvalidateScope('pages');
        await cacheInvalidateScope('pagesBySlug');
        // 3. Log Audit
        await logAudit('delete_product', req.user?.username || 'system', `Deleted product: ${String(id)}`);
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};
export const updateProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
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
        await logAudit('update_product_status', req.user?.username || 'system', `Updated product status: ${id} -> ${status}`);
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update product status' });
    }
};
