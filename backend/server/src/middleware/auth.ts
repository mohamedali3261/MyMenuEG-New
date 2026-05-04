import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

// Validate JWT secrets at startup
const validateJwtSecret = (secret: string | undefined, name: string): string => {
  if (!secret) {
    throw new Error(`${name} is required`);
  }
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  // In production, enforce strict validation
  if (isProduction) {
    if (secret.length < 32) {
      throw new Error(`${name} must be at least 32 characters long in production`);
    }
    const weakSecrets = ['secret', 'password', 'jwt-secret', 'your-jwt-secret', 'your-refresh-secret', 'changeme'];
    if (weakSecrets.some(weak => secret.toLowerCase().includes(weak))) {
      throw new Error(`${name} appears to be a weak or placeholder value. Please use a strong random secret in production.`);
    }
  } else {
    // In development, just warn
    if (secret.length < 32) {
      logger.warn(`WARNING: ${name} should be at least 32 characters long for security`);
    }
    const weakSecrets = ['secret', 'password', 'jwt-secret', 'your-jwt-secret', 'your-refresh-secret', 'changeme'];
    if (weakSecrets.some(weak => secret.toLowerCase().includes(weak))) {
      logger.warn(`WARNING: ${name} appears to be a placeholder. Please use a strong random secret!`);
    }
  }
  
  return secret;
};

const validatedJwtSecret = validateJwtSecret(JWT_SECRET, 'JWT_SECRET');
const validatedRefreshSecret = validateJwtSecret(JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET');

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    is_super_admin: boolean;
    permissions: string[];
  };
}

/**
 * Verify JWT token and attach user to request
 */
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = (Array.isArray(authHeader) ? authHeader[0] : authHeader)?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, validatedJwtSecret) as jwt.JwtPayload;
    
    // Fetch user from database to get fresh permissions
    const admin = await prisma.admins.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        is_super_admin: true,
        permissions: true,
        is_active: true
      }
    });

    if (!admin) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!admin.is_active) {
      return res.status(401).json({ error: 'Account is disabled' });
    }

    // Parse permissions
    let permissions: string[] = [];
    try {
      permissions = admin.permissions ? JSON.parse(admin.permissions) : [];
    } catch {
      permissions = [];
    }

    req.user = {
      id: admin.id,
      username: admin.username,
      is_super_admin: admin.is_super_admin || false,
      permissions
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    logger.error('Authentication error:', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Verify JWT token and attach user to request (Optional version)
 */
export const optionalAuthenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = (Array.isArray(authHeader) ? authHeader[0] : authHeader)?.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, validatedJwtSecret) as jwt.JwtPayload;
    
    const admin = await prisma.admins.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        is_super_admin: true,
        permissions: true,
        is_active: true
      }
    });

    if (admin && admin.is_active) {
      let permissions: string[] = [];
      try {
        permissions = admin.permissions ? JSON.parse(admin.permissions) : [];
      } catch {
        permissions = [];
      }

      req.user = {
        id: admin.id,
        username: admin.username,
        is_super_admin: admin.is_super_admin || false,
        permissions
      };
    }
  } catch (err) {
    // Ignore invalid tokens for optional auth
  }
  next();
};

/**
 * Require super admin role
 */
export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!req.user.is_super_admin) {
    return res.status(403).json({ error: 'Super admin access required' });
  }

  next();
};

/**
 * Optional authentication - attaches user if token present, but doesn't require it
 */
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = (Array.isArray(authHeader) ? authHeader[0] : authHeader)?.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, validatedJwtSecret) as jwt.JwtPayload;
    
    const admin = await prisma.admins.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        is_super_admin: true,
        permissions: true,
        is_active: true
      }
    });

    if (admin && admin.is_active) {
      let permissions: string[] = [];
      try {
        permissions = admin.permissions ? JSON.parse(admin.permissions) : [];
      } catch {
        permissions = [];
      }

      req.user = {
        id: admin.id,
        username: admin.username,
        is_super_admin: admin.is_super_admin || false,
        permissions
      };
    }
  } catch {
    // Token invalid, but that's okay for optional auth
  }

  next();
};

export interface CustomerAuthRequest extends Request {
  customer?: {
    id: string;
    email: string;
    name: string | null;
  };
}

/**
 * Verify JWT token for customer (Google-authenticated)
 */
export const authenticateCustomer = async (req: CustomerAuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = (Array.isArray(authHeader) ? authHeader[0] : authHeader)?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, validatedJwtSecret) as jwt.JwtPayload;

    const customer = await prisma.customers.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, is_active: true }
    });

    if (!customer) {
      return res.status(401).json({ error: 'Customer not found' });
    }

    if (customer.is_active === false) {
      return res.status(403).json({ error: 'هذا الحساب معطل. يرجى التواصل مع الإدارة' });
    }

    req.customer = {
      id: customer.id,
      email: customer.email,
      name: customer.name
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    logger.error('Customer authentication error:', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Middleware that allows either an admin or a customer
 */
export const authenticateAny = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = (Array.isArray(authHeader) ? authHeader[0] : authHeader)?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, validatedJwtSecret) as jwt.JwtPayload;
    
    // Check if it's an admin
    const admin = await prisma.admins.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, is_super_admin: true, permissions: true, is_active: true }
    });

    if (admin && admin.is_active) {
      (req as any).user = {
        id: admin.id,
        username: admin.username,
        is_super_admin: admin.is_super_admin || false,
        permissions: admin.permissions ? JSON.parse(admin.permissions) : []
      };
      return next();
    }

    // Check if it's a customer
    const customer = await prisma.customers.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, is_active: true }
    });

    if (customer && customer.is_active !== false) {
      (req as any).customer = {
        id: customer.id,
        email: customer.email,
        name: customer.name
      };
      return next();
    }

    return res.status(401).json({ error: 'User not found or disabled' });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Export validated secrets for use in authController
export { validatedJwtSecret, validatedRefreshSecret };
