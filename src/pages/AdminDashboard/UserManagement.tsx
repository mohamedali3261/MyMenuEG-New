import { useState, useEffect } from 'react';
import { useStore } from '../../store/store';
import { 
  LucideUsers, 
  LucidePlus, 
  LucideTrash2, 
  LucideShield, 
  LucideUserCheck, 
  LucideX,
  LucideCheck,
  LucideLock,
  LucidePencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ADMIN_TABS } from './components/adminTabs';

interface ManagedAdmin {
  id: string;
  username: string;
  is_super_admin: boolean;
  permissions?: string[];
}

const AVAILABLE_PAGES = ADMIN_TABS.map((tab) => ({
  id: tab.id,
  name: tab.labelAr
}));

export default function UserManagement() {
  const { user, admins, fetchAdmins, addAdmin, updateAdmin, deleteAdmin } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  if (!user?.is_super_admin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-red-500/5 rounded-3xl border border-red-500/10">
        <LucideLock size={64} className="text-red-500 mb-6 opacity-40 animate-pulse" />
        <h1 className="text-2xl font-black text-white mb-2">عفواً، الوصول مرفوض</h1>
        <p className="text-slate-400 max-w-md">هذه الصفحة مخصصة للمسؤول الرئيسي فقط. ليس لديك صلاحية لإدارة المستخدمين.</p>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setEditingId(null);
    setUsername('');
    setPassword('');
    setSelectedPermissions([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (admin: ManagedAdmin) => {
    setIsEditMode(true);
    setEditingId(admin.id);
    setUsername(admin.username);
    setPassword(''); // Don't show hashed password
    setSelectedPermissions(admin.permissions || []);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPermissions.length === 0 && !isEditMode) {
      toast.error('يرجى تحديد صلاحية واحدة على الأقل');
      return;
    }
    
    setIsLoading(true);
    let success = false;

    if (isEditMode && editingId) {
      const data: { username: string; permissions: string[]; password?: string } = { username, permissions: selectedPermissions };
      if (password) data.password = password; // Only update if provided
      success = await updateAdmin(editingId, data);
    } else {
      success = await addAdmin({ username, password, permissions: selectedPermissions });
    }

    if (success) {
      toast.success(isEditMode ? 'تم تحديث البيانات بنجاح' : 'تم إضافة المستخدم بنجاح');
      setIsModalOpen(false);
      fetchAdmins();
    } else {
      toast.error('فشل في حفظ البيانات (ربما الاسم موجود مسبقاً)');
    }
    setIsLoading(false);
  };

  const togglePermission = (id: string) => {
    setSelectedPermissions(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <LucideUsers className="text-primary-500" size={32} />
            <span>إدارة المستخدمين</span>
          </h1>
          <p className="text-slate-400 mt-2">قم بإنشاء حسابات فرعية وتحديد صلاحيات الوصول لكل مستخدم</p>
        </div>
        
        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/20 active:scale-95"
        >
          <LucidePlus size={20} />
          <span>إضافة مستخدم جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {admins.map((admin) => (
          <motion.div 
            layout
            key={admin.id}
            className="glass-card p-6 border border-white/5 hover:border-primary-500/30 transition-all group relative overflow-hidden"
          >
             {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 blur-3xl rounded-full -mr-10 -mt-10 group-hover:bg-primary-500/10 transition-colors" />

            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/5 group-hover:bg-primary-500/20 group-hover:border-primary-500/20 transition-all">
                  <LucideShield size={24} className="text-primary-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">{admin.username}</h3>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    {admin.is_super_admin ? 'مسؤول رئيسي' : 'مسؤول'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleOpenEdit(admin)}
                  className="p-2 text-slate-500 hover:text-primary-500 hover:bg-primary-500/10 rounded-xl transition-all"
                  title="تعديل"
                >
                  <LucidePencil size={18} />
                </button>
                
                {!admin.is_super_admin && (
                  <button 
                    onClick={() => {
                      if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
                        deleteAdmin(admin.id).then(() => fetchAdmins());
                      }
                    }}
                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    title="حذف"
                  >
                    <LucideTrash2 size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-3 relative z-10">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">الصلاحيات:</span>
              <div className="flex flex-wrap gap-2">
                {admin.is_super_admin ? (
                  <span className="px-3 py-1 bg-primary-500/10 text-primary-500 rounded-full text-xs font-bold border border-primary-500/20">كل الصفحات</span>
                ) : (
                  admin.permissions?.map((p: string) => (
                    <span key={p} className="px-3 py-1 bg-white/5 text-slate-300 rounded-full text-xs font-bold border border-white/10 group-hover:border-primary-500/20 transition-all">
                      {AVAILABLE_PAGES.find(ap => ap.id === p)?.name || p}
                    </span>
                  )) || <span className="text-xs text-slate-600">لا توجد صلاحيات</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-28 md:pt-32 pb-6 px-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl glass-card border border-white/10 rounded-2xl p-3.5 md:p-4 shadow-2xl relative z-110 overflow-hidden"
            >
              <div className="max-h-[calc(100vh-11.5rem)] overflow-y-auto custom-scrollbar pr-1.5 [direction:ltr]">
              <div dir="rtl" className="text-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  {isEditMode ? <LucidePencil className="text-primary-500" size={20} /> : <LucideUserCheck className="text-primary-500" size={20} />}
                  <span>{isEditMode ? `تعديل المستخدم: ${username}` : 'إضافة مسؤول جديد'}</span>
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                  <LucideX size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 mr-1 block">اسم المستخدم</label>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full h-9 bg-white/5 border border-white/10 rounded-lg px-3 text-xs text-white outline-none focus:border-primary-500/50 transition-all"
                      placeholder="admin_new"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 mr-1 block">كلمة المرور {isEditMode && '(اتركها فارغة لعدم التغيير)'}</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-9 bg-white/5 border border-white/10 rounded-lg px-3 text-xs text-white outline-none focus:border-primary-500/50 transition-all"
                      placeholder="••••••••"
                      required={!isEditMode}
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-slate-400 mr-1 block uppercase tracking-widest">تحديد صلاحيات الوصول إلى الصفحات:</label>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    {AVAILABLE_PAGES.map((page) => (
                      <button
                        key={page.id}
                        type="button"
                        onClick={() => togglePermission(page.id)}
                        className={`p-2.5 rounded-lg border transition-all text-right flex items-center justify-between group ${
                          selectedPermissions.includes(page.id) 
                            ? 'bg-primary-500/20 border-primary-500/50 text-white' 
                            : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <span className="text-xs font-medium">{page.name}</span>
                        {selectedPermissions.includes(page.id) ? (
                          <LucideCheck size={14} className="text-primary-500" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-600 group-hover:border-slate-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 h-9 border border-white/5 hover:bg-white/5 text-slate-300 text-xs font-bold rounded-lg transition-all"
                  >
                    إلغاء
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="px-6 h-9 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50"
                  >
                    {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (isEditMode ? 'تحديث البيانات' : 'إضافة المستخدم')}
                  </button>
                </div>
              </form>
              </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
