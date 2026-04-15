import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import extract from 'extract-zip';
import { fileURLToPath } from 'url';
import prisma from '../lib/prisma';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUPS_DIR = path.join(__dirname, '../../../backups');
const UPLOADS_DIR = path.join(__dirname, '../../../public/uploads');

const ensureBackupsDir = async () => {
  await fs.promises.mkdir(BACKUPS_DIR, { recursive: true });
};

export const generateBackupFile = async (tables: string[]) => {
  await ensureBackupsDir();
  const filename = `mymenueg_backup_${Date.now()}.zip`;
  const filePath = path.join(BACKUPS_DIR, filename);
  const output = fs.createWriteStream(filePath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => resolve({ filePath, filename, size: archive.pointer() }));
    archive.on('error', (err) => reject(err));

    archive.pipe(output);

    // 1. Export database to JSON
    const exportData: any = {
      metadata: {
        generated_at: new Date().toISOString(),
        tables_included: tables
      }
    };

    const fetchAll = async () => {
        for (const table of tables) {
            try {
                // TypeScript/Prisma dynamic access hack
                const data = await (prisma as any)[table].findMany();
                exportData[table] = data;
            } catch (err) {
                console.warn(`Could not export table ${table}:`, err);
            }
        }
        
        archive.append(JSON.stringify(exportData, null, 2), { name: 'database.json' });

        // 2. Export uploads
        const uploadsExists = await fs.promises
          .access(UPLOADS_DIR)
          .then(() => true)
          .catch(() => false);
        if (uploadsExists) archive.directory(UPLOADS_DIR, 'uploads');

        archive.finalize();
    };

    fetchAll();
  });
};

export const restoreFromZip = async (zipPath: string) => {
    await ensureBackupsDir();
    const tempDir = path.join(BACKUPS_DIR, `temp_restore_${Date.now()}`);
    await fs.promises.mkdir(tempDir, { recursive: true });

    try {
        await extract(zipPath, { dir: tempDir });

        const dbJsonPath = path.join(tempDir, 'database.json');
        const dbJsonExists = await fs.promises
          .access(dbJsonPath)
          .then(() => true)
          .catch(() => false);
        if (!dbJsonExists) {
            throw new Error('Invalid backup: database.json missing');
        }

        const backupRaw = await fs.promises.readFile(dbJsonPath, 'utf8');
        const backupData = JSON.parse(backupRaw);

        // Restoration Logic
        await prisma.$transaction(async (tx) => {
            // Disable foreign keys temporarily (MySQL specific)
            await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

            const tables = [
                'order_items', 'product_specs', 'product_images', 'product_quantity_prices',
                'orders', 'products', 'categories', 'hero_slides', 'coupons', 'notifications'
            ];

            // Truncate
            for (const table of tables) {
                await tx.$executeRawUnsafe(`TRUNCATE TABLE ${table};`);
            }

            // Restore from JSON
            for (const table of tables.reverse()) { // Reversing to handle dependency order (though FKs are off)
                const rows = backupData[table];
                if (rows && Array.isArray(rows)) {
                    for (const row of rows) {
                        const keys = Object.keys(row);
                        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
                        const columns = keys.join(', ');
                        const values = Object.values(row);
                        
                        // We use raw query to preserve IDs and avoid Prisma's auto-generation logic
                        // Note: Prisma raw query placeholders differ by DB. For MySQL it's '?'
                        const sql = `INSERT INTO ${table} (${columns}) VALUES (${keys.map(() => '?').join(', ')});`;
                        await tx.$executeRawUnsafe(sql, ...values);
                    }
                }
            }

            await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
        });

        // Restore Images
        const tempUploads = path.join(tempDir, 'uploads');
        const tempUploadsExists = await fs.promises
          .access(tempUploads)
          .then(() => true)
          .catch(() => false);
        if (tempUploadsExists) {
            // Copy files back to UPLOADS_DIR
            await fs.promises.cp(tempUploads, UPLOADS_DIR, { recursive: true, force: true });
        }

        return true;
    } finally {
        // Cleanup temp dir
        await fs.promises.rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
    }
};
