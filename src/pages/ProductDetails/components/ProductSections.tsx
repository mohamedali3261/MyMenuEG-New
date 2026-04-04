import { motion } from 'framer-motion';
import { useStore } from '../../../store/store';
import { FileText, Settings, Truck, Shield } from 'lucide-react';

interface ProductSectionsProps {
  description: string;
  specs: any[];
  shipping: string;
  warranty: string;
}

export default function ProductSections({ description, specs, shipping, warranty }: ProductSectionsProps) {
  const { rtl } = useStore();

  return (
    <div className="mt-12 space-y-10">
      
      {/* 1. Full Description */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        className="glass-card p-8 md:p-10 relative overflow-hidden group/section"
      >
        <div className="flex items-center gap-4 mb-6 border-b border-slate-200 dark:border-white/10 pb-6">
           <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-xl shadow-primary-500/30 group-hover/section:rotate-0 transition-transform duration-500">
              <FileText size={24} />
           </div>
           <div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-slate-900 dark:text-white">
                 {rtl ? 'تـفاصيل الـمنتج' : 'Product Details'}
              </h2>
           </div>
        </div>
        <div className="prose dark:prose-invert max-w-none prose-p:leading-relaxed text-lg">
           <p className="whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-300">
             {description}
           </p>
        </div>
      </motion.div>

      {/* 2. Technical Specs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        className="glass-card p-8 md:p-10 group/specs"
      >
        <div className="flex items-center gap-4 mb-6 border-b border-slate-200 dark:border-white/10 pb-6">
           <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white/10 flex items-center justify-center text-primary-500 group-hover/specs:bg-primary-500 group-hover/specs:text-white transition-all duration-500">
              <Settings size={24} />
           </div>
           <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-slate-900 dark:text-white">
              {rtl ? 'الـمواصفات الـفنية' : 'Technical Specs'}
           </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1">
          {specs.length > 0 ? specs.map((spec, i) => (
            <div 
              key={i} 
              className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-white/5 last:border-0 group/item"
            >
              <span className="font-black text-slate-400 uppercase tracking-widest text-[8px] group-hover/item:text-primary-500 transition-colors">{spec.key}</span>
              <span className="font-black text-slate-900 dark:text-white text-base tracking-tight bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg group-hover/item:bg-primary-500 group-hover/item:text-white transition-all">
                {spec.value}
              </span>
            </div>
          )) : (
            <div className="col-span-2 text-center text-slate-500 py-6 italic text-sm">
               {rtl ? 'لا توجد بيانات حالياً.' : 'Specs coming soon.'}
            </div>
          )}
        </div>
      </motion.div>

      {/* 3. Shipping & Warranty */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-8 flex flex-col h-full border-primary-500/10 group/ship"
        >
          <div className="flex items-center gap-4 mb-4 text-primary-500">
             <div className="p-3 bg-primary-500/10 rounded-xl group-hover/ship:bg-primary-500 group-hover/ship:text-white transition-all">
               <Truck size={20} />
             </div>
             <h3 className="text-lg font-black uppercase tracking-wider">{rtl ? 'الـشحن' : 'Shipping'}</h3>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
            {shipping || (rtl ? 'توصيل سريع خلال 48-72 ساعة عمل.' : 'Express shipping within 48-72 hours.')}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-8 flex flex-col h-full border-emerald-500/10 group/guarantee"
        >
          <div className="flex items-center gap-4 mb-4 text-emerald-500">
             <div className="p-3 bg-emerald-500/10 rounded-xl group-hover/guarantee:bg-emerald-500 group-hover/guarantee:text-white transition-all">
               <Shield size={20} />
             </div>
             <h3 className="text-lg font-black uppercase tracking-wider">{rtl ? 'الـضمان' : 'Warranty'}</h3>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
            {warranty || (rtl ? 'استبدال فوري خلال 14 يوماً من الاستلام.' : '14-day replacement guarantee.')}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
