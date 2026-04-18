import { useEffect, useState } from 'react';
import { useStore } from '../store/store';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

interface WhatsAppSettings {
  whatsapp_enabled?: string;
  whatsapp_phone?: string;
  whatsapp_message?: string;
}

export default function WhatsAppButton() {
  const { rtl, fetchSettings } = useStore();
  const [data, setData] = useState<WhatsAppSettings | null>(null);
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    fetchSettings()
      .then(settings => {
        if (settings && settings.whatsapp_enabled === 'true') {
          setData(settings as WhatsAppSettings);
        }
      })
      .catch(console.error);
    
    const timer = setTimeout(() => setShowTooltip(false), 8000);
    return () => clearTimeout(timer);
  }, [fetchSettings]);

  if (!data || !data.whatsapp_phone) return null;
  const whatsappPhone = data.whatsapp_phone;

  const handleOpen = () => {
    const url = `https://wa.me/${whatsappPhone.replace(/\+/g, '')}?text=${encodeURIComponent(data.whatsapp_message || '')}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-8 right-8 z-[60] flex flex-col items-end gap-3 rtl:left-8 rtl:right-auto rtl:items-start">
       <AnimatePresence>
         {showTooltip && (
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: 20 }}
             className="bg-white dark:bg-slate-800 shadow-2xl rounded-2xl p-4 border border-white/20 relative"
           >
              <button 
                onClick={() => setShowTooltip(false)} 
                className="absolute -top-3 -right-3 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-primary-500 transition-all shadow-md"
              >
                 <X size={12} />
              </button>
              <p className="text-sm font-bold pr-2">{rtl ? 'نتواجد هنا لمساعدتك!' : 'We are here to help!'}</p>
           </motion.div>
         )}
       </AnimatePresence>

       <motion.button
         whileHover={{ scale: 1.1 }}
         whileTap={{ scale: 0.9 }}
         initial={{ scale: 0 }}
         animate={{ scale: 1 }}
         onClick={handleOpen}
         className="w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(37,211,102,0.4)] relative group"
       >
          <MessageCircle size={32} />
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25 group-hover:hidden"></span>
       </motion.button>
    </div>
  );
}
