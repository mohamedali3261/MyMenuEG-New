/**
 * Parse permissions from JSON string
 */
const parsePermissions = (permissionsStr) => {
    if (!permissionsStr)
        return [];
    try {
        const parsed = JSON.parse(permissionsStr);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
};
/**
 * Check if user has required permission
 */
export const hasPermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        // Super admin has all permissions
        if (req.user.is_super_admin) {
            return next();
        }
        const userPermissions = req.user.permissions || [];
        if (!userPermissions.includes(requiredPermission)) {
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
export const hasAnyPermission = (...permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        // Super admin has all permissions
        if (req.user.is_super_admin) {
            return next();
        }
        const userPermissions = req.user.permissions || [];
        const hasAny = permissions.some(p => userPermissions.includes(p));
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
export const hasAllPermissions = (...permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        // Super admin has all permissions
        if (req.user.is_super_admin) {
            return next();
        }
        const userPermissions = req.user.permissions || [];
        const hasAll = permissions.every(p => userPermissions.includes(p));
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
export const attachPermissions = async (req, res, next) => {
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
