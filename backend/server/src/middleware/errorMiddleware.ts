import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Global Error Handling Middleware
 * Catch-all for any error thrown in the request lifecycle.
 */
export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Log error with request context
  logger.error(`[Error] ${req.method} ${req.path}`, {
    message: err.message,
    stack: err.stack,
    requestId: res.locals.requestId,
  });

  // In production, never expose internal error details
  const response: any = {
    success: false,
    message: isProduction 
      ? 'An unexpected error occurred. Please try again later.' 
      : err.message || 'Internal Server Error',
  };

  // Only include error details in development
  if (!isProduction) {
    response.error = err.message;
    response.stack = err.stack;
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.details || [err.message],
    });
  }

  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }

  if (err.code === 'P2002') {
    // Prisma unique constraint violation
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists',
    });
  }

  res.status(statusCode).json(response);
};
