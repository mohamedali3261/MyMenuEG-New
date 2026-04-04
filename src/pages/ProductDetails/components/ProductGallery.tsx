import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const validImages = images ? images.filter(Boolean) : [];

  useEffect(() => {
    // Auto-scroll thumbnails into view when active changes
    if (scrollRef.current) {
      const activeElement = scrollRef.current.children[active] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [active]);

  // Framer Motion 120fps hardware-accelerated tracking values
  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(50);
  
  // Physics springs for flawless momentum
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  const transformOrigin = useMotionTemplate`${smoothX}% ${smoothY}%`;
  
  // Scale spring
  const scale = useSpring(1, springConfig);

  if (validImages.length === 0) {
    return (
      <div className="relative w-full aspect-square bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-[2.5rem] flex items-center justify-center p-8 text-slate-300 dark:text-white/10 overflow-hidden backdrop-blur-xl">
        <ShoppingBag className="w-48 h-48 opacity-20" strokeWidth={1} />
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 pointer-events-none" />
      </div>
    );
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActive((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
  }
  
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActive((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    scale.set(2.2); // Smoothly animate to zoom level
  };

  const handleMouseLeave = () => {
    scale.set(1); // Return to default scale
    // Gently glide focus back to center
    setTimeout(() => {
      mouseX.set(50);
      mouseY.set(50);
    }, 100);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Main Image View */}
      <div 
        className="relative group aspect-square bg-slate-100 dark:bg-[#111] border border-slate-200/50 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl cursor-crosshair"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={validImages[active].startsWith('http') ? validImages[active] : 'http://localhost:5000' + validImages[active]}
            alt="Product"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ 
              transformOrigin,
              scale
            }}
            className="w-full h-full object-cover ease-out"
          />
        </AnimatePresence>

        {/* Dynamic Vignette overlay for premium depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Navigation Controls */}
        {validImages.length > 1 && (
          <>
            <button
               onClick={handlePrev}
               className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 flex items-center justify-center text-slate-800 dark:text-white opacity-0 group-hover:opacity-100 hover:scale-110 transition-all duration-300 hover:bg-primary-500 hover:border-primary-500 hover:text-white shadow-xl -translate-x-4 group-hover:translate-x-0"
            >
               <ChevronLeft />
            </button>
            <button
               onClick={handleNext}
               className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 flex items-center justify-center text-slate-800 dark:text-white opacity-0 group-hover:opacity-100 hover:scale-110 transition-all duration-300 hover:bg-primary-500 hover:border-primary-500 hover:text-white shadow-xl translate-x-4 group-hover:translate-x-0"
            >
               <ChevronRight />
            </button>
          </>
        )}

        {/* Number Badge */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-6 left-6 flex items-center gap-2 z-10 pointer-events-none"
        >
           <div className="bg-white/80 dark:bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white/80 shadow-lg">
              {active + 1} / {validImages.length}
           </div>
        </motion.div>
      </div>

      {/* Thumbnails Row */}
      {validImages.length > 1 && (
        <div className="relative">
          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 pt-2 px-2 scrollbar-hide snap-x snap-mandatory"
          >
            {validImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden transition-all duration-300 snap-center ${
                  active === i 
                  ? 'border-2 border-primary-500 scale-105 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.05)] z-10' 
                  : 'border-2 border-transparent scale-95 opacity-60 hover:opacity-100 hover:scale-100 filter grayscale-[0.3]'
                }`}
              >
                {active === i && (
                  <div className="absolute inset-0 bg-primary-500/10 pointer-events-none mix-blend-overlay z-10" />
                )}
                <img 
                  src={img.startsWith('http') ? img : 'http://localhost:5000' + img} 
                  alt={`Thumbnail ${i + 1}`} 
                  className="w-full h-full object-cover rounded-[14px]" 
                />
              </button>
            ))}
          </div>
          
          {/* Fading Edge Indicators for Thumbnails */}
          <div className="absolute top-0 right-0 w-12 h-24 bg-gradient-to-l from-slate-50 dark:from-[#070707] to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 w-12 h-24 bg-gradient-to-r from-slate-50 dark:from-[#070707] to-transparent pointer-events-none" />
        </div>
      )}
    </div>
  );
}
