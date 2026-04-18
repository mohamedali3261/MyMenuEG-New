import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../lib/prisma';
import { generateBackupFile, restoreFromZip } from '../services/backupService';
import { clearUploadsDir } from '../utils/fileUtils';
import { logAudit } from '../services/auditService';
import { logger } from '../utils/logger';
import { getQueryParam } from '../utils/helpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUPS_DIR = path.join(__dirname, '../../../backups');

const ALL_TABLES = [
    'categories', 'products', 'product_specs', 'product_images',
    'orders', 'order_items', 'hero_slides', 'coupons', 'admins', 'notifications'
];

const resolveBackupPath = (filenameParam: string | string[] | undefined) => {
    const filename = getQueryParam(filenameParam);
    if (!filename) return null;
    
    const basename = path.basename(filename);
    if (!basename || !basename.endsWith('.zip')) return null;
    
    const normalizedBackupsDir = path.resolve(BACKUPS_DIR);
    const targetPath = path.resolve(normalizedBackupsDir, basename);
    if (!targetPath.startsWith(normalizedBackupsDir + path.sep)) return null;
    return { filename: basename, targetPath };
};

const cleanupOldBackups = async () => {
    try {
        const files = await fs.promises.readdir(BACKUPS_DIR).catch(() => []);
        const backupsWithStats = await Promise.all(
            files
                .filter(f => f.endsWith('.zip'))
                .map(async (f) => {
                    const stat = await fs.promises.stat(path.join(BACKUPS_DIR, f));
                    return { name: f, time: stat.mtime.getTime() };
                })
        );
        const sorted = backupsWithStats.sort((a, b) => b.time - a.time);

        // Keep 10 latest, delete rest
        if (sorted.length > 10) {
            await Promise.all(
                sorted.slice(10).map((f) =>
                    fs.promises.unlink(path.join(BACKUPS_DIR, f.name)).catch(() => undefined)
                )
            );
        }
    } catch (err) {
        logger.error('Backup cleanup failed', err);
    }
};

export const listBackups = async (req: Request, res: Response) => {
    try {
        const files = await fs.promises.readdir(BACKUPS_DIR).catch(() => []);
        if (files.length === 0) return res.json([]);

        const response = await Promise.all(files.filter(f => f.endsWith('.zip')).map(async (fname) => {
            const stats = await fs.promises.stat(path.join(BACKUPS_DIR, fname));
            return {
                filename: fname,
                size: stats.size,
                created_at: stats.mtime.toISOString(),
                type: fname.startsWith('auto_') ? 'auto' : fname.startsWith('snapshot_') ? 'snapshot' : 'manual'
            };
        }));
        response.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        res.json(response);
    } catch (err) {
        logger.error('Failed to list backups', err);
        res.status(500).json({ error: 'Failed to list backups' });
    }
};

export const createManualBackup = async (req: any, res: Response) => {
    try {
        const result: any = await generateBackupFile(ALL_TABLES);
        await logAudit('manual_backup', req.user?.username || 'system', `Saved: ${result.filename}`);
        await cleanupOldBackups();
        res.json({ success: true, ...result });
    } catch (err) {
        logger.error('Failed to create backup', err);
        res.status(500).json({ error: 'Failed to create backup' });
    }
};

export const downloadBackup = async (req: Request, res: Response) => {
    try {
        const resolved = resolveBackupPath(req.params.filename);
        if (!resolved) {
            return res.status(400).json({ error: 'Invalid backup filename' });
        }
        
        await fs.promises.access(resolved.targetPath).catch(() => {
            throw new Error('NOT_FOUND');
        });
        res.download(resolved.targetPath, resolved.filename);
    } catch (err) {
        if ((err as Error).message === 'NOT_FOUND') {
            return res.status(404).json({ error: 'Backup not found' });
        }
        logger.error('Download backup failed', err);
        res.status(500).json({ error: 'Download failed' });
    }
};

export const deleteBackupFile = async (req: any, res: Response) => {
    try {
        const resolved = resolveBackupPath(req.params.filename);
        if (!resolved) {
            return res.status(400).json({ error: 'Invalid backup filename' });
        }
        
        const exists = await fs.promises
            .access(resolved.targetPath)
            .then(() => true)
            .catch(() => false);
        if (exists) {
            await fs.promises.unlink(resolved.targetPath);
            await logAudit('delete_backup', req.user?.username || 'system', `Deleted: ${resolved.filename}`);
        }
        res.json({ success: true });
    } catch (err) {
        logger.error('Delete backup failed', err);
        res.status(500).json({ error: 'Delete failed' });
    }
};

export const wipeDatabase = async (req: any, res: Response) => {
    try {
        // 1. Create safety snapshot
        await generateBackupFile(ALL_TABLES);
        await cleanupOldBackups();
        
        // 2. Clear tables
        await prisma.$transaction(async (tx) => {
            await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');
            for (const table of ALL_TABLES) {
                if (table === 'admins') continue; // Don't wipe admins to avoid lockout
                await tx.$executeRawUnsafe(`TRUNCATE TABLE ${table};`);
            }
            await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
        });

        // 3. Clear uploads
        await clearUploadsDir();

        await logAudit('wipe', req.user?.username || 'system', "Full wipe with safety snapshot");
        res.json({ success: true, message: 'Store data wiped successfully.' });
    } catch (err) {
        logger.error('Wipe database failed', err);
        res.status(500).json({ error: 'Wipe failed' });
    }
};

export const getBackupLogs = async (req: Request, res: Response) => {
    try {
        const logs = await prisma.backup_logs.findMany({
            orderBy: { created_at: 'desc' },
            take: 50
        });
        res.json(logs);
    } catch (err) {
        logger.error('Failed to fetch backup logs', err);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
};
