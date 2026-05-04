import { logger } from '../utils/logger';
import Redis from 'ioredis';
const defaultTtlSeconds = Number(process.env.CACHE_TTL_SECONDS || 120);
const redisUrl = process.env.REDIS_URL;
// Redis client with error handling
let redis = null;
if (redisUrl) {
    try {
        redis = new Redis(redisUrl, {
            maxRetriesPerRequest: 1,
            retryStrategy: (times) => (times > 3 ? null : Math.min(times * 100, 2000)),
        });
        redis.on('error', (err) => logger.warn(`Redis connection error: ${err.message}`));
    }
    catch (err) {
        logger.warn(`Failed to initialize Redis: ${err}`);
    }
}
const memoryCache = new Map();
const revalidateLocks = new Set();
const buildKey = (scope, key) => `cache:${scope}:${key}`;
const readRaw = async (fullKey) => {
    // Try Redis first
    if (redis) {
        try {
            return await redis.get(fullKey);
        }
        catch (err) {
            logger.warn(`Redis get failed, falling back to memory: ${err}`);
        }
    }
    // Fallback to memory
    const item = memoryCache.get(fullKey);
    if (!item)
        return null;
    if (Date.now() > item.expiresAt) {
        memoryCache.delete(fullKey);
        return null;
    }
    return item.value;
};
const writeRaw = async (fullKey, value, ttlSeconds) => {
    // Write to Redis
    if (redis) {
        try {
            await redis.set(fullKey, value, 'EX', ttlSeconds);
        }
        catch (err) {
            logger.warn(`Redis set failed: ${err}`);
        }
    }
    // Always write to memory as secondary/fallback
    memoryCache.set(fullKey, {
        value,
        expiresAt: Date.now() + ttlSeconds * 1000,
    });
};
export const cacheGet = async (scope, key) => {
    const fullKey = buildKey(scope, key);
    return readRaw(fullKey);
};
export const cacheSet = async (scope, key, value, ttlSeconds = defaultTtlSeconds) => {
    const fullKey = buildKey(scope, key);
    await writeRaw(fullKey, value, ttlSeconds);
};
const parseEnvelope = (raw) => {
    try {
        const parsed = JSON.parse(raw);
        if (typeof parsed.value === 'string' &&
            typeof parsed.freshUntil === 'number' &&
            typeof parsed.staleUntil === 'number') {
            return parsed;
        }
        return null;
    }
    catch {
        return null;
    }
};
export const getCacheStatus = () => {
    return {
        type: redis ? 'redis' : 'memory',
        connected: redis ? redis.status === 'ready' : true,
        memoryItems: memoryCache.size
    };
};
export const cacheSetSWR = async (scope, key, value, freshTtlSeconds = defaultTtlSeconds, staleTtlSeconds = 300) => {
    const now = Date.now();
    const envelope = {
        value,
        freshUntil: now + freshTtlSeconds * 1000,
        staleUntil: now + staleTtlSeconds * 1000,
    };
    const fullKey = buildKey(scope, key);
    await writeRaw(fullKey, JSON.stringify(envelope), staleTtlSeconds);
};
export const cacheResolveSWR = async (scope, key, loader, freshTtlSeconds = defaultTtlSeconds, staleTtlSeconds = 300) => {
    const fullKey = buildKey(scope, key);
    const raw = await readRaw(fullKey);
    if (raw) {
        const envelope = parseEnvelope(raw);
        if (envelope) {
            const now = Date.now();
            if (now <= envelope.freshUntil) {
                return envelope.value;
            }
            if (now <= envelope.staleUntil) {
                if (!revalidateLocks.has(fullKey)) {
                    revalidateLocks.add(fullKey);
                    void loader()
                        .then((freshValue) => cacheSetSWR(scope, key, freshValue, freshTtlSeconds, staleTtlSeconds))
                        .catch((err) => logger.warn(`SWR background refresh failed: ${String(err)}`))
                        .finally(() => revalidateLocks.delete(fullKey));
                }
                return envelope.value;
            }
        }
        else {
            return raw;
        }
    }
    const freshValue = await loader();
    await cacheSetSWR(scope, key, freshValue, freshTtlSeconds, staleTtlSeconds);
    return freshValue;
};
export const cacheInvalidateScope = async (scope) => {
    const prefix = buildKey(scope, '');
    // Invalidate Redis
    if (redis) {
        try {
            const keys = await redis.keys(`${prefix}*`);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        }
        catch (err) {
            logger.warn(`Redis invalidation failed: ${err}`);
        }
    }
    // Invalidate Memory
    for (const key of memoryCache.keys()) {
        if (key.startsWith(prefix)) {
            memoryCache.delete(key);
        }
    }
};
