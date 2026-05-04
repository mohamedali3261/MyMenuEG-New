import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger';

type OutboxType =
  | 'order.created.notify_ws'
  | 'order.created.send_email'
  | 'payment.status.send_email';

type OutboxJob = {
  id: string;
  type: OutboxType;
  payload: any;
  attempts: number;
  nextAttemptAt: number;
  createdAt: number;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTBOX_DIR = path.join(__dirname, '../../../runtime/outbox');
const MAX_ATTEMPTS = 6;
const BASE_RETRY_MS = 2000;

let workerTimer: NodeJS.Timeout | null = null;
let processing = false;

const ensureOutboxDir = async () => {
  await fs.promises.mkdir(OUTBOX_DIR, { recursive: true });
};

const jobPath = (id: string) => path.join(OUTBOX_DIR, `${id}.json`);

const processJob = async (job: OutboxJob) => {
  if (job.type === 'order.created.notify_ws') {
    const { notifyNewOrder } = await import('./websocketService');
    notifyNewOrder(job.payload);
    return;
  }
  if (job.type === 'order.created.send_email') {
    const { sendOrderConfirmationEmail } = await import('./emailService');
    await sendOrderConfirmationEmail(
      job.payload.email,
      job.payload.orderId,
      job.payload.customerName,
      job.payload.totalPrice,
      job.payload.items
    );
    return;
  }
  if (job.type === 'payment.status.send_email') {
    const { sendOrderStatusEmail } = await import('./emailService');
    await sendOrderStatusEmail(
      job.payload.email,
      job.payload.orderId,
      job.payload.customerName,
      job.payload.statusEn,
      job.payload.statusAr
    );
    return;
  }
};

const processOutboxOnce = async () => {
  if (processing) return;
  processing = true;
  try {
    await ensureOutboxDir();
    const files = await fs.promises.readdir(OUTBOX_DIR);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const fullPath = path.join(OUTBOX_DIR, file);
      try {
        const raw = await fs.promises.readFile(fullPath, 'utf8');
        const job = JSON.parse(raw) as OutboxJob;
        if (job.nextAttemptAt > Date.now()) continue;

        await processJob(job);
        await fs.promises.unlink(fullPath).catch(() => undefined);
      } catch (err) {
        try {
          const raw = await fs.promises.readFile(fullPath, 'utf8');
          const job = JSON.parse(raw) as OutboxJob;
          const attempts = (job.attempts || 0) + 1;
          if (attempts >= MAX_ATTEMPTS) {
            logger.error(`Outbox job dropped after max retries: ${job.id}`, err);
            await fs.promises.unlink(fullPath).catch(() => undefined);
          } else {
            const updated: OutboxJob = {
              ...job,
              attempts,
              nextAttemptAt: Date.now() + BASE_RETRY_MS * Math.pow(2, attempts - 1),
            };
            await fs.promises.writeFile(fullPath, JSON.stringify(updated), 'utf8');
          }
        } catch (nestedErr) {
          logger.error('Failed to process outbox job file', nestedErr);
        }
      }
    }
  } finally {
    processing = false;
  }
};

export const enqueueOutboxJob = async (type: OutboxType, payload: any) => {
  await ensureOutboxDir();
  const id = `${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;
  const job: OutboxJob = {
    id,
    type,
    payload,
    attempts: 0,
    nextAttemptAt: Date.now(),
    createdAt: Date.now(),
  };
  await fs.promises.writeFile(jobPath(id), JSON.stringify(job), 'utf8');
};

export const startOutboxWorker = () => {
  if (workerTimer) return;
  workerTimer = setInterval(() => {
    processOutboxOnce().catch((err) => logger.error('Outbox worker tick failed', err));
  }, 5000);
  processOutboxOnce().catch((err) => logger.error('Outbox bootstrap run failed', err));
};

export const stopOutboxWorker = () => {
  if (workerTimer) {
    clearInterval(workerTimer);
    workerTimer = null;
  }
};
