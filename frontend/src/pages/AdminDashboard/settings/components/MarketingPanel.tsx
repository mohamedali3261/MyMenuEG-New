import { useState, useEffect } from 'react';
import { useStore } from '../../../../store/store';
import { Megaphone, MessageCircle, Loader2 } from 'lucide-react';
import { api } from '../../../../api';
import SaveButton from '../../../../components/SaveButton';

export default function MarketingPanel() {
  const { rtl, showToast } = useStore();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    promo_enabled: 'false',
    promo_text_ar: '',
    promo_text_en: '',
    whatsapp_enabled: 'false',
    whatsapp_phone: '',
    whatsapp_message: ''
  });

  useEffect(() => {
    api.get('/settings').then(res => {
      setForm(prev => ({ ...prev, ...res.data }));
    }).catch(console.error);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post('/settings', form);
      showToast(rtl ? 'تم حفظ إعدادات التسويق' : 'Marketing settings saved');
    } catch {
      showToast('Error saving settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 mt-8">
      {/* Promotion Strip Settings */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
          <Megaphone size={24} className="text-primary-500" />
          {rtl ? 'شريط العروض العلوي' : 'Promotion Strip'}
        </h2>
        
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${form.promo_enabled === 'true' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-slate-200 text-slate-400'}`}>
              <Megaphone size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{rtl ? 'تفعيل الشريط العلوي' : 'Enable Top Promotion Strip'}</p>
              <p className="text-[10px] text-slate-500">{rtl ? 'شريط عروض متحرك أعلى الصفحة' : 'Animated offers strip at top'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setForm({...form, promo_enabled: form.promo_enabled === 'true' ? 'false' : 'true'})}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 ease-out ${form.promo_enabled === 'true' ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30' : 'bg-slate-300 dark:bg-slate-600'}`}
          >
            <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ease-out flex items-center justify-center ${form.promo_enabled === 'true' ? 'translate-x-7 shadow-primary-500/20' : 'translate-x-0'}`}>
              {form.promo_enabled === 'true' && <span className="text-primary-500 text-[10px] font-bold">✓</span>}
            </span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm text-slate-400">{rtl ? 'نص العرض (عربي)' : 'Promo Text (Arabic)'}</label>
            <input value={form.promo_text_ar} onChange={e => setForm({...form, promo_text_ar: e.target.value})} type="text" className="w-full bg-slate-100 dark:bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block mb-2 text-sm text-slate-400">{rtl ? 'نص العرض (إنجليزي)' : 'Promo Text (English)'}</label>
            <input value={form.promo_text_en} onChange={e => setForm({...form, promo_text_en: e.target.value})} type="text" className="w-full bg-slate-100 dark:bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-primary-500" dir="ltr" />
          </div>
        </div>
      </div>

      {/* WhatsApp Settings */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
          <MessageCircle size={24} className="text-primary-500" />
          {rtl ? 'زر الواتساب العائم' : 'Floating WhatsApp Button'}
        </h2>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${form.whatsapp_enabled === 'true' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-slate-200 text-slate-400'}`}>
              <MessageCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{rtl ? 'تفعيل زر الواتساب' : 'Enable WhatsApp Button'}</p>
              <p className="text-[10px] text-slate-500">{rtl ? 'زر عائم للتواصل عبر واتساب' : 'Floating chat button'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setForm({...form, whatsapp_enabled: form.whatsapp_enabled === 'true' ? 'false' : 'true'})}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 ease-out ${form.whatsapp_enabled === 'true' ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/30' : 'bg-slate-300 dark:bg-slate-600'}`}
          >
            <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ease-out flex items-center justify-center ${form.whatsapp_enabled === 'true' ? 'translate-x-7 shadow-green-500/20' : 'translate-x-0'}`}>
              {form.whatsapp_enabled === 'true' && <span className="text-green-500 text-[10px] font-bold">✓</span>}
            </span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block mb-2 text-sm text-slate-400">{rtl ? 'رقم الواتساب (بالكود)' : 'WhatsApp Number (with code)'}</label>
            <input value={form.whatsapp_phone} onChange={e => setForm({...form, whatsapp_phone: e.target.value})} type="text" placeholder="2010..." className="w-full bg-slate-100 dark:bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-green-500" dir="ltr" />
          </div>
          <div>
            <label className="block mb-2 text-sm text-slate-400">{rtl ? 'الرسالة التلقائية' : 'Default Message'}</label>
            <input value={form.whatsapp_message} onChange={e => setForm({...form, whatsapp_message: e.target.value})} type="text" className="w-full bg-slate-100 dark:bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-green-500" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton
          onClick={handleSave}
          isSaving={loading}
          rtl={rtl}
          color="glass"
          checkHasChanges={false}
        />
      </div>
    </div>
  );
}
