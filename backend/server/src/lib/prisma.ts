import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

// Startup check for critical environment variables
const REQUIRED_ENV = [
  'DATABASE_URL',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const OPTIONAL_ENV = [
  'PORT',
  'NODE_ENV',
  'CORS_ORIGIN',
  'CACHE_WARMUP',
  'CACHE_WARMUP_INTERVAL_MS'
];

const missingEnv: string[] = [];
REQUIRED_ENV.forEach(key => {
  if (!process.env[key] || process.env[key] === `your-${key.toLowerCase().replace(/_/g, '-')}-here`) {
    missingEnv.push(key);
  }
});

if (missingEnv.length > 0) {
  logger.error(`FATAL: Missing required environment variables: ${missingEnv.join(', ')}`);
  logger.error('Please check your .env file against .env.example');
  process.exit(1);
}

// Validate JWT_SECRET strength
const jwtSecret = process.env.JWT_SECRET || '';
if (jwtSecret.length < 32) {
  logger.warn('WARNING: JWT_SECRET should be at least 32 characters long for security');
}
if (jwtSecret.includes('your-') || jwtSecret.includes('change') || jwtSecret.includes('secret')) {
  logger.warn('WARNING: JWT_SECRET appears to be a placeholder. Please use a strong random secret in production!');
}

// Log environment info
logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

// The PrismaClient automatically loads DATABASE_URL from the .env file
// because it's defined as url = env("DATABASE_URL") in the schema.
// We only need to instantiate it.

const prisma = new PrismaClient();

export default prisma;
