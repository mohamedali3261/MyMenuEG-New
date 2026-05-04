import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import extract from 'extract-zip';
import { fileURLToPath } from 'url';
import prisma from '../lib/prisma';
import { logger } from '../utils/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUPS_DIR = path.join(__dirname, '../../../backups');
const UPLOADS_DIR = path.join(__dirname, '../../../../uploads');

// Whitelist of allowed tables for backup operations (security)
const ALLOWED_TABLES = [
  'admins', 'refresh_tokens', 'backup_logs',
  'customers', 'customer_wishlists', 'customer_carts', 'customer_notifications',
  'categories', 'coupons', 'hero_slides', 'notifications',
  'orders', 'order_items',
  'products', 'product_specs', 'product_images', 'product_quantity_prices',
  'product_detail_items', 'product_faqs', 'product_variants', 'product_variant_images',
  'product_bundle_items', 'product_fbt', 'product_reviews',
  'settings', 'store_pages', 'contact_submissions',
  'gsap_slides', 'marquee_logos', 'marquee_settings', 'svg_marquee', 'svg_marquee_items'
];

// Parent tables must be inserted before child tables (foreign key order)
const PARENT_FIRST = [
  'admins', 'customers', 'categories', 'settings',
  'products', 'hero_slides', 'coupons', 'gsap_slides', 'store_pages',
  'orders', 'notifications', 'contact_submissions', 'backup_logs',
  'refresh_tokens', 'customer_wishlists', 'customer_carts', 'customer_notifications',
  'order_items', 'product_specs', 'product_images', 'product_quantity_prices',
  'product_detail_items', 'product_faqs', 'product_variants', 'product_variant_images',
  'product_bundle_items', 'product_fbt', 'product_reviews',
  'marquee_settings', 'marquee_logos', 'svg_marquee', 'svg_marquee_items',
];

const ensureBackupsDir = async () => {
  await fs.promises.mkdir(BACKUPS_DIR, { recursive: true });
};

// Escape a value for SQL INSERT
const sqlEscape = (val: any): string => {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? '1' : '0';
  if (typeof val === 'bigint') return String(val);
  // Prisma Decimal objects
  if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
    const str = val.toString();
    if (/^-?\d+(\.\d+)?$/.test(str)) return str;
  }
  // String/Date — escape single quotes
  const str = String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\0/g, '\\0');
  return `'${str}'`;
};

// ==========================================
// SQL DUMP — Primary backup format (v3)
// ==========================================

