import { Response } from 'express';

/**
 * Standardized Response Handler
 * Ensures consistent communication between Backend and Frontend.
 */
export const sendSuccess = (res: Response, data: any, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const sendError = (res: Response, message = 'Internal Server Error', statusCode = 500, details: any = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    details
  });
};
