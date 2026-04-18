import crypto from 'crypto';
import prisma from '../lib/prisma';
import { orderSchema } from '../utils/schemas';
import { logger } from '../utils/logger';
import { getQueryParam, getQueryInt, calculatePagination } from '../utils/helpers';
import { sendOrderConfirmationEmail } from '../services/emailService';
export const createOrder = async (req, res) => {
    try {
        // 0. Validate Input
        const validated = orderSchema.parse(req.body);
        const { customer, items, total_price, coupon_id, discount_amount } = validated;
        const orderId = crypto.randomUUID();
        await prisma.$transaction(async (tx) => {
            if (coupon_id) {
                const coupon = await tx.coupons.findUnique({ where: { id: coupon_id } });
                if (!coupon || coupon.status !== 'active') {
                    throw { status: 400, message: 'Invalid or inactive coupon' };
                }
                if (coupon.usage_limit !== null &&
                    (coupon.used_count ?? 0) >= coupon.usage_limit) {
                    throw { status: 400, message: 'Coupon usage limit reached' };
                }
                if (coupon.min_order !== null && total_price < coupon.min_order) {
                    throw { status: 400, message: `Min order EGP ${coupon.min_order} required` };
                }
                const updated = await tx.coupons.updateMany({
                    where: {
                        id: coupon_id,
                        status: 'active',
                        OR: [
                            { usage_limit: null },
                            { usage_limit: { gt: coupon.used_count ?? 0 } }
                        ]
                    },
                    data: { used_count: { increment: 1 } }
                });
                if (updated.count === 0) {
                    throw { status: 400, message: 'Coupon is no longer available' };
                }
            }
            // 1. Create order
            await tx.orders.create({
                data: {
                    id: orderId,
                    customer_name: customer.name || '',
                    phone: customer.phone || '',
                    governorate: customer.governorate || '',
                    city: customer.city || '',
                    address: customer.address || '',
                    notes: customer.notes || '',
                    total_price,
                    status: 'pending',
                    coupon_id,
                    discount_amount: discount_amount || 0
                }
            });
            // 2. Create items
            await tx.order_items.createMany({
                data: items.map((item) => ({
                    order_id: orderId,
                    product_id: item.id,
                    product_name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    subtotal: item.price * item.quantity
                }))
            });
        });
        // Send confirmation email (async, don't wait)
        if (customer.email) {
            sendOrderConfirmationEmail(customer.email, orderId, customer.name || 'Customer', total_price, items.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            }))).catch(err => logger.error('Failed to send order confirmation email', err));
        }
        // Notify admin via WebSocket
        const { notifyNewOrder } = await import('../services/websocketService');
        notifyNewOrder({
            id: orderId,
            customer_name: customer.name,
            total_price,
            created_at: new Date().toISOString()
        });
        res.json({ success: true, orderId });
    }
    catch (err) {
        if (err?.status && err?.message) {
            return res.status(err.status).json({ error: err.message });
        }
        if (err.name === 'ZodError') {
            return res.status(400).json({
                error: 'Validation failed',
                details: err.errors.map((e) => e.message)
            });
        }
        logger.error('Failed to create order', err);
        res.status(500).json({ error: 'Failed to create order' });
    }
};
export const trackOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.orders.findUnique({
            where: { id: String(id) },
            select: {
                id: true,
                status: true,
                total_price: true,
                created_at: true,
                discount_amount: true
            }
        });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    }
    catch (err) {
        logger.error('Track order failed', err);
        res.status(500).json({ error: 'Tracking failed' });
    }
};
export const checkNewOrders = async (req, res) => {
    try {
        const lastCheckStr = getQueryParam(req.query.lastCheck) || '1970-01-01T00:00:00Z';
        // Handle the space format from frontend (YYYY-MM-DD HH:MM:SS)
        const normalizedDate = lastCheckStr.includes(' ') ? lastCheckStr.replace(' ', 'T') + 'Z' : lastCheckStr;
        const date = new Date(normalizedDate);
        // Fallback if date is invalid
        const finalDate = isNaN(date.getTime()) ? new Date(0) : date;
        const count = await prisma.orders.count({
            where: { created_at: { gt: finalDate } }
        });
        res.json({ count });
    }
    catch (err) {
        logger.error('New orders check error', err);
        res.status(500).json({ error: 'Check failed' });
    }
};
export const getAllOrders = async (req, res) => {
    try {
        // Add pagination support
        const page = getQueryInt(req.query.page, 1, 1);
        const limit = getQueryInt(req.query.limit, 50, 1, 200);
        const status = getQueryParam(req.query.status);
        const skip = (page - 1) * limit;
        const where = {};
        if (status && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            where.status = status;
        }
        const [orders, total] = await Promise.all([
            prisma.orders.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: { order_items: true }
            }),
            prisma.orders.count({ where })
        ]);
        // Format to match PHP output
        const formatted = orders.map(o => ({
            ...o,
            items: o.order_items
        }));
        res.json({
            orders: formatted,
            ...calculatePagination(total, page, limit)
        });
    }
    catch (err) {
        logger.error('Failed to fetch orders', err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};
export const updateOrderStatus = async (req, res) => {
    try {
        const id = String(req.params.id);
        const { status } = req.body;
        let statusTextAr = status;
        let statusTextEn = status;
        switch (status) {
            case 'processing':
                statusTextAr = 'جاري التجهيز';
                statusTextEn = 'Processing';
                break;
            case 'shipped':
                statusTextAr = 'تم الشحن';
                statusTextEn = 'Shipped';
                break;
            case 'delivered':
                statusTextAr = 'تم التسليم';
                statusTextEn = 'Delivered';
                break;
            case 'cancelled':
                statusTextAr = 'تم الإلغاء';
                statusTextEn = 'Cancelled';
                break;
            case 'pending':
                statusTextAr = 'قيد المراجعة';
                statusTextEn = 'Pending';
                break;
        }
        await prisma.$transaction([
            prisma.orders.update({
                where: { id },
                data: { status }
            }),
            prisma.notifications.create({
                data: {
                    target_order_id: id,
                    title_ar: 'تحديث حالة الطلب',
                    title_en: 'Order Status Update',
                    message_ar: `الطلب رقم #${id} تغيرت حالته الآن إلى: ${statusTextAr}`,
                    message_en: `Your order #${id} status has been updated to: ${statusTextEn}`
                }
            })
        ]);
        res.json({ success: true });
    }
    catch (err) {
        logger.error('Failed to update order status', err);
        res.status(500).json({ error: 'Failed to update order status' });
    }
};
export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if order exists
        const order = await prisma.orders.findUnique({ where: { id: String(id) } });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        await prisma.orders.delete({ where: { id: String(id) } });
        res.json({ success: true });
    }
    catch (err) {
        logger.error('Failed to delete order', err);
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(500).json({ error: 'Failed to delete order' });
    }
};
