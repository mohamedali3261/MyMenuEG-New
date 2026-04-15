import { logger } from '../utils/logger';

type CacheValue = string;
type CacheEnvelope = {
  value: CacheValue;
  freshUntil: number;
  staleUntil: number;
};

const defaultTtlSeconds = Number(process.env.CACHE_TTL_SECONDS || 120);

const memoryCache = new Map<string, { value: CacheValue; expiresAt: number }>();
const revalidateLocks = new Set<string>();

const buildKey = (scope: string, key: string) => `cache:${scope}:${key}`;

const readRaw = async (fullKey: string): Promise<CacheValue | null> => {
  const item = memoryCache.get(fullKey);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    memoryCache.delete(fullKey);
    return null;
  }
  return item.value;
};

const writeRaw = async (fullKey: string, value: CacheValue, ttlSeconds: number) => {
  memoryCache.set(fullKey, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

export const cacheGet = async (scope: string, key: string): Promise<CacheValue | null> => {
  const fullKey = buildKey(scope, key);
  return readRaw(fullKey);
};

export const cacheSet = async (
  scope: string,
  key: string,
  value: CacheValue,
  ttlSeconds = defaultTtlSeconds
) => {
  const fullKey = buildKey(scope, key);
  await writeRaw(fullKey, value, ttlSeconds);
};

const parseEnvelope = (raw: string): CacheEnvelope | null => {
  try {
    const parsed = JSON.parse(raw) as CacheEnvelope;
    if (
      typeof parsed.value === 'string' &&
      typeof parsed.freshUntil === 'number' &&
      typeof parsed.staleUntil === 'number'
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export const cacheSetSWR = async (
  scope: string,
  key: string,
  value: CacheValue,
  freshTtlSeconds = defaultTtlSeconds,
  staleTtlSeconds = 300
) => {
  const now = Date.now();
  const envelope: CacheEnvelope = {
    value,
    freshUntil: now + freshTtlSeconds * 1000,
    staleUntil: now + staleTtlSeconds * 1000,
  };
  const fullKey = buildKey(scope, key);
  await writeRaw(fullKey, JSON.stringify(envelope), staleTtlSeconds);
};

export const cacheResolveSWR = async (
  scope: string,
  key: string,
  loader: () => Promise<CacheValue>,
  freshTtlSeconds = defaultTtlSeconds,
  staleTtlSeconds = 300
) => {
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
            .then((freshValue) =>
              cacheSetSWR(scope, key, freshValue, freshTtlSeconds, staleTtlSeconds)
            )
            .catch((err) => logger.warn(`SWR background refresh failed: ${String(err)}`))
            .finally(() => revalidateLocks.delete(fullKey));
        }
        return envelope.value;
      }
    } else {
      return raw;
    }
  }

  const freshValue = await loader();
  await cacheSetSWR(scope, key, freshValue, freshTtlSeconds, staleTtlSeconds);
  return freshValue;
};

export const cacheInvalidateScope = async (scope: string) => {
  const prefix = buildKey(scope, '');

  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
};
