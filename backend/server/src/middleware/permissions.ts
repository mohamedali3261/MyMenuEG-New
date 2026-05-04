import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Permission types
export type Permission = 
  | 'products:read'
  | 'products:write'
  | 'products:delete'
  | 'categories:read'
  | 'categories:write'
  | 'categories:delete'
  | 'orders:read'
  | 'orders:write'
  | 'orders:delete'
  | 'coupons:read'
  | 'coupons:write'
  | 'coupons:delete'
  | 'settings:read'
  | 'settings:write'
  | 'admins:read'
  | 'admins:write'
  | 'admins:delete'
  | 'pages:read'
  | 'pages:write'
  | 'pages:delete'
  | 'slides:read'
  | 'slides:write'
  | 'slides:delete'
  | 'notifications:read'
  | 'notifications:write'
  | 'customers:read'
  | 'customers:write'
  | 'customers:delete'
  | 'database:backup'
  | 'database:restore';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    is_super_admin: boolean;
    permissions?: string[];
  };
}

/**
 * Parse permissions from JSON string
 */
const parsePermissions = (permissionsStr: string | null | undefined): string[] => {
  if (!permissionsStr) return [];
  try {
    const parsed = JSON.parse(permissionsStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const LEGACY_PERMISSION_MAP: Record<string, Permission[]> = {
  products: ['products:read', 'products:write', 'products:delete'],
  categories: ['categories:read', 'categories:write', 'categories:delete'],
  orders: ['orders:read', 'orders:write', 'orders:delete'],
  coupons: ['coupons:read', 'coupons:write', 'coupons:delete'],
  settings: ['settings:read', 'settings:write'],
  admins: ['admins:read', 'admins:write', 'admins:delete'],
  pages: ['pages:read', 'pages:write', 'pages:delete'],
  slides: ['slides:read', 'slides:write', 'slides:delete'],
  notifications: ['notifications:read', 'notifications:write'],
  customers: ['customers:read', 'customers:write', 'customers:delete'],
  database: ['database:backup', 'database:restore'],
};

const normalizePermissions = (permissions: string[]): Set<string> => {
  const normalized = new Set<string>();
  for (const permission of permissions) {
    normalized.add(permission);
    const legacyMapped = LEGACY_PERMISSION_MAP[permission];
    if (legacyMapped) {
      for (const mapped of legacyMapped) normalized.add(mapped);
    }
  }
  return normalized;
};

/**
 * Check if user has required permission
 */
export const hasPermission = (requiredPermission: Permission) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Super admin has all permissions
    if (req.user.is_super_admin) {
      return next();
    }

    const userPermissions = normalizePermissions(req.user.permissions || []);
    if (!userPermissions.has(requiredPermission)) {
      return res.status(403).json({ 
        error: 'Permission denied',
        required: requiredPermission 
      });
    }

    next();
  };
};

/**
 * Check if user has any of the required permissions
 */
export const hasAnyPermission = (...permissions: Permission[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Super admin has all permissions
    if (req.user.is_super_admin) {
      return next();
    }

    const userPermissions = normalizePermissions(req.user.permissions || []);
    const hasAny = permissions.some(p => userPermissions.has(p));

    if (!hasAny) {
      return res.status(403).json({ 
        error: 'Permission denied',
        requiredAny: permissions 
      });
    }

    next();
  };
};

/**
 * Check if user has all of the required permissions
 */
export const hasAllPermissions = (...permissions: Permission[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Super admin has all permissions
    if (req.user.is_super_admin) {
      return next();
    }

    const userPermissions = normalizePermissions(req.user.permissions || []);
    const hasAll = permissions.every(p => userPermissions.has(p));

    if (!hasAll) {
      return res.status(403).json({ 
        error: 'Permission denied',
        requiredAll: permissions 
      });
    }

    next();
  };
};

/**
 * Middleware to attach user permissions to request
 */
export const attachPermissions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // This should be called after authenticateToken
  // The user object should already be attached
  if (!req.user) {
    return next();
  }

  // If permissions are already attached, skip
  if (req.user.permissions) {
    return next();
  }

  // Permissions will be loaded from the database in the auth middleware
  next();
};
