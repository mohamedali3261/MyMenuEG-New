import { logger } from '../utils/logger';
const defaultTtlSeconds = Number(process.env.CACHE_TTL_SECONDS || 120);
const memoryCache = new Map();
const revalidateLocks = new Set();
const buildKey = (scope, key) => `cache:${scope}:${key}`;
const readRaw = async (fullKey) => {
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
    for (const key of memoryCache.keys()) {
        if (key.startsWith(prefix)) {
            memoryCache.delete(key);
        }
    }
};
