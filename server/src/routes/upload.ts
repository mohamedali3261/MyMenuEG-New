import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { authenticateToken } from '../middleware/auth';
import { optimizeImage } from '../services/imageService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req: any, file, cb) => {
    // Save to a temporary folder because req.body might not be fully parsed yet
    const tempDir = path.join(__dirname, '../../../public/temp_uploads/');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}${fileExt}`;
    cb(null, fileName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExts.includes(ext) && allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, png, gif, webp) are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB Limit
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

      const rawPage = String(req.body.page || 'general');
      const pageFolder = rawPage.replace(/[^a-zA-Z0-9_-]/g, '');

      // Validate real file content (magic bytes) to avoid spoofed uploads
      try {
        const meta = await sharp(req.file.path).metadata();
        if (!meta.format || !['jpeg', 'png', 'webp', 'gif'].includes(meta.format)) {
          await fs.promises.unlink(req.file.path).catch(() => undefined);
          return res.status(400).json({ error: 'Invalid image content' });
        }
      } catch {
        await fs.promises.unlink(req.file.path).catch(() => undefined);
        return res.status(400).json({ error: 'Corrupted or unsupported image file' });
      }

      // Optimize the image
      const optimizedTempPath = await optimizeImage(req.file.path);
      if (path.extname(optimizedTempPath).toLowerCase() !== '.webp') {
        await fs.promises.unlink(optimizedTempPath).catch(() => undefined);
        return res.status(400).json({ error: 'Image must be converted to webp' });
      }
      const finalFilename = path.basename(optimizedTempPath);

      // Now move it to the correct target folder
      const targetDir = path.join(__dirname, '../../../public/uploads/', pageFolder);
      await fs.promises.mkdir(targetDir, { recursive: true });
      const finalDestination = path.join(targetDir, finalFilename);
      await fs.promises.rename(optimizedTempPath, finalDestination);

      const url = `/uploads/${pageFolder}/${finalFilename}`;
      res.json({ success: true, url });
    } catch (err) {
      console.error(err);
      if (req.file?.path) {
        await fs.promises.unlink(req.file.path).catch(() => undefined);
      }
      if (err instanceof Error && err.message === 'IMAGE_OPTIMIZATION_FAILED') {
        return res.status(400).json({ error: 'Failed to convert image to webp' });
      }
      res.status(500).json({ error: 'Upload failed' });
    }
  });
});

export default router;
