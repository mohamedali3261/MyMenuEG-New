import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Download, ShieldAlert, Loader2, Lock, FileJson, AlertTriangle, Trash2, Upload, Clock, History, Save, RotateCcw, HardDrive, CheckSquare, Square, Shield, FolderOpen, XCircle, ClipboardList, DatabaseBackup, Cloud, Settings, ExternalLink } from 'lucide-react';
import { useStore } from '../../../store/store';

const TABLE_GROUPS = [
  { key: 'categories', labelAr: 'التصنيفات', labelEn: 'Categories' },
  { key: 'products', labelAr: 'المنتجات', labelEn: 'Products', includes: ['products', 'product_specs', 'product_images'] },
  { key: 'orders', labelAr: 'الطلبات', labelEn: 'Orders', includes: ['orders', 'order_items'] },
  { key: 'hero_slides', labelAr: 'السلايدر', labelEn: 'Slider' },
  { key: 'coupons', labelAr: 'الكوبونات', labelEn: 'Coupons' },
  { key: 'notifications', labelAr: 'الإشعارات', labelEn: 'Notifications' },
];

type BackupFile = {
  filename: string;
  type: 'auto' | 'snapshot' | 'manual';
  created_at: string;
  size: number;
};

type BackupLog = {
  id: number;
  action: string;
  admin_username: string;
  details?: string;
  created_at: string;
};

