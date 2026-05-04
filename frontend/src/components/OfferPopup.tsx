import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Sparkles, Megaphone } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/store';

interface PopupConfig {
  enabled?: boolean | string;
  delaySeconds?: string;
  imageUrl?: string;
  titleAr?: string;
  titleEn?: string;
  descAr?: string;
  descEn?: string;
  actionLink?: string;
  actionTextAr?: string;
  actionTextEn?: string;
}

export default function OfferPopup() {
  const { rtl, fetchSettings } = useStore();
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [config, setConfig] = useState<PopupConfig | null>(null);

  useEffect(() => {
    // Check if we are in Test Mode via URL
    const params = new URLSearchParams(location.search);
    const isTestMode = params.get('test_popup') === 'true';

    if (isTestMode) {
      // Test mode active
    }

    // 1. Fetch Popup Config from Settings
    fetchSettings().then(settings => {
      if (!settings?.popup_settings) {
        return;
      }

      try {
        const parsed = JSON.parse(String(settings.popup_settings)) as PopupConfig;
        
        // 2. Logic Selection
        const isEnabled = parsed.enabled === true || parsed.enabled === 'true';
        
        if (!isEnabled && !isTestMode) {
          return;
        }

        setConfig(parsed);
        const delay = isTestMode ? 0.5 : (parseInt(String(parsed.delaySeconds ?? ''), 10) || 5);
        
        // 3. Trigger showing
        const timer = setTimeout(() => {
          setShow(true);
        }, delay * 1000);

        return () => clearTimeout(timer);
      } catch (e) {
        console.error('[POPUP] Parsing error', e);
      }
    }).catch(err => {
      console.error('[POPUP] API Fetch failed', err);
    });
  }, [fetchSettings, location.search]);

  return (
    <AnimatePresence>
      {show && config && (
        <div className={`fixed bottom-6 ${rtl ? 'left-6' : 'right-6'} z-[1000] w-[calc(100vw-3rem)] sm:w-[400px] pointer-events-none`}>
          {/* Floating Card Content */}
          <motion.div
            initial={{ opacity: 0, x: rtl ? -100 : 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: rtl ? -100 : 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 150 }}
            className="pointer-events-auto relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] border border-white/20 flex flex-col group"
          >
            {/* Close Button */}
            <button 
              onClick={() => setShow(false)}
              className="absolute top-3 right-3 z-30 p-1.5 bg-black/20 hover:bg-black/50 text-white rounded-full backdrop-blur-md transition-all active:scale-90"
            >
              <X size={16} />
            </button>

            {/* Top Banner (Optional Image) */}
            {config.imageUrl && (
              <div className="h-32 w-full relative overflow-hidden bg-slate-100 dark:bg-white/5">
                <img src={config.imageUrl} alt="Offer" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 to-transparent opacity-40" />
                
                {/* Badge Overlay */}
                <div className="absolute top-3 left-3">
                   <div className="bg-primary-500 text-white text-[8px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-white/10">
                      <Sparkles size={10} className="animate-pulse" />
                      {rtl ? 'عرض خاص' : 'SPECIAL OFFER'}
                   </div>
                </div>
              </div>
            )}

            {/* Info Section */}
            <div className="p-6 relative">
              <Megaphone size={60} className={`absolute -bottom-4 ${rtl ? '-left-4' : '-right-4'} text-primary-500/5 -rotate-12 pointer-events-none`} />
              
              <div className="mb-6">
                 <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
                    {rtl ? config.titleAr : config.titleEn}
                 </h2>
                 <p className="text-sm text-slate-500 dark:text-slate-400 font-bold line-clamp-3">
                    {rtl ? config.descAr : config.descEn}
                 </p>
              </div>

              <div className="flex flex-col gap-3">
                <Link 
                  to={config.actionLink || '/products'} 
                  onClick={() => setShow(false)}
                  className="btn-primary w-full h-12 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-primary-500/20 group relative overflow-hidden"
                >
                  <span className="text-sm font-black uppercase tracking-widest relative z-10">
                    {rtl ? config.actionTextAr : config.actionTextEn}
                  </span>
                  {rtl ? <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform relative z-10" /> : <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform relative z-10" />}
                </Link>
                
                <button 
                  onClick={() => setShow(false)}
                  className="text-xs font-bold text-slate-400 hover:text-primary-500 transition-colors py-1"
                >
                   {rtl ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>

            {/* Accent Pattern */}
            <div className="h-1 w-full bg-gradient-to-r from-primary-500 to-accent-500" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
