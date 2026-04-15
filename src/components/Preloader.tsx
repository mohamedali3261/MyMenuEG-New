import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/store';
import { Package } from 'lucide-react';
import { resolveAssetUrl } from '../utils/assetUrl';

export default function Preloader({ isLoading }: { isLoading: boolean }) {
  const { loadingScreen, branding, rtl } = useStore();

  if (!loadingScreen.enabled) return null;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, ease: "easeInOut" }
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
        >
          {/* Background Decorative Elements - Removed for pure white feel */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px]" />
          </div>

          <div className="relative flex flex-col items-center">
            {loadingScreen.type === 'animation' ? (
              <div className="relative">
                {/* Rotating Rings */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 rounded-full border-2 border-t-primary-500 border-r-transparent border-b-primary-500/20 border-l-transparent"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 rounded-full border-2 border-t-transparent border-r-primary-500/40 border-b-transparent border-l-primary-500/10"
                />

                {/* Logo/Icon Core */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {branding.logoUrl ? (
                    <img
                      src={resolveAssetUrl(branding.logoUrl)}
                      alt={branding.storeName}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <Package size={32} className="text-primary-500" />
                  )}
                </motion.div>

                {/* Pulsing Glow */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl -z-10"
                />
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative"
              >
                {loadingScreen.imageUrl ? (
                  <img
                    src={loadingScreen.imageUrl}
                    alt="Loading..."
                    className="max-w-[85vw] md:max-w-[500px] max-h-[70vh] object-contain"
                  />
                ) : (
                  <div className="p-8 glass-card border border-primary-500/20 flex flex-col items-center gap-4">
                     <Package size={48} className="text-primary-500 animate-bounce" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Experience</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Loading text with progress-like animation - Only show for 'animation' type */}
            {loadingScreen.type === 'animation' && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex flex-col items-center"
              >
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
                  {branding.storeName}
                </h2>
                <div className="flex items-center gap-2">
                   <div className="h-1 w-24 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="h-full w-full bg-gradient-to-r from-transparent via-primary-500 to-transparent"
                      />
                   </div>
                </div>
                <p className="text-[9px] font-bold text-slate-400 mt-3 uppercase tracking-[0.2em]">
                  {rtl ? 'جارٍ التحميل...' : 'Please wait...'}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
