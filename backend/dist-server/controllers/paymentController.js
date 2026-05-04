import prisma from '../lib/prisma';
import { logger } from '../utils/logger';
import { initializePayment, initializeFawryPayment, initializeWalletPayment, processCallback, verifyFawryCallback } from '../services/paymentService';
import { beginIdempotency, beginIdempotencyWithKey, completeIdempotency, failIdempotency } from '../services/idempotencyService';
import { enqueueOutboxJob } from '../services/outboxService';
import { logAudit } from '../services/auditService';
/**
 * Initialize payment for an order
 */
export const createPayment = async (req, res) => {
    let idemRecordId = null;
    const respond = async (statusCode, body) => {
        if (idemRecordId) {
            if (statusCode >= 200 && statusCode < 300) {
                await completeIdempotency(idemRecordId, statusCode, body);
            }
            else {
                await failIdempotency(idemRecordId, statusCode, body);
            }
        }
        return res.status(statusCode).json(body);
    };
    try {
        const idem = await beginIdempotency('payment_create', req, req.body);
        if (idem.enabled && idem.replay) {
            return res.status(idem.response.statusCode).json(idem.response.body);
        }
        idemRecordId = idem.enabled && !idem.replay ? idem.recordId : null;
        const actor = req.user?.username || 'system';
        const isAdminFlow = Boolean(req.user);
        const orderId = typeof req.body.orderId === 'string' ? req.body.orderId : null;
        if (!orderId) {
            return respond(400, { error: 'Order ID is required' });
        }
        // Get order details
        const order = await prisma.orders.findUnique({
            where: { id: orderId },
            include: { order_items: true }
        });
        if (!order) {
            return respond(404, { error: 'Order not found' });
        }
        // Plan 0 Hardening: Verify ownership
        const customer = req.customer;
        const admin = req.user;
        if (customer) {
            // If it's a customer, they must own the order (by customer_id or email)
            const ownsByCustomerId = order.customer_id && order.customer_id === customer.id;
            const ownsByEmail = order.email && order.email.toLowerCase() === customer.email.toLowerCase();
            if (!ownsByCustomerId && !ownsByEmail) {
                await logAudit('payment_create_rejected', `customer:${customer.id}`, `Unauthorized payment attempt for order ${orderId}`);
                return respond(403, { error: 'Unauthorized: You do not own this order' });
            }
        }
        else if (!admin) {
            // If neither customer nor admin, it's unauthorized
            return respond(401, { error: 'Authentication required' });
        }
        if (order.payment_status === 'paid') {
            await logAudit('payment_create_rejected', actor, `Order ${orderId} already paid`);
            return respond(400, { error: 'Order already paid' });
        }
        const method = typeof req.body.method === 'string' ? req.body.method : 'card';
        const walletNumber = typeof req.body.walletNumber === 'string' ? req.body.walletNumber : undefined;
        const paymentData = {
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
            })),
            method: method,
            walletNumber
        };
        let paymentResult;
        if (method === 'fawry') {
            paymentResult = await initializeFawryPayment(paymentData);
        }
        else if (method === 'wallet') {
            paymentResult = await initializeWalletPayment(paymentData);
        }
        else {
            paymentResult = await initializePayment(paymentData);
        }
        if (!paymentResult.success) {
            await logAudit('payment_create_failed', actor, `Order ${orderId}, method=${method}, reason=${paymentResult.error || 'unknown'}`);
            return respond(400, { error: paymentResult.error });
        }
        // Update order with payment method
        await prisma.orders.update({
            where: { id: orderId },
            data: {
                payment_method: method,
                payment_id: paymentResult.paymentKey || paymentResult.referenceNumber || null
            }
        });
        await logAudit('payment_create', actor, `Order ${orderId}, method=${method}, flow=${isAdminFlow ? 'admin' : 'customer'}`);
        return respond(200, {
            success: true,
            paymentUrl: paymentResult.paymentUrl,
            referenceNumber: paymentResult.referenceNumber
        });
    }
    catch (err) {
        logger.error('Failed to create payment', err);
        return respond(500, { error: 'Failed to initialize payment' });
    }
};
/**
 * Handle Paymob callback
 */
