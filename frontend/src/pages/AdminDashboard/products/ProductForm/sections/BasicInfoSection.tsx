import { Zap } from 'lucide-react';
import PremiumDropdown from '../../../../../components/ui/PremiumDropdown';
import { PRODUCT_TEMPLATE_OPTIONS } from '../../productTemplates';
import type { FormData, OptionItem } from '../types';

interface Props {
  rtl: boolean;
  formData: FormData;
  updateForm: (key: keyof FormData, val: any) => void;
  templateKey: string;
  applyTemplate: (key: string) => void;
  categories: OptionItem[];
  pages: OptionItem[];
}

export function BasicInfoSection({ rtl, formData, updateForm, templateKey, applyTemplate, categories, pages }: Props) {
  const templateOptions = [
    { value: '', labelAr: '-- بدون قالب --', labelEn: '-- No template --' },
    ...PRODUCT_TEMPLATE_OPTIONS
  ];

  const categoryOptions = [
    { value: '', labelAr: '-- بدون تصنيف --', labelEn: '-- Uncategorized --' },
    ...categories.map(c => ({ value: c.id, labelAr: c.name_ar, labelEn: c.name_en }))
  ];

  const pageOptions = [
    { value: '', labelAr: '-- الصفحة العامة --', labelEn: '-- General Products --' },
    ...pages.map(p => ({ value: p.id, labelAr: p.name_ar, labelEn: p.name_en }))
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card p-8 border-s-4 border-primary-500">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary-500/10 text-primary-500 rounded-2xl"><Zap size={24} /></div>
          <div>
            <h2 className="text-xl font-black">{rtl ? 'قالب التعبئة السريعة' : 'Quick Template'}</h2>
            <p className="text-xs text-slate-500">{rtl ? 'اختر قالب معد مسبقاً لتوفير الوقت' : 'Select a preset template to save time'}</p>
          </div>
        </div>
        <PremiumDropdown value={templateKey} options={templateOptions} rtl={rtl} onChange={applyTemplate} />
      </div>

      <div className="glass-card p-8 group">
        <h2 className="text-xl font-black mb-8 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
          {rtl ? 'الاسم والوصف' : 'Identity & Description'}
        </h2>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{rtl ? 'الاسم (عربي)' : 'Product Name (Ar)'}</label>
            <input value={formData.name_ar} onChange={e => updateForm('name_ar', e.target.value)} type="text" className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{rtl ? 'الاسم (إنجليزي)' : 'Product Name (En)'}</label>
            <input value={formData.name_en} onChange={e => updateForm('name_en', e.target.value)} type="text" dir="ltr" className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-bold font-mono" />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{rtl ? 'الوصف (عربي)' : 'Rich Description (Ar)'}</label>
            <textarea value={formData.description_ar} onChange={e => updateForm('description_ar', e.target.value)} rows={6} className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none resize-none" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{rtl ? 'الوصف (إنجليزي)' : 'Rich Description (En)'}</label>
            <textarea value={formData.description_en} onChange={e => updateForm('description_en', e.target.value)} dir="ltr" rows={6} className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none resize-none" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{rtl ? 'التصنيف الرئيسي' : 'Main Category'}</label>
          <PremiumDropdown value={formData.category_id} options={categoryOptions} rtl={rtl} onChange={(v) => updateForm('category_id', v)} />
        </div>
        <div className="glass-card p-6 space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{rtl ? 'الصفحة المستهدفة' : 'Target Store Page'}</label>
          <PremiumDropdown value={formData.page_id} options={pageOptions} rtl={rtl} onChange={(v) => updateForm('page_id', v)} />
        </div>
      </div>
    </div>
  );
}
