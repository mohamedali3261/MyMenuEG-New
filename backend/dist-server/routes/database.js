import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { listBackups, createManualBackup, downloadBackup, deleteBackupFile, wipeDatabase, getBackupLogs, backupToDisk, restoreBackup, restoreSavedBackup, testGithubConnection, syncToGithub, downloadImagesBackup } from '../controllers/databaseController';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_UPLOADS = path.join(__dirname, '../../backups/temp_uploads');
// Ensure temp_uploads directory exists
fs.mkdirSync(TEMP_UPLOADS, { recursive: true });
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, TEMP_UPLOADS),
    filename: (_req, file, cb) => cb(null, `upload_${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });
const router = Router();
// All routes require Super Admin auth (checked inside controllers usually, but here middleware works too)
router.use(authenticateToken);
router.use(requireSuperAdmin);
router.get('/backup', createManualBackup);
router.get('/backup-images', downloadImagesBackup);
router.post('/backup-to-disk', backupToDisk);
router.post('/restore', upload.single('backup_file'), restoreBackup);
router.get('/saved-backups', listBackups);
router.get('/saved-backups/:filename', downloadBackup);
router.post('/saved-backups/:filename/restore', restoreSavedBackup);
router.delete('/saved-backups/:filename', deleteBackupFile);
router.delete('/wipe', wipeDatabase);
router.get('/logs', getBackupLogs);
router.post('/github/test', testGithubConnection);
router.post('/github/sync-now', syncToGithub);
export default router;
