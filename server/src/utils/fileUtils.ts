import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root uploads directory: mymenueg/public/uploads
const UPLOADS_ROOT = path.join(__dirname, '../../../public/uploads');

/**
 * Removes a file given its relative URL (e.g., /uploads/products/image.jpg)
 */
export const removeFile = (relativeUrl: string | null | undefined) => {
  if (!relativeUrl || !relativeUrl.startsWith('/uploads/')) {
    return;
  }

  // Convert URL path to system path
  // Strip /uploads/ and join with UPLOADS_ROOT
  const relativePath = relativeUrl.replace(/^\/uploads\//, '');
  const filePath = path.join(UPLOADS_ROOT, relativePath);

  fs.promises
    .unlink(filePath)
    .then(() => {
      console.log(`Successfully deleted file: ${filePath}`);
    })
    .catch((err: any) => {
      if (err?.code !== 'ENOENT') {
        console.error(`Error deleting file ${filePath}:`, err);
      }
    });
};

/**
 * Recursively clears the uploads directory
 */
export const clearUploadsDir = async () => {
  try {
    await fs.promises.rm(UPLOADS_ROOT, { recursive: true, force: true });
    await fs.promises.mkdir(UPLOADS_ROOT, { recursive: true });
    console.log('Uploads directory cleared successfully.');
  } catch (err) {
    console.error('Error clearing uploads directory:', err);
  }
};
