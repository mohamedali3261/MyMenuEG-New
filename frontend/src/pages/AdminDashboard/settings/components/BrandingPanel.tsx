import { useState, useEffect } from 'react';
import { useStore } from '../../../../store/store';
import { api } from '../../../../api';
import { Palette, Type, Upload, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import SaveButton from '../../../../components/SaveButton';

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
    logoUrl: branding.logoUrl,
    navbarStyle: branding.navbarStyle || 'variant1'
  });

  useEffect(() => {
    setForm({
      storeName: branding.storeName,
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor || '#10b981',
      blendColors: !!branding.blendColors,
      lightBgColor: branding.lightBgColor || '#e2e8f0',
      logoUrl: branding.logoUrl,
      navbarStyle: branding.navbarStyle || 'variant1'
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
        logo_url: form.logoUrl,
        navbar_style: form.navbarStyle
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
      className="glass-card p-6 mb-8 border-l-4 border-primary-500"
    >
      <div className="flex items-center gap-3 mb-6">
        <Palette className="text-primary-500" size={20} />
        <div>
          <h2 className="text-lg font-bold">{rtl ? 'الهوية والعلامة التجارية' : 'Branding & Identity'}</h2>
          <p className="text-xs text-slate-500">{rtl ? 'خصص مظهر المتجر واسمه وشعاره' : 'Customize store appearance, name and logo'}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Store Name */}
        <div className="space-y-2">
          <label className="text-xs font-bold flex items-center gap-2">
            <Type size={14} className="text-primary-500" />
            {rtl ? 'اسم المتجر' : 'Store Name'}
          </label>
          <input 
            type="text" 
            value={form.storeName}
            onChange={e => setForm({ ...form, storeName: e.target.value })}
            className="w-full bg-slate-100 dark:bg-white/5 border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-sm"
          />
        </div>

        {/* Primary Color */}
        <div className="space-y-2">
          <label className="text-xs font-bold flex items-center gap-2">
            <Palette size={14} className="text-primary-500" />
            {rtl ? 'اللون الرئيسي' : 'Primary Theme Color'}
          </label>
          <div className="flex gap-3 items-center">
            <input 
              type="color" 
              value={form.primaryColor}
              onChange={e => setForm({ ...form, primaryColor: e.target.value })}
              className="w-12 h-10 bg-transparent border-0 cursor-pointer rounded-lg"
            />
            <input 
              type="text" 
              value={form.primaryColor}
              onChange={e => setForm({ ...form, primaryColor: e.target.value })}
              className="flex-grow bg-slate-100 dark:bg-white/5 border border-white/10 rounded-lg p-3 uppercase font-mono text-sm"
            />
          </div>
        </div>

        {/* Secondary Color */}
        <div className="space-y-2">
          <label className="text-xs font-bold flex items-center gap-2">
            <Palette size={14} className="text-accent-500" />
            {rtl ? 'اللون الثانوي' : 'Secondary Theme Color'}
          </label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={form.secondaryColor}
              onChange={e => setForm({ ...form, secondaryColor: e.target.value })}
              className="w-12 h-10 bg-transparent border-0 cursor-pointer rounded-lg"
            />
            <input
              type="text"
              value={form.secondaryColor}
              onChange={e => setForm({ ...form, secondaryColor: e.target.value })}
              className="flex-grow bg-slate-100 dark:bg-white/5 border border-white/10 rounded-lg p-3 uppercase font-mono text-sm"
            />
          </div>
        </div>

        {/* Logo Upload */}
        <div className="md:col-span-2 space-y-3">
          <label className="text-xs font-bold flex items-center gap-2">
            <Upload size={14} className="text-primary-500" />
            {rtl ? 'شعار المتجر (اللوجو)' : 'Store Logo'}
          </label>
          
          <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-slate-100 dark:bg-white/5 rounded-xl border-2 border-dashed border-white/10">
             <div className="w-24 h-24 bg-white dark:bg-black/20 rounded-xl flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
                {form.logoUrl ? (
                   <img src={'' + form.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain p-2" />
                ) : (
                   <span className="text-2xl font-black text-slate-300">Logo</span>
                )}
             </div>

             <div className="flex-grow text-center md:text-start">
                <h4 className="font-bold text-sm mb-2">{rtl ? 'رفع صور جديدة' : 'Upload New Image'}</h4>
                <p className="text-xs text-slate-500 mb-3">{rtl ? 'يفضل استخدام صور بخلفية شفافة PNG أو WebP بمقاس 200x200' : 'Recommended: transparent PNG or WebP, 200x200px'}</p>
                <label className="btn-primary cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-xs">
                   <Upload size={14} />
                   {rtl ? 'اختر صورة' : 'Choose Image'}
                   <input type="file" className="hidden" accept=".png,.jpg,.jpeg,.gif,.webp,image/png,image/jpeg,image/gif,image/webp" onChange={handleLogoUpload} />
                </label>
                {form.logoUrl && (
                   <button 
                    onClick={() => setForm({ ...form, logoUrl: '' })}
                    className="ms-3 text-xs text-red-500 font-bold hover:underline"
                   >
                     {rtl ? 'حذف اللوجو' : 'Remove Logo'}
                   </button>
                )}
             </div>
          </div>
        </div>

        {/* Light Mode Background Color */}
        <div className="space-y-2">
          <label className="text-xs font-bold flex items-center gap-2">
            <Palette size={14} className="text-primary-500" />
            {rtl ? 'لون الخلفية (الوضع النهاري)' : 'Background Color (Light Mode)'}
          </label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={form.lightBgColor}
              onChange={e => setForm({ ...form, lightBgColor: e.target.value })}
              className="w-12 h-10 bg-transparent border-0 cursor-pointer rounded-lg"
            />
            <input
              type="text"
              value={form.lightBgColor}
              onChange={e => setForm({ ...form, lightBgColor: e.target.value })}
              className="flex-grow bg-slate-100 dark:bg-white/5 border border-white/10 rounded-lg p-3 uppercase font-mono text-sm"
            />
          </div>
        </div>

        <div className="md:col-span-2 flex items-center justify-between p-3 rounded-xl border border-white/10 bg-slate-100 dark:bg-white/5">
          <div>
            <p className="font-bold text-sm">{rtl ? 'دمج اللونين' : 'Blend Primary + Secondary'}</p>
            <p className="text-xs text-slate-500">
              {rtl ? 'تشغيله يفعّل التدرجات المدمجة في الأزرار والعناصر البارزة.' : 'Enable gradient blending for prominent UI elements.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm(prev => ({ ...prev, blendColors: !prev.blendColors }))}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black text-xs transition-all duration-300 ${form.blendColors ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 hover:scale-105 active:scale-95' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-white/20'}`}
            aria-pressed={form.blendColors}
          >
            {form.blendColors ? '✓' : '○'} {rtl ? 'مفعّل' : 'Enabled'}
          </button>
        </div>

        {/* Navbar Style Selection */}
        <div className="md:col-span-2 space-y-3">
          <label className="text-xs font-bold flex items-center gap-2">
            <Type size={14} className="text-primary-500" />
            {rtl ? 'شكل شريط التنقل (النافبار)' : 'Navigation Bar Style'}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'variant1', nameAr: 'عائم زجاجي', nameEn: 'Glass Floating', descAr: 'تصميم عصري بزجاجية وحواف دائرية', descEn: 'Modern glassmorphism with rounded corners' },
              { id: 'variant2', nameAr: 'كلاسيكي مع شريط علوي', nameEn: 'Classic with Top Bar', descAr: 'تصميم تقليدي بشريط إعلاني علوي', descEn: 'Traditional design with promotional top bar' },
              { id: 'variant3', nameAr: 'بسيط شفاف', nameEn: 'Clean Transparent', descAr: 'تصميم بسيط وشفاف مع أزرار دائرية', descEn: 'Clean transparent design with pill buttons' }
            ].map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, navbarStyle: variant.id as 'variant1' | 'variant2' | 'variant3' }))}
                className={`p-4 rounded-xl border-2 transition-all text-start ${form.navbarStyle === variant.id ? 'border-primary-500 bg-primary-500/10' : 'border-slate-200 dark:border-white/10 hover:border-primary-300'}`}
              >
                <div className="font-bold text-sm mb-1">{rtl ? variant.nameAr : variant.nameEn}</div>
                <div className="text-xs text-slate-500">{rtl ? variant.descAr : variant.descEn}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3 justify-end">
        <button
          type="button"
          onClick={handleResetToDefaultColors}
          disabled={loading}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
        >
          {rtl ? 'استرجاع الألوان الافتراضية' : 'Reset Default Colors'}
        </button>
        <SaveButton
          onClick={handleSave}
          isSaving={loading}
          rtl={rtl}
          color="glass"
          checkHasChanges={false}
        />
      </div>
    </motion.div>
  );
}
