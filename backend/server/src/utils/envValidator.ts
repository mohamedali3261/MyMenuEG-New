import { logger } from './logger';

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'PORT'
];

export const validateEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    logger.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    logger.error('The application will now exit.');
    process.exit(1);
  }

  // Warning for non-critical but recommended vars
  if (!process.env.REDIS_URL) {
    logger.warn('⚠️ REDIS_URL is not set. Falling back to in-memory cache.');
  }

  if (!process.env.CORS_ORIGIN) {
    logger.warn('⚠️ CORS_ORIGIN is not set. Using default development origins.');
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    logger.warn('⚠️ JWT_REFRESH_SECRET is not set. Falling back to JWT_SECRET.');
  }

  logger.info('✅ Environment variables validated successfully.');
};
