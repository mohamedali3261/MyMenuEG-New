import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../store/store';
import { FileText, Settings, Truck, Shield } from 'lucide-react';

interface ProductTabsProps {
  description: string;
  specs: Array<{ key?: string; value?: string }>;
  shipping: string;
  warranty: string;
}

export default function ProductTabs({ description, specs, shipping, warranty }: ProductTabsProps) {
  const { rtl } = useStore();
  const [activeTab, setActiveTab] = useState('desc');

  const tabs = [
    { id: 'desc', label: rtl ? 'الوصف كامل' : 'Full Description', icon: <FileText size={18} /> },
    { id: 'specs', label: rtl ? 'المواصفات التقنية' : 'Technical Specs', icon: <Settings size={18} /> },
    { id: 'shipping', label: rtl ? 'الشحن والضمان' : 'Shipping & Warranty', icon: <Truck size={18} /> }
  ];

  return (
    <div className="mt-16 glass-card rounded-[2.5rem] overflow-hidden border border-white/10">
      {/* Tab Headers */}
      <div className="flex border-b border-white/10 bg-white/5 overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-8 py-5 font-bold transition-all shrink-0 relative ${activeTab === tab.id ? 'text-primary-500 bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-8 md:p-12">
        <AnimatePresence mode="wait">
          {activeTab === 'desc' && (
            <motion.div
              key="desc"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="prose prose-invert max-w-none prose-p:text-slate-400 prose-p:leading-relaxed"
            >
              <p className="whitespace-pre-line">{description}</p>
            </motion.div>
          )}

          {activeTab === 'specs' && (
            <motion.div
              key="specs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {specs.length > 0 ? specs.map((spec, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-xs">{spec.key}</span>
                    <span className="font-medium text-white">{spec.value}</span>
                  </div>
                )) : (
                  <div className="col-span-2 text-center text-slate-500 py-12 italic">
                     {rtl ? 'لا توجد مواصفات فنية إضافية.' : 'No additional technical specs found.'}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'shipping' && (
            <motion.div
              key="shipping"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid md:grid-cols-2 gap-12"
            >
              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-primary-500 font-bold mb-4">
                    <Truck /> {rtl ? 'معلومات الشحن' : 'Shipping Information'}
                 </div>
                 <p className="text-slate-400 leading-relaxed bg-white/5 p-6 rounded-3xl border border-white/5">
                    {shipping || (rtl ? 'يتم الشحن خلال 2-4 أيام عمل في جميع المحافظات.' : 'Shipping takes 2-4 business days nationwide.')}
                 </p>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-green-500 font-bold mb-4">
                    <Shield /> {rtl ? 'الضمان والاسترجاع' : 'Warranty & Returns'}
                 </div>
                 <p className="text-slate-400 leading-relaxed bg-white/5 p-6 rounded-3xl border border-white/5">
                    {warranty || (rtl ? 'ضمان استبدال خلال 14 يوم من تاريخ الشراء في حال وجود عيوب صناعة.' : '14-day exchange warranty for manufacturing defects.')}
                 </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
