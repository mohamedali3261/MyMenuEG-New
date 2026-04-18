import { useEffect, useState } from 'react';
import { useStore } from '../store/store';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone } from 'lucide-react';

export default function PromotionStrip() {
  const { rtl, fetchSettings } = useStore();
  const [data, setData] = useState<Record<string, string> | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    fetchSettings()
      .then(settings => {
        if (settings && settings.promo_enabled === 'true') {
          setData(settings as Record<string, string>);
        }
      })
      .catch(console.error);
  }, [fetchSettings]);

  if (!data || !visible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative bg-gradient-to-r from-primary-600 to-accent-600 text-white z-[60]"
      >
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-center gap-3">
           <Megaphone size={16} className="animate-bounce" />
           <p className="text-sm font-bold text-center">
             {rtl ? data.promo_text_ar : data.promo_text_en}
           </p>
           <button onClick={() => setVisible(false)} className="absolute right-4 hover:bg-white/20 p-1 rounded-full transition rtl:left-4 rtl:right-auto">
             <X size={14} />
           </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