export const handleCallback = async (req, res) => {
    let idemRecordId = null;
    const respond = async (statusCode, body) => {
        if (idemRecordId) {
            if (statusCode >= 200 && statusCode < 300) {
                await completeIdempotency(idemRecordId, statusCode, body);
            }
            else {
                await failIdempotency(idemRecordId, statusCode, body);
            }
        }
        return res.status(statusCode).json(body);
    };
    try {
        const callbackKey = req.body?.id ? `paymob:${String(req.body.id)}` : `paymob:${String(req.body?.hmac || Date.now())}`;
        const idem = await beginIdempotencyWithKey('payment_callback', callbackKey, req.body || {});
        if (idem.enabled && idem.replay) {
            return res.status(idem.response.statusCode).json(idem.response.body);
        }
        idemRecordId = idem.enabled && !idem.replay ? idem.recordId : null;
        const result = await processCallback(req.body);
        if (!result.success || !result.orderId) {
            await logAudit('payment_callback_rejected', 'system', 'Paymob callback verification failed');
            return respond(400, { error: 'Payment verification failed' });
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
            await enqueueOutboxJob('payment.status.send_email', {
                email: order.email,
                orderId: order.id,
                customerName: order.customer_name || 'Customer',
                statusEn: 'processing',
                statusAr: 'جاري التجهيز',
            });
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
        await logAudit('payment_callback_success', 'system', `Paymob paid order ${result.orderId}`);
        return respond(200, { success: true });
    }
    catch (err) {
        await logAudit('payment_callback_error', 'system', `Paymob callback exception: ${err.message || 'unknown'}`);
        logger.error('Failed to process payment callback', err);
        return respond(500, { error: 'Failed to process callback' });
    }
};
/**
 * Handle Fawry callback
 */
export const handleFawryCallback = async (req, res) => {
    let idemRecordId = null;
    const respond = async (statusCode, body) => {
        if (idemRecordId) {
            if (statusCode >= 200 && statusCode < 300) {
                await completeIdempotency(idemRecordId, statusCode, body);
            }
            else {
                await failIdempotency(idemRecordId, statusCode, body);
            }
        }
        return res.status(statusCode).json(body);
    };
    try {
        const callbackKey = `fawry:${String(req.body?.paymentRefNumber || req.body?.merchantRefNumber || Date.now())}`;
        const idem = await beginIdempotencyWithKey('fawry_callback', callbackKey, req.body || {});
        if (idem.enabled && idem.replay) {
            return res.status(idem.response.statusCode).json(idem.response.body);
        }
        idemRecordId = idem.enabled && !idem.replay ? idem.recordId : null;
        if (!verifyFawryCallback(req.body)) {
            await logAudit('fawry_callback_rejected', 'system', 'Invalid callback signature');
            return respond(400, { error: 'Invalid Fawry callback signature' });
        }
        const orderId = req.body.merchantRefNumber || req.body.orderReferenceNumber;
        const orderStatus = req.body.orderStatus;
        if (!orderId) {
            await logAudit('fawry_callback_rejected', 'system', 'Missing order ID in callback');
            return respond(400, { error: 'Order ID missing' });
        }
        const order = await prisma.orders.findUnique({ where: { id: String(orderId) } });
        if (!order) {
            return respond(404, { error: 'Order not found' });
        }
        if (orderStatus === 'PAID' || orderStatus === 'PAID') {
            await prisma.orders.update({
                where: { id: String(orderId) },
                data: {
                    payment_status: 'paid',
                    payment_id: req.body.paymentRefNumber?.toString() || null,
                    status: 'processing'
                }
            });
            if (order.email) {
                await enqueueOutboxJob('payment.status.send_email', {
                    email: order.email,
                    orderId: order.id,
                    customerName: order.customer_name || 'Customer',
                    statusEn: 'processing',
                    statusAr: 'جاري التجهيز',
                });
            }
            await logAudit('fawry_callback_paid', 'system', `Order ${orderId} marked paid`);
        }
        else if (orderStatus === 'FAILED' || orderStatus === 'EXPIRED') {
            await prisma.orders.update({
                where: { id: String(orderId) },
                data: { payment_status: 'failed' }
            });
            await logAudit('fawry_callback_failed', 'system', `Order ${orderId} status=${orderStatus}`);
        }
        return respond(200, { success: true });
    }
    catch (err) {
        await logAudit('fawry_callback_error', 'system', `Fawry callback exception: ${err.message || 'unknown'}`);
        logger.error('Failed to process Fawry callback', err);
        return respond(500, { error: 'Failed to process Fawry callback' });
    }
};
/**
 * Get payment status
 */
export const getPaymentStatus = async (req, res) => {
    try {
        const orderId = String(req.params.orderId);
        const order = await prisma.orders.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                customer_id: true,
                email: true,
                payment_method: true,
                payment_status: true,
                payment_id: true,
                status: true
            }
        });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        // Plan 0 Hardening: Verify ownership
        const customer = req.customer;
        const admin = req.user;
        if (customer) {
            const ownsByCustomerId = order.customer_id && order.customer_id === customer.id;
            const ownsByEmail = order.email && order.email.toLowerCase() === customer.email.toLowerCase();
            if (!ownsByCustomerId && !ownsByEmail) {
                return res.status(403).json({ error: 'Unauthorized' });
            }
        }
        else if (!admin) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        res.json(order);
    }
    catch (err) {
        logger.error('Failed to get payment status', err);
        res.status(500).json({ error: 'Failed to get payment status' });
    }
};
