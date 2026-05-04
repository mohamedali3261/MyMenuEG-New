import { logger } from '../utils/logger';
const REDIS_URL = process.env.REDIS_URL;
const isRedisConfigured = REDIS_URL !== undefined;
// Redis client - only import if configured
let redisClient = null;
/**
 * Initialize Redis connection
 */
export const initRedis = async () => {
    if (!isRedisConfigured) {
        logger.info('Redis not configured, using in-memory cache');
        return false;
    }
    try {
        // Dynamic import for redis
        // @ts-expect-error redis is optional at runtime and may be absent in some environments
        const { createClient } = await import('redis');
        redisClient = createClient({ url: REDIS_URL });
        redisClient.on('error', (err) => {
            logger.error('Redis Client Error', err);
        });
        redisClient.on('connect', () => {
            logger.info('Redis connected successfully');
        });
        await redisClient.connect();
        return true;
    }
    catch (err) {
        logger.error('Failed to connect to Redis', err);
        return false;
    }
};
/**
 * Get value from Redis
 */
export const redisGet = async (key) => {
    if (!redisClient)
        return null;
    try {
        return await redisClient.get(key);
    }
    catch (err) {
        logger.error(`Redis GET error for key: ${key}`, err);
        return null;
    }
};
/**
 * Set value in Redis
 */
export const redisSet = async (key, value, ttlSeconds) => {
    if (!redisClient)
        return false;
    try {
        if (ttlSeconds) {
            await redisClient.setEx(key, ttlSeconds, value);
        }
        else {
            await redisClient.set(key, value);
        }
        return true;
    }
    catch (err) {
        logger.error(`Redis SET error for key: ${key}`, err);
        return false;
    }
};
/**
 * Delete key from Redis
 */
export const redisDel = async (key) => {
    if (!redisClient)
        return false;
    try {
        await redisClient.del(key);
        return true;
    }
    catch (err) {
        logger.error(`Redis DEL error for key: ${key}`, err);
        return false;
    }
};
/**
 * Delete keys matching pattern
 */
export const redisDelPattern = async (pattern) => {
    if (!redisClient)
        return 0;
    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length === 0)
            return 0;
        await redisClient.del(keys);
        return keys.length;
    }
    catch (err) {
        logger.error(`Redis DEL pattern error: ${pattern}`, err);
        return 0;
    }
};
/**
 * Check if Redis is connected
 */
export const isRedisConnected = () => {
    return redisClient !== null && redisClient.isOpen;
};
/**
 * Disconnect Redis
 */
export const disconnectRedis = async () => {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
    }
};
