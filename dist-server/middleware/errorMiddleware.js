import { logger } from '../utils/logger';
/**
 * Global Error Handling Middleware
 * Catch-all for any error thrown in the request lifecycle.
 */
export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    logger.error(`[Error] ${req.method} ${req.path}`, err);
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        // Only include stack trace in development mode for security
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
        success: false
    });
};
