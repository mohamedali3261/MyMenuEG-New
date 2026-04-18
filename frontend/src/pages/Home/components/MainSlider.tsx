import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useStore } from '../../../store/store';
import { api } from '../../../api';
import { ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SlideItem {
  id: string;
  image_url?: string;
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  btn_text_ar: string;
  btn_text_en: string;
  btn_link?: string;
}

export default function MainSlider({ pageId }: { pageId?: string }) {
  const { rtl, fetchSettings } = useStore();
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(true);
  const [intervalTime, setIntervalTime] = useState(3000);
  const containerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Parallax effect for the container
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  const fetchSlides = useCallback(async () => {
    try {
      const url = pageId ? `/slides?page_id=${pageId}` : '/slides?page_id=home';
      const [res, settings] = await Promise.all([
        api.get(url),
        fetchSettings(),
      ]);
      setSlides((res.data ?? []) as SlideItem[]);

      if (settings?.sliderInterval) {
        setIntervalTime(Number(settings.sliderInterval) * 1000);
      }
    } catch (err) {
      console.error('Failed to fetch slides', err);
    } finally {
      setLoading(false);
    }
  }, [fetchSettings, pageId]);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex(prev => (prev + 1) % slides.length);
    }, intervalTime);
    return () => clearInterval(interval);
  }, [slides, intervalTime]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length);
  };

  if (loading) {
    return (
      <div className="w-full h-screen">
        <div className="w-full h-full bg-slate-200 dark:bg-white/5 animate-pulse"></div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <section className="relative w-full h-screen flex items-center justify-center p-6 bg-slate-100 dark:bg-slate-900 overflow-hidden">
        {/* Abstract Blobs for Empty State */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/20 blur-[120px] rounded-full" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="glass-card p-12 text-center max-w-2xl relative z-10 border-white/20 shadow-4xl"
        >
           <div className="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="text-primary-500" size={40} />
           </div>
           <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">
             {rtl ? 'أهلاً بك في عالم التغليف' : 'Welcome to the World of Packaging'}
           </h1>
           <p className="text-slate-500 dark:text-slate-400 mb-8 font-bold">
             {rtl ? 'يرجى إضافة شرائح للسلايدر من لوحة الإدارة لتبدأ عرض منتجاتك بشكل احترافي.' : 'Please add some slides from the admin dashboard to start showcasing your products professionally.'}
           </p>
           <Link to="/products" className="btn-primary h-14 px-10 text-lg flex items-center gap-3 w-fit mx-auto shadow-2xl shadow-primary-500/30">
             {rtl ? 'تصفح منتجاتنا' : 'Browse Our Products'} <ArrowRight size={22} className={rtl ? 'rotate-180' : ''} />
           </Link>
        </motion.div>
      </section>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <section ref={containerRef} className="relative w-full h-screen overflow-hidden group bg-slate-950 transition-colors duration-500">
      
      {/* Dynamic Background Blobs */}
      <motion.div
        animate={prefersReducedMotion ? undefined : {
          x: [0, 50, -50, 0],
          y: [0, -50, 50, 0],
          scale: [1, 1.1, 1]
        }}
        transition={prefersReducedMotion ? undefined : { duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-primary-500/10 blur-[120px] rounded-full pointer-events-none" 
      />
      <motion.div
        animate={prefersReducedMotion ? undefined : {
          x: [0, -60, 60, 0],
          y: [0, 60, -60, 0],
          scale: [1, 1.2, 1]
        }}
        transition={prefersReducedMotion ? undefined : { duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-accent-500/10 blur-[130px] rounded-full pointer-events-none" 
      />

      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={currentIndex}
          style={{ y }}
          initial={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 1.02 }
          }
          animate={
            prefersReducedMotion
              ? { opacity: 1 }
              : { opacity: 1, scale: 1 }
          }
          exit={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.995 }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0.25 }
              : { duration: 0.95, ease: [0.22, 0.61, 0.36, 1] }
          }
          className="absolute inset-0 w-full h-full overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] bg-slate-900"
        >
          {/* Parallax Background Image */}
          <motion.div 
             initial={prefersReducedMotion ? { scale: 1 } : { scale: 1.03 }}
             animate={
               prefersReducedMotion
                 ? { scale: 1 }
                 : { scale: [1.03, 1.08, 1.03], x: [0, -8, 0], y: [0, 6, 0] }
             }
             transition={
               prefersReducedMotion
                 ? { duration: 0.2 }
                 : { duration: Math.max(9, Math.floor(intervalTime / 1000) + 1), ease: 'easeInOut', repeat: Infinity }
             }
             className="absolute inset-0"
          >
            {currentSlide.image_url && (
              <img 
                src={currentSlide.image_url.startsWith('/') ? '' + currentSlide.image_url : currentSlide.image_url} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                alt="" 
              />
            )}
             {/* Rich Gradient Overlays */}
             <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent dark:from-black/95 dark:via-black/50 rtl:bg-gradient-to-l"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          </motion.div>

          {/* Master Content */}
          <div className="absolute inset-0 flex items-center px-8 md:px-32">
             <div className="max-w-4xl space-y-8 relative z-10">
                <motion.div
                  initial={{ opacity: 0, x: rtl ? 32 : -32 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.7, ease: 'easeOut' }}
                  className="space-y-4"
                >
                   <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 text-primary-400 font-black text-xs md:text-sm uppercase tracking-[0.3em] shadow-2xl">
                      <Sparkles size={16} className="animate-pulse" />
                      {rtl ? 'تغليف يصنع الفارق' : 'Packaging that matters'}
                   </div>
                   
                   <h1 className="text-5xl md:text-8xl font-black text-white leading-[1] md:leading-[1.1] tracking-tighter drop-shadow-2xl">
                     {rtl ? currentSlide.title_ar : currentSlide.title_en}
                   </h1>
                </motion.div>

                <motion.p
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.25, duration: 0.7, ease: 'easeOut' }}
                   className="text-lg md:text-2xl text-slate-300 max-w-2xl leading-relaxed font-bold border-l-4 border-primary-500 pl-6 rtl:border-l-0 rtl:border-r-4 rtl:pr-6"
                >
                   {rtl ? currentSlide.subtitle_ar : currentSlide.subtitle_en}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.35, duration: 0.65, ease: 'easeOut' }}
                   className="flex flex-wrap items-center gap-6 pt-6"
                >
                   <Link 
                     to={currentSlide.btn_link || '/products'} 
                     className="btn-primary h-20 px-14 text-xl flex items-center gap-4 w-fit shadow-[0_20px_40px_rgba(235,94,40,0.4)] rounded-[1.5rem] relative group/btn"
                   >
                     {/* Inner shine effect */}
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                     
                     <span className="font-black uppercase tracking-widest">{rtl ? currentSlide.btn_text_ar : currentSlide.btn_text_en}</span>
                     {rtl ? (
                       <ArrowLeft size={28} className="group-hover:-translate-x-2 transition-transform duration-300" />
                     ) : (
                       <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform duration-300" />
                     )}
                   </Link>
                </motion.div>
             </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Bar (Visual) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[min(160px,56vw)] flex gap-1.5 z-30">
         {slides.map((_, i) => (
           <button 
             key={i}
             onClick={() => {
               setDirection(i > currentIndex ? 1 : -1);
               setCurrentIndex(i);
             }}
             className={`h-1 transition-all duration-700 rounded-full ${currentIndex === i ? 'flex-[2.5] bg-primary-500 shadow-[0_0_10px_#eb5e28]' : 'flex-1 bg-white/15 hover:bg-white/35'}`}
           />
         ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={rtl ? nextSlide : prevSlide}
            aria-label={rtl ? 'السابق' : 'Previous slide'}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white flex items-center justify-center transition-all duration-300"
          >
            {rtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <button
            onClick={rtl ? prevSlide : nextSlide}
            aria-label={rtl ? 'التالي' : 'Next slide'}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white flex items-center justify-center transition-all duration-300"
          >
            {rtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </>
      )}
    </section>
  )
}
