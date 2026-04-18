import { Plus, Trash2 } from 'lucide-react';
import type { FormData, QuantityPrice } from '../types';

interface Props {
  rtl: boolean;
  formData: FormData;
  updateForm: (key: keyof FormData, val: any) => void;
  quantityPrices: QuantityPrice[];
  addQuantityPrice: () => void;
  updateQuantityPrice: (index: number, key: keyof QuantityPrice, val: any) => void;
  removeQuantityPrice: (index: number) => void;
}

export function PricingSection({ 
  rtl, formData, updateForm, quantityPrices, addQuantityPrice, updateQuantityPrice, removeQuantityPrice 
}: Props) {
  return (
    <div className="space-y-6">
      <div className="glass-card p-8">
        <h2 className="text-xl font-black mb-8 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
          {rtl ? 'منطق التسعير الأساسي' : 'Base Pricing Logic'}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">{rtl ? 'السعر الحالي (EGP)' : 'Active Price (EGP)'}</label>
            <input value={formData.price} onChange={e => updateForm('price', Number(e.target.value))} type="number" step="0.01" className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none text-xl font-black text-primary-500" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">{rtl ? 'السعر القديم (مقارنة)' : 'Old Price (Anchor)'}</label>
            <input value={formData.old_price} onChange={e => updateForm('old_price', Number(e.target.value))} type="number" step="0.01" className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none text-slate-500 line-through" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">{rtl ? 'المخزون الكلي المتاح' : 'Master Stock Level'}</label>
            <input value={formData.stock} onChange={e => updateForm('stock', Number(e.target.value))} type="number" className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-bold" />
          </div>
        </div>
      </div>

      <div className="glass-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-3xl -z-10" />
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
          <div>
            <h2 className="text-xl font-black">{rtl ? 'التسعير المتدرج (بالكمية)' : 'Tiered Pricing (Quantity)'}</h2>
            <p className="text-xs text-slate-500">{rtl ? 'قدم خصومات عند شراء كميات أكبر' : 'Offer incentives for bulk orders'}</p>
          </div>
          <button onClick={addQuantityPrice} className="btn-primary py-3 px-6 text-xs flex items-center gap-2 rounded-2xl">
            <Plus size={16} /> {rtl ? 'إضافة مستوى سعر' : 'Add Pricing Tier'}
          </button>
        </div>
        
        <div className="space-y-4">
          {quantityPrices.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
              <p className="text-sm text-slate-500">{rtl ? 'لم يتم إضافة أسعار كمية حتى الآن' : 'No quantity tiers defined yet'}</p>
            </div>
          )}
          {quantityPrices.map((qp, i) => (
            <div key={i} className="flex gap-4 items-center bg-white/5 p-6 rounded-3xl border border-white/5 group hover:border-primary-500/30 transition-all">
              <div className="grid grid-cols-3 gap-6 flex-grow">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-500">{rtl ? 'الاسم (مثلاً: 1000 قطعة)' : 'Tier Name (e.g. 1000 pcs)'}</label>
                  <input value={qp.quantity_label} onChange={e => updateQuantityPrice(i, 'quantity_label', e.target.value)} className="w-full bg-black/20 p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 border border-transparent font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-500">{rtl ? 'السعر للقطعة' : 'Unit Price'}</label>
                  <input value={qp.price} onChange={e => updateQuantityPrice(i, 'price', Number(e.target.value))} type="number" className="w-full bg-black/20 p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 border border-transparent font-bold text-primary-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-500">{rtl ? 'السعر القديم' : 'Anchor Price'}</label>
                  <input value={qp.old_price || ''} onChange={e => updateQuantityPrice(i, 'old_price', Number(e.target.value))} type="number" className="w-full bg-black/20 p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 border border-transparent text-slate-500" />
                </div>
              </div>
              <button onClick={() => removeQuantityPrice(i)} className="text-red-500 hover:bg-red-500/10 p-4 rounded-2xl transition"><Trash2 size={20} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
