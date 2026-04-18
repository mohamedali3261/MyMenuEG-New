import { logger } from '../utils/logger';
/**
 * Input validation patterns
 */
const DANGEROUS_PATTERNS = {
    // Path traversal
    pathTraversal: /\.\.[\/\\]/g,
    // Null bytes
    nullBytes: /\x00/g,
    // Unicode control characters
    controlChars: /[\x00-\x1F\x7F]/g,
    // Script injection patterns
    scriptInjection: /<\s*script[^>]*>.*?<\s*\/\s*script\s*>/gis,
    // Event handlers
    eventHandlers: /\bon\w+\s*=/gi,
    // JavaScript protocol
    jsProtocol: /javascript\s*:/gi,
    // Data URI (potential XSS)
    dataUri: /data\s*:\s*text\/html/gi,
};
/**
 * Validate and sanitize string input
 */
const validateString = (value, fieldName) => {
    const errors = [];
    let sanitized = value;
    // Check for path traversal
    if (DANGEROUS_PATTERNS.pathTraversal.test(value)) {
        errors.push(`Path traversal detected in ${fieldName}`);
        sanitized = sanitized.replace(DANGEROUS_PATTERNS.pathTraversal, '');
    }
    // Check for null bytes
    if (DANGEROUS_PATTERNS.nullBytes.test(value)) {
        errors.push(`Null bytes detected in ${fieldName}`);
        sanitized = sanitized.replace(DANGEROUS_PATTERNS.nullBytes, '');
    }
    // Check for control characters (except newlines and tabs)
    const controlCharsMatch = value.match(DANGEROUS_PATTERNS.controlChars);
    if (controlCharsMatch && controlCharsMatch.some(c => !['\n', '\r', '\t'].includes(c))) {
        errors.push(`Control characters detected in ${fieldName}`);
        sanitized = sanitized.replace(DANGEROUS_PATTERNS.controlChars, (char) => ['\n', '\r', '\t'].includes(char) ? char : '');
    }
    // Check for script injection
    if (DANGEROUS_PATTERNS.scriptInjection.test(value)) {
        errors.push(`Script injection detected in ${fieldName}`);
        sanitized = sanitized.replace(DANGEROUS_PATTERNS.scriptInjection, '');
    }
    // Check for event handlers
    if (DANGEROUS_PATTERNS.eventHandlers.test(value)) {
        errors.push(`Event handlers detected in ${fieldName}`);
        sanitized = sanitized.replace(DANGEROUS_PATTERNS.eventHandlers, '');
    }
    // Check for javascript: protocol
    if (DANGEROUS_PATTERNS.jsProtocol.test(value)) {
        errors.push(`JavaScript protocol detected in ${fieldName}`);
        sanitized = sanitized.replace(DANGEROUS_PATTERNS.jsProtocol, '');
    }
    return {
        valid: errors.length === 0,
        sanitized,
        errors,
    };
};
/**
 * Recursively validate and sanitize object
 */
const validateObject = (obj, path = '') => {
    const errors = [];
    if (obj === null || obj === undefined) {
        return { valid: true, sanitized: obj, errors: [] };
    }
    if (typeof obj === 'string') {
        const result = validateString(obj, path || 'value');
        return result;
    }
    if (Array.isArray(obj)) {
        const sanitizedArray = [];
        let allValid = true;
        obj.forEach((item, index) => {
            const result = validateObject(item, `${path}[${index}]`);
            if (!result.valid) {
                allValid = false;
                errors.push(...result.errors);
            }
            sanitizedArray.push(result.sanitized);
        });
        return { valid: allValid, sanitized: sanitizedArray, errors };
    }
    if (typeof obj === 'object') {
        const sanitizedObj = {};
        let allValid = true;
        for (const [key, value] of Object.entries(obj)) {
            // Validate key name
            const keyResult = validateString(key, `key at ${path}`);
            if (!keyResult.valid) {
                allValid = false;
                errors.push(...keyResult.errors);
            }
            // Validate value
            const valueResult = validateObject(value, path ? `${path}.${key}` : key);
            if (!valueResult.valid) {
                allValid = false;
                errors.push(...valueResult.errors);
            }
            sanitizedObj[keyResult.sanitized] = valueResult.sanitized;
        }
        return { valid: allValid, sanitized: sanitizedObj, errors };
    }
    return { valid: true, sanitized: obj, errors: [] };
};
/**
 * Input validation middleware
 */