// Generate SQL dump file — fast, type-safe, compact
const generateSqlDump = async (tables: string[]): Promise<string> => {
  await ensureBackupsDir();

  const validTables = tables.filter(t => ALLOWED_TABLES.includes(t));
  if (validTables.length === 0) throw new Error('No valid tables specified');

  // Sort in parent-first order
  const ordered = [...validTables].sort((a, b) => {
    const ai = PARENT_FIRST.indexOf(a);
    const bi = PARENT_FIRST.indexOf(b);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  const filename = `mymenueg_dump_${Date.now()}.sql`;
  const filePath = path.join(BACKUPS_DIR, filename);
  const stream = fs.createWriteStream(filePath);

  // Header
  stream.write(`-- MyMenuEG SQL Dump\n`);
  stream.write(`-- Generated: ${new Date().toISOString()}\n`);
  stream.write(`-- Tables: ${ordered.length}\n\n`);
  stream.write(`SET FOREIGN_KEY_CHECKS=0;\n\n`);

  for (const table of ordered) {
    try {
      const rows = await (prisma as any)[table].findMany();
      if (rows.length === 0) {
        stream.write(`-- Table: ${table} (empty)\nTRUNCATE TABLE ${table};\n\n`);
        continue;
      }

      stream.write(`-- Table: ${table} (${rows.length} rows)\n`);
      stream.write(`TRUNCATE TABLE ${table};\n`);

      const columns = Object.keys(rows[0]);
      const colList = columns.join(', ');

      for (const row of rows) {
        const values = columns.map(c => sqlEscape(row[c])).join(', ');
        stream.write(`INSERT INTO ${table} (${colList}) VALUES (${values});\n`);
      }
      stream.write(`\n`);
    } catch (err) {
      logger.warn(`Could not export table ${table}: ${err}`);
    }
  }

  stream.write(`SET FOREIGN_KEY_CHECKS=1;\n`);
  stream.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};

// Restore from SQL dump file — just execute the SQL
const restoreSqlDump = async (sqlPath: string) => {
  const resolvedPath = path.resolve(sqlPath);
  if (!resolvedPath.startsWith(BACKUPS_DIR)) {
    throw new Error('Invalid backup file path');
  }

  const sql = await fs.promises.readFile(resolvedPath, 'utf8');

  // Split by semicolons and execute each statement
  const statements = sql
    .split('\n')
    .filter(line => line.trim() && !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  await prisma.$transaction(async (tx) => {
    for (const stmt of statements) {
      try {
        await tx.$executeRawUnsafe(stmt);
      } catch (err: any) {
        logger.warn(`SQL restore statement failed: ${err?.message?.slice(0, 100)}`);
      }
    }
  });
};

// ==========================================
// JSON Backup — Legacy format (v1/v2)
// ==========================================

// Custom JSON replacer to handle Prisma types (Decimal, BigInt, Date)
const jsonReplacer = (_key: string, value: any) => {
  if (typeof value === 'bigint') return Number(value);
  if (value !== null && typeof value === 'object' && typeof value.toString === 'function') {
    const str = value.toString();
    if (/^-?\d+(\.\d+)?$/.test(str) && !Array.isArray(value) && !(value instanceof Date)) {
      return str;
    }
  }
  return value;
};

const safeStringify = (data: any) => JSON.stringify(data, jsonReplacer, 2);

// Generate DB backup ZIP (SQL dump only — fast, compact, reliable)
export const generateDbBackup = async (tables: string[]) => {
  await ensureBackupsDir();

  const validTables = tables.filter(t => ALLOWED_TABLES.includes(t));
  if (validTables.length === 0) {
    throw new Error('No valid tables specified for backup');
  }

  // Generate SQL dump
  const sqlPath = await generateSqlDump(validTables);

  const filename = `mymenueg_db_${Date.now()}.zip`;
  const filePath = path.join(BACKUPS_DIR, filename);
  const output = fs.createWriteStream(filePath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      // Clean up temp SQL file only AFTER archive is fully written
      fs.promises.unlink(sqlPath).catch(() => undefined);
      resolve({ filePath, filename, size: archive.pointer() });
    });
    archive.on('error', (err) => reject(err));

    archive.pipe(output);

    // Add SQL dump only
    archive.file(sqlPath, { name: 'dump.sql' });

    archive.finalize();
  });
};

// Generate full backup ZIP (DB + Images in one file)
export const generateFullBackup = async (tables: string[]) => {
  await ensureBackupsDir();

  const validTables = tables.filter(t => ALLOWED_TABLES.includes(t));
  if (validTables.length === 0) {
    throw new Error('No valid tables specified for backup');
  }

  // Generate SQL dump
  const sqlPath = await generateSqlDump(validTables);

  const filename = `mymenueg_full_${Date.now()}.zip`;
  const filePath = path.join(BACKUPS_DIR, filename);
  const output = fs.createWriteStream(filePath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      fs.promises.unlink(sqlPath).catch(() => undefined);
      resolve({ filePath, filename, size: archive.pointer() });
    });
    archive.on('error', (err) => reject(err));

    archive.pipe(output);

    // Add SQL dump
    archive.file(sqlPath, { name: 'dump.sql' });

    // Add images if uploads dir exists
    const uploadsExists = fs.existsSync(UPLOADS_DIR);
    if (uploadsExists) {
      archive.directory(UPLOADS_DIR, 'uploads');
    }

    archive.finalize();
  });
};

