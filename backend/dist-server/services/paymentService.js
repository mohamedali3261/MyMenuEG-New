import axios from 'axios';
import { logger } from '../utils/logger';
// Paymob configuration
const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID;
const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET;
const PAYMOB_BASE_URL = 'https://accept.paymob.com/api';
const isPaymobConfigured = PAYMOB_API_KEY && PAYMOB_INTEGRATION_ID && PAYMOB_IFRAME_ID;
/**
 * Get authentication token from Paymob
 */
const getAuthToken = async () => {
    try {
        const response = await axios.post(`${PAYMOB_BASE_URL}/auth/tokens`, {
            api_key: PAYMOB_API_KEY
        });
        return response.data.token;
    }
    catch (err) {
        logger.error('Failed to get Paymob auth token', err);
        return null;
    }
};
/**
 * Register order with Paymob
 */
const registerOrder = async (token, amount, orderId) => {
    try {
        const response = await axios.post(`${PAYMOB_BASE_URL}/ecommerce/orders`, {
            auth_token: token,
            delivery_needed: false,
            amount_cents: Math.round(amount * 100),
            currency: 'EGP',
            merchant_order_id: orderId,
            items: []
        });
        return response.data.id;
    }
    catch (err) {
        logger.error('Failed to register order with Paymob', err);
        return null;
    }
};
/**
 * Generate payment key
 */
const generatePaymentKey = async (token, orderId, amount, customer) => {
    try {
        const [first_name, last_name] = customer.name.split(' ');
        const response = await axios.post(`${PAYMOB_BASE_URL}/acceptance/payment_keys`, {
            auth_token: token,
            amount_cents: Math.round(amount * 100),
            expiration: 3600,
            order_id: orderId,
            billing_data: {
                first_name: first_name || 'Customer',
                last_name: last_name || 'Customer',
                email: customer.email || 'customer@example.com',
                phone_number: customer.phone,
                country: 'EG',
                city: 'Cairo',
                street: 'NA',
                building: 'NA',
                floor: 'NA',
                apartment: 'NA'
            },
            currency: 'EGP',
            integration_id: parseInt(PAYMOB_INTEGRATION_ID)
        });
        return response.data.token;
    }
    catch (err) {
        logger.error('Failed to generate payment key', err);
        return null;
    }
};
/**
 * Initialize payment and get payment URL
 */
export const initializePayment = async (data) => {
    if (!isPaymobConfigured) {
        return {
            success: false,
            error: 'Payment gateway not configured'
        };
    }
    try {
        // Step 1: Get auth token
        const token = await getAuthToken();
        if (!token) {
            return { success: false, error: 'Failed to authenticate with payment gateway' };
        }
        // Step 2: Register order
        const paymobOrderId = await registerOrder(token, data.amount, data.orderId);
        if (!paymobOrderId) {
            return { success: false, error: 'Failed to register order' };
        }
        // Step 3: Generate payment key
        const paymentKey = await generatePaymentKey(token, paymobOrderId, data.amount, data.customer);
        if (!paymentKey) {
            return { success: false, error: 'Failed to generate payment key' };
        }
        // Step 4: Generate payment URL
        const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;
        return {
            success: true,
            paymentUrl,
            paymentKey
        };
    }
    catch (err) {
        logger.error('Payment initialization failed', err);
        return { success: false, error: 'Payment initialization failed' };
    }
};
/**
 * Verify payment callback
 */
export const verifyPayment = (data) => {
    if (!PAYMOB_HMAC_SECRET) {
        logger.warn('Paymob HMAC secret not configured');
        return false;
    }
    try {
        const crypto = require('crypto');
        // Extract relevant fields
        const fields = [
            data.amount_cents,
            data.created_at,
            data.currency,
            data.error_occured,
            data.has_parent_transaction,
            data.id,
            data.integration_id,
            data.is_3d_secure,
            data.is_auth,
            data.is_capture,
            data.is_refunded,
            data.is_standalone_payment,
            data.is_voided,
            data.order.id,
            data.owner,
            data.pending,
            data.source_data.pan,
            data.source_data.sub_type,
            data.source_data.type,
            data.success
        ];
        const concatenated = fields.join('');
        const hmac = crypto
            .createHmac('sha512', PAYMOB_HMAC_SECRET)
            .update(concatenated)
            .digest('hex');
        return hmac === data.hmac;
    }
    catch (err) {
        logger.error('Payment verification failed', err);
        return false;
    }
};
/**
 * Process callback from Paymob
 */
export const processCallback = async (data) => {
    try {
        // Verify the callback
        if (!verifyPayment(data)) {
            logger.error('Invalid payment callback - HMAC verification failed');
            return { success: false };
        }
        const orderId = data.order?.merchant_order_id || data.merchant_order_id;
        const success = data.success === true;
        return {
            success,
            orderId
        };
    }
    catch (err) {
        logger.error('Failed to process payment callback', err);
        return { success: false };
    }
};
