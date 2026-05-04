import { useState, useEffect } from 'react';
import { useStore } from '../../../store/store';
import { Megaphone, Save, Loader2, Image as ImageIcon, Link as LinkIcon, Timer, Sparkles } from 'lucide-react';
import { api } from '../../../api';
import { resolveAssetUrl } from '../../../utils/assetUrl';

interface OfferForm {
  enabled: boolean;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  imageUrl: string;
  actionLink: string;
  actionTextAr: string;
  actionTextEn: string;
  delaySeconds: number;
}

export default function OffersManager() {
  const { rtl, showToast } = useStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [form, setForm] = useState<OfferForm>({
    enabled: false,
    titleAr: '',
    titleEn: '',
    descAr: '',
    descEn: '',
    imageUrl: '',
    actionLink: '',
    actionTextAr: '',
    actionTextEn: '',
    delaySeconds: 5
  });

  useEffect(() => {
    api.get('/settings').then(res => {
      if (res.data.popup_settings) {
        try {
          const parsed = JSON.parse(res.data.popup_settings);
          setForm(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error('Failed to parse popup settings', e);
        }
      }
    }).catch(console.error).finally(() => setFetching(false));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('page', 'popup_offer');

    try {
      const res = await api.post('/upload', formData);
      setForm({ ...form, imageUrl: res.data.url });
      showToast(rtl ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
    } catch (error) {
      console.error(error);
      showToast('Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post('/settings', {
        popup_settings: JSON.stringify(form)
      });
      showToast(rtl ? 'تم حفظ إعدادات العرض المنبثق' : 'Popup offer settings saved');
    } catch (error) {
      console.error(error);
      showToast('Error saving settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <Megaphone size={32} className="text-primary-500" />
          {rtl ? 'إدارة الإعلانات والعروض' : 'Ads & Offers Management'}
        </h1>
        
        <div className="flex items-center gap-4">
           <div className={`px-4 py-2 rounded-xl text-sm font-black uppercase flex items-center gap-2 ${form.enabled ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'}`}>
              <div className={`w-2 h-2 rounded-full ${form.enabled ? 'bg-primary-500 animate-pulse' : 'bg-slate-500'}`} />
              {form.enabled ? (rtl ? 'مفعل الآن' : 'Active Now') : (rtl ? 'معطل' : 'Disabled')}
           </div>
        </div>
      </div>

      <div className="glass-card p-8 md:p-12 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
          <div>
             <h2 className="text-xl font-bold mb-1">{rtl ? 'إعدادات النافذة المنبثقة' : 'Popup Offer Settings'}</h2>
             <p className="text-sm text-slate-500">{rtl ? 'تحكم في شكل وتوقيت العرض الذي يظهر للزوار' : 'Control the appearance and timing of the offer shown to visitors'}</p>
          </div>
          <button 
            onClick={() => setForm({...form, enabled: !form.enabled})}
            className={`relative w-16 h-8 rounded-full transition-all duration-300 ease-out ${form.enabled ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30' : 'bg-slate-300 dark:bg-slate-600'}`}
          >
            <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 ease-out flex items-center justify-center ${form.enabled ? 'translate-x-7 shadow-primary-500/20' : 'translate-x-0'}`}>
              {form.enabled && <span className="text-primary-500 text-xs font-bold">✓</span>}
            </span>
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column: Form Fields */}
          <div className="space-y-8">
            <div className="space-y-3">
                <label className="text-sm font-bold text-slate-400 flex items-center gap-2">
                  <Timer size={16} />
                  {rtl ? 'تأخير الظهور (ثواني)' : 'Delay (Seconds)'}
                </label>
                <input 
                  type="number" 
                  value={form.delaySeconds} 
                  onChange={e => setForm({...form, delaySeconds: parseInt(e.target.value) || 0})} 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-primary-500 font-black text-lg transition-all"
                />
            </div>

            <div className="space-y-6 bg-white/5 p-6 rounded-3xl border border-white/5">
              <h3 className="font-black text-primary-500 flex items-center gap-2 uppercase tracking-widest text-sm">
                <Sparkles size={18} />
                {rtl ? 'نصوص العرض' : 'Offer Content'}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">{rtl ? 'العنوان (عربي)' : 'Title (Arabic)'}</label>
                  <input value={form.titleAr} onChange={e => setForm({...form, titleAr: e.target.value})} type="text" className="w-full bg-slate-900 border border-white/10 rounded-xl p-3.5 outline-none focus:border-primary-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">{rtl ? 'العنوان (إنجليزي)' : 'Title (English)'}</label>
                  <input value={form.titleEn} onChange={e => setForm({...form, titleEn: e.target.value})} type="text" className="w-full bg-slate-900 border border-white/10 rounded-xl p-3.5 outline-none focus:border-primary-500" dir="ltr" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">{rtl ? 'الوصف (عربي)' : 'Description (Arabic)'}</label>
                <textarea value={form.descAr} onChange={e => setForm({...form, descAr: e.target.value})} rows={3} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3.5 outline-none focus:border-primary-500 resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">{rtl ? 'الوصف (إنجليزي)' : 'Description (English)'}</label>
                <textarea value={form.descEn} onChange={e => setForm({...form, descEn: e.target.value})} rows={3} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3.5 outline-none focus:border-primary-500 resize-none" dir="ltr" />
              </div>
            </div>

            <div className="space-y-6 bg-white/5 p-6 rounded-3xl border border-white/5">
               <h3 className="font-black text-primary-500 flex items-center gap-2 uppercase tracking-widest text-sm">
                <LinkIcon size={18} />
                {rtl ? 'زر التوجيه' : 'Target Link'}
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">{rtl ? 'نص الزر (عربي)' : 'Btn Text (Arabic)'}</label>
                  <input value={form.actionTextAr} onChange={e => setForm({...form, actionTextAr: e.target.value})} type="text" className="w-full bg-slate-900 border border-white/10 rounded-xl p-3.5 outline-none focus:border-primary-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">{rtl ? 'نص الزر (إنجليزي)' : 'Btn Text (English)'}</label>
                  <input value={form.actionTextEn} onChange={e => setForm({...form, actionTextEn: e.target.value})} type="text" className="w-full bg-slate-900 border border-white/10 rounded-xl p-3.5 outline-none focus:border-primary-500" dir="ltr" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">{rtl ? 'الرابط المستهدف' : 'Action Link'}</label>
                <input value={form.actionLink} onChange={e => setForm({...form, actionLink: e.target.value})} type="text" placeholder="/products" className="w-full bg-slate-900 border border-white/10 rounded-xl p-3.5 outline-none focus:border-primary-500" dir="ltr" />
              </div>
            </div>
          </div>

          {/* Right Column: Visuals */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-black text-blue-500 flex items-center gap-2 uppercase tracking-widest text-sm">
                <ImageIcon size={18} />
                {rtl ? 'الصورة الترويجية' : 'Offer Image'}
              </h3>
              <div className="aspect-[16/10] rounded-[2.5rem] bg-slate-950/50 border-2 border-dashed border-white/10 overflow-hidden relative group">
                {form.imageUrl ? (
                  <>
                    <img src={resolveAssetUrl(form.imageUrl)} alt="Offer Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
                       <label className="p-4 bg-white text-slate-900 rounded-full cursor-pointer hover:scale-110 active:scale-95 transition-all">
                          <ImageIcon size={24} />
                          <input type="file" className="hidden" onChange={handleImageUpload} accept=".png,.jpg,.jpeg,.gif,.webp,image/png,image/jpeg,image/gif,image/webp" />
                       </label>
                       <button onClick={() => setForm({...form, imageUrl: ''})} className="p-4 bg-red-500 text-white rounded-full hover:scale-110 active:scale-95 transition-all">
                          <LinkIcon size={24} className="rotate-45" />
                       </button>
                    </div>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 transition-colors">
                     <div className="p-6 rounded-full bg-white/5 text-slate-500">
                        {uploading ? <Loader2 size={40} className="animate-spin text-primary-500" /> : <ImageIcon size={40} />}
                     </div>
                     <div className="text-center">
                        <p className="font-black text-sm uppercase tracking-wider">{rtl ? 'اضغط لرفع صورة' : 'Click to Upload'}</p>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">{rtl ? 'أقصى حجم: 10 ميجا' : 'Max size: 10MB'}</p>
                     </div>
                     <input type="file" className="hidden" onChange={handleImageUpload} accept=".png,.jpg,.jpeg,.gif,.webp,image/png,image/jpeg,image/gif,image/webp" />
                  </label>
                )}
              </div>
            </div>

            {/* General Tip */}
            <div className="p-6 rounded-3xl bg-primary-500/5 border border-primary-500/10 space-y-3">
               <h4 className="font-black text-xs text-primary-500 uppercase tracking-widest flex items-center gap-2">
                 <Sparkles size={14} />
                 {rtl ? 'نصيحة للعرض' : 'Promotion Tip'}
               </h4>
               <p className="text-sm text-slate-400 leading-relaxed font-bold">
                 {rtl ? 'استخدم صوراً ذات جودة عالية مع ألوان زاهية وخطوط واضحة لجذب انتباه الزوار فور دخولهم الموقع. النوافذ المنبثقة تزيد من معدل التحويل بنسبة تصل إلى 20%.' 
                     : 'Use high-quality images with vibrant colors and clear typography to grab visitor attention instantly. Popups can increase conversion rates by up to 20%.'}
               </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-10 border-t border-white/5 flex justify-end">
          <button 
            onClick={handleSave} 
            disabled={loading || uploading} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all duration-300 bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 hover:scale-105 active:scale-95"
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
            <span className="text-xl font-black uppercase tracking-widest">
              {rtl ? 'حفظ التعديلات' : 'Save Offer Details'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
