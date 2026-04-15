import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });
// Startup check for critical environment variables
const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET'];
REQUIRED_ENV.forEach(key => {
    if (!process.env[key]) {
        logger.error(`FATAL: Missing required environment variable: ${key}`);
        process.exit(1);
    }
});
// The PrismaClient automatically loads DATABASE_URL from the .env file
// because it's defined as url = env("DATABASE_URL") in the schema.
// We only need to instantiate it.
const prisma = new PrismaClient();
export default prisma;
