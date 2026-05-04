import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { authenticateToken } from '../middleware/auth';
import { hasAnyPermission } from '../middleware/permissions';
import { optimizeImageBuffer } from '../services/imageService';
import prisma from '../lib/prisma';
import { toFolderName } from '../controllers/categoryController';
import { rateLimit } from 'express-rate-limit';
import { logger } from '../utils/logger';
import { logAudit } from '../services/auditService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Rate limiter for uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 uploads per 15 min per IP
  message: { error: 'Too many uploads. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const contactUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 8, // stricter: 8 files per hour per IP
  message: { error: 'Too many contact uploads. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Allowed upload folders (whitelist for security)
// All product images go to 'products' folder regardless of category
const ALLOWED_FOLDERS = [
  'products', 'banners', 'branding', 'categories', 'popup_offer', 'general', 'slides', 'preloader', 'contact_logos', 'marquee'
];

// Map upload types to actual folders
const FOLDER_MAP: Record<string, string> = {
  'products': 'products',      // All product images
  'product': 'products',       // Alias
  'banners': 'banners',
  'branding': 'branding',
  'categories': 'categories',
  'category': 'categories',    // Alias
  'popup_offer': 'popup_offer',
  'popup': 'popup_offer',      // Alias
  'general': 'general',
  'slides': 'slides',
  'slide': 'slides',           // Alias
  'preloader': 'preloader',
  'contact_logos': 'contact_logos',
  'contact': 'contact_logos',   // Alias
  'marquee': 'marquee',
};

// Multer storage configuration
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Check for double extensions (e.g., file.jpg.exe)
    const baseName = path.basename(file.originalname, ext);
    if (baseName.includes('.')) {
      return cb(new Error('Invalid file name: multiple extensions not allowed'));
    }
    
    if (allowedExts.includes(ext) && allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, png, gif, webp) are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB Limit
    files: 1 // Only one file at a time
  }
});

const uploadSingle = upload.single('image');

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const CONTACT_EXTS = [...IMAGE_EXTS, '.pdf', '.ai', '.psd'];

const inferFileTypeFromMagicBytes = async (buffer: Buffer): Promise<'jpeg' | 'png' | 'gif' | 'webp' | 'pdf' | 'psd' | 'ai' | null> => {
  // Common signatures:
  // JPEG: FF D8 FF
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  // GIF: 47 49 46 38
  // WEBP: RIFF....WEBP
  // PDF/AI (pdf-based): %PDF-
  // AI (postscript-based): %!PS-Adobe
  // PSD: 38 42 50 53 -> "8BPS"
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpeg';
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) return 'png';
  if (buffer.length >= 4 && buffer.toString('ascii', 0, 4) === 'GIF8') return 'gif';
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) return 'webp';
  if (buffer.length >= 5 && buffer.toString('ascii', 0, 5) === '%PDF-') return 'pdf';
  if (buffer.length >= 10 && buffer.toString('ascii', 0, 10) === '%!PS-Adobe') return 'ai';
  if (buffer.length >= 4 && buffer.toString('ascii', 0, 4) === '8BPS') return 'psd';

  // Fallback for image formats that may still be valid but not covered by simple signatures.
  try {
    const meta = await sharp(buffer).metadata();
    if (meta.format === 'jpeg') return 'jpeg';
    if (meta.format === 'png') return 'png';
    if (meta.format === 'gif') return 'gif';
    if (meta.format === 'webp') return 'webp';
  } catch {
    // Ignore: non-image or corrupted image
  }

  return null;
};

const isAllowedExtensionForType = (ext: string, detectedType: string): boolean => {
  if (['jpeg', 'png', 'gif', 'webp'].includes(detectedType)) {
    if (detectedType === 'jpeg') return ['.jpg', '.jpeg'].includes(ext);
    return ext === `.${detectedType}`;
  }
  if (detectedType === 'pdf') return ext === '.pdf' || ext === '.ai';
  if (detectedType === 'ai') return ext === '.ai';
  if (detectedType === 'psd') return ext === '.psd';
  return false;
};

