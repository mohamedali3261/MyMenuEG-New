import crypto from 'crypto';
const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE_NAME = 'csrf_token';
// Store CSRF tokens with expiry (in-memory, for production use Redis)
const tokenStore = new Map();
// Clean up expired tokens every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of tokenStore.entries()) {
        if (value.expiresAt < now) {
            tokenStore.delete(key);
        }
    }
}, 5 * 60 * 1000);
/**
 * Generate a new CSRF token
 */
export const generateCsrfToken = () => {
    return crypto.randomBytes(32).toString('hex');
};
/**
 * Middleware to generate and attach CSRF token
 */
export const csrfProtection = (req, res, next) => {
    // Skip CSRF for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        // Generate token for GET requests to be used in subsequent POST/PUT/DELETE
        const existingToken = req.cookies?.[CSRF_COOKIE_NAME];
        if (existingToken && tokenStore.has(existingToken)) {
            res.locals.csrfToken = existingToken;
        }
        else {
            const newToken = generateCsrfToken();
            tokenStore.set(newToken, {
                token: newToken,
                expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            });
            res.cookie(CSRF_COOKIE_NAME, newToken, {
                httpOnly: false, // Must be accessible to JS
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000,
            });
            res.locals.csrfToken = newToken;
        }
        return next();
    }
    // For POST, PUT, DELETE, PATCH - validate CSRF token
    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
    const headerToken = req.headers[CSRF_HEADER];
    if (!cookieToken || !headerToken) {
        return res.status(403).json({
            error: 'CSRF token missing',
            code: 'CSRF_MISSING'
        });
    }
    // Validate tokens match
    if (cookieToken !== headerToken) {
        return res.status(403).json({
            error: 'CSRF token mismatch',
            code: 'CSRF_MISMATCH'
        });
    }
    // Check token exists in store
    const stored = tokenStore.get(cookieToken);
    if (!stored || stored.expiresAt < Date.now()) {
        tokenStore.delete(cookieToken);
        return res.status(403).json({
            error: 'CSRF token expired or invalid',
            code: 'CSRF_INVALID'
        });
    }
    next();
};
/**
 * Endpoint to get CSRF token
 */
export const getCsrfToken = (req, res) => {
    const token = res.locals.csrfToken || generateCsrfToken();
    tokenStore.set(token, {
        token,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    res.cookie(CSRF_COOKIE_NAME, token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ csrfToken: token });
};