// Generate images-only backup ZIP
export const generateImagesBackup = async () => {
  await ensureBackupsDir();

  const uploadsExists = await fs.promises
    .access(UPLOADS_DIR)
    .then(() => true)
    .catch(() => false);
  if (!uploadsExists) {
    throw new Error('No uploads directory found');
  }

  const filename = `mymenueg_images_${Date.now()}.zip`;
  const filePath = path.join(BACKUPS_DIR, filename);
  const output = fs.createWriteStream(filePath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => resolve({ filePath, filename, size: archive.pointer() }));
    archive.on('error', (err) => reject(err));

    archive.pipe(output);

    const metadata = {
      type: 'images',
      generated_at: new Date().toISOString(),
      version: '3.0'
    };
    archive.append(safeStringify(metadata), { name: 'metadata.json' });

    archive.directory(UPLOADS_DIR, 'uploads');
    archive.finalize();
  });
};

// Restore from ZIP - auto-detects format (SQL dump or JSON)
export const restoreFromZip = async (zipPath: string, includeImages = true) => {
    await ensureBackupsDir();

    const resolvedPath = path.resolve(zipPath);
    if (!resolvedPath.startsWith(BACKUPS_DIR)) {
        throw new Error('Invalid backup file path');
    }

    const tempDir = path.join(BACKUPS_DIR, `temp_restore_${Date.now()}`);
    await fs.promises.mkdir(tempDir, { recursive: true });

    try {
        await extract(zipPath, { dir: tempDir });

        // Detect format by file presence (no metadata needed)
        const sqlDumpPath = path.join(tempDir, 'dump.sql');
        const sqlDumpExists = await fs.promises
          .access(sqlDumpPath)
          .then(() => true)
          .catch(() => false);

        const oldDbJsonPath = path.join(tempDir, 'database.json');
        const oldDbJsonExists = await fs.promises
          .access(oldDbJsonPath)
          .then(() => true)
          .catch(() => false);

        // Check for v2 JSON tables (metadata.json with tables_included)
        const metadataPath = path.join(tempDir, 'metadata.json');
        const metadataExists = await fs.promises
          .access(metadataPath)
          .then(() => true)
          .catch(() => false);
        let tablesIncluded: string[] = [];
        if (metadataExists) {
          try {
            const metadata = JSON.parse(await fs.promises.readFile(metadataPath, 'utf8'));
            tablesIncluded = metadata.tables_included || [];
          } catch { /* ignore */ }
        }

        // Restore DB data — prefer SQL dump
        let dbRestored = false;
        if (sqlDumpExists) {
          // v3: SQL dump
          logger.info('Restoring from SQL dump');
          await restoreSqlDump(sqlDumpPath);
          dbRestored = true;
        } else if (oldDbJsonExists) {
          // v1: single database.json
          await restoreDbData(tempDir, true, tablesIncluded);
          dbRestored = true;
        } else if (tablesIncluded.length > 0) {
          // v2: per-table JSON files
          await restoreDbData(tempDir, false, tablesIncluded);
          dbRestored = true;
        }

        // Restore images (only if includeImages is true)
        let imagesRestored = false;
        if (includeImages) {
          const tempUploads = path.join(tempDir, 'uploads');
          const tempUploadsExists = await fs.promises
            .access(tempUploads)
            .then(() => true)
            .catch(() => false);
          if (tempUploadsExists) {
            await fs.promises.mkdir(UPLOADS_DIR, { recursive: true });
            await fs.promises.cp(tempUploads, UPLOADS_DIR, { recursive: true, force: true });
            imagesRestored = true;
          }
        }

        return { dbRestored, imagesRestored };
    } finally {
        await fs.promises.rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
    }
};

