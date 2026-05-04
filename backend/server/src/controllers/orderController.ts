import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { orderSchema } from '../utils/schemas';
import { logger } from '../utils/logger';
import { getQueryParam, getQueryInt, calculatePagination } from '../utils/helpers';
import { beginIdempotency, completeIdempotency, failIdempotency } from '../services/idempotencyService';
import { enqueueOutboxJob } from '../services/outboxService';
import { logAudit } from '../services/auditService';

export const createOrder = async (req: Request, res: Response) => {
  let idemRecordId: number | null = null;
  const respond = async (statusCode: number, body: any) => {
    if (idemRecordId) {
      if (statusCode >= 200 && statusCode < 300) {
        await completeIdempotency(idemRecordId, statusCode, body);
      } else {
        await failIdempotency(idemRecordId, statusCode, body);
      }
    }
    return res.status(statusCode).json(body);
  };

  try {
    const idem = await beginIdempotency('create_order', req, req.body);
    if (idem.enabled && idem.replay) {
      return res.status(idem.response.statusCode).json(idem.response.body);
    }
    idemRecordId = idem.enabled && !idem.replay ? idem.recordId : null;

    // 0. Validate Input
    const validated = orderSchema.parse(req.body);
    const { customer, items, total_price, coupon_id } = validated;
    
    const orderId = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const productIds = [...new Set(items.map((item: any) => String(item.id)))];
      const dbProducts = await tx.products.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          name_ar: true,
          name_en: true,
          price: true,
          status: true
        }
      });

      if (dbProducts.length !== productIds.length) {
        throw { status: 400, message: 'One or more products are invalid' };
      }

      const productMap = new Map(dbProducts.map((p) => [p.id, p]));
      let subtotal = 0;

      const orderItemsData = items.map((item: any) => {
        const product = productMap.get(String(item.id));
        if (!product) {
          throw { status: 400, message: `Invalid product: ${String(item.id)}` };
        }

        if (product.status && product.status !== 'active') {
          throw { status: 400, message: `Product is not available: ${String(item.id)}` };
        }

        const unitPrice = Number(product.price ?? 0);
        if (!Number.isFinite(unitPrice) || unitPrice < 0) {
          throw { status: 400, message: `Invalid product price: ${String(item.id)}` };
        }

        const quantity = Number(item.quantity ?? 0);
        const lineSubtotal = unitPrice * quantity;
        subtotal += lineSubtotal;

        return {
          order_id: orderId,
          product_id: String(item.id),
          product_name: product.name_ar || product.name_en || item.name || 'Product',
          price: unitPrice,
          quantity,
          subtotal: lineSubtotal,
          custom_print_url: item.custom_file_url || null,
          custom_print_notes: item.custom_notes || null
        };
      });

      let appliedDiscount = 0;

      if (coupon_id) {
        const coupon = await tx.coupons.findUnique({ where: { id: coupon_id } });
        if (!coupon || coupon.status !== 'active') {
          throw { status: 400, message: 'Invalid or inactive coupon' };
        }

        const now = new Date();
        if (coupon.start_date && coupon.start_date > now) {
          throw { status: 400, message: 'Coupon has not started yet' };
        }
        if (coupon.end_date && coupon.end_date < now) {
          throw { status: 400, message: 'Coupon has expired' };
        }

        if (
          coupon.usage_limit !== null &&
          (coupon.used_count ?? 0) >= coupon.usage_limit
        ) {
          throw { status: 400, message: 'Coupon usage limit reached' };
        }

        if (coupon.min_order !== null && subtotal < coupon.min_order) {
          throw { status: 400, message: `Min order EGP ${coupon.min_order} required` };
        }

        const couponValue = Number(coupon.value ?? 0);
        if ((coupon.type || 'fixed') === 'percent') {
          appliedDiscount = (subtotal * couponValue) / 100;
        } else {
          appliedDiscount = couponValue;
        }
        appliedDiscount = Math.max(0, Math.min(appliedDiscount, subtotal));

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

      const finalTotal = Number((subtotal - appliedDiscount).toFixed(2));
      const clientTotal = Number(total_price ?? 0);
      if (Math.abs(clientTotal - finalTotal) > 0.01) {
        throw {
          status: 400,
          message: 'Price mismatch detected. Please refresh your cart and try again.'
        };
      }

      // 1. Create order
      await tx.orders.create({
        data: {
          id: orderId,
          customer_id: (req as any).customer?.id || null,
          customer_name: customer.name || '',
          phone: customer.phone || '',
          email: (req as any).customer?.email || null,
          governorate: customer.governorate || '',
          city: customer.city || '',
          address: customer.address || '',
          notes: customer.notes || '',
          total_price: finalTotal,
          status: 'pending',
          coupon_id,
          discount_amount: Number(appliedDiscount.toFixed(2))
        }
      });

      // 2. Create items
      await tx.order_items.createMany({
        data: orderItemsData
      });
    });

    // Outbox: order confirmation email (durable retries)
    if ((customer as any).email) {
      await enqueueOutboxJob('order.created.send_email', {
        email: (customer as any).email,
        orderId,
        customerName: customer.name || 'Customer',
        totalPrice: total_price,
        items: items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      });
    }

    // Outbox: real-time notification for admins
    await enqueueOutboxJob('order.created.notify_ws', {
      id: orderId,
      customer_name: customer.name,
      total_price,
      created_at: new Date().toISOString()
    });

    return respond(200, { success: true, orderId });
  } catch (err: any) {
    if (err?.status && err?.message) {
      return respond(err.status, { error: err.message });
    }
    if (err.name === 'ZodError') {
      return respond(400, { 
        error: 'Validation failed', 
        details: err.errors.map((e: any) => e.message) 
      });
    }
    logger.error('Failed to create order', err);
    return respond(500, { error: 'Failed to create order' });
  }
};

