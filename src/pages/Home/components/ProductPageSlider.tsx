import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../store/store';
import { api } from '../../../api';
import { ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductPageSlider({ pageId }: { pageId?: string }) {
  const { rtl } = useStore();
  const [slides, setSlides] = useState<Array<{
    title_ar: string;
    title_en: string;
    subtitle_ar?: string;
    subtitle_en?: string;
    btn_link?: string;
    btn_text_ar?: string;
    btn_text_en?: string;
    image_url: string;
  }>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [intervalTime, setIntervalTime] = useState(4000); 

  const fetchSlides = useCallback(async () => {
    try {
      const url = pageId ? `/slides?page_id=${pageId}` : '/slides?page_id=home';
      const res = await api.get(url);
      setSlides(res.data);
      
      const settingsRes = await api.get('/settings');
      if (settingsRes.data.sliderInterval) {
        setIntervalTime(Number(settingsRes.data.sliderInterval) * 1000);
      }
    } catch (error) {
      console.error('Failed to fetch slides', error);
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slides.length);
    }, intervalTime);
    return () => clearInterval(interval);
  }, [slides, intervalTime]);

  const nextSlide = () => setCurrentIndex(prev => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length);

  if (loading) {
    return <div className="w-full h-[60vh] bg-slate-200 dark:bg-white/5 animate-pulse rounded-3xl"></div>;
  }

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  return (
    <section className="relative w-full min-h-[500px] h-[60vh] overflow-hidden group py-6 px-4 md:px-10">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-500/10 blur-[120px] -z-10 rounded-full animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent-500/10 blur-[100px] -z-10 rounded-full" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-full h-full glass-card border-white/10 dark:border-white/5 shadow-2xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white/40 via-white/10 to-transparent dark:from-white/5 dark:via-transparent dark:to-transparent"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full items-center p-8 md:p-16">
            
            {/* Left Content */}
            <div className="order-2 lg:order-1 space-y-6 md:space-y-8">
               <motion.div
                 initial={{ x: rtl ? 50 : -50, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 transition={{ delay: 0.2, duration: 0.6 }}
               >
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-500 text-[10px] font-black uppercase tracking-widest mb-4">
                    <Sparkles size={12} />
                    {rtl ? 'منتج مميز' : 'Featured Highlight'}
                 </div>
                 <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight tracking-tight uppercase">
                    {rtl ? currentSlide.title_ar : currentSlide.title_en}
                 </h2>
               </motion.div>

               <motion.p
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.4, duration: 0.6 }}
                 className="text-base md:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-lg leading-relaxed"
               >
                 {rtl ? currentSlide.subtitle_ar : currentSlide.subtitle_en}
               </motion.p>

               <motion.div
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 0.6, duration: 0.4 }}
               >
                  <Link 
                    to={currentSlide.btn_link || '/products'} 
                    className="btn-primary h-14 px-10 text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 w-fit shadow-xl shadow-primary-500/20 active:scale-95 transition-transform"
                  >
                    {rtl ? currentSlide.btn_text_ar : currentSlide.btn_text_en}
                    {rtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                  </Link>
               </motion.div>
            </div>

            {/* Right Image Showcase */}
            <div className="order-1 lg:order-2 flex items-center justify-center relative">
               <motion.div
                 initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
                 animate={{ scale: 1, opacity: 1, rotate: 0 }}
                 transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.3 }}
                 className="relative w-full max-w-[400px] aspect-square"
               >
                  {/* Glowing background behind image */}
                  <div className="absolute inset-4 bg-primary-500/20 blur-[60px] rounded-full animate-pulse shadow-2xl" />
                  
                  {/* The actual image floating */}
                  <motion.div
                    animate={{ y: [0, -15, 0], rotate: [0, 2, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="relative z-10 w-full h-full p-6 md:p-12 drop-shadow-[0_25px_25px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_25px_25px_rgba(0,0,0,0.4)]"
                  >
                    <img 
                      src={currentSlide.image_url.startsWith('/') ? '' + currentSlide.image_url : currentSlide.image_url} 
                      className="w-full h-full object-contain" 
                      alt="" 
                    />
                  </motion.div>
               </motion.div>
            </div>

          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      {slides.length > 1 && (
        <>
          <div className="absolute top-1/2 -translate-y-1/2 flex items-center justify-between w-full left-0 px-2 md:px-6 pointer-events-none">
            <button 
              onClick={prevSlide}
              className="pointer-events-auto w-10 h-10 md:w-12 md:h-12 rounded-full glass flex items-center justify-center text-slate-500 hover:text-primary-500 hover:scale-110 active:scale-90 transition-all border border-white/20"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={nextSlide}
              className="pointer-events-auto w-10 h-10 md:w-12 md:h-12 rounded-full glass flex items-center justify-center text-slate-500 hover:text-primary-500 hover:scale-110 active:scale-90 transition-all border border-white/20"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5 p-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full">
            {slides.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 transition-all duration-300 rounded-full ${currentIndex === i ? 'w-6 bg-primary-500' : 'w-1.5 bg-slate-400 hover:bg-white'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
