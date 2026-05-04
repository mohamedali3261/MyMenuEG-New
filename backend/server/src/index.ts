import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';

// Helper for ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables at the very top
dotenv.config({ path: path.join(__dirname, '../.env') });

import { validateEnv } from './utils/envValidator';
validateEnv();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import compression from 'compression';
import { randomUUID } from 'crypto';
import prisma from './lib/prisma';

// Route Imports
import authRoutes from './routes/auth';
import adminRoutes from './routes/admins';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import pageRoutes from './routes/pages';
import slideRoutes from './routes/slides';
import settingRoutes from './routes/settings';
import orderRoutes from './routes/orders';
import couponRoutes from './routes/coupons';
import statRoutes from './routes/stats';
import notificationRoutes from './routes/notifications';
import uploadRoutes from './routes/upload';
import databaseRoutes from './routes/database';
import contactRoutes from './routes/contact';
import reviewRoutes from './routes/reviews';
import paymentRoutes from './routes/payment';
import customerRoutes from './routes/customers';
import customerDataRoutes from './routes/customerData';
import gsapSlidesRoutes from './routes/gsapSlides';
import marqueeRoutes from './routes/marquee';
import svgMarqueeRoutes from './routes/svgMarquee';
import { errorHandler } from './middleware/errorMiddleware';
import { logger } from './utils/logger';
import { startPeriodicWarmup, stopPeriodicWarmup, warmupCache } from './services/cacheWarmupService';
import { swaggerSpec } from './swagger';
import { initWebSocket, notifyNewOrder } from './services/websocketService';
import { cleanupExpiredTokens } from './controllers/authController';
import { metricsService } from './services/metricsService';
import type { Server } from 'http';
import { startOutboxWorker, stopOutboxWorker } from './services/outboxService';

const app = express();

// Maintenance Mode Middleware
app.use((req, res, next) => {
  if (process.env.MAINTENANCE_MODE === 'true' && !req.path.startsWith('/api/v1/auth')) {
    return res.status(503).json({
      error: 'الموقع في وضع الصيانة حالياً. يرجى المحاولة لاحقاً.',
      message: 'Site is under maintenance. Please try again later.'
    });
  }
  next();
});

const PORT = Number(process.env.PORT) || 5000;
const isProduction = process.env.NODE_ENV === 'production';
const warmupEnabled = process.env.CACHE_WARMUP !== 'false';
const periodicWarmupMs = Number(process.env.CACHE_WARMUP_INTERVAL_MS || 60000);

const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

if (!isProduction && corsOrigins.length === 0) {
  corsOrigins.push('http://localhost:5173', 'http://127.0.0.1:5173', 'http://0.0.0.0:5173', 'http://10.10.1.187:5173');
}

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
})); // Sets various security-related HTTP headers
app.use(compression()); // Compress all responses
app.set('trust proxy', 1);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (corsOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed'));
  },
  credentials: true,
}));

