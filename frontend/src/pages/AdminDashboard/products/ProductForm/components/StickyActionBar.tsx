import { Link } from 'react-router-dom';
import { Save, Loader2 } from 'lucide-react';
import type { ProductFormTab } from '../types';

interface Props {
  rtl: boolean;
  activeTab: ProductFormTab;
  loading: boolean;
  saveProduct: () => void;
  productType: 'simple' | 'variants' | 'custom' | 'bundle';
}

export function StickyActionBar({ rtl, activeTab, loading, saveProduct, productType }: Props) {
  const sectionLabels: Record<ProductFormTab, string> = {
    basic: rtl ? 'البيانات الأساسية' : 'Basic Info',
    pricing: rtl ? 'التسعير والمخزون' : 'Pricing & Inventory',
    media: rtl ? 'الصور والميديا' : 'Media & Assets',
    specs: rtl ? 'المواصفات والتفاصيل' : 'Specs & Details',
    shipping: rtl ? 'الشحن والضمان' : 'Shipping & Warranty',
    relations: rtl ? 'الأسئلة والروابط' : 'FAQ & Relationships',
    bundle: rtl ? 'محتويات الباقة' : 'Bundle Items'
  };

  return (
    <div className="flex items-center gap-4 md:gap-8">
      <div className="hidden lg:flex items-center gap-4 border-r border-slate-200 dark:border-white/10 pr-8">
        <div className="w-10 h-10 bg-primary-500/10 text-primary-500 rounded-xl flex items-center justify-center font-black text-xs uppercase">
          {activeTab[0]}
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{rtl ? 'القسم الحالي' : 'Active Section'}</p>
          <p className="font-black text-xs text-slate-900 dark:text-white leading-none">
            {sectionLabels[activeTab]}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Link to="/admin/products" className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-black uppercase tracking-widest px-4 transition-colors">{rtl ? 'إلغاء' : 'Discard'}</Link>
        <button 
          onClick={saveProduct} 
          disabled={loading} 
          className={`py-2.5 px-6 md:px-10 flex items-center justify-center gap-2 font-black text-xs shadow-lg transition-all rounded-full text-white ${
            productType === 'simple' 
              ? 'bg-slate-900 shadow-black/20 hover:bg-black' 
              : 'bg-primary-500 shadow-primary-500/20 hover:bg-primary-600'
          }`}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {productType === 'simple' 
            ? (rtl ? 'حفظ المنتج' : 'Save Product')
            : productType === 'custom'
              ? (rtl ? 'حفظ التخصيص' : 'Save Custom')
              : productType === 'bundle'
                ? (rtl ? 'حفظ الباقة' : 'Save Bundle')
                : (rtl ? 'حفظ النسخ' : 'Save Variants')}
        </button>
      </div>
    </div>
  );
}
