import { z } from 'zod';
/**
 * Validation Schemas for MyMenuEG
 * Ensuring data integrity for long-term production use.
 */
// --- Order Validation ---
export const orderSchema = z.object({
    customer: z.object({
        name: z.string().min(2, 'Name is too short').max(100),
        phone: z.string().min(8, 'Invalid phone number'),
        governorate: z.string().min(2, 'Governorate required'),
        city: z.string().min(2, 'City required'),
        address: z.string().min(5, 'Address is too short'),
        notes: z.string().optional(),
    }),
    items: z.array(z.object({
        id: z.string(),
        name: z.string(),
        price: z.number().positive(),
        quantity: z.number().int().positive(),
    })).min(1, 'Order must contain at least one item'),
    total_price: z.number().positive(),
    coupon_id: z.string().nullable().optional(),
    discount_amount: z.number().nonnegative().optional(),
});
// --- Product Validation ---
export const productSchema = z.object({
    id: z.string().optional(),
    name_ar: z.string().min(2).max(255),
    name_en: z.string().min(2).max(255),
    description_ar: z.string().optional().default(''),
    description_en: z.string().optional().default(''),
    price: z.coerce.number().positive(),
    old_price: z.coerce.number().nonnegative().optional().default(0),
    stock: z.coerce.number().int().nonnegative().optional().default(0),
    category_id: z.string().optional(),
    page_id: z.string().optional(),
    status: z.enum(['active', 'draft', 'archived']).optional().default('active'),
    is_best_seller: z.boolean().optional().default(false),
    images: z.array(z.string()).optional().default([]),
    specs: z.array(z.object({
        key_ar: z.string().optional().default(''),
        key_en: z.string().optional().default(''),
        val_ar: z.string().optional().default(''),
        val_en: z.string().optional().default(''),
    })).optional().default([]),
    quantity_prices: z.array(z.object({
        quantity_label: z.string().min(1),
        price: z.coerce.number().positive(),
        old_price: z.coerce.number().nonnegative().optional().default(0),
    })).optional().default([]),
    shipping_info_ar: z.string().optional().default(''),
    shipping_info_en: z.string().optional().default(''),
    warranty_info_ar: z.string().optional().default(''),
    warranty_info_en: z.string().optional().default(''),
    carton_details_ar: z.string().optional().default(''),
    carton_details_en: z.string().optional().default(''),
    brand_ar: z.string().optional().default(''),
    brand_en: z.string().optional().default(''),
    material_ar: z.string().optional().default(''),
    material_en: z.string().optional().default(''),
    dimensions_ar: z.string().optional().default(''),
    dimensions_en: z.string().optional().default(''),
    usage_notes_ar: z.string().optional().default(''),
    usage_notes_en: z.string().optional().default(''),
    template_key: z.string().optional().default(''),
    variants: z.array(z.object({
        label_ar: z.string().optional().default(''),
        label_en: z.string().optional().default(''),
        sku: z.string().optional().default(''),
        price: z.coerce.number().positive(),
        old_price: z.coerce.number().nonnegative().optional().default(0),
        stock: z.coerce.number().int().nonnegative().optional().default(0),
        is_default: z.boolean().optional().default(false),
    })).optional().default([]),
    detail_items: z.array(z.object({
        label_ar: z.string().optional().default(''),
        label_en: z.string().optional().default(''),
        value_ar: z.string().optional().default(''),
        value_en: z.string().optional().default(''),
        order_index: z.coerce.number().int().nonnegative().optional().default(0),
    })).optional().default([]),
    video_url: z.string().optional().default(''),
}).passthrough();
// --- Coupon Validation ---
export const couponValidationSchema = z.object({
    code: z.string().min(2).max(50),
    total: z.coerce.number().nonnegative(),
});
export const couponUpsertSchema = z.object({
    id: z.string().optional(),
    code: z.string().min(2).max(50),
    type: z.enum(['fixed', 'percent']),
    value: z.coerce.number().positive(),
    min_order: z.coerce.number().nonnegative().nullable().optional(),
    usage_limit: z.coerce.number().int().positive().nullable().optional(),
    status: z.enum(['active', 'inactive']).optional().default('active'),
}).passthrough();
// --- Notifications Validation ---
export const notificationOrderIdsSchema = z.object({
    orderIds: z.array(z.string().min(1).max(100)).min(1).max(50),
    customerPhone: z.string().min(8).max(50).optional(),
});
// --- Category Validation ---
export const categorySchema = z.object({
    name_ar: z.string().min(2).max(100),
    name_en: z.string().min(2).max(100),
});