export const trackOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const phone = getQueryParam(req.query.phone);

    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const order = await prisma.orders.findFirst({
      where: {
        id: String(id),
        phone: phone.trim()
      },
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
  } catch (err) {
    logger.error('Track order failed', err);
    res.status(500).json({ error: 'Tracking failed' });
  }
};

export const checkNewOrders = async (req: Request, res: Response) => {
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
  } catch (err) {
    logger.error('New orders check error', err);
    res.status(500).json({ error: 'Check failed' });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    // Add pagination support
    const page = getQueryInt(req.query.page, 1, 1);
    const limit = getQueryInt(req.query.limit, 50, 1, 200);
    const status = getQueryParam(req.query.status);
    const skip = (page - 1) * limit;

    const where: any = {};
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
  } catch (err) {
    logger.error('Failed to fetch orders', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    let statusTextAr = status;
    let statusTextEn = status;

    switch (status) {
      case 'processing': statusTextAr = 'جاري التجهيز'; statusTextEn = 'Processing'; break;
      case 'shipped':    statusTextAr = 'تم الشحن';    statusTextEn = 'Shipped';    break;
      case 'delivered':  statusTextAr = 'تم التسليم';  statusTextEn = 'Delivered';  break;
      case 'cancelled':  statusTextAr = 'تم الإلغاء';  statusTextEn = 'Cancelled';  break;
      case 'pending':    statusTextAr = 'قيد المراجعة'; statusTextEn = 'Pending';    break;
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

    await logAudit(
      'update_order_status',
      (req as any).user?.username || 'system',
      `Updated order ${id} status to ${status}`
    );

    res.json({ success: true });
  } catch (err) {
    logger.error('Failed to update order status', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if order exists
    const order = await prisma.orders.findUnique({ where: { id: String(id) } });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await prisma.orders.delete({ where: { id: String(id) } });
    await logAudit(
      'delete_order',
      (req as any).user?.username || 'system',
      `Deleted order: ${String(id)}`
    );
    res.json({ success: true });
  } catch (err: any) {
    logger.error('Failed to delete order', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(500).json({ error: 'Failed to delete order' });
  }
};

export const getMyOrders = async (req: any, res: Response) => {
  try {
    const customerId = req.customer?.id;
    if (!customerId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const page = getQueryInt(req.query.page, 1, 1);
    const limit = getQueryInt(req.query.limit, 20, 1, 100);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where: { customer_id: customerId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { order_items: true }
      }),
      prisma.orders.count({ where: { customer_id: customerId } })
    ]);

    const formatted = orders.map(o => ({
      ...o,
      items: o.order_items
    }));

    res.json({ 
      orders: formatted,
      ...calculatePagination(total, page, limit)
    });
  } catch (err) {
    logger.error('Failed to fetch my orders', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};
