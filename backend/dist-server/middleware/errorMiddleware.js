import { logger } from '../utils/logger';
import { isAppError } from '../utils/appError';
/**
 * Global Error Handling Middleware
 * Catch-all for any error thrown in the request lifecycle.
 */
export const errorHandler = (err, req, res, _next) => {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    const isProduction = process.env.NODE_ENV === 'production';
    // Log error with request context
    logger.error(`[Error] ${req.method} ${req.path}`, {
        message: err.message,
        stack: err.stack,
        requestId: res.locals.requestId,
    });
    if (isAppError(err)) {
        const appErrResponse = {
            success: false,
            error: {
                code: err.code,
                message: err.message,
                requestId: res.locals.requestId,
            },
        };
        if (!isProduction && err.details !== undefined) {
            appErrResponse.error.details = err.details;
        }
        return res.status(err.statusCode).json(appErrResponse);
    }
    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: err.details || [err.message],
                requestId: res.locals.requestId,
            },
        });
    }
    if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: {
                code: 'AUTHENTICATION_FAILED',
                message: 'Authentication failed',
                requestId: res.locals.requestId,
            },
        });
    }
    if (err.code === 'P2002') {
        // Prisma unique constraint violation
        return res.status(409).json({
            success: false,
            error: {
                code: 'UNIQUE_CONSTRAINT_VIOLATION',
                message: 'A record with this value already exists',
                requestId: res.locals.requestId,
            },
        });
    }
    const response = {
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: isProduction
                ? 'An unexpected error occurred. Please try again later.'
                : err.message || 'Internal Server Error',
            requestId: res.locals.requestId,
        },
    };
    if (!isProduction) {
        response.error.stack = err.stack;
    }
    res.status(statusCode).json(response);
};
