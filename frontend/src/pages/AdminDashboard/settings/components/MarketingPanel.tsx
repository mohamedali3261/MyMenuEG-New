import { useState, useEffect } from 'react';
import { useStore } from '../../../../store/store';
import { Megaphone, MessageCircle, Save, Loader2 } from 'lucide-react';
import { api } from '../../../../api';

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
        
        <div className="flex items-center gap-3 mb-6">
           <input 
             type="checkbox" 
             id="promo_enabled"
             checked={form.promo_enabled === 'true'} 
             onChange={e => setForm({...form, promo_enabled: e.target.checked ? 'true' : 'false'})}
             className="w-5 h-5 rounded text-primary-500" 
           />
           <label htmlFor="promo_enabled" className="font-bold">{rtl ? 'تفعيل الشريط العلوي' : 'Enable Top Promotion Strip'}</label>
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
          <MessageCircle size={24} className="text-green-500" />
          {rtl ? 'زر الواتساب العائم' : 'Floating WhatsApp Button'}
        </h2>

        <div className="flex items-center gap-3 mb-6">
           <input 
             type="checkbox" 
             id="whatsapp_enabled"
             checked={form.whatsapp_enabled === 'true'} 
             onChange={e => setForm({...form, whatsapp_enabled: e.target.checked ? 'true' : 'false'})}
             className="w-5 h-5 rounded text-primary-500" 
           />
           <label htmlFor="whatsapp_enabled" className="font-bold">{rtl ? 'تفعيل زر الواتساب' : 'Enable WhatsApp Button'}</label>
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
        <button onClick={handleSave} disabled={loading} className="btn-primary flex items-center gap-2 px-10 h-12 shadow-xl shadow-primary-500/20">
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          {rtl ? 'حفظ إعدادات التسويق' : 'Save Marketing Settings'}
        </button>
      </div>
    </div>
  );
}
