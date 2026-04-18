import { Router } from 'express';
import { listBackups, createManualBackup, downloadBackup, deleteBackupFile, wipeDatabase, getBackupLogs } from '../controllers/databaseController';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth';
const router = Router();
// All routes require Super Admin auth (checked inside controllers usually, but here middleware works too)
router.use(authenticateToken);
router.use(requireSuperAdmin);
router.get('/backup', createManualBackup);
router.get('/saved-backups', listBackups);
router.get('/saved-backups/:filename', downloadBackup);
router.delete('/saved-backups/:filename', deleteBackupFile);
router.delete('/wipe', wipeDatabase);
router.get('/logs', getBackupLogs);
export default router;
