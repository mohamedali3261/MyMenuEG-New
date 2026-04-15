import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
/**
 * Image Processing Service
 * Resizes, optimizes, and converts images to WebP for peak performance.
 */
export const optimizeImage = async (filePath) => {
    try {
        const ext = path.extname(filePath);
        const webpPath = filePath.replace(ext, '.webp');
        // 1. Process with Sharp
        await sharp(filePath)
            .resize(1200, null, {
            withoutEnlargement: true
        })
            .webp({ quality: 80 }) // Convert to WebP with 80% quality
            .toFile(webpPath);
        // 2. Remove the original bulky file (optional, but recommended for storage)
        if (fs.existsSync(filePath) && filePath !== webpPath) {
            fs.unlinkSync(filePath);
        }
        return webpPath;
    }
    catch (err) {
        logger.error('Image optimization failed:', err);
        return filePath; // Fallback to original if optimization fails
    }
};
