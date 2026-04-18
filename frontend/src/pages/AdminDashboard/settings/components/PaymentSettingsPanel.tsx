import { useState, useEffect } from 'react';
import { useStore } from '../../../../store/store';
import { CreditCard, Save, Loader2, ToggleLeft, ToggleRight, Wallet, Landmark, Smartphone, Banknote, ShieldCheck, AlertTriangle } from 'lucide-react';
import { api } from '../../../../api';

type ToggleSwitchProps = {
  enabled: boolean;
  onToggle: () => void;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color?: string;
};

export default function PaymentSettingsPanel() {
  const { rtl, showToast, paymentSettings, updatePaymentSettings } = useStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(paymentSettings);

  useEffect(() => {
    api.get('/settings').then(res => {
      if (res.data.payment_settings) {
        try {
          const parsed = JSON.parse(res.data.payment_settings);
          setForm(prev => ({ ...prev, ...parsed }));
          updatePaymentSettings(parsed);
        } catch { /* use defaults */ }
      }
    }).catch(console.error);
  }, [updatePaymentSettings]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post('/settings', {
        payment_settings: JSON.stringify(form)
      });
      updatePaymentSettings(form);
      showToast(rtl ? 'تم حفظ إعدادات الدفع بنجاح ✓' : 'Payment settings saved ✓');
    } catch {
      showToast(rtl ? 'خطأ في حفظ الإعدادات' : 'Error saving settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleField = (field: 'onlinePaymentEnabled' | 'cod' | 'paymob' | 'fawry' | 'wallet') => {
    setForm(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const ToggleSwitch = ({ enabled, onToggle, label, description, icon: Icon, color = 'primary' }: ToggleSwitchProps) => (
    <div className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${enabled ? `bg-${color}-500/5 border-${color}-500/20` : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${enabled ? `bg-${color}-500/10 text-${color}-500` : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
          <Icon size={22} />
        </div>
        <div>
          <p className="font-bold text-sm">{label}</p>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
      </div>
      <button onClick={onToggle} className="transition-all active:scale-90">
        {enabled ? (
          <ToggleRight size={36} className="text-green-500" />
        ) : (
          <ToggleLeft size={36} className="text-slate-400" />
        )}
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
        <CreditCard className="text-primary-500" size={32} />
        {rtl ? 'إعدادات الدفع' : 'Payment Settings'}
      </h1>
      <p className="text-slate-400 text-sm mb-8">
        {rtl ? 'تحكم في طرق الدفع المتاحة لعملائك' : 'Control the payment methods available to your customers'}
      </p>

      {/* Master Switch */}
      <div className={`glass-card p-6 mb-8 border-2 transition-all ${form.onlinePaymentEnabled ? 'border-green-500/30' : 'border-slate-200 dark:border-white/10'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${form.onlinePaymentEnabled ? 'bg-green-500/10 text-green-500' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
              <CreditCard size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black">{rtl ? 'الدفع الإلكتروني' : 'Online Payments'}</h2>
              <p className="text-sm text-slate-400">
                {form.onlinePaymentEnabled 
                  ? (rtl ? '✅ مفعّل - العملاء يمكنهم الدفع إلكترونياً' : '✅ Enabled - Customers can pay online')
                  : (rtl ? '⏸️ معطّل - الدفع عند الاستلام فقط' : '⏸️ Disabled - Cash on Delivery only')}
              </p>
            </div>
          </div>
          <button 
            onClick={() => toggleField('onlinePaymentEnabled')}
            className="transition-all active:scale-90"
          >
            {form.onlinePaymentEnabled ? (
              <ToggleRight size={48} className="text-green-500" />
            ) : (
              <ToggleLeft size={48} className="text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="glass-card p-6 mb-8">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <Wallet size={20} className="text-primary-500" />
          {rtl ? 'طرق الدفع المتاحة' : 'Available Payment Methods'}
        </h3>
        <div className="space-y-4">
          <ToggleSwitch
            enabled={form.cod}
            onToggle={() => toggleField('cod')}
            label={rtl ? 'الدفع عند الاستلام (COD)' : 'Cash on Delivery (COD)'}
            description={rtl ? 'يدفع العميل عند استلام الطلب' : 'Customer pays when receiving the order'}
            icon={Banknote}
          />
          
          {form.onlinePaymentEnabled && (
            <>
              <ToggleSwitch
                enabled={form.paymob}
                onToggle={() => toggleField('paymob')}
                label={rtl ? 'Paymob (فيزا / ماستركارد)' : 'Paymob (Visa / Mastercard)'}
                description={rtl ? 'الدفع بالبطاقات البنكية' : 'Pay with bank cards'}
                icon={CreditCard}
              />
              <ToggleSwitch
                enabled={form.fawry}
                onToggle={() => toggleField('fawry')}
                label={rtl ? 'فوري (Fawry)' : 'Fawry'}
                description={rtl ? 'الدفع عبر أكشاك فوري' : 'Pay via Fawry kiosks'}
                icon={Landmark}
              />
              <ToggleSwitch
                enabled={form.wallet}
                onToggle={() => toggleField('wallet')}
                label={rtl ? 'المحافظ الإلكترونية' : 'Mobile Wallets'}
                description={rtl ? 'فودافون كاش / اتصالات كاش / أورانج' : 'Vodafone Cash / Etisalat Cash / Orange'}
                icon={Smartphone}
              />
            </>
          )}
        </div>
      </div>

      {/* API Keys (only when online payments enabled) */}
      {form.onlinePaymentEnabled && (
        <div className="glass-card p-6 mb-8">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            <ShieldCheck size={20} className="text-green-500" />
            {rtl ? 'مفاتيح API (اختياري)' : 'API Keys (Optional)'}
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            {rtl ? 'اتركها فارغة لاستخدام وضع المحاكاة (Simulation)' : 'Leave empty to use Simulation Mode'}
          </p>

          {!form.paymobApiKey && !form.fawryMerchantCode && (
            <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6">
              <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                {rtl 
                  ? 'وضع المحاكاة نشط: الدفع الإلكتروني سيعمل كتجربة وهمية حتى تضيف مفاتيح API الحقيقية.' 
                  : 'Simulation Mode Active: Online payments will work as a demo until you add real API keys.'}
              </p>
            </div>
          )}

          {form.paymob && (
            <div className="space-y-4 mb-6 p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
              <h4 className="font-bold text-sm text-primary-500">Paymob</h4>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">{rtl ? 'مفتاح API' : 'API Key'}</label>
                <input
                  type="password"
                  value={form.paymobApiKey}
                  onChange={e => setForm({ ...form, paymobApiKey: e.target.value })}
                  placeholder="pk_live_..."
                  className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-primary-500 outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Integration ID</label>
                <input
                  type="text"
                  value={form.paymobIntegrationId}
                  onChange={e => setForm({ ...form, paymobIntegrationId: e.target.value })}
                  placeholder="123456"
                  className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-primary-500 outline-none font-mono"
                />
              </div>
            </div>
          )}

          {form.fawry && (
            <div className="space-y-4 p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
              <h4 className="font-bold text-sm text-blue-500">Fawry</h4>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Merchant Code</label>
                <input
                  type="text"
                  value={form.fawryMerchantCode}
                  onChange={e => setForm({ ...form, fawryMerchantCode: e.target.value })}
                  placeholder="FawryMerchant..."
                  className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-primary-500 outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Security Key</label>
                <input
                  type="password"
                  value={form.fawrySecurityKey}
                  onChange={e => setForm({ ...form, fawrySecurityKey: e.target.value })}
                  placeholder="sk_..."
                  className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-primary-500 outline-none font-mono"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full btn-primary flex items-center justify-center gap-2 h-14 text-lg shadow-xl shadow-primary-500/20"
      >
        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
        {rtl ? 'حفظ إعدادات الدفع' : 'Save Payment Settings'}
      </button>
    </div>
  );
}
