import { logger } from '../utils/logger';
/**
 * Security headers middleware - additional headers beyond Helmet
 */
export const securityHeaders = (req, res, next) => {
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Enable XSS filter in browsers
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Permissions policy (formerly Feature-Policy)
    res.setHeader('Permissions-Policy', [
        'geolocation=()',
        'microphone=()',
        'camera=()',
        'payment=()',
        'usb=()',
    ].join(', '));
    next();
};
/**
 * Request sanitization middleware
 */
export const sanitizeRequest = (req, res, next) => {
    // Remove potential XSS payloads from query params
    if (req.query) {
        for (const key of Object.keys(req.query)) {
            const value = req.query[key];
            if (typeof value === 'string') {
                req.query[key] = sanitizeString(value);
            }
        }
    }
    // Sanitize body (basic - don't modify deeply nested objects)
    if (req.body && typeof req.body === 'object') {
        sanitizeObject(req.body);
    }
    next();
};
/**
 * Sanitize a string by removing potential XSS patterns
 */
const sanitizeString = (str) => {
    return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/data:/gi, '');
};
/**
 * Recursively sanitize an object
 */
const sanitizeObject = (obj) => {
    for (const key of Object.keys(obj)) {
        const value = obj[key];
        if (typeof value === 'string') {
            obj[key] = sanitizeString(value);
        }
        else if (typeof value === 'object' && value !== null) {
            sanitizeObject(value);
        }
    }
};
/**
 * IP-based request blocking for known bad actors
 */
const blockedIPs = new Set();
export const blockMaliciousIPs = (req, res, next) => {
    const clientIP = req.ip || req.socket.remoteAddress || '';
    if (blockedIPs.has(clientIP)) {
        logger.warn(`Blocked request from malicious IP: ${clientIP}`);
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
};
/**
 * Add IP to blocklist
 */
export const blockIP = (ip) => {
    blockedIPs.add(ip);
    logger.info(`Added IP to blocklist: ${ip}`);
};
/**
 * Remove IP from blocklist
 */
export const unblockIP = (ip) => {
    blockedIPs.delete(ip);
    logger.info(`Removed IP from blocklist: ${ip}`);
};
/**
 * SQL injection detection middleware
 */
export const detectSqlInjection = (req, res, next) => {
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
        /(--)|(\/\*)|(\*\/)/,
        /(\bOR\b|\bAND\b)\s*['"]?\d+['"]?\s*=\s*['"]?\d+/i,
        /['"];\s*(SELECT|INSERT|UPDATE|DELETE|DROP)/i,
    ];
    const checkValue = (value) => {
        if (typeof value === 'string') {
            return sqlPatterns.some(pattern => pattern.test(value));
        }
        if (typeof value === 'object' && value !== null) {
            return Object.values(value).some(checkValue);
        }
        return false;
    };
    const checkObject = (obj) => {
        return Object.values(obj).some(checkValue);
    };
    // Check query params
    if (req.query && checkObject(req.query)) {
        logger.warn(`Potential SQL injection detected in query params from IP: ${req.ip}`);
        return res.status(400).json({ error: 'Invalid request' });
    }
    // Check body
    if (req.body && checkValue(req.body)) {
        logger.warn(`Potential SQL injection detected in body from IP: ${req.ip}`);
        return res.status(400).json({ error: 'Invalid request' });
    }
    next();
};
/**
 * Request size validation
 */
export const validateRequestSize = (maxSizeKB = 100) => {
    return (req, res, next) => {
        const contentLength = parseInt(req.headers['content-length'] || '0', 10);
        if (contentLength > maxSizeKB * 1024) {
            return res.status(413).json({
                error: `Request body too large. Maximum allowed: ${maxSizeKB}KB`
            });
        }
        next();
    };
};
