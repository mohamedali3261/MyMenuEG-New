import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../lib/prisma';
import { generateImagesBackup, generateFullBackup, generateBackupFile, restoreFromZip } from '../services/backupService';
import { clearUploadsDir } from '../utils/fileUtils';
import { logAudit } from '../services/auditService';
import { logger } from '../utils/logger';
import { getQueryParam } from '../utils/helpers';
import { resilientRequest } from '../services/resilientHttpService';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUPS_DIR = path.join(__dirname, '../../../backups');
const getActor = (req) => req.user?.username || 'system';
const ALL_TABLES = [
    'admins', 'refresh_tokens', 'backup_logs',
    'customers', 'customer_wishlists', 'customer_carts', 'customer_notifications',
    'categories', 'coupons', 'hero_slides', 'notifications',
    'orders', 'order_items',
    'products', 'product_specs', 'product_images', 'product_quantity_prices',
    'product_detail_items', 'product_faqs', 'product_variants', 'product_variant_images',
    'product_bundle_items', 'product_fbt', 'product_reviews',
    'settings', 'gsap_slides', 'store_pages', 'contact_submissions',
    'marquee_logos', 'marquee_settings', 'svg_marquee_items', 'svg_marquee'
];
const resolveBackupPath = (filenameParam) => {
    const filename = getQueryParam(filenameParam);
    if (!filename)
        return null;
    const basename = path.basename(filename);
    if (!basename || !basename.endsWith('.zip'))
        return null;
    const normalizedBackupsDir = path.resolve(BACKUPS_DIR);
    const targetPath = path.resolve(normalizedBackupsDir, basename);
    if (!targetPath.startsWith(normalizedBackupsDir + path.sep))
        return null;
    return { filename: basename, targetPath };
};
const cleanupOldBackups = async () => {
    try {
        const files = await fs.promises.readdir(BACKUPS_DIR).catch(() => []);
        const backupsWithStats = await Promise.all(files
            .filter(f => f.endsWith('.zip'))
            .map(async (f) => {
            const stat = await fs.promises.stat(path.join(BACKUPS_DIR, f));
            return { name: f, time: stat.mtime.getTime() };
        }));
        const sorted = backupsWithStats.sort((a, b) => b.time - a.time);
        // Keep 10 latest, delete rest
        if (sorted.length > 10) {
            await Promise.all(sorted.slice(10).map((f) => fs.promises.unlink(path.join(BACKUPS_DIR, f.name)).catch(() => undefined)));
        }
    }
    catch (err) {
        logger.error('Backup cleanup failed', err);
    }
};
export const listBackups = async (req, res) => {
    try {
        const files = await fs.promises.readdir(BACKUPS_DIR).catch(() => []);
        if (files.length === 0)
            return res.json([]);
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
    }
    catch (err) {
        logger.error('Failed to list backups', err);
        res.status(500).json({ error: 'Failed to list backups' });
    }
};
export const createManualBackup = async (req, res) => {
    try {
        const result = await generateFullBackup(ALL_TABLES);
        await logAudit('manual_backup', getActor(req), `Downloaded Full: ${result.filename}`);
        await cleanupOldBackups();
        res.download(result.filePath, result.filename);
    }
    catch (err) {
        logger.error('Failed to create backup', err);
        res.status(500).json({ error: 'Failed to create backup' });
    }
};
export const downloadImagesBackup = async (req, res) => {
    try {
        const result = await generateImagesBackup();
        await logAudit('images_backup', getActor(req), `Downloaded Images: ${result.filename}`);
        await cleanupOldBackups();
        res.download(result.filePath, result.filename);
    }
    catch (err) {
        logger.error('Failed to create images backup', err);
        res.status(500).json({ error: err.message || 'Failed to create images backup' });
    }
};
export const downloadBackup = async (req, res) => {
    try {
        const resolved = resolveBackupPath(req.params.filename);
        if (!resolved) {
            return res.status(400).json({ error: 'Invalid backup filename' });
        }
        await fs.promises.access(resolved.targetPath).catch(() => {
            throw new Error('NOT_FOUND');
        });
        await logAudit('download_backup', getActor(req), `Downloaded saved backup: ${resolved.filename}`);
        res.download(resolved.targetPath, resolved.filename);
    }
    catch (err) {
        if (err.message === 'NOT_FOUND') {
            return res.status(404).json({ error: 'Backup not found' });
        }
        logger.error('Download backup failed', err);
        res.status(500).json({ error: 'Download failed' });
    }
};
export const deleteBackupFile = async (req, res) => {
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
            await logAudit('delete_backup', getActor(req), `Deleted: ${resolved.filename}`);
        }
        res.json({ success: true });
    }
    catch (err) {
        logger.error('Delete backup failed', err);
        res.status(500).json({ error: 'Delete failed' });
    }
};
export const wipeDatabase = async (req, res) => {
    try {
        // 1. Create safety snapshot
        await generateBackupFile(ALL_TABLES);
        await cleanupOldBackups();
        // 2. Clear tables
        await prisma.$transaction(async (tx) => {
            await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');
            for (const table of ALL_TABLES) {
                if (table === 'admins')
                    continue; // Don't wipe to avoid lockout
                // Use DELETE for tables with non-autoincrement IDs (TRUNCATE doesn't work)
                const useDelete = ['admins', 'settings', 'categories', 'coupons', 'store_pages', 'marquee_settings', 'svg_marquee', 'products', 'customer_wishlists', 'customer_carts', 'customer_notifications', 'refresh_tokens', 'orders', 'marquee_logos', 'hero_slides', 'gsap_slides', 'contact_submissions'].includes(table);
                if (useDelete) {
                    await tx.$executeRawUnsafe(`DELETE FROM ${table};`);
                }
                else {
                    await tx.$executeRawUnsafe(`TRUNCATE TABLE ${table};`);
                }
            }
            await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
        });
        // 3. Clear uploads
        await clearUploadsDir();
        // 4. Disable marquee features after wipe (insert with enabled=false since records are deleted)
        await prisma.svg_marquee.upsert({
            where: { id: 'main' },
            update: { enabled: false },
            create: { id: 'main', enabled: false }
        });
        await prisma.marquee_settings.upsert({
            where: { id: 'main' },
            update: { enabled: false },
            create: { id: 'main', enabled: false }
        });
        await logAudit('wipe', getActor(req), "Full wipe with safety snapshot");
        res.json({ success: true, message: 'Store data wiped successfully.' });
    }
    catch (err) {
        logger.error('Wipe database failed', err);
        res.status(500).json({ error: 'Wipe failed' });
    }
};
export const getBackupLogs = async (req, res) => {
    try {
        const logs = await prisma.backup_logs.findMany({
            orderBy: { created_at: 'desc' },
            take: 50
        });
        res.json(logs);
    }
    catch (err) {
        logger.error('Failed to fetch backup logs', err);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
};
export const backupToDisk = async (req, res) => {
    try {
        const result = await generateBackupFile(ALL_TABLES);
        await logAudit('backup_to_disk', getActor(req), `Saved to disk: ${result.filename}`);
        await cleanupOldBackups();
        res.json({ success: true, filename: result.filename, size: result.size });
    }
    catch (err) {
        logger.error('Backup to disk failed', err);
        res.status(500).json({ error: 'Failed to save backup to disk' });
    }
};
export const restoreBackup = async (req, res) => {
    try {
        const file = req.file || (req.files && req.files.backup_file);
        if (!file) {
            await logAudit('restore_rejected', getActor(req), 'No backup file uploaded');
            return res.status(400).json({ error: 'No backup file uploaded' });
        }
        // Always copy uploaded file into BACKUPS_DIR so restoreFromZip path validation passes
        const tmpDir = path.join(BACKUPS_DIR, 'temp_uploads');
        await fs.promises.mkdir(tmpDir, { recursive: true });
        const tmpFile = path.join(tmpDir, `upload_${Date.now()}.zip`);
        const tempPath = file.path || file.tempFilePath;
        if (tempPath) {
            await fs.promises.copyFile(tempPath, tmpFile);
            // Clean up multer temp file
            await fs.promises.unlink(tempPath).catch(() => undefined);
        }
        else {
            await fs.promises.writeFile(tmpFile, file.buffer || file.data);
        }
        const includeImages = req.body.include_images !== 'false';
        await restoreFromZip(tmpFile, includeImages);
        await fs.promises.unlink(tmpFile).catch(() => undefined);
        await logAudit('restore', getActor(req), `Restored from uploaded backup (images: ${includeImages})`);
        res.json({ success: true, message: 'Data restored successfully' });
    }
    catch (err) {
        await logAudit('restore_failed', getActor(req), `Restore failed: ${err.message || 'unknown'}`);
        logger.error('Restore failed', err);
        res.status(500).json({ error: err.message || 'Restore failed' });
    }
};
export const restoreSavedBackup = async (req, res) => {
    try {
        const resolved = resolveBackupPath(req.params.filename);
        if (!resolved) {
            return res.status(400).json({ error: 'Invalid backup filename' });
        }
        const exists = await fs.promises.access(resolved.targetPath).then(() => true).catch(() => false);
        if (!exists) {
            await logAudit('restore_saved_rejected', getActor(req), `Backup file not found: ${resolved.filename}`);
            return res.status(404).json({ error: 'Backup file not found' });
        }
        const includeImages = req.query.images !== 'false';
        await restoreFromZip(resolved.targetPath, includeImages);
        await logAudit('restore_saved', getActor(req), `Restored from: ${resolved.filename} (images: ${includeImages})`);
        res.json({ success: true, message: 'Data restored successfully' });
    }
    catch (err) {
        await logAudit('restore_saved_failed', getActor(req), `Restore saved failed: ${err.message || 'unknown'}`);
        logger.error('Restore from saved backup failed', err);
        res.status(500).json({ error: err.message || 'Restore failed' });
    }
};
export const testGithubConnection = async (req, res) => {
    try {
        const { token, repo } = req.body;
        if (!token || !repo) {
            await logAudit('github_test_rejected', getActor(req), 'Missing token or repo');
            return res.status(400).json({ error: 'Token and repo are required' });
        }
        const response = await resilientRequest({
            service: 'github-api',
            method: 'GET',
            url: `https://api.github.com/repos/${repo}`,
            headers: {
                Authorization: `token ${token}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        if (response.status >= 200 && response.status < 300) {
            const data = response.data;
            await logAudit('github_test_success', getActor(req), `Connected to ${data.full_name}`);
            res.json({ success: true, message: `Connected to ${data.full_name}` });
        }
        else {
            const data = response.data;
            await logAudit('github_test_failed', getActor(req), data.message || 'GitHub connection failed');
            res.status(400).json({ error: data.message || 'GitHub connection failed' });
        }
    }
    catch (err) {
        await logAudit('github_test_error', getActor(req), err.message || 'unknown');
        logger.error('GitHub test failed', err);
        res.status(500).json({ error: 'Failed to test GitHub connection' });
    }
};
export const syncToGithub = async (req, res) => {
    try {
        const settings = await prisma.settings.findMany({
            where: {
                key_name: { in: ['github_token', 'github_repo', 'github_branch', 'github_enabled'] }
            }
        });
        const settingsMap = Object.fromEntries(settings.map((s) => [s.key_name, s.value]));
        const ghToken = settingsMap.github_token;
        const ghRepo = settingsMap.github_repo;
        const ghBranch = settingsMap.github_branch || 'main';
        if (!ghToken || !ghRepo) {
            return res.status(400).json({ error: 'GitHub not configured. Set token and repo in settings.' });
        }
        const result = await generateBackupFile(ALL_TABLES);
        const backupPath = result.filePath;
        const fileContent = await fs.promises.readFile(backupPath);
        const base64Content = fileContent.toString('base64');
        const filename = `backups/${result.filename}`;
        let existingSha = null;
        try {
            const checkRes = await resilientRequest({
                service: 'github-api',
                method: 'GET',
                url: `https://api.github.com/repos/${ghRepo}/contents/${filename}?ref=${ghBranch}`,
                headers: { Authorization: `token ${ghToken}`, Accept: 'application/vnd.github.v3+json' }
            });
            if (checkRes.status >= 200 && checkRes.status < 300) {
                const checkData = checkRes.data;
                existingSha = checkData.sha;
            }
        }
        catch { /* file doesn't exist yet */ }
        const body = {
            message: `Auto backup ${new Date().toISOString()}`,
            content: base64Content,
            branch: ghBranch
        };
        if (existingSha)
            body.sha = existingSha;
        const pushRes = await resilientRequest({
            service: 'github-api',
            method: 'PUT',
            url: `https://api.github.com/repos/${ghRepo}/contents/${filename}`,
            headers: {
                Authorization: `token ${ghToken}`,
                Accept: 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            data: body
        });
        if (pushRes.status < 200 || pushRes.status >= 300) {
            const errData = pushRes.data;
            throw new Error(errData.message || 'GitHub push failed');
        }
        await logAudit('github_sync', getActor(req), `Synced ${result.filename} to GitHub`);
        await cleanupOldBackups();
        res.json({ success: true, message: 'Backup synced to GitHub successfully' });
    }
    catch (err) {
        logger.error('GitHub sync failed', err);
        res.status(500).json({ error: err.message || 'GitHub sync failed' });
    }
};
