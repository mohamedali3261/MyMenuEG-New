import { useStore } from '../../store/store';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FAQ() {
  const { rtl, branding, faqSettings } = useStore();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    document.title = `${rtl ? 'الأسئلة الشائعة' : 'FAQ'} | ${branding.storeName}`;
  }, [rtl, branding]);

  if (!faqSettings.enabled) {
    return null;
  }

  const faqs = faqSettings.items || [];


  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12 min-h-[80vh]">
      <div className="text-center mb-12">
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="w-20 h-20 bg-primary-500/10 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <HelpCircle size={40} />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          {rtl ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-lg hover:text-slate-700 transition-colors">
          {rtl 
            ? 'جمعنا لك إجابات لأكثر الأسئلة التي تصلنا لتوفير وقتك. إذا لم تجد إجابتك هنا، يسعدنا تواصلك معنا دائماً.' 
            : 'We\'ve compiled answers to our most common questions to save your time. If you can\'t find your answer, we are happy to talk.'}
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card overflow-hidden transition-all duration-300 border-2 ${isOpen ? 'border-primary-500' : 'border-transparent hover:border-white/10'}`}
            >
              <button 
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full text-start p-6 flex justify-between items-center bg-transparent outline-none focus:outline-none"
              >
                <span className="text-lg md:text-xl font-bold pr-4">
                  {rtl ? faq.qAr : faq.qEn}
                </span>
                <div className={`w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-primary-500/20 text-primary-500' : ''}`}>
                  <ChevronDown size={20} />
                </div>
              </button>
              
              <AnimatePresence>
                {isOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 pt-0 text-slate-500 dark:text-slate-300 text-lg leading-relaxed border-t border-slate-100 dark:border-white/5 mt-2 pt-4">
                      {rtl ? faq.aAr : faq.aEn}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-16 text-center glass-card p-10 flex flex-col items-center bg-gradient-to-br from-slate-100/50 to-white/50 dark:from-slate-900/50 dark:to-black/50"
      >
        <MessageCircle size={36} className="text-accent-500 mb-4" />
        <h3 className="text-2xl font-bold mb-3">{rtl ? 'لا تزال لديك أسئلة؟' : 'Still have questions?'}</h3>
        <p className="text-slate-500 mb-8">{rtl ? 'فريق الدعم الخاص بنا متواجد دائماً للإجابة على جميع استفساراتك بأسرع وقت.' : 'Our support team is always available to answer your questions ASAP.'}</p>
        <Link to="/contact" className="btn-primary px-8 py-4">
          {rtl ? 'تواصل معنا الآن' : 'Contact Us Now'}
        </Link>
      </motion.div>
    </div>
  );
}