// Body Parser with limits to prevent DoS
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // 300 requests per minute per IP
  message: { error: 'Too many requests from this IP, please try again after a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 attempts per 15 mins
  message: { error: 'Too many login attempts, please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const orderLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 orders per minute per IP (Spam protection)
  message: { error: 'Too many order requests, please try again after a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 messages per 10 mins
  message: { error: 'Too many contact messages, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, 
  message: { error: 'Too many admin requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, 
  message: { error: 'Too many upload requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', globalLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/orders/create', orderLimiter);
app.use('/api/v1/payment/create', orderLimiter);
app.use('/api/v1/contact', contactLimiter);
app.use('/api/v1/admins', adminLimiter);
app.use('/api/v1/products', adminLimiter);
app.use('/api/v1/categories', adminLimiter);
app.use('/api/v1/pages', adminLimiter);
app.use('/api/v1/gsap-slides', adminLimiter);
app.use('/api/v1/marquee-logos', adminLimiter);
app.use('/api/v1/svg-marquee', adminLimiter);
app.use('/api/v1/settings', adminLimiter);
app.use('/api/v1/coupons', adminLimiter);
app.use('/api/v1/upload', uploadLimiter);
app.use('/api/v1/database', adminLimiter);

app.use((req, res, next) => {
  const requestId = randomUUID();
  const startedAt = Date.now();

  res.setHeader('X-Request-Id', requestId);
  res.locals.requestId = requestId;

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    logger.info(
      `[${requestId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`
    );
    metricsService.record(req.method, req.originalUrl, res.statusCode, durationMs);
  });

  next();
});

// Global Request Timeout (15 seconds)
app.use((req, res, next) => {
  res.setTimeout(15000, () => {
    logger.warn(`Request Timeout: ${req.method} ${req.path}`);
    if (!res.headersSent) {
      res.status(408).send('Request Timeout');
    }
    req.socket.destroy();
  });
  next();
});

// Serve static uploads
// All environments use root uploads directory
const uploadsPath = path.join(__dirname, '../../../uploads');
app.use('/uploads', express.static(uploadsPath));

// API Routes (v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admins', adminRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/pages', pageRoutes);
app.use('/api/v1/slides', slideRoutes);
app.use('/api/v1/settings', settingRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/stats', statRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/database', databaseRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/customer-data', customerDataRoutes);
app.use('/api/v1/gsap-slides', gsapSlidesRoutes);
app.use('/api/v1/marquee-logos', marqueeRoutes);
app.use('/api/v1/svg-marquee', svgMarqueeRoutes);

// Health Check (Live DB Check)
app.get('/api/v1/health', async (req, res) => {
  try {
    // Ping DB
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Cache status
    let cacheStatus = {};
    try {
      const { getCacheStatus } = await import('./services/cacheService');
      cacheStatus = getCacheStatus();
    } catch (error) {
      logger.warn(
        `Failed to read cache status for health endpoint: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    res.json({ 
      status: 'ok', 
      database: 'connected',
      cache: cacheStatus,
      version: '1.2.2',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    logger.error('Health Check Failed:', err);
    res.status(503).json({ 
      status: 'error', 
      database: 'disconnected',
      message: 'Service Unavailable' 
    });
  }
});

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'MyMenuEG API Docs'
}));

// Metrics Endpoint (Prometheus Format)
app.get('/api/v1/metrics', (req, res) => {
  // Simple token check for security (can be set in .env)
  const metricsToken = process.env.METRICS_TOKEN;
  const providedToken = req.headers['x-metrics-token'] || req.query.token;

  if (metricsToken && providedToken !== metricsToken) {
    return res.status(403).send('Forbidden');
  }

  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send(metricsService.getPrometheusMetrics());
});

// Error Handling (Must be last)
app.use(errorHandler);

let server: Server | null = null;
let isShuttingDown = false;
let cleanupExpiredTokensInterval: NodeJS.Timeout | null = null;

// Graceful Shutdown
const shutdown = async (signal: string, exitCode = 0) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  stopPeriodicWarmup();
  stopOutboxWorker();
  if (cleanupExpiredTokensInterval) {
    clearInterval(cleanupExpiredTokensInterval);
    cleanupExpiredTokensInterval = null;
  }
  logger.warn(`Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await prisma.$disconnect();
      logger.info('Database connection closed.');
      process.exit(exitCode);
    });
  } else {
    await prisma.$disconnect();
    process.exit(exitCode);
  }

  // Force shutdown after 10s
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', err);
  shutdown('uncaughtException', 1);
});
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', reason);
  shutdown('unhandledRejection', 1);
});

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully.');
    if (warmupEnabled) {
      await warmupCache();
      startPeriodicWarmup(periodicWarmupMs);
    }
    startOutboxWorker();
    
    // Cleanup expired refresh tokens every hour
    cleanupExpiredTokensInterval = setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

    // Cleanup old audit logs every 24 hours (keep last 30 days)
    setInterval(async () => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const result = await prisma.backup_logs.deleteMany({
          where: { 
            created_at: { lt: thirtyDaysAgo },
            action: { not: 'idem:%' } // Keep idempotency keys a bit longer if needed, or delete all
          }
        });
        logger.info(`Cleaned up ${result.count} old audit logs`);
      } catch (err) {
        logger.error('Failed to cleanup old audit logs', err);
      }
    }, 24 * 60 * 60 * 1000);
    
    server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server is running on http://0.0.0.0:${PORT}`);
      // Initialize WebSocket
      if (server) {
        initWebSocket(server);
      }
    });
  } catch (err) {
    logger.error('Failed to start server due to startup error', err);
    process.exit(1);
  }
};

startServer();