// Internal: restore DB data from JSON (v1/v2 legacy)
const restoreDbData = async (tempDir: string, isOldFormat: boolean, tablesIncluded: string[]) => {
    if (isOldFormat) {
      const backupRaw = await fs.promises.readFile(path.join(tempDir, 'database.json'), 'utf8');
      const backupData = JSON.parse(backupRaw);
      if (!backupData.metadata || !backupData.metadata.tables_included) {
        throw new Error('Invalid v1 backup: missing metadata');
      }
      tablesIncluded = backupData.metadata.tables_included.filter((t: string) => ALLOWED_TABLES.includes(t));
      await restoreTablesFromJson(tablesIncluded, backupData);
    } else {
      const validTables = tablesIncluded.filter((t: string) => ALLOWED_TABLES.includes(t));
      const backupData: any = {};
      for (const table of validTables) {
        const tablePath = path.join(tempDir, `${table}.json`);
        const exists = await fs.promises.access(tablePath).then(() => true).catch(() => false);
        if (exists) {
          const raw = await fs.promises.readFile(tablePath, 'utf8');
          backupData[table] = JSON.parse(raw);
        }
      }
      await restoreTablesFromJson(validTables, backupData);
    }
};

// Tables with autoincrement IDs (Prisma create() rejects explicit id for these)
const AUTO_INCREMENT_TABLES = new Set([
  'backup_logs', 'notifications', 'order_items', 'product_bundle_items',
  'product_images', 'product_quantity_prices', 'product_specs',
  'product_detail_items', 'product_faqs', 'product_variants', 'product_variant_images',
  'product_reviews', 'product_fbt', 'contact_submissions',
]);

// Internal: restore from JSON data (legacy v1/v2)
const restoreTablesFromJson = async (tables: string[], backupData: any) => {
    const orderedTables = [...tables].sort((a, b) => {
      const ai = PARENT_FIRST.indexOf(a);
      const bi = PARENT_FIRST.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });

    await prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

        for (const table of orderedTables) {
          await tx.$executeRawUnsafe(`TRUNCATE TABLE ${table};`);
        }

        for (const table of orderedTables) {
          const rows = backupData[table];
          if (!rows || !Array.isArray(rows) || rows.length === 0) continue;

          if (AUTO_INCREMENT_TABLES.has(table)) {
            for (const row of rows) {
              const keys = Object.keys(row);
              const columns = keys.join(', ');
              const values = Object.values(row).map((v: any) => {
                if (v === null || v === undefined) return null;
                if (typeof v === 'object') return String(v);
                return v;
              });
              const placeholders = keys.map(() => '?').join(', ');
              const validColumns = keys.every(k => /^[a-zA-Z0-9_]+$/.test(k));
              if (!validColumns) {
                logger.warn(`Invalid column name in ${table}, skipping row`);
                continue;
              }
              try {
                await tx.$executeRawUnsafe(
                  `INSERT INTO ${table} (${columns}) VALUES (${placeholders});`,
                  ...values
                );
              } catch (err: any) {
                logger.warn(`Restore row failed for ${table}: ${err?.message?.slice(0, 120)}`);
              }
            }
          } else {
            const model = (tx as any)[table];
            if (!model || typeof model.create !== 'function') {
              logger.warn(`Skipping restore for unknown model: ${table}`);
              continue;
            }
            for (const row of rows) {
              const data: any = {};
              for (const [key, val] of Object.entries(row)) {
                if (val === null || val === undefined) {
                  data[key] = null;
                } else if (typeof val === 'object' && val !== null) {
                  data[key] = String(val);
                } else {
                  data[key] = val;
                }
              }
              try {
                await model.create({ data });
              } catch (err: any) {
                logger.warn(`Restore row failed for ${table}: ${err?.message?.slice(0, 120)}`);
              }
            }
          }
        }

        await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
    });
};

// Keep old export name for backward compatibility (used by backupToDisk, wipeDatabase safety snapshot)
export const generateBackupFile = generateDbBackup;
