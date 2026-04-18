import { Plus, Trash2, Package } from 'lucide-react';
import PremiumDropdown from '../../../../../components/ui/PremiumDropdown';
import { resolveAssetUrl } from '../../../../../utils/assetUrl';
import { DIMENSIONS_PRESET_OPTIONS, DIMENSION_PRESET_MAP } from '../constants';
import type { FormData, ProductVariant } from '../types';

interface Props {
  rtl: boolean;
  variants: ProductVariant[];
  addVariant: () => void;
  updateVariant: (index: number, key: keyof ProductVariant, val: any) => void;
  removeVariant: (index: number) => void;
  handleVariantImageUpload: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  removeVariantImage: (variantIndex: number, imageIndex: number) => void;
  specs: any[];
  addSpec: () => void;
  updateSpec: (index: number, key: string, val: string) => void;
  removeSpec: (index: number) => void;
  formData: FormData;
  updateForm: (key: keyof FormData, val: any) => void;
  dimensionsPreset: string;
  handleDimensionsPresetChange: (val: string) => void;
  productType: 'simple' | 'variants' | 'custom' | 'bundle';
}

export function SpecsSection({ 
  rtl, variants, addVariant, updateVariant, removeVariant, handleVariantImageUpload, removeVariantImage,
  specs, addSpec, updateSpec, removeSpec,
  formData, updateForm, dimensionsPreset, handleDimensionsPresetChange, productType
}: Props) {
  const handleDimensionSelect = (index: number, key: string) => {
    if (!key) return;
    const preset = DIMENSIONS_PRESET_OPTIONS.find(opt => opt.value === key);
    if (preset && key) {
       const data = DIMENSION_PRESET_MAP[key];
       if (data) {
         updateVariant(index, 'size_ar', data.ar);
         updateVariant(index, 'size_en', data.en);
       }
    }
  };

  return (
    <div className="space-y-6">
      {productType === 'variants' && (
      <div className="glass-card p-1">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black">{rtl ? 'النسخ الفعلية (المقاسات/الألوان)' : 'Master Variants'}</h2>
            <button onClick={addVariant} className="btn-primary py-3 px-6 text-xs flex items-center gap-2 rounded-2xl shadow-xl shadow-primary-500/20">
              <Plus size={16} /> {rtl ? 'إضافة نسخة جديدة' : 'Add New Variant'}
            </button>
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-loose">
            {rtl ? 'تُستخدم النسخ لتعريف فوارق المقاس أو اللون أو الحجم التي يختار منها العميل' : 'Define distinct sizes, colors, or capacities for real-world inventory tracking'}
          </p>
        </div>
        
        <div className="p-4 space-y-4">
          {variants.length === 0 && (
            <div className="py-20 flex flex-col items-center opacity-30 grayscale"><Plus size={48} className="mb-4" /></div>
          )}
          {variants.map((variant, i) => (
            <div key={i} className="bg-slate-50 dark:bg-[#0a0a0a] p-4 md:p-6 rounded-3xl md:rounded-[2rem] border border-slate-200 dark:border-white/5 relative group">
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* 1. Images Section (Fixed Width) */}
                <div className="w-full lg:w-48 shrink-0 space-y-3">
                   <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">{rtl ? 'صور النسخة' : 'Variant Images'}</span>
                      <label className="text-primary-500 hover:text-primary-400 cursor-pointer flex items-center gap-1">
                        <Plus size={14} />
                        <span className="text-[10px] font-black uppercase">{rtl ? 'إضافة' : 'Add'}</span>
                        <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleVariantImageUpload(i, e)} />
                      </label>
                   </div>
                   <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
                      {variant.images && variant.images.map((img, imgIdx) => (
                        <div key={imgIdx} className="relative group/img aspect-square rounded-xl overflow-hidden bg-black/20 border border-white/5">
                          <img src={resolveAssetUrl(img)} alt="" className="w-full h-full object-cover" />
                          <button 
                            onClick={() => removeVariantImage(i, imgIdx)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all shadow-lg"
                          >
                            <Plus size={12} className="rotate-45" />
                          </button>
                        </div>
                      ))}
                      <label className="flex items-center justify-center aspect-square rounded-xl bg-slate-100 dark:bg-white/5 border-2 border-dashed border-slate-300 dark:border-white/10 text-slate-400 hover:text-primary-500 hover:border-primary-500/50 transition-all cursor-pointer">
                        <Plus size={18} />
                        <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleVariantImageUpload(i, e)} />
                      </label>
                   </div>
                </div>

                {/* 2. Uniform Fields Grid in Pairs */}
                <div className="flex-grow grid grid-cols-2 gap-x-6 gap-y-4 w-full">
                  {/* Pair 1: Names */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-500 mb-1 block tracking-widest">{rtl ? 'الاسم بالعربية' : 'NAME AR'}</label>
                    <input placeholder={rtl ? 'الاسم (ع)' : 'Name (Ar)'} value={variant.label_ar} onChange={e => updateVariant(i, 'label_ar', e.target.value)} className="w-full bg-white dark:bg-black/40 p-3 h-12 rounded-xl border border-transparent focus:border-primary-500/50 outline-none text-xs font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-500 mb-1 block tracking-widest">{rtl ? 'الاسم بالإنجليزية' : 'NAME EN'}</label>
                    <input placeholder={rtl ? 'الاسم (en)' : 'Name (En)'} value={variant.label_en} onChange={e => updateVariant(i, 'label_en', e.target.value)} dir="ltr" className="w-full bg-white dark:bg-black/40 p-3 h-12 rounded-xl border border-transparent focus:border-primary-500/50 outline-none text-xs font-bold font-mono" />
                  </div>

                  {/* Pair 2: Colors */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-500 mb-1 block tracking-widest">{rtl ? 'اللون (ع)' : 'COLOR AR'}</label>
                    <input placeholder={rtl ? 'اللون (ع)' : 'Color (Ar)'} value={variant.color_ar || ''} onChange={e => updateVariant(i, 'color_ar', e.target.value)} className="w-full bg-white dark:bg-black/40 p-3 h-12 rounded-xl border border-transparent focus:border-primary-500/50 outline-none text-xs font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-500 mb-1 block tracking-widest">{rtl ? 'اللون (ENG)' : 'COLOR EN'}</label>
                    <input placeholder={rtl ? 'اللون (en)' : 'Color (En)'} value={variant.color_en || ''} onChange={e => updateVariant(i, 'color_en', e.target.value)} dir="ltr" className="w-full bg-white dark:bg-black/40 p-3 h-12 rounded-xl border border-transparent focus:border-primary-500/50 outline-none text-xs font-bold font-mono" />
                  </div>

                  {/* Pair 3: Dimensions with Quick Picker */}
                  <div className="col-span-2 space-y-3 p-4 bg-slate-500/5 rounded-2xl border border-slate-500/10">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-md bg-slate-200 dark:bg-white/10 text-slate-500">
                          <Package size={12} />
                        </div>
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{rtl ? 'الأبعاد والقياسات' : 'DIMENSIONS & SIZES'}</span>
                      </div>
                      
                      <div className="w-56">
                        <PremiumDropdown
                          value=""
                          onChange={(val) => handleDimensionSelect(i, val)}
                          options={DIMENSIONS_PRESET_OPTIONS}
                          rtl={rtl}
                          placeholderAr="اختر من القائمة..."
                          placeholderEn="Pick from presets..."
                          className="!py-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <input placeholder={rtl ? 'البُعد (ع)' : 'Dimension (Ar)'} value={variant.size_ar || ''} onChange={e => updateVariant(i, 'size_ar', e.target.value)} className="w-full bg-white dark:bg-black/40 p-3 h-12 rounded-xl border border-transparent focus:border-primary-500/50 outline-none text-xs font-bold" />
                      </div>
                      <div className="space-y-1">
                        <input placeholder={rtl ? 'البُعد (en)' : 'Dimension (En)'} value={variant.size_en || ''} onChange={e => updateVariant(i, 'size_en', e.target.value)} dir="ltr" className="w-full bg-white dark:bg-black/40 p-3 h-12 rounded-xl border border-transparent focus:border-primary-500/50 outline-none text-xs font-bold font-mono" />
                      </div>
                    </div>
                  </div>

                  {/* Pair 4: Prices */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-primary-500 mb-1 block tracking-widest">{rtl ? 'السعر' : 'PRICE'}</label>
                    <input value={variant.price} onChange={e => updateVariant(i, 'price', Number(e.target.value))} type="number" step="0.01" className="w-full bg-white dark:bg-[#111] p-3 h-12 rounded-xl border border-primary-500/20 outline-none text-xs font-black text-primary-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-500 mb-1 block tracking-widest">{rtl ? 'السعر القديم' : 'OLD PRICE'}</label>
                    <input value={variant.old_price} onChange={e => updateVariant(i, 'old_price', Number(e.target.value))} type="number" step="0.01" className="w-full bg-white dark:bg-[#111] p-3 h-12 rounded-xl border border-slate-200 dark:border-white/5 outline-none text-xs font-bold text-slate-500 line-through opacity-60" />
                  </div>

                  {/* Pair 5: Logistics */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-500 mb-1 block tracking-widest">SKU</label>
                    <input placeholder="SKU" value={variant.sku} onChange={e => updateVariant(i, 'sku', e.target.value)} dir="ltr" className="w-full bg-white dark:bg-black/40 p-3 h-12 rounded-xl border border-transparent focus:border-primary-500/50 outline-none text-xs font-black tracking-widest uppercase" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-500 mb-1 block tracking-widest">{rtl ? 'المخزون' : 'STOCK'}</label>
                    <input value={variant.stock} onChange={e => updateVariant(i, 'stock', Number(e.target.value))} type="number" className="w-full bg-white dark:bg-[#111] p-3 h-12 rounded-xl border border-slate-200 dark:border-white/5 outline-none text-xs font-black" />
                  </div>
                </div>

                {/* 3. Actions Column */}
                <div className="w-full lg:w-24 shrink-0 flex flex-row lg:flex-col justify-between items-center h-full lg:h-48 gap-4">
                  <div className="lg:mt-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none group/def">
                      <input type="checkbox" checked={variant.is_default} onChange={e => updateVariant(i, 'is_default', e.target.checked)} className="w-4 h-4 rounded text-primary-500 border-white/10 bg-black/50 focus:ring-0" />
                      <span className="text-[9px] font-black uppercase text-slate-500 group-hover/def:text-primary-500 transition-colors">{rtl ? 'أساسي' : 'DEFAULT'}</span>
                    </label>
                  </div>
                  <button onClick={() => removeVariant(i)} className="w-10 h-10 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {productType === 'simple' && (
        <div className="glass-card p-8">
          <h2 className="text-xl font-black mb-8 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
            {rtl ? 'تحديد الأبعاد' : 'Dimensional Specs'}
          </h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">{rtl ? 'قوائم جاهزة' : 'Dimension Presets'}</label>
              <PremiumDropdown value={dimensionsPreset} options={DIMENSIONS_PRESET_OPTIONS} rtl={rtl} onChange={handleDimensionsPresetChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">{rtl ? 'يدوي (ع)' : 'Manual (Ar)'}</label>
                <input value={formData.dimensions_ar} onChange={e => { handleDimensionsPresetChange(''); updateForm('dimensions_ar', e.target.value); }} className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-2xl outline-none border border-transparent focus:border-primary-500/50 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">{rtl ? 'Manual (En)' : 'Manual (En)'}</label>
                <input value={formData.dimensions_en} onChange={e => { handleDimensionsPresetChange(''); updateForm('dimensions_en', e.target.value); }} dir="ltr" className="w-full bg-slate-50 dark:bg-black/20 p-4 rounded-2xl outline-none border border-transparent focus:border-primary-500/50 font-mono font-bold" />
              </div>
            </div>
          </div>
        </div>
        )}

        <div className={`glass-card p-8 ${productType === 'variants' ? 'md:col-span-2' : ''}`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
            <h2 className="text-xl font-black">{rtl ? 'المواصفات التقنية' : 'Technical Specifications'}</h2>
            <button onClick={addSpec} className="btn-primary py-2 px-4 text-[10px] flex items-center gap-2 rounded-xl">
              <Plus size={14} /> {rtl ? 'إضافة خانة' : 'Add Property'}
            </button>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {specs.map((spec, i) => (
              <div key={i} className="grid grid-cols-2 gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 relative group">
                <input value={spec.key_ar} onChange={e => updateSpec(i, 'key_ar', e.target.value)} placeholder="الخاصية (ع)" className="bg-black/20 p-2 rounded-lg text-xs outline-none" />
                <input value={spec.val_ar} onChange={e => updateSpec(i, 'val_ar', e.target.value)} placeholder="القيمة (ع)" className="bg-black/20 p-2 rounded-lg text-xs outline-none" />
                <input value={spec.key_en} onChange={e => updateSpec(i, 'key_en', e.target.value)} placeholder="Key (En)" className="bg-black/20 p-2 rounded-lg text-xs outline-none font-mono" />
                <input value={spec.val_en} onChange={e => updateSpec(i, 'val_en', e.target.value)} placeholder="Value (En)" className="bg-black/20 p-2 rounded-lg text-xs outline-none font-mono" />
                <button onClick={() => removeSpec(i)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"><Plus size={14} className="rotate-45" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
