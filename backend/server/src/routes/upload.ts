import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { authenticateToken } from '../middleware/auth';
import { optimizeImageBuffer } from '../services/imageService';
import prisma from '../lib/prisma';
import { toFolderName } from '../controllers/categoryController';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Allowed upload folders (whitelist for security)
// All product images go to 'products' folder regardless of category
const ALLOWED_FOLDERS = [
  'products', 'banners', 'branding', 'categories', 'popup_offer', 'general', 'slides'
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

router.post('/', authenticateToken, (req: Request, res: Response) => {
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

      const targetDir = path.join(__dirname, '../../../../frontend/public/uploads/', targetSubPath);
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
import { removeFile } from '../utils/fileUtils';

/**
 * DELETE /api/v1/upload
 * Body: { url: "/uploads/products/cups/large-paper-cup_123.webp" }
 * Deletes a single image file from disk.
 */
router.delete('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.startsWith('/uploads/')) {
      return res.status(400).json({ error: 'Invalid file URL' });
    }
    removeFile(url);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;