export default function DatabaseBackups() {
  const { rtl, user, token, showToast } = useStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [isSavingToDisk, setIsSavingToDisk] = useState(false);
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [wipeConfirmText, setWipeConfirmText] = useState('');
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selective tables
  const [selectedTables, setSelectedTables] = useState<string[]>([
    'categories', 'products', 'product_specs', 'product_images',
    'orders', 'order_items', 'hero_slides', 'coupons', 'notifications'
  ]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Saved backups & logs
  const [savedBackups, setSavedBackups] = useState<BackupFile[]>([]);
  const [backupLogs, setBackupLogs] = useState<BackupLog[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // GitHub Sync Settings
  const [ghToken, setGhToken] = useState('');
  const [ghRepo, setGhRepo] = useState('');
  const [ghBranch, setGhBranch] = useState('main');
  const [ghEnabled, setGhEnabled] = useState(false);
  const [isTestingGh, setIsTestingGh] = useState(false);
  const [isSyncingGh, setIsSyncingGh] = useState(false);
  const [isSavingGh, setIsSavingGh] = useState(false);
  const [showGhConfig, setShowGhConfig] = useState(false);

  const API_BASE = '';

  const fetchGhSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const settings = await res.json();
        if (settings.github_token) setGhToken(settings.github_token);
        if (settings.github_repo) setGhRepo(settings.github_repo);
        if (settings.github_branch) setGhBranch(settings.github_branch);
        if (settings.github_enabled) setGhEnabled(settings.github_enabled === 'true');
      }
    } catch (error) { console.error(error); }
  }, [token]);

  const handleSaveGhSettings = async () => {
    setIsSavingGh(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/settings`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          github_token: ghToken,
          github_repo: ghRepo,
          github_branch: ghBranch,
          github_enabled: ghEnabled.toString()
        })
      });
      if (res.ok) {
        showToast(rtl ? 'تم حفظ إعدادات GitHub!' : 'GitHub settings saved!', 'success');
      }
    } catch {
      showToast(rtl ? 'فشل الحفظ' : 'Save failed', 'error');
    } finally {
      setIsSavingGh(false);
    }
  };

  const handleTestGhConnection = async () => {
    setIsTestingGh(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/database/github/test`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: ghToken, repo: ghRepo })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
      } else {
        showToast(data.error, 'error');
      }
    } catch {
      showToast(rtl ? 'فشل الاتصال' : 'Connection failed', 'error');
    } finally {
      setIsTestingGh(false);
    }
  };

  const handleSyncToGithubNow = async () => {
    setIsSyncingGh(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/database/github/sync-now`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast(rtl ? 'تمت المزامنة بنجاح!' : 'GitHub sync successful!', 'success');
        fetchLogs();
      } else {
        showToast(data.error, 'error');
      }
    } catch {
      showToast(rtl ? 'فشلت المزامنة' : 'Sync failed', 'error');
    } finally {
      setIsSyncingGh(false);
    }
  };

  const fetchSavedBackups = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/database/saved-backups`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setSavedBackups(await res.json());
    } catch (error) { console.error(error); }
  }, [token]);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/database/logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setBackupLogs(await res.json());
    } catch (error) { console.error(error); }
  }, [token]);

  useEffect(() => {
    if (user?.is_super_admin) {
      fetchSavedBackups();
      fetchLogs();
      fetchGhSettings();
    }
  }, [fetchGhSettings, fetchLogs, fetchSavedBackups, user]);

  const toggleTableGroup = (group: typeof TABLE_GROUPS[0]) => {
    const keys = group.includes || [group.key];
    const allSelected = keys.every(k => selectedTables.includes(k));
    if (allSelected) {
      setSelectedTables(prev => prev.filter(t => !keys.includes(t)));
    } else {
      setSelectedTables(prev => [...new Set([...prev, ...keys])]);
    }
  };

  const handleDownloadBackup = async () => {
    setIsDownloading(true);
    try {
      const tablesParam = selectedTables.join(',');
      const response = await fetch(`${API_BASE}/api/v1/database/backup?tables=${tablesParam}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mymenueg_complete_backup_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      setLastBackup(new Date().toLocaleString(rtl ? 'ar-EG' : 'en-US'));
      showToast(rtl ? 'تم تحميل النسخة الاحتياطية بنجاح!' : 'Backup downloaded!', 'success');
      fetchLogs();
    } catch {
      showToast(rtl ? 'حدث خطأ أثناء تحميل النسخة' : 'Error downloading backup', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveToDisk = async () => {
    setIsSavingToDisk(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/database/backup-to-disk`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast(rtl ? 'تم حفظ النسخة على السيرفر بنجاح!' : 'Backup saved to server!', 'success');
        fetchSavedBackups();
        fetchLogs();
      }
    } catch {
      showToast(rtl ? 'خطأ في الحفظ' : 'Save failed', 'error');
    } finally {
      setIsSavingToDisk(false);
    }
  };

  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsRestoring(true);
    const formData = new FormData();
    formData.append('backup_file', file);
    formData.append('tables', JSON.stringify(selectedTables));

    try {
      const response = await fetch(`${API_BASE}/api/v1/database/restore`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        showToast(rtl ? 'تمت استعادة البيانات بنجاح!' : 'Data restored!', 'success');
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchSavedBackups();
        fetchLogs();
      } else {
        throw new Error(data.error || 'Restore failed');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : undefined;
      showToast(message || (rtl ? 'خطأ أثناء الاستعادة' : 'Restore failed'), 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleRestoreSaved = async (filename: string) => {
    if (!confirm(rtl ? `هل أنت متأكد من استعادة ${filename}؟` : `Restore from ${filename}?`)) return;
    setLoadingSaved(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/database/saved-backups/${filename}/restore`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast(rtl ? 'تمت الاستعادة بنجاح!' : 'Restored!', 'success');
        fetchSavedBackups();
        fetchLogs();
      }
    } catch {
      showToast(rtl ? 'فشلت الاستعادة' : 'Restore failed', 'error');
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleDeleteSaved = async (filename: string) => {
    if (!confirm(rtl ? `حذف ${filename}؟` : `Delete ${filename}?`)) return;
    try {
      await fetch(`${API_BASE}/api/v1/database/saved-backups/${filename}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchSavedBackups();
      fetchLogs();
    } catch { /* ignore */ }
  };

  const handleDownloadSaved = (filename: string) => {
    window.open(`${API_BASE}/api/v1/database/saved-backups/${filename}?token=${token}`, '_blank');
  };

  const handleWipeDatabase = async () => {
    if (wipeConfirmText !== 'CONFIRM WIPE') {
      showToast(rtl ? 'يرجى كتابة العبارة التأكيدية بشكل صحيح' : 'Type CONFIRM WIPE exactly.', 'error');
      return;
    }
    setIsWiping(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/database/wipe`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        showToast(rtl ? 'تم مسح كامل بيانات المتجر.' : 'Store wiped.', 'success');
        setShowWipeModal(false);
        setWipeConfirmText('');
        fetchSavedBackups();
        fetchLogs();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : undefined;
      showToast(message || (rtl ? 'خطأ' : 'Error'), 'error');
    } finally {
      setIsWiping(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getActionIcon = (action: string) => {
    const cls = 'shrink-0';
    switch (action) {
      case 'download': return <Download size={16} className={`${cls} text-primary-500`} />;
      case 'auto_backup': return <Clock size={16} className={`${cls} text-green-500`} />;
      case 'manual_backup': return <Save size={16} className={`${cls} text-blue-500`} />;
      case 'wipe': return <Trash2 size={16} className={`${cls} text-red-500`} />;
      case 'restore': return <RotateCcw size={16} className={`${cls} text-amber-500`} />;
      case 'restore_from_saved': return <FolderOpen size={16} className={`${cls} text-indigo-500`} />;
      case 'github_sync': return <DatabaseBackup size={16} className={`${cls} text-slate-800 dark:text-white`} />;
      case 'github_sync_error': return <XCircle size={16} className={`${cls} text-red-600`} />;
      default: return <ClipboardList size={16} className={`${cls} text-slate-400`} />;
    }
  };

  if (!user?.is_super_admin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldAlert size={64} className="text-red-500 opacity-50" />
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">
          {rtl ? 'صلاحيات غير كافية' : 'Insufficient Permissions'}
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tighter text-slate-800 dark:text-white flex items-center gap-3">
          <div className="p-2.5 bg-primary-500/10 text-primary-500 rounded-xl"><Database size={28} /></div>
          {rtl ? 'مركز النسخ الاحتياطي المتقدم' : 'Advanced Backup Center'}
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          {rtl ? 'نسخ احتياطي تلقائي، استعادة مخصصة، لقطات أمان، وسجل عمليات' : 'Auto-backups, selective restore, safety snapshots & activity logs'}
        </p>
      </div>

      {/* Security Warning */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 border-s-4 border-red-500 bg-red-500/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-5 pointer-events-none translate-x-1/3 -translate-y-1/4"><Lock size={200} /></div>
        <div className="relative z-10 flex gap-4">
          <ShieldAlert size={22} className="text-red-500 animate-pulse mt-0.5 shrink-0" />
          <div>
            <h3 className="font-bold text-red-600 dark:text-red-400 mb-1">{rtl ? 'تحذير أمني' : 'Security Warning'}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {rtl ? 'الملفات تحتوي على بيانات حساسة. احتفظ بها في مكان آمن.' : 'Files contain sensitive data. Store securely.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Feature 2: Selective Tables (Advanced Options) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <button onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-primary-500 font-bold flex items-center gap-1 hover:underline mb-2">
          {showAdvanced ? '▼' : '▶'} {rtl ? 'خيارات متقدمة (اختيار الجداول)' : 'Advanced Options (Select Tables)'}
        </button>
        <AnimatePresence>
          {showAdvanced && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="glass-card p-4 overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {TABLE_GROUPS.map(group => {
                  const keys = group.includes || [group.key];
                  const checked = keys.every(k => selectedTables.includes(k));
                  return (
                    <button key={group.key} onClick={() => toggleTableGroup(group)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${checked ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/30' : 'bg-slate-100 dark:bg-white/5 text-slate-500 border border-transparent'}`}>
                      {checked ? <CheckSquare size={16} /> : <Square size={16} />}
                      {rtl ? group.labelAr : group.labelEn}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Download Backup Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-6 flex flex-col items-center text-center gap-3 group">
          <div className="w-16 h-16 bg-primary-500/10 text-primary-500 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white transition-all duration-500">
            <FileJson size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{rtl ? 'تحميل ZIP' : 'Download ZIP'}</h3>
          <p className="text-xs text-slate-500 mb-2">{rtl ? 'تحميل مباشر للجهاز' : 'Direct download to device'}</p>
          <button onClick={handleDownloadBackup} disabled={isDownloading}
            className={`w-full py-3 rounded-xl flex justify-center items-center gap-2 font-bold transition-all ${isDownloading ? 'bg-slate-100 text-slate-400' : 'bg-primary-500 text-white hover:bg-primary-600 active:scale-95 shadow-lg shadow-primary-500/30'}`}>
            {isDownloading ? <><Loader2 className="animate-spin" size={18} /> {rtl ? 'جاري...' : 'Exporting...'}</> : <><Download size={18} /> {rtl ? 'تحميل' : 'Download'}</>}
          </button>
        </motion.div>

        {/* Save to Server Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card p-6 flex flex-col items-center text-center gap-3 group">
          <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
            <Save size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{rtl ? 'حفظ على السيرفر' : 'Save to Server'}</h3>
          <p className="text-xs text-slate-500 mb-2">{rtl ? 'حفظ نسخة داخل السيرفر' : 'Store backup on server disk'}</p>
          <button onClick={handleSaveToDisk} disabled={isSavingToDisk}
            className={`w-full py-3 rounded-xl flex justify-center items-center gap-2 font-bold transition-all ${isSavingToDisk ? 'bg-slate-100 text-slate-400' : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95 shadow-lg shadow-blue-500/30'}`}>
            {isSavingToDisk ? <><Loader2 className="animate-spin" size={18} /> {rtl ? 'جاري...' : 'Saving...'}</> : <><HardDrive size={18} /> {rtl ? 'حفظ' : 'Save'}</>}
          </button>
        </motion.div>

        {/* Restore Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-6 flex flex-col items-center text-center gap-3 group">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
            <Upload size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{rtl ? 'استعادة من ملف' : 'Restore from File'}</h3>
          <p className="text-xs text-slate-500 mb-2">{rtl ? 'رفع ملف .zip للاستعادة' : 'Upload a .zip backup'}</p>
          <input type="file" accept=".zip" ref={fileInputRef} onChange={handleRestoreBackup} className="hidden" id="restore-upload" />
          <label htmlFor="restore-upload"
            className={`w-full py-3 rounded-xl flex justify-center items-center gap-2 font-bold cursor-pointer transition-all border-2 border-dashed ${isRestoring ? 'border-slate-300 bg-slate-50 text-slate-400 pointer-events-none' : 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-500 hover:text-white'}`}>
            {isRestoring ? <><Loader2 className="animate-spin" size={18} /> {rtl ? 'جاري...' : 'Restoring...'}</> : <><RotateCcw size={18} /> {rtl ? 'اختر ملف' : 'Select File'}</>}
          </label>
        </motion.div>
      </div>

      {/* GitHub Sync Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        className="glass-card overflow-hidden border-indigo-500/20">
        <div className="bg-gradient-to-r from-indigo-500/10 to-transparent p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/20 text-indigo-500 rounded-2xl flex items-center justify-center shadow-inner">
              <DatabaseBackup size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                {rtl ? 'نسخ احتياطي سحابي' : 'Cloud Backup'}
                <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest leading-none">GitHub</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {rtl ? 'تصدير تلقائي لقاعدة البيانات إلى مستودع GitHub خاص' : 'Auto-export database to a private GitHub repository'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSyncToGithubNow} disabled={isSyncingGh || !ghToken}
              className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${isSyncingGh || !ghToken ? 'bg-slate-100 text-slate-400' : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-500/30'}`}>
              {isSyncingGh ? <Loader2 className="animate-spin" size={18} /> : <Cloud size={18} />}
              {rtl ? 'مزامنة الآن' : 'Sync Now'}
            </button>
            <button onClick={() => setShowGhConfig(!showGhConfig)}
              className="p-2.5 bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all">
              <Settings size={20} className={showGhConfig ? 'rotate-90' : ''} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showGhConfig && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase ml-1">{rtl ? 'توكن GitHub (PAT)' : 'GitHub PAT Token'}</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="password" value={ghToken} onChange={(e) => setGhToken(e.target.value)}
                        placeholder="ghp_xxxxxxxxxxxx"
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-mono" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase ml-1">{rtl ? 'المستودع (Owner/Repo)' : 'Repository Path'}</label>
                    <div className="relative">
                      <HardDrive className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="text" value={ghRepo} onChange={(e) => setGhRepo(e.target.value)}
                        placeholder="username/backup-repo"
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-mono" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase ml-1">{rtl ? 'الفرع (Branch)' : 'Target Branch'}</label>
                    <div className="relative">
                      <RotateCcw className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="text" value={ghBranch} onChange={(e) => setGhBranch(e.target.value)}
                        placeholder="main"
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-mono" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${ghEnabled ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-slate-200 text-slate-400'}`}>
                        <RotateCcw size={20} className={ghEnabled ? 'animate-spin-slow' : ''} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{rtl ? 'التزامن التلقائي' : 'Auto Sync'}</p>
                        <p className="text-[10px] text-slate-500">{rtl ? 'بعد كل نسخة تلقائية' : 'After each auto-backup'}</p>
                      </div>
                    </div>
                    <button onClick={() => setGhEnabled(!ghEnabled)}
                      className={`w-14 h-7 rounded-full relative transition-all duration-300 ${ghEnabled ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${rtl ? (ghEnabled ? 'right-8' : 'right-1') : (ghEnabled ? 'left-8' : 'left-1')}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={handleSaveGhSettings} disabled={isSavingGh}
                  className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all flex justify-center items-center gap-2 shadow-lg shadow-slate-900/10">
                  {isSavingGh ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {rtl ? 'حفظ الإعدادات' : 'Save Settings'}
                </button>
                <button onClick={handleTestGhConnection} disabled={isTestingGh}
                  className="px-6 py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center gap-2">
                  {isTestingGh ? <Loader2 className="animate-spin" size={18} /> : <ExternalLink size={18} />}
                  {rtl ? 'فحص الاتصال' : 'Test Connection'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Feature 1 & 5: Saved Backups & Snapshots */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <HardDrive size={20} className="text-blue-500" />
            {rtl ? 'النسخ المحفوظة ولقطات الأمان' : 'Saved Backups & Safety Snapshots'}
          </h3>
          <button onClick={fetchSavedBackups} className="text-xs text-primary-500 font-bold hover:underline">
            {rtl ? 'تحديث' : 'Refresh'}
          </button>
        </div>

        {savedBackups.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">{rtl ? 'لا توجد نسخ محفوظة بعد' : 'No saved backups yet'}</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
            {savedBackups.map((b) => (
              <div key={b.filename} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${b.type === 'auto' ? 'bg-green-500/10 text-green-500' : b.type === 'snapshot' ? 'bg-violet-500/10 text-violet-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {b.type === 'auto' ? <Clock size={16} /> : b.type === 'snapshot' ? <Shield size={16} /> : <Save size={16} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{b.filename}</p>
                    <p className="text-xs text-slate-400">{new Date(b.created_at).toLocaleString(rtl ? 'ar-EG' : 'en-US')} · {formatSize(b.size)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => handleDownloadSaved(b.filename)}
                    className="p-2 rounded-lg bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all" title={rtl ? 'تحميل' : 'Download'}>
                    <Download size={14} />
                  </button>
                  <button onClick={() => handleRestoreSaved(b.filename)} disabled={loadingSaved}
                    className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all" title={rtl ? 'استعادة' : 'Restore'}>
                    <RotateCcw size={14} />
                  </button>
                  <button onClick={() => handleDeleteSaved(b.filename)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all" title={rtl ? 'حذف' : 'Delete'}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Feature 3: Activity Log */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="glass-card p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
          <History size={20} className="text-violet-500" />
          {rtl ? 'سجل العمليات' : 'Activity Log'}
        </h3>
        {backupLogs.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">{rtl ? 'لا توجد عمليات مسجلة بعد' : 'No operations logged yet'}</p>
        ) : (
          <div className="space-y-1.5 max-h-[250px] overflow-y-auto custom-scrollbar">
            {backupLogs.slice(0, 20).map((log) => (
              <div key={log.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 text-sm">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-white/10 shrink-0">{getActionIcon(log.action)}</div>
                <div className="flex-grow min-w-0">
                  <span className="font-bold text-slate-700 dark:text-slate-200">{log.action}</span>
                  <span className="text-slate-400 mx-1">·</span>
                  <span className="text-xs text-slate-500">{log.admin_username}</span>
                  {log.details && <p className="text-xs text-slate-400 truncate">{log.details}</p>}
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                  {new Date(log.created_at).toLocaleString(rtl ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Feature 1: Auto-Backup Status */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="glass-card p-5 flex items-center justify-between flex-wrap gap-4 bg-green-500/5 border-s-4 border-green-500">
        <div className="flex items-center gap-3">
          <Clock size={22} className="text-green-500" />
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">{rtl ? 'النسخ الاحتياطي التلقائي' : 'Auto-Backup'}</h3>
            <p className="text-xs text-slate-500">{rtl ? 'يعمل يومياً الساعة 3:00 فجراً تلقائياً ويحتفظ بآخر 7 نسخ' : 'Runs daily at 3:00 AM, keeps last 7 copies'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastBackup && (
            <span className="text-xs text-slate-500">
              {rtl ? `آخر نسخة: ${lastBackup}` : `Last backup: ${lastBackup}`}
            </span>
          )}
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-sm font-bold text-green-600 dark:text-green-400">{rtl ? 'نشط' : 'Active'}</span>
        </div>
      </motion.div>

      {/* DANGER ZONE */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="mt-10 pt-10 border-t border-red-500/20">
        <h2 className="text-2xl font-black text-red-500 mb-6 flex items-center gap-2">
          <AlertTriangle size={28} /> {rtl ? 'منطقة الخطر' : 'Danger Zone'}
        </h2>
        <div className="glass-card p-6 border border-red-500/30 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
              {rtl ? 'مسح قاعدة البيانات (Factory Reset)' : 'Wipe Database (Factory Reset)'}
            </h3>
            <p className="text-sm text-slate-500">
              {rtl ? 'سيتم أخذ لقطة أمان تلقائية قبل الحذف. حسابات المديرين ستبقى.' : 'A safety snapshot is auto-created before wiping. Admin accounts are preserved.'}
            </p>
          </div>
          <button onClick={() => setShowWipeModal(true)}
            className="px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all rounded-xl font-bold flex items-center gap-2 border border-red-500/50">
            <Trash2 size={20} /> {rtl ? 'تفريغ المتجر' : 'Wipe Store'}
          </button>
        </div>
      </motion.div>

      {/* Wipe Confirmation Modal */}
      <AnimatePresence>
        {showWipeModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowWipeModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative z-10 border border-slate-100 dark:border-slate-800">
              <div className="p-8">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-2xl font-black text-center text-slate-800 dark:text-white mb-2">
                  {rtl ? 'هل أنت متأكد؟' : 'Are you sure?'}
                </h3>
                <p className="text-center text-slate-500 mb-4 text-sm">
                  {rtl ? 'سيتم أخذ لقطة أمان تلقائية يمكنك الرجوع إليها.' : 'A safety snapshot will be auto-created for undo.'}
                </p>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl mb-4 text-center border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-400 block mb-1 uppercase">{rtl ? 'اكتب هذه العبارة' : 'Type this phrase'}</span>
                  <code className="text-red-500 font-mono font-black text-lg">CONFIRM WIPE</code>
                </div>
                <input type="text" autoFocus placeholder="CONFIRM WIPE" value={wipeConfirmText}
                  onChange={(e) => setWipeConfirmText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 mb-4 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all font-mono text-center uppercase" />
                <div className="flex gap-3">
                  <button onClick={() => setShowWipeModal(false)}
                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    {rtl ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button onClick={handleWipeDatabase} disabled={wipeConfirmText !== 'CONFIRM WIPE' || isWiping}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2">
                    {isWiping ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                    {rtl ? 'تأكيد الحذف' : 'Wipe Now'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
