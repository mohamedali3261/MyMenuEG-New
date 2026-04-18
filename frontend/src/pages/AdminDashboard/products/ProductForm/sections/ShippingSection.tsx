import type { FormData } from '../types';

interface Props {
  rtl: boolean;
  formData: FormData;
  updateForm: (key: keyof FormData, val: any) => void;
}

export function ShippingSection({ rtl, formData, updateForm }: Props) {
  return (
    <div className="space-y-6">
      <div className="glass-card p-8">
        <h2 className="text-xl font-black mb-8 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
          {rtl ? 'خدمات الشحن واللوجستيات' : 'Shipping & Logistics'}
        </h2>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">{rtl ? 'سياسة الشحن (عربي)' : 'Shipping Policy (Ar)'}</label>
            <textarea value={formData.shipping_info_ar} onChange={e => updateForm('shipping_info_ar', e.target.value)} rows={3} className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-bold" placeholder={rtl ? 'مثال: يتم التوصيل خلال ٤٨ ساعة عمل' : 'e.g. Ships within 48 business hours'} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">{rtl ? 'Shipping Policy (En)' : 'Shipping Policy (En)'}</label>
            <textarea value={formData.shipping_info_en} onChange={e => updateForm('shipping_info_en', e.target.value)} dir="ltr" rows={3} className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-bold font-mono" placeholder="e.g. Ships within 48 business hours" />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">{rtl ? 'معلومات الضمان (عربي)' : 'Warranty & Returns (Ar)'}</label>
            <textarea value={formData.warranty_info_ar} onChange={e => updateForm('warranty_info_ar', e.target.value)} rows={3} className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">{rtl ? 'Warranty & Returns (En)' : 'Warranty & Returns (En)'}</label>
            <textarea value={formData.warranty_info_en} onChange={e => updateForm('warranty_info_en', e.target.value)} dir="ltr" rows={3} className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-mono" />
          </div>
        </div>
      </div>

      <div className="glass-card p-8">
        <h2 className="text-xl font-black mb-8 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
          {rtl ? 'لوجستيات التغليف' : 'Packaging & Carton'}
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">{rtl ? 'مواصفات الكرتونة (عربي)' : 'Carton Specifications (Ar)'}</label>
            <input value={formData.carton_details_ar} onChange={e => updateForm('carton_details_ar', e.target.value)} type="text" className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-bold" placeholder={rtl ? 'تتضمن ١٩٨ عبوة...' : 'Includes 198 pieces...'} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">{rtl ? 'Carton Specifications (En)' : 'Carton Specifications (En)'}</label>
            <input value={formData.carton_details_en} onChange={e => updateForm('carton_details_en', e.target.value)} dir="ltr" type="text" className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-bold font-mono" placeholder="Includes 198 pieces..." />
          </div>
        </div>
      </div>

      <div className="glass-card p-8">
        <h2 className="text-xl font-black mb-8 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
          {rtl ? 'العلامة التجارية والمواد' : 'Brand & Manufacturing'}
        </h2>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">{rtl ? 'اسم البراند (ع)' : 'Brand Identity (Ar)'}</label>
            <input value={formData.brand_ar} onChange={e => updateForm('brand_ar', e.target.value)} type="text" className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-4 outline-none focus:border-primary-500" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">{rtl ? 'Brand Name (En)' : 'Brand Identity (En)'}</label>
            <input value={formData.brand_en} onChange={e => updateForm('brand_en', e.target.value)} dir="ltr" type="text" className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-4 outline-none focus:border-primary-500 font-mono" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">{rtl ? 'الخامة / المكونات (ع)' : 'Core Material (Ar)'}</label>
            <input value={formData.material_ar} onChange={e => updateForm('material_ar', e.target.value)} type="text" className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-4 outline-none focus:border-primary-500" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">{rtl ? 'Core Material (En)' : 'Core Material (En)'}</label>
            <input value={formData.material_en} onChange={e => updateForm('material_en', e.target.value)} dir="ltr" type="text" className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-4 outline-none focus:border-primary-500 font-mono" />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">{rtl ? 'ملاحظات الاستخدام (ع)' : 'Usage Instructions (Ar)'}</label>
            <textarea value={formData.usage_notes_ar} onChange={e => updateForm('usage_notes_ar', e.target.value)} rows={3} className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-4 outline-none focus:border-primary-500" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">{rtl ? 'Usage Notes (En)' : 'Usage Instructions (En)'}</label>
            <textarea value={formData.usage_notes_en} onChange={e => updateForm('usage_notes_en', e.target.value)} dir="ltr" rows={3} className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-4 outline-none focus:border-primary-500 font-mono" />
          </div>
        </div>
      </div>
    </div>
  );
}
