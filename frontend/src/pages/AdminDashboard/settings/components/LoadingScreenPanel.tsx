import { useState, useEffect } from 'react';
import { useStore } from '../../../../store/store';
import { api } from '../../../../api';
import { Image as ImageIcon, Upload, Loader2, CheckCircle2, Zap, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoadingScreenPanel() {
  const { rtl, loadingScreen, updateLoadingScreen, showToast } = useStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    enabled: loadingScreen.enabled,
    type: loadingScreen.type,
    imageUrl: loadingScreen.imageUrl,
    minDuration: loadingScreen.minDuration
  });

  useEffect(() => {
    setForm({
      enabled: loadingScreen.enabled,
      type: loadingScreen.type,
      imageUrl: loadingScreen.imageUrl,
      minDuration: loadingScreen.minDuration
    });
  }, [loadingScreen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    formData.append('page', 'preloader');

    setLoading(true);
    try {
      const res = await api.post('/upload', formData);
      setForm(prev => ({ ...prev, imageUrl: res.data.url }));
      showToast(rtl ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
    } catch {
      showToast(rtl ? 'فشل رفع الصورة' : 'Failed to upload image', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Stringify the entire object to store it in a single settings key
      await api.post('/settings', {
        loading_screen_settings: JSON.stringify(form)
      });
      updateLoadingScreen(form);
      showToast(rtl ? 'تم حفظ إعدادات شاشة التحميل' : 'Loading screen settings saved');
    } catch {
      showToast(rtl ? 'حدث خطأ أثناء الحفظ' : 'Error saving settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 mb-8 border-l-4 border-accent-500"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Zap className="text-accent-500" size={28} />
          <div>
            <h2 className="text-xl font-bold">{rtl ? 'شاشة التحميل (Preloader)' : 'Loading Screen (Preloader)'}</h2>
            <p className="text-sm text-slate-500">{rtl ? 'تحكم في المظهر الذي يراه الزائر عند فتح الموقع' : 'Control what visitors see while the site loads'}</p>
          </div>
        </div>

        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={form.enabled}
            onChange={e => setForm({ ...form, enabled: e.target.checked })}
          />
          <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500 rounded-full"></div>
          <span className="ms-3 text-sm font-bold text-slate-600 dark:text-slate-400">
            {form.enabled ? (rtl ? 'مفعلة' : 'Enabled') : (rtl ? 'معطلة' : 'Disabled')}
          </span>
        </label>
      </div>

      {form.enabled && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Type Selection */}
          <div className="grid md:grid-cols-2 gap-4">
             <button
               onClick={() => setForm({ ...form, type: 'animation' })}
               className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${form.type === 'animation' ? 'border-accent-500 bg-accent-500/5' : 'border-white/5 hover:bg-white/5'}`}
             >
                <div className={`p-4 rounded-xl ${form.type === 'animation' ? 'bg-accent-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                   <Zap size={24} />
                </div>
                <div className="text-center">
                   <h4 className="font-bold">{rtl ? 'أنيميشن احترافي' : 'Premium Animation'}</h4>
                   <p className="text-[10px] text-slate-500 mt-1">{rtl ? 'حركة ناعمة متطورة بشعارك' : 'Smooth modern pulse animation'}</p>
                </div>
             </button>

             <button
               onClick={() => setForm({ ...form, type: 'custom' })}
               className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${form.type === 'custom' ? 'border-accent-500 bg-accent-500/5' : 'border-white/5 hover:bg-white/5'}`}
             >
                <div className={`p-4 rounded-xl ${form.type === 'custom' ? 'bg-accent-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                   <ImageIcon size={24} />
                </div>
                <div className="text-center">
                   <h4 className="font-bold">{rtl ? 'صورة مخصصة / GIF' : 'Custom Image / GIF'}</h4>
                   <p className="text-[10px] text-slate-500 mt-1">{rtl ? 'ارفع صورتك المتحركة الخاصة' : 'Upload your own loading visual'}</p>
                </div>
             </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8 pt-4">
             {/* Custom Image Upload (If type is custom) */}
             <div className={`space-y-4 transition-opacity duration-300 ${form.type === 'custom' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <label className="text-sm font-bold flex items-center gap-2">
                  <Upload size={16} className="text-accent-500" />
                  {rtl ? 'الصورة المخصصة (GIF/PNG)' : 'Custom Loading Image'}
                </label>
                <div className="flex items-center gap-6 p-4 bg-slate-100 dark:bg-white/5 rounded-xl border border-white/10">
                   <div className="w-16 h-16 bg-white dark:bg-black/20 rounded-lg flex items-center justify-center overflow-hidden border border-white/5">
                      {form.imageUrl ? <img src={form.imageUrl} alt="" className="w-full h-full object-contain" /> : <ImageIcon size={20} className="text-slate-300" />}
                   </div>
                   <label className="btn-primary-sm cursor-pointer whitespace-nowrap">
                      {rtl ? 'اختر ملف' : 'Choose File'}
                      <input type="file" className="hidden" accept=".png,.jpg,.jpeg,.gif,.webp,image/png,image/jpeg,image/gif,image/webp" onChange={handleImageUpload} />
                   </label>
                </div>
             </div>

             {/* Minimum Duration */}
             <div className="space-y-4">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Clock size={16} className="text-accent-500" />
                  {rtl ? 'أقل مدة ظهور (بالملي ثانية)' : 'Min Duration (ms)'}
                </label>
                <div className="flex items-center gap-4">
                   <input 
                    type="range"
                    min="500"
                    max="5000"
                    step="100"
                    value={form.minDuration}
                    onChange={e => setForm({ ...form, minDuration: parseInt(e.target.value) })}
                    className="flex-grow accent-accent-500"
                   />
                   <span className="w-16 text-center font-mono font-bold text-accent-500 bg-accent-500/10 p-2 rounded-lg">{form.minDuration}ms</span>
                </div>
                <p className="text-[10px] text-slate-500 italic">
                   {rtl ? '* ينصح بـ 1500ms لتجربة بصرية أفضل' : '* 1500ms is recommended for best results'}
                </p>
             </div>
          </div>
        </div>
      )}

      <div className="mt-10 pt-6 border-t border-white/10 flex justify-end">
         <button 
          onClick={handleSave}
          disabled={loading}
          className="btn-accent px-10 py-3 flex items-center gap-2 shadow-lg shadow-accent-500/20"
         >
           {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
           {rtl ? 'حفظ الإعدادات' : 'Save Settings'}
         </button>
      </div>
    </motion.div>
  );
}
