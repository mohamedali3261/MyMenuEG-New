import crypto from 'crypto';
import { logger } from '../utils/logger';
import { resilientRequestOrThrow } from './resilientHttpService';

// Paymob configuration
const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID;
const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET;

// Fawry configuration
const FAWRY_MERCHANT_CODE = process.env.FAWRY_MERCHANT_CODE;
const FAWRY_SECURITY_KEY = process.env.FAWRY_SECURITY_KEY;

const PAYMOB_BASE_URL = 'https://accept.paymob.com/api';
const FAWRY_BASE_URL = 'https://atfawry.fawrystaging.com/fawrypay-api/api/v2';

const isPaymobConfigured = PAYMOB_API_KEY && PAYMOB_INTEGRATION_ID && PAYMOB_IFRAME_ID;
const isFawryConfigured = FAWRY_MERCHANT_CODE && FAWRY_SECURITY_KEY;

interface PaymentData {
  amount: number;
  currency: string;
  orderId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: {
    name: string;
    amount: number;
    quantity: number;
  }[];
  method?: 'card' | 'fawry' | 'wallet';
  walletNumber?: string;
}

interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  paymentKey?: string;
  referenceNumber?: string;
  error?: string;
}

/**
 * Get authentication token from Paymob
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    const response = await resilientRequestOrThrow<{ token: string }>({
      service: 'paymob',
      method: 'POST',
      url: `${PAYMOB_BASE_URL}/auth/tokens`,
      data: {
      api_key: PAYMOB_API_KEY
      },
    });
    return response.token;
  } catch (err) {
    logger.error('Failed to get Paymob auth token', err);
    return null;
  }
};

/**
 * Register order with Paymob
 */
const registerOrder = async (
  token: string,
  amount: number,
  orderId: string
): Promise<number | null> => {
  try {
    const response = await resilientRequestOrThrow<{ id: number }>({
      service: 'paymob',
      method: 'POST',
      url: `${PAYMOB_BASE_URL}/ecommerce/orders`,
      data: {
      auth_token: token,
      delivery_needed: false,
      amount_cents: Math.round(amount * 100),
      currency: 'EGP',
      merchant_order_id: orderId,
      items: []
      },
    });
    return response.id;
  } catch (err) {
    logger.error('Failed to register order with Paymob', err);
    return null;
  }
};

/**
 * Generate payment key
 */
const generatePaymentKey = async (
  token: string,
  orderId: number,
  amount: number,
  customer: { name: string; email: string; phone: string }
): Promise<string | null> => {
  try {
    const [first_name, last_name] = customer.name.split(' ');
    
    const response = await resilientRequestOrThrow<{ token: string }>({
      service: 'paymob',
      method: 'POST',
      url: `${PAYMOB_BASE_URL}/acceptance/payment_keys`,
      data: {
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
      integration_id: parseInt(PAYMOB_INTEGRATION_ID!)
      },
    });
    
    return response.token;
  } catch (err) {
    logger.error('Failed to generate payment key', err);
    return null;
  }
};

/**
 * Initialize payment and get payment URL
 */
export const initializePayment = async (data: PaymentData): Promise<PaymentResponse> => {
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
  } catch (err) {
    logger.error('Payment initialization failed', err);
    return { success: false, error: 'Payment initialization failed' };
  }
};

/**
 * Verify payment callback
 */
export const verifyPayment = (data: any): boolean => {
  if (!PAYMOB_HMAC_SECRET) {
    logger.warn('Paymob HMAC secret not configured');
    return false;
  }

  try {
    const cryptoModule = crypto;
    
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
    
    const hmac = cryptoModule
      .createHmac('sha512', PAYMOB_HMAC_SECRET)
      .update(concatenated)
      .digest('hex');

    return hmac === data.hmac;
  } catch (err) {
    logger.error('Payment verification failed', err);
    return false;
  }
};

/**
 * Process callback from Paymob
 */
export const processCallback = async (data: any): Promise<{ success: boolean; orderId?: string }> => {
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
  } catch (err) {
    logger.error('Failed to process payment callback', err);
    return { success: false };
  }
};

// --- Fawry Payment ---

/**
 * Initialize Fawry payment (charge via Fawry reference)
 */
