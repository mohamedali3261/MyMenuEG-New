import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { logger } from '../utils/logger';
import { logAudit } from '../services/auditService';

export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const search = (typeof req.query.search === 'string' ? req.query.search : '') || '';
    const page = Math.max(1, parseInt(typeof req.query.page === 'string' ? req.query.page : '1') || 1);
    const limit = Math.min(100, Math.max(1, parseInt(typeof req.query.limit === 'string' ? req.query.limit : '20') || 20));
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { email: { contains: search } },
            { name: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      prisma.customers.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          google_id: true,
          is_active: true,
          created_at: true,
          _count: { select: { orders: true } },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.customers.count({ where }),
    ]);

    const formatted = customers.map((c) => ({
      id: c.id,
      email: c.email,
      name: c.name,
      phone: c.phone,
      avatar: c.avatar,
      google_id: c.google_id,
      is_active: c.is_active ?? true,
      created_at: c.created_at,
      orderCount: c._count.orders,
    }));

    res.json({ customers: formatted, total, page, limit });
  } catch (err) {
    logger.error('Get customers error:', err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, is_active } = req.body;

    const customer = await prisma.customers.findUnique({ where: { id: String(id) } });
    if (!customer) {
      return res.status(404).json({ error: 'العميل غير موجود' });
    }

    const data: any = { updated_at: new Date() };
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (is_active !== undefined) data.is_active = is_active;
    if (req.body.governorate !== undefined) data.governorate = req.body.governorate;
    if (req.body.city !== undefined) data.city = req.body.city;
    if (req.body.address !== undefined) data.address = req.body.address;

    const updated = await prisma.customers.update({
      where: { id: String(id) },
      data,
    });

    await logAudit(
      'update_customer',
      (req as any).user?.username || 'system',
      `Updated customer: ${id}`
    );
    logger.info(`Customer updated: ${id}`);
    res.json({ success: true, customer: updated });
  } catch (err) {
    logger.error('Update customer error:', err);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customers.findUnique({ where: { id: String(id) } });
    if (!customer) {
      return res.status(404).json({ error: 'العميل غير موجود' });
    }

    await prisma.customers.delete({ where: { id: String(id) } });

    await logAudit(
      'delete_customer',
      (req as any).user?.username || 'system',
      `Deleted customer: ${id}`
    );
    logger.info(`Customer deleted: ${id}`);
    res.json({ success: true, message: 'تم حذف العميل بنجاح' });
  } catch (err) {
    logger.error('Delete customer error:', err);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};

export const getCustomerDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customers.findUnique({
      where: { id: String(id) },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        governorate: true,
        city: true,
        address: true,
        avatar: true,
        google_id: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        orders: {
          select: {
            id: true,
            status: true,
            total_price: true,
            discount_amount: true,
            created_at: true,
            order_items: {
              select: {
                product_name: true,
                quantity: true,
                price: true,
                subtotal: true,
              }
            }
          },
          orderBy: { created_at: 'desc' },
          take: 20,
        },
        wishlists: {
          select: {
            product_id: true,
            created_at: true,
          }
        },
        cart_items: {
          select: {
            product_id: true,
            quantity: true,
            variant: true,
            is_bundle: true,
            created_at: true,
          }
        },
        notifications: {
          select: {
            id: true,
            title: true,
            message: true,
            is_read: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
          take: 50,
        },
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'العميل غير موجود' });
    }

    // Get product names for wishlist and cart
    const wishlistProductIds = customer.wishlists.map((w: { product_id: string }) => w.product_id);
    const cartProductIds = customer.cart_items.map((c: { product_id: string }) => c.product_id);
    const allProductIds = [...new Set([...wishlistProductIds, ...cartProductIds])];

    const products = await prisma.products.findMany({
      where: { id: { in: allProductIds } },
      select: { id: true, name_ar: true, name_en: true, image_url: true, price: true }
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    const formatted = {
      ...customer,
      orderCount: customer.orders.length,
      totalSpent: (customer.orders as any[]).reduce((sum: number, o: any) => sum + (o.total_price || 0), 0),
      wishlists: (customer.wishlists as any[]).map((w: any) => ({
        product_id: w.product_id,
        product_name: productMap.get(w.product_id)?.name_ar || productMap.get(w.product_id)?.name_en || '—',
        product_image: productMap.get(w.product_id)?.image_url || '',
        added_at: w.created_at,
      })),
      cart_items: (customer.cart_items as any[]).map((c: any) => ({
        product_id: c.product_id,
        product_name: productMap.get(c.product_id)?.name_ar || productMap.get(c.product_id)?.name_en || '—',
        product_image: productMap.get(c.product_id)?.image_url || '',
        product_price: productMap.get(c.product_id)?.price || 0,
        quantity: c.quantity,
        variant: c.variant,
        is_bundle: c.is_bundle,
      })),
    };

    res.json(formatted);
  } catch (err) {
    logger.error('Get customer details error:', err);
    res.status(500).json({ error: 'Failed to fetch customer details' });
  }
};

