import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../store/store';
import { FileText, Settings, Truck, ShieldCheck, ChevronDown, HelpCircle, Info } from 'lucide-react';

interface ProductSectionsProps {
  description: string;
  specs: Array<{ key?: string; value?: string }>;
  shipping: string;
  warranty: string;
  extraDetails?: Array<{ label_ar?: string; label_en?: string; value_ar?: string; value_en?: string }>;
  faqs?: Array<{ question_ar?: string; question_en?: string; answer_ar?: string; answer_en?: string }>;
}

export default function ProductSections({ description, specs, shipping, warranty, extraDetails = [], faqs = [] }: ProductSectionsProps) {
  const { rtl } = useStore();

  return (
    <div className="mt-10 space-y-7">
      
      {/* 1. Full Description */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        className="glass-card p-6 md:p-7 relative overflow-hidden group/section"
      >
        <div className="flex items-center gap-3 mb-5 border-b border-slate-200 dark:border-white/10 pb-4">
           <div className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-300 group-hover/section:text-primary-500 transition-all">
              <FileText size={18} />
           </div>
           <div>
              <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-slate-900 dark:text-white">
                 {rtl ? 'تـفاصيل الـمنتج' : 'Product Details'}
              </h2>
           </div>
        </div>
        <div className="prose dark:prose-invert max-w-none prose-p:leading-relaxed text-base">
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
        className="glass-card p-6 md:p-7 group/specs"
      >
        <div className="flex items-center gap-3 mb-5 border-b border-slate-200 dark:border-white/10 pb-4">
           <div className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-300 group-hover/specs:text-primary-500 transition-all">
              <Settings size={18} />
           </div>
           <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-slate-900 dark:text-white">
              {rtl ? 'الـمواصفات الـفنية' : 'Technical Specs'}
           </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-7 gap-y-1">
          {specs.length > 0 ? specs.map((spec, i) => (
            <div 
              key={i} 
              className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5 last:border-0 group/item"
            >
              <span className="font-black text-slate-400 uppercase tracking-widest text-[8px] group-hover/item:text-primary-500 transition-colors">{spec.key}</span>
              <span className="font-black text-slate-900 dark:text-white text-sm tracking-tight bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg group-hover/item:bg-primary-500 group-hover/item:text-white transition-all">
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
      <div className="grid md:grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-6 flex flex-col h-full border-primary-500/10 group/ship"
        >
          <div className="flex items-center gap-3 mb-3">
             <div className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-300 group-hover/ship:text-primary-500 transition-all">
               <Truck size={18} />
             </div>
             <h3 className="text-base font-black uppercase tracking-wider text-slate-900 dark:text-white">{rtl ? 'الـشحن' : 'Shipping'}</h3>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
            {shipping || (rtl ? 'توصيل سريع خلال 48-72 ساعة عمل.' : 'Express shipping within 48-72 hours.')}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-6 flex flex-col h-full border-emerald-500/10 group/guarantee"
        >
          <div className="flex items-center gap-3 mb-3">
             <div className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-300 group-hover/guarantee:text-emerald-500 transition-all">
               <ShieldCheck size={18} />
             </div>
             <h3 className="text-base font-black uppercase tracking-wider text-slate-900 dark:text-white">{rtl ? 'الـضمان' : 'Warranty'}</h3>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
            {warranty || (rtl ? 'استبدال فوري خلال 14 يوماً من الاستلام.' : '14-day replacement guarantee.')}
          </p>
        </motion.div>
      </div>

      {extraDetails.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="glass-card p-6 md:p-7"
        >
          <div className="flex items-center gap-3 mb-5 border-b border-slate-200 dark:border-white/10 pb-4">
            <div className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-300 hover:text-primary-500 transition-all">
               <Info size={18} />
            </div>
            <h3 className="text-lg md:text-xl font-black uppercase tracking-wider text-slate-900 dark:text-white">
              {rtl ? 'تفاصيل إضافية' : 'Additional Details'}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {extraDetails.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 dark:border-white/10 p-3 bg-slate-50 dark:bg-white/5">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">{rtl ? (item.label_ar || item.label_en) : (item.label_en || item.label_ar)}</p>
                <p className="font-bold text-slate-900 dark:text-white">{rtl ? (item.value_ar || item.value_en) : (item.value_en || item.value_ar)}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 5. FAQ Accordion */}
      {faqs && faqs.length > 0 && (
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-50px" }}
           className="glass-card p-6 md:p-7"
        >
          <div className="flex items-center gap-3 mb-5 border-b border-slate-200 dark:border-white/10 pb-4">
             <div className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-300 hover:text-indigo-500 transition-all">
                <HelpCircle size={18} />
             </div>
             <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-slate-900 dark:text-white">
                {rtl ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
             </h2>
          </div>
          <div className="space-y-3">
             {faqs.map((faq, idx) => (
                <FAQItem 
                   key={idx} 
                   question={rtl ? (faq.question_ar || faq.question_en || '') : (faq.question_en || faq.question_ar || '')} 
                   answer={rtl ? (faq.answer_ar || faq.answer_en || '') : (faq.answer_en || faq.answer_ar || '')} 
                />
             ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/5 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full text-left px-5 py-4 flex items-center justify-between focus:outline-none"
      >
        <span className="font-bold text-slate-900 dark:text-white text-sm pr-4">{question}</span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-primary-500' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl whitespace-pre-line border-t border-slate-100 dark:border-white/5 pt-3">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
