import crypto from 'crypto';
import type { Request } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../utils/appError';

type CachedResponse = {
  statusCode: number;
  body: any;
};

type BeginResult =
  | { enabled: false; replay?: undefined; recordId?: undefined }
  | { enabled: true; replay: true; response: CachedResponse; recordId?: undefined }
  | { enabled: true; replay: false; recordId: number };

const IDEMPOTENCY_USER = 'idempotency';

const hashKey = (key: string) => crypto.createHash('sha256').update(key).digest('hex').slice(0, 24);
const hashPayload = (payload: unknown) => crypto.createHash('sha256').update(JSON.stringify(payload || {})).digest('hex');

const makeAction = (scope: string, key: string) => `idem:${scope}:${hashKey(key)}`.slice(0, 100);

export const getIdempotencyKey = (req: Request): string | null => {
  const direct = req.header('idempotency-key') || req.header('x-idempotency-key');
  if (!direct) return null;
  const normalized = direct.trim();
  return normalized.length > 0 ? normalized : null;
};

export const beginIdempotency = async (
  scope: string,
  req: Request,
  payloadForHash: unknown
): Promise<BeginResult> => {
  const key = getIdempotencyKey(req);
  if (!key) return { enabled: false };
  return beginIdempotencyWithKey(scope, key, payloadForHash);
};

export const beginIdempotencyWithKey = async (
  scope: string,
  key: string,
  payloadForHash: unknown
): Promise<BeginResult> => {
  const action = makeAction(scope, key);
  const requestHash = hashPayload(payloadForHash);

  const existing = await prisma.backup_logs.findFirst({
    where: { action, admin_username: IDEMPOTENCY_USER },
    orderBy: { created_at: 'desc' },
  });

  if (existing?.details) {
    try {
      const parsed = JSON.parse(existing.details);
      if (parsed.requestHash && parsed.requestHash !== requestHash) {
        throw new AppError(409, 'IDEMPOTENCY_KEY_REUSED', 'Idempotency key was reused with different payload');
      }
      if (parsed.status === 'completed' && parsed.response?.statusCode && parsed.response?.body !== undefined) {
        return {
          enabled: true,
          replay: true,
          response: parsed.response as CachedResponse,
        };
      }
      if (parsed.status === 'processing') {
        throw new AppError(409, 'IDEMPOTENCY_IN_PROGRESS', 'A request with this idempotency key is already processing');
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
    }
  }

  const created = await prisma.backup_logs.create({
    data: {
      action,
      admin_username: IDEMPOTENCY_USER,
      details: JSON.stringify({
        status: 'processing',
        scope,
        requestHash,
      }),
    },
  });

  return { enabled: true, replay: false, recordId: created.id };
};

export const completeIdempotency = async (recordId: number, statusCode: number, body: any) => {
  await prisma.backup_logs.update({
    where: { id: recordId },
    data: {
      details: JSON.stringify({
        status: 'completed',
        response: {
          statusCode,
          body,
        },
      }),
    },
  });
};

export const failIdempotency = async (recordId: number, statusCode: number, body: any) => {
  await prisma.backup_logs.update({
    where: { id: recordId },
    data: {
      details: JSON.stringify({
        status: 'failed',
        response: {
          statusCode,
          body,
        },
      }),
    },
  });
};
