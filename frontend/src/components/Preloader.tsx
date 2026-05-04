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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-white via-white to-primary-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800"
        >
          {/* Background Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary-500/10 rounded-full blur-[100px] animate-pulse" />
             <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-primary-400/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative flex flex-col items-center">
            {loadingScreen.type === 'animation' ? (
              <div className="relative">
                {/* Rotating Rings */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                  className="w-28 h-28 rounded-full border-[3px] border-t-primary-500 border-r-transparent border-b-primary-500/30 border-l-transparent"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-3 rounded-full border-[3px] border-t-transparent border-r-primary-500/50 border-b-transparent border-l-primary-500/20"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-6 rounded-full border-2 border-t-primary-500/40 border-r-transparent border-b-transparent border-l-transparent"
                />

                {/* Logo/Icon Core */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {branding.logoUrl ? (
                    <img
                      src={resolveAssetUrl(branding.logoUrl)}
                      alt={branding.storeName}
                      className="w-14 h-14 object-contain drop-shadow-lg"
                    />
                  ) : (
                    <Package size={36} className="text-primary-500 drop-shadow-lg" />
                  )}
                </motion.div>

                {/* Pulsing Glow */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-primary-500/30 rounded-full blur-2xl -z-10"
                />
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                {loadingScreen.imageUrl ? (
                  <img
                    src={loadingScreen.imageUrl}
                    alt="Loading..."
                    className="max-w-[85vw] md:max-w-[500px] max-h-[70vh] object-contain drop-shadow-2xl"
                  />
                ) : (
                  <div className="p-10 glass-card border-2 border-primary-500/30 flex flex-col items-center gap-6 shadow-2xl shadow-primary-500/10">
                     <motion.div
                       animate={{ y: [0, -10, 0] }}
                       transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                     >
                       <Package size={56} className="text-primary-500" />
                     </motion.div>
                     <p className="text-xs font-black uppercase tracking-widest text-primary-500">{branding.storeName}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Loading Experience</p>
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
                className="mt-10 flex flex-col items-center"
              >
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                  {branding.storeName}
                </h2>
                <div className="flex items-center gap-2 w-48">
                   <div className="h-2 flex-1 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        className="h-full w-full bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500"
                      />
                   </div>
                </div>
                <motion.p 
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-xs font-bold text-primary-500 mt-4 uppercase tracking-[0.2em]"
                >
                  {rtl ? 'جارٍ التحميل...' : 'Please wait...'}
                </motion.p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
