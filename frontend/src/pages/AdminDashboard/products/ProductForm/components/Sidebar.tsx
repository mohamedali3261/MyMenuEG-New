import { Info, Banknote, Image as ImageIcon, ClipboardList, Truck, HelpCircle } from 'lucide-react';
import type { ProductFormTab } from '../types';

interface Props {
  rtl: boolean;
  activeTab: ProductFormTab;
  setActiveTab: (tab: ProductFormTab | 'bundle') => void;
  productType: 'simple' | 'variants' | 'custom' | 'bundle';
}

export function Sidebar({ rtl, activeTab, setActiveTab, productType }: Props) {
  const sidebarTabs = [
    { id: 'basic', label: rtl ? 'البيانات الأساسية' : 'Basic Info', icon: <Info size={18} /> },
    { id: 'pricing', label: rtl ? 'التسعير والمخزون' : 'Pricing & Inventory', icon: <Banknote size={18} /> },
    { id: 'media', label: rtl ? 'الصور والميديا' : 'Media & Assets', icon: <ImageIcon size={18} /> },
    { id: 'specs', label: rtl ? 'المواصفات والتفاصيل' : 'Specs & Details', icon: <ClipboardList size={18} /> },
    { id: 'shipping', label: rtl ? 'الشحن والضمان' : 'Shipping & Warranty', icon: <Truck size={18} /> },
    { id: 'relations', label: rtl ? 'الأسئلة والروابط' : 'FAQ & Relationships', icon: <HelpCircle size={18} /> },
    { id: 'bundle', label: rtl ? 'محتويات الباقة' : 'Bundle Items', icon: <ClipboardList size={18} /> },
  ].filter(tab => {
    if (productType === 'variants' && (tab.id === 'pricing' || tab.id === 'media')) return false;
    if (productType === 'bundle' && (tab.id === 'pricing' || tab.id === 'media' || tab.id === 'specs')) return false;
    if (productType !== 'bundle' && tab.id === 'bundle') return false;
    return true;
  });

  return (
    <aside className="w-full md:w-fit flex md:flex-col overflow-x-auto md:overflow-x-visible no-scrollbar gap-2 md:gap-2 pb-4 md:pb-0 sticky top-0 md:relative z-50 bg-[#f8fafc]/80 dark:bg-[#050505]/80 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none">
      {sidebarTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as ProductFormTab)}
          className={`flex-shrink-0 flex items-center gap-3 p-4 md:p-5 rounded-2xl md:rounded-3xl transition-all duration-500 group relative overflow-hidden ${
            activeTab === tab.id 
              ? 'bg-primary-500 text-white shadow-xl md:shadow-2xl shadow-primary-500/40 translate-y-[-2px] md:translate-x-1 scale-[1.02]' 
              : 'bg-white dark:bg-white/5 md:bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {activeTab === tab.id && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
          )}
          <div className={`p-2 rounded-xl transition-all duration-500 ${
            activeTab === tab.id ? 'bg-white/20 rotate-[360deg]' : 'bg-slate-100 dark:bg-white/5 group-hover:bg-primary-500/10'
          }`}>
            {tab.icon}
          </div>
          <span className="font-black text-sm tracking-tight uppercase tracking-widest">{tab.label}</span>
          {activeTab === tab.id && (
            <div className={`absolute ${rtl ? 'left-4' : 'right-4'} w-1.5 h-1.5 bg-white rounded-full`} />
          )}
        </button>
      ))}
    </aside>
  );
}
