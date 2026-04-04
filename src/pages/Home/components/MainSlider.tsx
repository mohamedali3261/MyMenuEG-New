import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../store/store';
import { api } from '../../../api';
import { ChevronLeft, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MainSlider() {
  const { rtl } = useStore();
  const [slides, setSlides] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [intervalTime, setIntervalTime] = useState(3000); // Default 3s

  const fetchSlides = useCallback(async () => {
    try {
      const res = await api.get('/slides');
      setSlides(res.data);
      
      const settingsRes = await api.get('/settings');
      if (settingsRes.data.sliderInterval) {
        setIntervalTime(Number(settingsRes.data.sliderInterval) * 1000);
      }
    } catch (err) {
      console.error('Failed to fetch slides', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  // Auto-play logic
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
    return <div className="w-full h-[70vh] bg-slate-200 dark:bg-white/5 animate-pulse rounded-[3rem]"></div>;
  }

  // Fallback if no slides exist
  if (slides.length === 0) {
    return (
      <section className="relative w-full h-[70vh] flex items-center justify-center p-6">
        <div className="glass-card p-12 text-center max-w-2xl">
           <h1 className="text-4xl font-bold mb-4">{rtl ? 'أهلاً بك في MyMenu' : 'Welcome to MyMenu'}</h1>
           <p className="text-slate-500 mb-8">{rtl ? 'يرجى إضافة شرائح للسلايدر من لوحة الإدارة.' : 'Please add some slides from the admin dashboard.'}</p>
           <Link to="/products" className="btn-primary inline-flex items-center gap-2">
             {rtl ? 'تصفح المنتجات' : 'Browse Products'} <ArrowRight size={20} />
           </Link>
        </div>
      </section>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <section className="relative w-full h-[75vh] md:h-[85vh] overflow-hidden group px-4 md:px-10 py-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="relative w-full h-full rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl"
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
             <img 
               src={currentSlide.image_url.startsWith('/') ? 'http://localhost:5000' + currentSlide.image_url : currentSlide.image_url} 
               className="w-full h-full object-cover scale-105" 
               alt="" 
             />
             <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent dark:from-black/90 dark:via-black/50 rtl:bg-gradient-to-l"></div>
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex items-center px-10 md:px-24">
             <div className="max-w-3xl space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                   <span className="inline-block px-4 py-1.5 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-400 font-bold text-sm mb-4 uppercase tracking-widest">
                      {rtl ? 'خدمات تغليف متميزة' : 'Premium Packaging'}
                   </span>
                   <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
                     {rtl ? currentSlide.title_ar : currentSlide.title_en}
                   </h1>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-lg md:text-xl text-slate-200 max-w-xl leading-relaxed"
                >
                   {rtl ? currentSlide.subtitle_ar : currentSlide.subtitle_en}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                  className="pt-6"
                >
                   <Link 
                     to={currentSlide.btn_link || '/products'} 
                     className="btn-primary h-14 px-10 text-lg flex items-center gap-3 w-fit shadow-xl shadow-primary-500/20"
                   >
                     {rtl ? currentSlide.btn_text_ar : currentSlide.btn_text_en}
                     {rtl ? <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" /> : <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />}
                   </Link>
                </motion.div>
             </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-10 md:left-20 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-primary-500 hover:scale-110 z-20"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-10 md:right-20 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-primary-500 hover:scale-110 z-20"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Pagination dots */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-3 z-20">
         {slides.map((_, i) => (
           <button 
             key={i} 
             onClick={() => setCurrentIndex(i)}
             className={`h-1.5 transition-all duration-500 rounded-full ${currentIndex === i ? 'w-10 bg-primary-500' : 'w-2 bg-white/30 hover:bg-white/60'}`}
           />
         ))}
      </div>
    </section>
  )
}
