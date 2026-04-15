import prisma from '../lib/prisma';
import { notificationOrderIdsSchema } from '../utils/schemas';
export const getCustomerNotifications = async (req, res) => {
    try {
        const parsed = notificationOrderIdsSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.json([]);
        }
        const orderIds = [...new Set(parsed.data.orderIds)];
        const { customerPhone } = parsed.data;
        let allowedOrderIds = orderIds;
        if (customerPhone) {
            const ownedOrders = await prisma.orders.findMany({
                where: {
                    id: { in: orderIds },
                    phone: customerPhone
                },
                select: { id: true }
            });
            allowedOrderIds = ownedOrders.map((o) => o.id);
        }
        if (allowedOrderIds.length === 0) {
            return res.json([]);
        }
        const notifs = await prisma.notifications.findMany({
            where: { target_order_id: { in: allowedOrderIds } },
            orderBy: { created_at: 'desc' },
            take: 200
        });
        res.json(notifs);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};
export const markAsRead = async (req, res) => {
    try {
        const parsed = notificationOrderIdsSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.json({ success: true });
        }
        const orderIds = [...new Set(parsed.data.orderIds)];
        const { customerPhone } = parsed.data;
        let allowedOrderIds = orderIds;
        if (customerPhone) {
            const ownedOrders = await prisma.orders.findMany({
                where: {
                    id: { in: orderIds },
                    phone: customerPhone
                },
                select: { id: true }
            });
            allowedOrderIds = ownedOrders.map((o) => o.id);
        }
        if (allowedOrderIds.length === 0) {
            return res.json({ success: true });
        }
        await prisma.notifications.updateMany({
            where: { target_order_id: { in: allowedOrderIds } },
            data: { is_read: true }
        });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to mark read' });
    }
};
