/**
 * Helper functions for common operations
 */
/**
 * Safely extract a string from query parameter (handles all Express query types)
 */
export const getQueryParam = (param) => {
    if (param === undefined || param === null)
        return undefined;
    if (typeof param === 'string')
        return param;
    if (Array.isArray(param)) {
        const first = param[0];
        return typeof first === 'string' ? first : undefined;
    }
    return undefined;
};
/**
 * Safely extract and parse an integer from query parameter
 */
export const getQueryInt = (param, defaultValue, min, max) => {
    const str = getQueryParam(param);
    if (!str)
        return defaultValue;
    const parsed = parseInt(str, 10);
    if (!Number.isFinite(parsed))
        return defaultValue;
    let result = parsed;
    if (min !== undefined)
        result = Math.max(min, result);
    if (max !== undefined)
        result = Math.min(max, result);
    return result;
};
/**
 * Generate a unique ID with prefix
 */
export const generateId = (prefix) => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
};
/**
 * Sanitize string for use in slug
 */
export const slugify = (str) => {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
};
/**
 * Format currency (EGP)
 */
export const formatCurrency = (amount) => {
    return `${amount.toFixed(2)} EGP`;
};
/**
 * Calculate pagination metadata
 */
export const calculatePagination = (total, page, limit) => {
    return {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
    };
};