router.post('/', authenticateToken, uploadLimiter, (req: Request, res: Response) => {
  uploadSingle(req, res, async (uploadErr: unknown) => {
    if (uploadErr) {
      if (uploadErr instanceof multer.MulterError) {
        if (uploadErr.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'Image is too large. Max size is 10MB.' });
        }
        return res.status(400).json({ error: uploadErr.message || 'Invalid upload payload' });
      }
      if (uploadErr instanceof Error) {
        return res.status(400).json({ error: uploadErr.message });
      }
      return res.status(400).json({ error: 'Invalid upload request' });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Validate and sanitize folder name - map to actual folder
      const rawPage = String(req.body.page || 'general');
      const sanitizedPage = rawPage.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50);
      
      // Map to actual folder (all product-related uploads go to 'products')
      const pageFolder = FOLDER_MAP[sanitizedPage] || 'general';
      
      // Check against whitelist
      if (!ALLOWED_FOLDERS.includes(pageFolder)) {
        return res.status(400).json({ error: 'Invalid upload folder' });
      }

      // Validate real file content (magic bytes) to avoid spoofed uploads
      try {
        const meta = await sharp(req.file.buffer).metadata();
        if (!meta.format || !['jpeg', 'png', 'webp', 'gif'].includes(meta.format)) {
          return res.status(400).json({ error: 'Invalid image content' });
        }
      } catch {
        return res.status(400).json({ error: 'Corrupted or unsupported image file' });
      }

      // Optimize the image from buffer
      const optimizedBuffer = await optimizeImageBuffer(req.file.buffer);

      // --- Build final filename using product name if provided ---
      const rawProductName = String(req.body.productName || '').trim();
      let finalFilename: string;
      if (rawProductName) {
        // Convert product name to safe filename: lowercase, spaces -> hyphens
        const safeName = rawProductName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '').slice(0, 80);
        const uniqueSuffix = `_${Date.now()}`;
        finalFilename = `${safeName}${uniqueSuffix}.webp`;
      } else {
        const safeExt = path.extname(req.file.originalname).toLowerCase().slice(0, 10);
        const fileNameBase = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        finalFilename = `${fileNameBase}.webp`;
      }

      // --- Determine target directory ---
      let targetSubPath = pageFolder; // e.g. 'products'
      const categoryId = String(req.body.categoryId || '').trim();

      if (pageFolder === 'products') {
        let catPath = 'general';
        if (categoryId) {
          const category = await prisma.categories.findUnique({
            where: { id: categoryId },
            select: { name_en: true, name_ar: true }
          });
          if (category) {
            catPath = toFolderName(category.name_en || category.name_ar || categoryId);
          }
        }

        if (rawProductName) {
          const prodFolder = toFolderName(rawProductName);
          targetSubPath = `products/${catPath}/${prodFolder}`;
        } else {
          targetSubPath = `products/${catPath}`;
        }
      }

      const uploadsRoot = path.join(__dirname, '../../../../uploads');
      const targetDir = path.join(uploadsRoot, targetSubPath);
      await fs.promises.mkdir(targetDir, { recursive: true });
      const finalDestination = path.join(targetDir, finalFilename);
      
      // Write the buffer directly to disk
      await fs.promises.writeFile(finalDestination, optimizedBuffer);

      const url = `/uploads/${targetSubPath}/${finalFilename}`;
      res.json({ success: true, url });
    } catch (err) {
      console.error(err);
      if (err instanceof Error && err.message === 'IMAGE_OPTIMIZATION_FAILED') {
        return res.status(400).json({ error: 'Failed to convert image to webp' });
      }
      res.status(500).json({ error: 'Upload failed' });
    }
  });
});

// --- Public upload endpoint for contact form (no auth required) ---
const contactUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (CONTACT_EXTS.includes(ext)) {
      cb(null, true);
    } else {
      logger.warn(`Blocked contact upload by extension: ${ext} from IP=${req.ip}`);
      cb(new Error('Only image, PDF, AI, PSD files are allowed'));
    }
  },
  limits: { fileSize: 8 * 1024 * 1024, files: 1 }
});

router.post('/contact', contactUploadLimiter, contactUpload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!CONTACT_EXTS.includes(ext)) {
      logger.warn(`Rejected contact upload due to unsupported extension: ${ext} IP=${req.ip}`);
      return res.status(400).json({ error: 'Unsupported file extension' });
    }

    const detectedType = await inferFileTypeFromMagicBytes(req.file.buffer);
    if (!detectedType || !isAllowedExtensionForType(ext, detectedType)) {
      logger.warn(
        `Rejected contact upload due to magic-byte mismatch. ext=${ext} detected=${detectedType || 'unknown'} IP=${req.ip}`
      );
      return res.status(400).json({ error: 'Invalid or spoofed file content' });
    }

    const safeName = `logo_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const finalFilename = `${safeName}${ext}`;

    const uploadsRoot = path.join(__dirname, '../../../../uploads');
    const targetDir = path.join(uploadsRoot, 'contact_logos');
    await fs.promises.mkdir(targetDir, { recursive: true });
    const finalDestination = path.join(targetDir, finalFilename);

    // For images, optimize; for other files, save directly
    const isImage = IMAGE_EXTS.includes(ext);
    if (isImage) {
      const optimizedBuffer = await optimizeImageBuffer(req.file.buffer);
      await fs.promises.writeFile(finalDestination, optimizedBuffer);
    } else {
      await fs.promises.writeFile(finalDestination, req.file.buffer);
    }

    const url = `/uploads/contact_logos/${finalFilename}`;
    logger.info(`Contact file uploaded: ${finalFilename} ext=${ext} ip=${req.ip}`);
    res.json({ success: true, fileUrl: url });
  } catch (err) {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      logger.warn(`Rejected contact upload due to size limit from IP=${req.ip}`);
      return res.status(400).json({ error: 'File is too large. Max size is 8MB.' });
    }
    logger.error('Contact upload error', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

import { removeFile } from '../utils/fileUtils';

/**
 * DELETE /api/v1/upload
 * Body: { url: "/uploads/products/cups/large-paper-cup_123.webp" }
 * Deletes a single image file from disk.
 */
router.delete(
  '/',
  authenticateToken,
  hasAnyPermission('products:write', 'pages:write', 'slides:write', 'settings:write'),
  async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.startsWith('/uploads/')) {
      return res.status(400).json({ error: 'Invalid file URL' });
    }
    removeFile(url);
    await logAudit('delete_uploaded_file', (req as any).user?.username || 'system', `Deleted uploaded file: ${url}`);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;