export const updateMyDelivery = async (req: any, res: Response) => {
  try {
    const customerId = req.customer?.id;
    if (!customerId) {
      return res.status(401).json({ error: 'غير مصرح' });
    }

    const { name, phone, governorate, city, address } = req.body;

    const data: any = { updated_at: new Date() };
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (governorate !== undefined) data.governorate = governorate;
    if (city !== undefined) data.city = city;
    if (address !== undefined) data.address = address;

    const updated = await prisma.customers.update({
      where: { id: customerId },
      data,
    });

    logger.info(`Customer updated delivery: ${customerId}`);
    res.json({
      success: true,
      customer: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        phone: updated.phone,
        governorate: updated.governorate,
        city: updated.city,
        address: updated.address,
        avatar: updated.avatar,
      }
    });
  } catch (err) {
    logger.error('Update my delivery error:', err);
    res.status(500).json({ error: 'Failed to update delivery data' });
  }
};

// --- Admin: Send notification to customer ---
export const sendNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'العنوان والرسالة مطلوبان' });
    }

    const customer = await prisma.customers.findUnique({ where: { id: String(id) } });
    if (!customer) {
      return res.status(404).json({ error: 'العميل غير موجود' });
    }

    const notification = await prisma.customer_notifications.create({
      data: { customer_id: String(id), title, message }
    });

    await logAudit(
      'send_customer_notification',
      (req as any).user?.username || 'system',
      `Sent notification to customer ${id}`
    );
    logger.info(`Notification sent to customer ${id}`);
    res.json({ success: true, notification });
  } catch (err) {
    logger.error('Send notification error:', err);
    res.status(500).json({ error: 'Failed to send notification' });
  }
};

// --- Customer: Get my notifications ---
export const getMyNotifications = async (req: any, res: Response) => {
  try {
    const customerId = req.customer?.id;
    if (!customerId) {
      return res.status(401).json({ error: 'غير مصرح' });
    }

    const notifications = await prisma.customer_notifications.findMany({
      where: { customer_id: customerId },
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    const unreadCount = notifications.filter((n: { is_read: boolean }) => !n.is_read).length;

    res.json({ notifications, unreadCount });
  } catch (err) {
    logger.error('Get notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// --- Customer: Mark notification as read ---
export const markNotificationRead = async (req: any, res: Response) => {
  try {
    const customerId = req.customer?.id;
    const { notificationId } = req.params;

    if (!customerId) {
      return res.status(401).json({ error: 'غير مصرح' });
    }

    await prisma.customer_notifications.updateMany({
      where: { id: String(notificationId), customer_id: customerId },
      data: { is_read: true }
    });

    res.json({ success: true });
  } catch (err) {
    logger.error('Mark notification read error:', err);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

// --- Customer: Mark all notifications as read ---
export const markAllNotificationsRead = async (req: any, res: Response) => {
  try {
    const customerId = req.customer?.id;
    if (!customerId) {
      return res.status(401).json({ error: 'غير مصرح' });
    }

    await prisma.customer_notifications.updateMany({
      where: { customer_id: customerId, is_read: false },
      data: { is_read: true }
    });

    res.json({ success: true });
  } catch (err) {
    logger.error('Mark all notifications read error:', err);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
};

// --- Admin: Broadcast notification to all active customers ---
export const broadcastNotification = async (req: Request, res: Response) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'العنوان والرسالة مطلوبان' });
    }

    const customers = await prisma.customers.findMany({
      where: { is_active: true },
      select: { id: true }
    });

    if (customers.length === 0) {
      return res.json({ success: true, sent: 0 });
    }

    await prisma.customer_notifications.createMany({
      data: customers.map(c => ({ customer_id: c.id, title, message }))
    });

    await logAudit(
      'broadcast_notification',
      (req as any).user?.username || 'system',
      `Broadcast notification to ${customers.length} active customers`
    );
    logger.info(`Broadcast notification sent to ${customers.length} customers`);
    res.json({ success: true, sent: customers.length });
  } catch (err) {
    logger.error('Broadcast notification error:', err);
    res.status(500).json({ error: 'Failed to broadcast notification' });
  }
};