export const validateInput = (req, res, next) => {
    // Validate query parameters
    if (req.query && Object.keys(req.query).length > 0) {
        const result = validateObject(req.query, 'query');
        if (!result.valid) {
            logger.warn(`Input validation failed for query params: ${result.errors.join(', ')}`);
            // Log but don't block - just sanitize
            req.query = result.sanitized;
        }
    }
    // Validate body
    if (req.body && typeof req.body === 'object') {
        const result = validateObject(req.body, 'body');
        if (!result.valid) {
            logger.warn(`Input validation failed for body: ${result.errors.join(', ')}`);
            // Log but don't block - just sanitize
            req.body = result.sanitized;
        }
    }
    // Validate params
    if (req.params && Object.keys(req.params).length > 0) {
        const result = validateObject(req.params, 'params');
        if (!result.valid) {
            logger.warn(`Input validation failed for params: ${result.errors.join(', ')}`);
            req.params = result.sanitized;
        }
    }
    next();
};
/**
 * Strict input validation - blocks requests with dangerous patterns
 */
export const strictInputValidation = (req, res, next) => {
    const checkValue = (value, path) => {
        const errors = [];
        if (typeof value === 'string') {
            if (DANGEROUS_PATTERNS.pathTraversal.test(value)) {
                errors.push(`Path traversal attempt in ${path}`);
            }
            if (DANGEROUS_PATTERNS.nullBytes.test(value)) {
                errors.push(`Null bytes in ${path}`);
            }
            if (DANGEROUS_PATTERNS.scriptInjection.test(value)) {
                errors.push(`Script injection attempt in ${path}`);
            }
        }
        else if (Array.isArray(value)) {
            value.forEach((item, index) => {
                errors.push(...checkValue(item, `${path}[${index}]`));
            });
        }
        else if (typeof value === 'object' && value !== null) {
            for (const [key, val] of Object.entries(value)) {
                errors.push(...checkValue(val, `${path}.${key}`));
            }
        }
        return errors;
    };
    const allErrors = [];
    // Check query
    if (req.query) {
        allErrors.push(...checkValue(req.query, 'query'));
    }
    // Check body
    if (req.body) {
        allErrors.push(...checkValue(req.body, 'body'));
    }
    // Check params
    if (req.params) {
        allErrors.push(...checkValue(req.params, 'params'));
    }
    if (allErrors.length > 0) {
        logger.error(`Strict input validation blocked request: ${allErrors.join('; ')}`);
        return res.status(400).json({
            error: 'Invalid input detected',
            code: 'INPUT_VALIDATION_FAILED',
        });
    }
    next();
};
/**
 * File upload validation middleware
 */
export const validateFileUpload = (allowedTypes, maxSizeBytes) => {
    return (req, res, next) => {
        if (!req.file && !req.files) {
            return next();
        }
        const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];
        for (const file of files) {
            if (!file)
                continue;
            // Check file size
            if (file.size > maxSizeBytes) {
                return res.status(400).json({
                    error: `File ${file.originalname} exceeds maximum size of ${maxSizeBytes / 1024 / 1024}MB`,
                    code: 'FILE_TOO_LARGE',
                });
            }
            // Check MIME type
            if (!allowedTypes.includes(file.mimetype)) {
                return res.status(400).json({
                    error: `File type ${file.mimetype} is not allowed`,
                    code: 'INVALID_FILE_TYPE',
                });
            }
            // Check filename for dangerous patterns
            const filenameValidation = validateString(file.originalname, 'filename');
            if (!filenameValidation.valid) {
                return res.status(400).json({
                    error: 'Invalid filename',
                    code: 'INVALID_FILENAME',
                });
            }
        }
        next();
    };
};
