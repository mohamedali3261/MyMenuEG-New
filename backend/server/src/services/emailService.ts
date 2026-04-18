import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

// Email configuration
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@mymenueg.com';

// Check if email is configured
const isEmailConfigured = SMTP_HOST && SMTP_USER && SMTP_PASS;

// Create transporter
let transporter: nodemailer.Transporter | null = null;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  if (!isEmailConfigured || !transporter) {
    logger.warn('Email not configured. Skipping email send.');
    return false;
  }

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: Array.isArray(options.to) ? options.to.join(',') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    });

    logger.info(`Email sent to ${Array.isArray(options.to) ? options.to.join(',') : options.to}`);
    return true;
  } catch (err) {
    logger.error('Failed to send email', err);
    return false;
  }
};

/**
 * Send order confirmation email
 */
export const sendOrderConfirmationEmail = async (
  email: string,
  orderId: string,
  customerName: string,
  total: number,
  items: { name: string; quantity: number; price: number }[]
) => {
  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price} EGP</td>
        </tr>
      `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-id { font-size: 24px; font-weight: bold; color: #667eea; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #667eea; color: white; padding: 12px; }
        .total { font-size: 20px; font-weight: bold; text-align: right; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛒 MyMenuEG</h1>
          <p>Order Confirmation</p>
        </div>
        <div class="content">
          <p>Dear ${customerName},</p>
          <p>Thank you for your order! Your order has been received and is being processed.</p>
          
          <p class="order-id">Order #${orderId}</p>
          
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <p class="total">Total: ${total.toFixed(2)} EGP</p>
          
          <p>We will contact you shortly to confirm your order.</p>
          <p>Thank you for shopping with us!</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} MyMenuEG. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Order Confirmation #${orderId} - MyMenuEG`,
    html,
    text: `Order Confirmation #${orderId}\n\nDear ${customerName},\n\nThank you for your order! Total: ${total.toFixed(2)} EGP\n\nWe will contact you shortly.`
  });
};

/**
 * Send order status update email
 */
export const sendOrderStatusEmail = async (
  email: string,
  orderId: string,
  customerName: string,
  status: string,
  statusAr: string
) => {
  const statusMessages: Record<string, { en: string; ar: string }> = {
    processing: {
      en: 'Your order is being processed and will be shipped soon.',
      ar: 'طلبك قيد التجهيز وسيتم شحنه قريباً.'
    },
    shipped: {
      en: 'Your order has been shipped and is on its way to you.',
      ar: 'تم شحن طلبك وهو في الطريق إليك.'
    },
    delivered: {
      en: 'Your order has been delivered. Thank you for shopping with us!',
      ar: 'تم تسليم طلبك. شكراً لتسوقك معنا!'
    },
    cancelled: {
      en: 'Your order has been cancelled. If you have any questions, please contact us.',
      ar: 'تم إلغاء طلبك. إذا كان لديك أي استفسار، يرجى التواصل معنا.'
    }
  };

  const message = statusMessages[status] || { en: status, ar: statusAr };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .status { font-size: 24px; font-weight: bold; color: #667eea; text-transform: uppercase; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛒 MyMenuEG</h1>
          <p>Order Status Update</p>
        </div>
        <div class="content">
          <p>Dear ${customerName},</p>
          <p>Your order <strong>#${orderId}</strong> status has been updated.</p>
          <p class="status">${status}</p>
          <p>${message.en}</p>
          <p>${message.ar}</p>
          <p>Thank you for shopping with us!</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} MyMenuEG. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Order #${orderId} Status Update - ${status} - MyMenuEG`,
    html,
    text: `Order #${orderId} Status: ${status}\n\n${message.en}`
  });
};

/**
 * Send contact form notification to admin
 */
export const sendContactNotificationToAdmin = async (
  adminEmail: string,
  contactData: { name: string; email: string; phone: string; subject: string; message: string }
) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f39c12; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📬 New Contact Message</h2>
        </div>
        <div class="content">
          <div class="field">
            <span class="label">Name:</span> ${contactData.name}
          </div>
          <div class="field">
            <span class="label">Email:</span> ${contactData.email}
          </div>
          <div class="field">
            <span class="label">Phone:</span> ${contactData.phone}
          </div>
          <div class="field">
            <span class="label">Subject:</span> ${contactData.subject}
          </div>
          <div class="field">
            <span class="label">Message:</span>
            <p>${contactData.message}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `New Contact Message: ${contactData.subject}`,
    html,
    text: `New Contact Message\n\nFrom: ${contactData.name} (${contactData.email})\nPhone: ${contactData.phone}\nSubject: ${contactData.subject}\n\n${contactData.message}`
  });
};
