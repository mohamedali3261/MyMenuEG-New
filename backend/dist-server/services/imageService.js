import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const removeFileBestEffort = async (targetPath) => {
    if (!fs.existsSync(targetPath))
        return;
    const retryableCodes = new Set(['EBUSY', 'EPERM']);
    const maxAttempts = 4;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            await fs.promises.unlink(targetPath);
            return;
        }
        catch (err) {
            const code = err?.code || '';
            if (!retryableCodes.has(code) || attempt === maxAttempts) {
                logger.warn(`Could not remove temp file ${targetPath}: ${String(err)}`);
                return;
            }
            await wait(80 * attempt);
        }
    }
};
/**
 * Image Processing Service
 * Resizes, optimizes, and converts images to WebP for peak performance.
 */
export const optimizeImage = async (filePath) => {
    const ext = path.extname(filePath);
    const webpPath = filePath.replace(ext, '.webp');
    try {
        // 1. Process with Sharp
        await sharp(filePath)
            .resize(1200, null, {
            withoutEnlargement: true
        })
            .webp({ quality: 80 }) // Convert to WebP with 80% quality
            .toFile(webpPath);
        // 2. Remove the original bulky file (optional, but recommended for storage)
        if (filePath !== webpPath) {
            await removeFileBestEffort(filePath);
        }
        return webpPath;
    }
    catch (err) {
        logger.error('Image optimization failed:', err);
        await removeFileBestEffort(filePath);
        throw new Error('IMAGE_OPTIMIZATION_FAILED');
    }
};
/**
 * Image Processing Service (Buffer version)
 * Resizes, optimizes, and converts image buffer to WebP buffer directly in memory.
 */
export const optimizeImageBuffer = async (buffer) => {
    try {
        const webpBuffer = await sharp(buffer)
            .resize(1200, null, {
            withoutEnlargement: true
        })
            .webp({ quality: 80 })
            .toBuffer();
        return webpBuffer;
    }
    catch (err) {
        logger.error('Image optimization from buffer failed:', err);
        throw new Error('IMAGE_OPTIMIZATION_FAILED');
    }
};