export const initializeFawryPayment = async (data: PaymentData): Promise<PaymentResponse> => {
  if (!isFawryConfigured) {
    return { success: false, error: 'Fawry payment not configured' };
  }

  try {
    const merchantCode = FAWRY_MERCHANT_CODE!;
    const securityKey = FAWRY_SECURITY_KEY!;
    const merchantRefNum = data.orderId;

    // Build items array
    const fawryItems = data.items.map(item => ({
      itemId: item.name.replace(/\s+/g, '_').slice(0, 50),
      description: item.name,
      price: item.amount,
      quantity: item.quantity
    }));

    // Generate signature: merchantCode + merchantRefNum + customerProfileId + amount + securityKey
    const customerProfileId = data.customer.phone || data.orderId;
    const signatureString = merchantCode + merchantRefNum + customerProfileId + data.amount.toFixed(2) + securityKey;
    const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

    const payload = {
      merchantCode,
      merchantRefNum,
      customerProfileId,
      customerName: data.customer.name,
      customerMobile: data.customer.phone,
      customerEmail: data.customer.email,
      amount: data.amount,
      currencyCode: 'EGP',
      chargeItems: fawryItems,
      signature,
      paymentMethod: 'PAYATFAWRY',
    };

    const result = await resilientRequestOrThrow<any>({
      service: 'fawry',
      method: 'POST',
      url: `${FAWRY_BASE_URL}/charge`,
      data: payload,
    });

    if (result.statusCode === 200 || result.type === 'ChargeResponse') {
      return {
        success: true,
        referenceNumber: result.referenceNumber,
        paymentUrl: `https://www.fawry.com/?ref=${result.referenceNumber}`,
      };
    }

    return { success: false, error: result.statusDescription || 'Fawry payment failed' };
  } catch (err: any) {
    logger.error('Fawry payment initialization failed', err);
    const msg = err?.response?.data?.statusDescription || err?.response?.data?.message || 'Fawry payment failed';
    return { success: false, error: msg };
  }
};

/**
 * Verify Fawry callback signature
 */
export const verifyFawryCallback = (data: any): boolean => {
  if (!FAWRY_MERCHANT_CODE || !FAWRY_SECURITY_KEY) return false;

  try {
    const { merchantCode, orderReferenceNumber, paymentAmount, paymentRefNumber, orderStatus } = data;
    const sigString = merchantCode + orderReferenceNumber + paymentAmount + paymentRefNumber + orderStatus + FAWRY_SECURITY_KEY;
    const expectedSig = crypto.createHash('sha256').update(sigString).digest('hex');
    return expectedSig === data.signature;
  } catch {
    return false;
  }
};

// --- Mobile Wallet Payment (via Paymob mobile wallet integration) ---

/**
 * Initialize mobile wallet payment via Paymob
 */
export const initializeWalletPayment = async (data: PaymentData): Promise<PaymentResponse> => {
  if (!isPaymobConfigured) {
    return { success: false, error: 'Payment gateway not configured' };
  }

  if (!data.walletNumber) {
    return { success: false, error: 'Wallet number is required' };
  }

  try {
    // Step 1: Get auth token
    const token = await getAuthToken();
    if (!token) return { success: false, error: 'Failed to authenticate with payment gateway' };

    // Step 2: Register order
    const paymobOrderId = await registerOrder(token, data.amount, data.orderId);
    if (!paymobOrderId) return { success: false, error: 'Failed to register order' };

    // Step 3: Generate payment key for mobile wallet
    const [first_name, last_name] = data.customer.name.split(' ');
    const walletIntegrationId = process.env.PAYMOB_WALLET_INTEGRATION_ID || PAYMOB_INTEGRATION_ID;

    const response = await resilientRequestOrThrow<{ token: string }>({
      service: 'paymob',
      method: 'POST',
      url: `${PAYMOB_BASE_URL}/acceptance/payment_keys`,
      data: {
      auth_token: token,
      amount_cents: Math.round(data.amount * 100),
      expiration: 3600,
      order_id: paymobOrderId,
      billing_data: {
        first_name: first_name || 'Customer',
        last_name: last_name || 'Customer',
        email: data.customer.email || 'customer@example.com',
        phone_number: data.customer.phone,
        country: 'EG',
        city: 'Cairo',
        street: 'NA',
        building: 'NA',
        floor: 'NA',
        apartment: 'NA'
      },
      currency: 'EGP',
      integration_id: parseInt(walletIntegrationId!)
      },
    });

    const paymentKey = response.token;

    // Step 4: Process wallet payment
    const walletResponse = await resilientRequestOrThrow<{ success?: boolean; pending?: boolean; redirect_url?: string }>({
      service: 'paymob',
      method: 'POST',
      url: `${PAYMOB_BASE_URL}/acceptance/payments/pay`,
      data: {
      source: {
        identifier: data.walletNumber,
        subtype: 'WALLET'
      },
      payment_token: paymentKey
      },
    });

    if (walletResponse.success === true || walletResponse.pending === true) {
      return {
        success: true,
        paymentUrl: walletResponse.redirect_url,
        paymentKey
      };
    }

    return { success: false, error: 'Wallet payment failed' };
  } catch (err: any) {
    logger.error('Wallet payment initialization failed', err);
    const msg = err?.response?.data?.message || 'Wallet payment failed';
    return { success: false, error: msg };
  }
};
