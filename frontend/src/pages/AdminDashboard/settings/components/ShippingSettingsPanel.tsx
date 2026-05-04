import { useState, useEffect } from 'react';
import { useStore } from '../../../../store/store';
import { api } from '../../../../api';
import { Truck, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import SaveButton from '../../../../components/SaveButton';

interface GovernorateRate {
  name: string;
  rate: number;
}

export default function ShippingSettingsPanel() {
  const { rtl, shippingSettings, updateShippingSettings } = useStore();
  const [freeEnabled, setFreeEnabled] = useState(shippingSettings.freeShippingEnabled);
  const [freeMinOrder, setFreeMinOrder] = useState(shippingSettings.freeShippingMinOrder);
  const [flatRate, setFlatRate] = useState(shippingSettings.flatRateShipping);
  const [govRates, setGovRates] = useState<GovernorateRate[]>(
    Object.entries(shippingSettings.governorateRates).map(([name, rate]) => ({ name, rate }))
  );
  const [newGov, setNewGov] = useState('');
  const [newRate, setNewRate] = useState(0);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const governorateRates: Record<string, number> = {};
      govRates.forEach(g => { governorateRates[g.name] = g.rate; });

      const settings = {
        freeShippingEnabled: freeEnabled,
        freeShippingMinOrder: freeMinOrder,
        flatRateShipping: flatRate,
        governorateRates
      };

      await api.post('/settings', { shipping_settings: JSON.stringify(settings) });
      updateShippingSettings(settings);
      toast.success(rtl ? 'تم حفظ إعدادات الشحن' : 'Shipping settings saved');
    } catch {
      toast.error(rtl ? 'فشل حفظ الإعدادات' : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    api.get('/settings').then(res => {
      const raw = res.data.shipping_settings;
      if (raw) {
        try {
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (parsed.freeShippingEnabled !== undefined) setFreeEnabled(parsed.freeShippingEnabled);
          if (parsed.freeShippingMinOrder !== undefined) setFreeMinOrder(parsed.freeShippingMinOrder);
          if (parsed.flatRateShipping !== undefined) setFlatRate(parsed.flatRateShipping);
          if (parsed.governorateRates) {
            setGovRates(Object.entries(parsed.governorateRates).map(([name, rate]) => ({ name, rate: rate as number })));
          }
        } catch { /* ignore */ }
      }
    }).catch(() => {});
  }, []);

  const addGovRate = () => {
    if (!newGov.trim()) return;
    if (govRates.some(g => g.name === newGov.trim())) return;
    setGovRates([...govRates, { name: newGov.trim(), rate: newRate }]);
    setNewGov('');
    setNewRate(0);
  };

  const removeGovRate = (name: string) => {
    setGovRates(govRates.filter(g => g.name !== name));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
          <Truck className="text-primary-500" size={20} />
        </div>
        <h2 className="text-xl font-bold">{rtl ? 'إعدادات الشحن' : 'Shipping Settings'}</h2>
      </div>

      {/* Free Shipping */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm">{rtl ? 'شحن مجاني' : 'Free Shipping'}</span>
          <button
            onClick={() => setFreeEnabled(!freeEnabled)}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ease-out ${freeEnabled ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30' : 'bg-slate-300 dark:bg-slate-600'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ease-out flex items-center justify-center ${freeEnabled ? 'translate-x-6 shadow-primary-500/20' : 'translate-x-0'}`}>
              {freeEnabled && <span className="text-primary-500 text-[10px] font-bold">✓</span>}
            </span>
          </button>
        </div>
        {freeEnabled && (
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
              {rtl ? 'الحد الأدنى للطلب للشحن المجاني (EGP)' : 'Min Order for Free Shipping (EGP)'}
            </label>
            <input
              type="number"
              value={freeMinOrder}
              onChange={e => setFreeMinOrder(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-primary-500"
              min={0}
              placeholder="0 = شحن مجاني دائماً"
            />
            <p className="text-xs text-slate-400 mt-1">
              {rtl ? 'اتركه 0 للشحن المجاني لجميع الطلبات' : 'Leave 0 for free shipping on all orders'}
            </p>
          </div>
        )}
      </div>

      {/* Flat Rate */}
      <div className="glass-card p-5 space-y-4">
        <label className="font-bold text-sm block">{rtl ? 'سعر الشحن الأساسي (EGP)' : 'Flat Rate Shipping (EGP)'}</label>
        <input
          type="number"
          value={flatRate}
          onChange={e => setFlatRate(Number(e.target.value))}
          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-primary-500"
          min={0}
        />
        <p className="text-xs text-slate-400">
          {rtl ? 'السعر الافتراضي إذا لم تتوفر تسعيرة خاصة بالمحافظة' : 'Default rate if no governorate-specific rate exists'}
        </p>
      </div>

      {/* Governorate Rates */}
      <div className="glass-card p-5 space-y-4">
        <label className="font-bold text-sm block">{rtl ? 'تسعير الشحن حسب المحافظة' : 'Shipping Rates by Governorate'}</label>
        
        {govRates.length > 0 && (
          <div className="space-y-2">
            {govRates.map(g => (
              <div key={g.name} className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                <span className="flex-1 font-medium text-sm">{g.name}</span>
                <span className="text-sm text-primary-500 font-bold">{g.rate} EGP</span>
                <button onClick={() => removeGovRate(g.name)} className="text-red-400 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={newGov}
            onChange={e => setNewGov(e.target.value)}
            placeholder={rtl ? 'اسم المحافظة' : 'Governorate name'}
            className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-primary-500"
          />
          <input
            type="number"
            value={newRate || ''}
            onChange={e => setNewRate(Number(e.target.value))}
            placeholder="EGP"
            className="w-24 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-primary-500"
            min={0}
          />
          <button onClick={addGovRate} className="btn-primary px-4 rounded-xl flex items-center gap-1 text-sm">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Save */}
      <SaveButton
        onClick={save}
        isSaving={saving}
        rtl={rtl}
        color="glass"
        checkHasChanges={false}
      />
    </div>
  );
}
