import { Request, Response, NextFunction } from 'express';

/**
 * Sanitize string input to prevent XSS
 */
export const sanitizeString = (str: string): string => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate and sanitize pagination parameters
 */
export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(String(req.query.page)) || 1;
  const limit = parseInt(String(req.query.limit)) || 20;

  // Ensure positive values
  req.query.page = String(Math.max(1, page));
  req.query.limit = String(Math.min(100, Math.max(1, limit))); // Max 100 items per page

  next();
};

/**
 * Validate MongoDB/ObjectID-like IDs
 */
export const validateId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID parameter' });
  }

  // Allow alphanumeric with dashes and underscores
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  next();
};

/**
 * Validate required fields in request body
 */
export const requireFields = (...fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = fields.filter(field => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missing
      });
    }

    next();
  };
};

/**
 * Validate file upload parameters
 */
export const validateUploadFolder = (req: Request, res: Response, next: NextFunction) => {
  const rawPage = String(req.body.page || 'general');
  
  // Only allow alphanumeric, dash, and underscore
  const pageFolder = rawPage.replace(/[^a-zA-Z0-9_-]/g, '');
  
  // Prevent path traversal
  if (pageFolder.includes('..') || pageFolder.includes('/') || pageFolder.includes('\\')) {
    return res.status(400).json({ error: 'Invalid folder name' });
  }
  
  req.body.page = pageFolder;
  next();
};

/**
 * Validate status values
 */
export const VALID_STATUSES = ['active', 'draft', 'archived', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export const validateStatus = (req: Request, res: Response, next: NextFunction) => {
  const { status } = req.body;

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: 'Invalid status value',
      validValues: VALID_STATUSES
    });
  }

  next();
};
