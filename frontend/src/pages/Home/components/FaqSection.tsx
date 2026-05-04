import { useStore } from '../../../store/store';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FaqSection() {
  const { rtl, faqSettings } = useStore();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqSettings.enabled || !faqSettings.items?.length) return null;

  const faqs = faqSettings.items.slice(0, 5);

  return (
    <section className="w-full max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <div className="w-14 h-14 bg-primary-500/10 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <HelpCircle size={28} />
        </div>
        <h2 className="text-2xl md:text-3xl font-black mb-2">
          {rtl ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {rtl ? 'إجابات سريعة لأكثر الأسئلة شيوعاً' : 'Quick answers to common questions'}
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`glass-card overflow-hidden transition-all duration-300 border ${isOpen ? 'border-primary-500/50' : 'border-transparent'}`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full text-start p-4 flex justify-between items-center bg-transparent outline-none"
              >
                <span className="font-bold text-sm pr-4">
                  {rtl ? faq.qAr : faq.qEn}
                </span>
                <div className={`w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-primary-500/20 text-primary-500' : ''}`}>
                  <ChevronDown size={16} />
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-4 pb-4 text-slate-500 dark:text-slate-300 text-sm leading-relaxed border-t border-slate-100 dark:border-white/5 pt-3">
                      {rtl ? faq.aAr : faq.aEn}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-8">
        <Link to="/faq" className="text-primary-500 font-bold text-sm hover:underline">
          {rtl ? 'عرض جميع الأسئلة الشائعة →' : 'View all FAQ →'}
        </Link>
      </div>
    </section>
  );
}
