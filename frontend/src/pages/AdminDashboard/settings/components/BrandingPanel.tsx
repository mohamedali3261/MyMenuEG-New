import { useState, useEffect } from 'react';
import { useStore } from '../../../../store/store';
import { api } from '../../../../api';
import { Palette, Type, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BrandingPanel() {
  const { rtl, branding, updateBranding, showToast } = useStore();
  const defaultBrandColors = {
    primaryColor: '#eb5e28',
    secondaryColor: '#10b981',
    lightBgColor: '#e2e8f0',
    blendColors: false
  };
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    storeName: branding.storeName,
    primaryColor: branding.primaryColor,
    secondaryColor: branding.secondaryColor || '#10b981',
    blendColors: !!branding.blendColors,
    lightBgColor: branding.lightBgColor || '#e2e8f0',
    logoUrl: branding.logoUrl
  });

  useEffect(() => {
    setForm({
      storeName: branding.storeName,
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor || '#10b981',
      blendColors: !!branding.blendColors,
      lightBgColor: branding.lightBgColor || '#e2e8f0',
      logoUrl: branding.logoUrl
    });
  }, [branding]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    formData.append('page', 'branding');

    setLoading(true);
    try {
      const res = await api.post('/upload', formData);
      setForm(prev => ({ ...prev, logoUrl: res.data.url }));
      showToast(rtl ? 'تم رفع اللوجو بنجاح' : 'Logo uploaded successfully');
    } catch {
      showToast(rtl ? 'فشل رفع اللوجو' : 'Failed to upload logo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post('/settings', {
        store_name: form.storeName,
        primary_color: form.primaryColor,
        secondary_color: form.secondaryColor,
        blend_colors: form.blendColors,
        light_bg_color: form.lightBgColor,
        logo_url: form.logoUrl
      });
      updateBranding(form);
      showToast(rtl ? 'تم حفظ التعديلات بنجاح' : 'Settings saved successfully');
    } catch {
      showToast(rtl ? 'حدث خطأ أثناء الحفظ' : 'Error saving settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefaultColors = () => {
    setForm(prev => ({
      ...prev,
      primaryColor: defaultBrandColors.primaryColor,
      secondaryColor: defaultBrandColors.secondaryColor,
      lightBgColor: defaultBrandColors.lightBgColor,
      blendColors: defaultBrandColors.blendColors
    }));
    showToast(rtl ? 'تمت إعادة الألوان للوضع الافتراضي' : 'Colors reset to default');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 mb-8 border-l-4 border-primary-500"
    >
      <div className="flex items-center gap-3 mb-8">
        <Palette className="text-primary-500" size={28} />
        <div>
          <h2 className="text-xl font-bold">{rtl ? 'الهوية والعلامة التجارية' : 'Branding & Identity'}</h2>
          <p className="text-sm text-slate-500">{rtl ? 'خصص مظهر المتجر واسمه وشعاره' : 'Customize store appearance, name and logo'}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Store Name */}
        <div className="space-y-2">
          <label className="text-sm font-bold flex items-center gap-2">
            <Type size={16} className="text-primary-500" />
            {rtl ? 'اسم المتجر' : 'Store Name'}
          </label>
          <input 
            type="text" 
            value={form.storeName}
            onChange={e => setForm({ ...form, storeName: e.target.value })}
            className="w-full bg-slate-100 dark:bg-white/5 border border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold"
          />
        </div>

        {/* Primary Color */}
        <div className="space-y-2">
          <label className="text-sm font-bold flex items-center gap-2">
            <Palette size={16} className="text-primary-500" />
            {rtl ? 'اللون الرئيسي' : 'Primary Theme Color'}
          </label>
          <div className="flex gap-4 items-center">
            <input 
              type="color" 
              value={form.primaryColor}
              onChange={e => setForm({ ...form, primaryColor: e.target.value })}
              className="w-16 h-14 bg-transparent border-0 cursor-pointer rounded-xl"
            />
            <input 
              type="text" 
              value={form.primaryColor}
              onChange={e => setForm({ ...form, primaryColor: e.target.value })}
              className="flex-grow bg-slate-100 dark:bg-white/5 border border-white/10 rounded-xl p-4 uppercase font-mono"
            />
          </div>
        </div>

        {/* Secondary Color */}
        <div className="space-y-2">
          <label className="text-sm font-bold flex items-center gap-2">
            <Palette size={16} className="text-accent-500" />
            {rtl ? 'اللون الثانوي' : 'Secondary Theme Color'}
          </label>
          <div className="flex gap-4 items-center">
            <input
              type="color"
              value={form.secondaryColor}
              onChange={e => setForm({ ...form, secondaryColor: e.target.value })}
              className="w-16 h-14 bg-transparent border-0 cursor-pointer rounded-xl"
            />
            <input
              type="text"
              value={form.secondaryColor}
              onChange={e => setForm({ ...form, secondaryColor: e.target.value })}
              className="flex-grow bg-slate-100 dark:bg-white/5 border border-white/10 rounded-xl p-4 uppercase font-mono"
            />
          </div>
        </div>

        {/* Logo Upload */}
        <div className="md:col-span-2 space-y-4">
          <label className="text-sm font-bold flex items-center gap-2">
            <Upload size={16} className="text-primary-500" />
            {rtl ? 'شعار المتجر (اللوجو)' : 'Store Logo'}
          </label>
          
          <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-slate-100 dark:bg-white/5 rounded-2xl border-2 border-dashed border-white/10">
             <div className="w-32 h-32 bg-white dark:bg-black/20 rounded-2xl flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
                {form.logoUrl ? (
                   <img src={'' + form.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain p-2" />
                ) : (
                   <span className="text-3xl font-black text-slate-300">Logo</span>
                )}
             </div>

             <div className="flex-grow text-center md:text-start">
                <h4 className="font-bold mb-2">{rtl ? 'رفع صور جديدة' : 'Upload New Image'}</h4>
                <p className="text-xs text-slate-500 mb-4">{rtl ? 'يفضل استخدام صور بخلفية شفافة PNG أو WebP بمقاس 200x200' : 'Recommended: transparent PNG or WebP, 200x200px'}</p>
                <label className="btn-primary cursor-pointer inline-flex items-center gap-2 px-6 py-2 text-sm">
                   <Upload size={16} />
                   {rtl ? 'اختر صورة' : 'Choose Image'}
                   <input type="file" className="hidden" accept=".png,.jpg,.jpeg,.gif,.webp,image/png,image/jpeg,image/gif,image/webp" onChange={handleLogoUpload} />
                </label>
                {form.logoUrl && (
                   <button 
                    onClick={() => setForm({ ...form, logoUrl: '' })}
                    className="ms-4 text-xs text-red-500 font-bold hover:underline"
                   >
                     {rtl ? 'حذف اللوجو' : 'Remove Logo'}
                   </button>
                )}
             </div>
          </div>
        </div>

        {/* Light Mode Background Color */}
        <div className="space-y-2">
          <label className="text-sm font-bold flex items-center gap-2">
            <Palette size={16} className="text-primary-500" />
            {rtl ? 'لون الخلفية (الوضع النهاري)' : 'Background Color (Light Mode)'}
          </label>
          <div className="flex gap-4 items-center">
            <input
              type="color"
              value={form.lightBgColor}
              onChange={e => setForm({ ...form, lightBgColor: e.target.value })}
              className="w-16 h-14 bg-transparent border-0 cursor-pointer rounded-xl"
            />
            <input
              type="text"
              value={form.lightBgColor}
              onChange={e => setForm({ ...form, lightBgColor: e.target.value })}
              className="flex-grow bg-slate-100 dark:bg-white/5 border border-white/10 rounded-xl p-4 uppercase font-mono"
            />
          </div>
        </div>

        <div className="md:col-span-2 flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-slate-100 dark:bg-white/5">
          <div>
            <p className="font-bold">{rtl ? 'دمج اللونين' : 'Blend Primary + Secondary'}</p>
            <p className="text-xs text-slate-500">
              {rtl ? 'تشغيله يفعّل التدرجات المدمجة في الأزرار والعناصر البارزة.' : 'Enable gradient blending for prominent UI elements.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm(prev => ({ ...prev, blendColors: !prev.blendColors }))}
            className={`w-16 h-9 rounded-full p-1 transition-all ${form.blendColors ? 'bg-primary-500' : 'bg-slate-300 dark:bg-white/20'}`}
            aria-pressed={form.blendColors}
          >
            <span className={`block w-7 h-7 rounded-full bg-white transition-transform ${form.blendColors ? (rtl ? '-translate-x-7' : 'translate-x-7') : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3 justify-end">
        <button
          type="button"
          onClick={handleResetToDefaultColors}
          disabled={loading}
          className="px-6 py-3 rounded-xl border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
        >
          {rtl ? 'استرجاع الألوان الافتراضية' : 'Reset Default Colors'}
        </button>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="btn-accent px-10 py-3 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
          {rtl ? 'حفظ هوية المتجر' : 'Save Branding'}
        </button>
      </div>
    </motion.div>
  );
}
