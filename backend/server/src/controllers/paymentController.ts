import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { logger } from '../utils/logger';
import { initializePayment, processCallback } from '../services/paymentService';
import { sendOrderStatusEmail } from '../services/emailService';

/**
 * Initialize payment for an order
 */
export const createPayment = async (req: Request, res: Response) => {
  try {
    const orderId = typeof req.body.orderId === 'string' ? req.body.orderId : null;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Get order details
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: { order_items: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.payment_status === 'paid') {
      return res.status(400).json({ error: 'Order already paid' });
    }

    // Initialize payment
    const paymentResult = await initializePayment({
      amount: order.total_price || 0,
      currency: 'EGP',
      orderId: order.id,
      customer: {
        name: order.customer_name || 'Customer',
        email: order.email || 'customer@example.com',
        phone: order.phone || ''
      },
      items: order.order_items.map(item => ({
        name: item.product_name || 'Product',
        amount: item.price || 0,
        quantity: item.quantity || 1
      }))
    });

    if (!paymentResult.success) {
      return res.status(400).json({ error: paymentResult.error });
    }

    // Update order with payment method
    await prisma.orders.update({
      where: { id: orderId },
      data: {
        payment_method: 'card',
        payment_id: paymentResult.paymentKey || null
      }
    });

    res.json({
      success: true,
      paymentUrl: paymentResult.paymentUrl
    });
  } catch (err) {
    logger.error('Failed to create payment', err);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
};

/**
 * Handle Paymob callback
 */
export const handleCallback = async (req: Request, res: Response) => {
  try {
    const result = await processCallback(req.body);

    if (!result.success || !result.orderId) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Update order payment status
    const order = await prisma.orders.update({
      where: { id: result.orderId },
      data: {
        payment_status: 'paid',
        payment_id: req.body.id?.toString() || null,
        status: 'processing'
      }
    });

    // Send confirmation email
    if (order.email) {
      sendOrderStatusEmail(
        order.email,
        order.id,
        order.customer_name || 'Customer',
        'processing',
        'جاري التجهيز'
      ).catch(err => logger.error('Failed to send payment confirmation email', err));
    }

    // Create notification
    await prisma.notifications.create({
      data: {
        target_order_id: order.id,
        title_ar: 'تم الدفع بنجاح',
        title_en: 'Payment Successful',
        message_ar: `تم استلام دفع طلبك رقم #${order.id}`,
        message_en: `Payment received for your order #${order.id}`
      }
    });

    logger.info(`Payment successful for order ${result.orderId}`);

    res.json({ success: true });
  } catch (err) {
    logger.error('Failed to process payment callback', err);
    res.status(500).json({ error: 'Failed to process callback' });
  }
};

/**
 * Get payment status
 */
export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const orderId = String(req.params.orderId);

    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        payment_method: true,
        payment_status: true,
        payment_id: true,
        status: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    logger.error('Failed to get payment status', err);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
};
