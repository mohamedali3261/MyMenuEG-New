import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, Heart, ShoppingBag, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../../store/store';

const ManualImageGallery = ({ images, imageUrl, imgAnimClass }: any) => {
  const [index, setIndex] = useState(0);
  
  let allImages = [];
  if (images && images.length > 0) {
    allImages = images;
  } else if (imageUrl) {
    allImages = [imageUrl];
  }

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  if (allImages.length === 0) {
    return <ShoppingBag className="w-full h-full p-6 opacity-20 text-slate-400" strokeWidth={1} />;
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-100 dark:bg-white/5 group/gallery">
       <div className={`w-full h-full transition-transform duration-700 ease-out ${imgAnimClass}`}>
         <AnimatePresence mode="popLayout">
           <motion.img 
             key={index}
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 0.3 }}
             src={allImages[index].startsWith('http') ? allImages[index] : 'http://localhost:5000' + allImages[index]} 
             className="absolute inset-0 w-full h-full object-cover" 
             alt="Product Image" 
           />
         </AnimatePresence>
       </div>
       
       {allImages.length > 1 && (
         <>
           <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-20">
             <button onClick={prevImage} className="pointer-events-auto p-1.5 rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-md text-slate-800 dark:text-white hover:bg-white dark:hover:bg-black shadow-md transition-all active:scale-95">
               <ChevronLeft size={18} />
             </button>
             <button onClick={nextImage} className="pointer-events-auto p-1.5 rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-md text-slate-800 dark:text-white hover:bg-white dark:hover:bg-black shadow-md transition-all active:scale-95">
               <ChevronRight size={18} />
             </button>
           </div>
           
           {/* Small Dot Indicators */}
           <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
             {allImages.map((_: any, i: number) => (
               <div 
                 key={i} 
                 className={`h-1.5 rounded-full backdrop-blur-sm transition-all duration-300 shadow-sm ${i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/50 border border-white/20'}`} 
               />
             ))}
           </div>
         </>
       )}
    </div>
  );
};


// Helper hooks
const useCardAnimations = () => {
    const { cardHoverAnimation } = useStore();
    return {
        cardAnimClass: cardHoverAnimation === 'lift' ? 'hover:-translate-y-2' : cardHoverAnimation === 'glow' ? 'hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] hover:border-primary-500/50' : '',
        imgAnimClass: cardHoverAnimation === 'zoom' ? 'group-hover:scale-110' : ''
    };
};

export const ClassicElegantCard = ({ prod, rtl, onAdd }: any) => {
  const { cardAnimClass, imgAnimClass } = useCardAnimations();
  const { toggleWishlist, wishlist } = useStore();
  const isFavorite = wishlist.some(p => p.id === prod.id);

  return (
    <div 
      className={`group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all duration-300 h-full ${cardAnimClass}`}
    >
      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden">
        {prod.is_best_seller === 1 && (
          <div className="absolute top-3 left-3 z-30 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm uppercase tracking-wider">
            {rtl ? 'الأكثر مبيعاً' : 'Best Seller'}
          </div>
        )}
        <div className="absolute top-3 right-3 z-30 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
           <button 
             onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(prod); }}
             className={`p-2 rounded-full shadow-md backdrop-blur-sm transition-all active:scale-75 ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 dark:bg-slate-800 text-slate-400 hover:text-red-500'}`}
           >
             <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
           </button>
           <Link to={`/products/${prod.id}`} className="p-2 bg-white/90 dark:bg-slate-800 text-slate-400 hover:text-primary-500 rounded-full shadow-md backdrop-blur-sm flex items-center justify-center transition-all"><Eye size={16} /></Link>
        </div>
        <Link to={`/products/${prod.id}`} className="block w-full h-full relative z-0">
          <ManualImageGallery images={prod.images} imageUrl={prod.image_url} imgAnimClass={imgAnimClass} />
        </Link>
      </div>

      <div className="flex flex-col flex-grow p-5 justify-between">
        <Link to={`/products/${prod.id}`} className="block mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 hover:text-primary-600 transition-colors line-clamp-2 mb-2">
            {rtl ? prod.name_ar : prod.name_en}
          </h3>
          <div className="flex items-center gap-1 text-amber-400">
            <Star size={14} className="fill-current" />
            <span className="text-xs text-slate-500 ml-1 font-medium">{prod.rating || 4.5}</span>
          </div>
        </Link>

        <div className="flex flex-col pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              EGP {prod.price.toFixed(2)}
            </span>
            {prod.old_price > prod.price && (
              <span className="text-xs text-slate-400 line-through">
                {prod.old_price.toFixed(2)}
              </span>
            )}
          </div>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd?.(e); }} 
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium hover:bg-primary-600 dark:hover:bg-primary-500 hover:text-white transition-colors active:scale-95 mt-2"
          >
            <ShoppingCart size={16} /> 
            <span className="text-sm font-bold uppercase tracking-wide">{rtl ? 'إضافة للسلة' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};


export const Floating3DCard = ({ prod, rtl, onAdd }: any) => {
  const { cardAnimClass, imgAnimClass } = useCardAnimations();
  const { toggleWishlist, wishlist } = useStore();
  const isFavorite = wishlist.some(p => p.id === prod.id);

  return (
    <div 
      className={`group flex flex-col items-center p-4 bg-gradient-to-b from-white/60 to-white/30 dark:from-white/10 dark:to-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/20 rounded-[2rem] shadow-2xl relative h-full transition-all duration-300 ${cardAnimClass}`}
    >
      {prod.is_best_seller === 1 && (
        <div className="absolute top-6 left-6 z-30 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-primary-500/30 -rotate-12 pointer-events-none">
          {rtl ? 'الأكثر مبيعاً' : 'Best Seller'}
        </div>
      )}
      <div className="absolute top-6 right-6 z-20 flex flex-col gap-2 md:opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(prod); }}
          className={`p-2 rounded-full backdrop-blur-md shadow-lg flex items-center justify-center transition-all active:scale-75 ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 dark:bg-black/40 text-slate-500 hover:text-red-500'}`}
        >
          <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
        </button>
        <Link to={`/products/${prod.id}`} className="p-2 text-slate-500 dark:text-slate-400 hover:text-primary-500 bg-white/90 dark:bg-black/40 rounded-full backdrop-blur-md shadow-lg flex items-center justify-center transition-all"><Eye size={20} /></Link>
      </div>

      <Link to={`/products/${prod.id}`} className="block w-full aspect-square mb-6 rounded-[1.5rem] shadow-inner bg-white/10 p-1 flex-shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="w-full h-full rounded-[1.25rem] relative z-10 bg-slate-50 dark:bg-[#111] overflow-hidden">
          <ManualImageGallery images={prod.images} imageUrl={prod.image_url} imgAnimClass={imgAnimClass} />
        </div>
      </Link>

      <div className="text-center w-full flex flex-col flex-grow z-10">
        <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white line-clamp-2 my-auto">{rtl ? prod.name_ar : prod.name_en}</h3>
        <div className="flex items-center justify-between bg-white/50 dark:bg-black/30 p-1.5 pl-4 rounded-full border border-slate-200 dark:border-white/20 mt-auto relative">
          <div className="flex flex-col">
            {prod.old_price > prod.price && (
              <span className="text-[9px] text-rose-500 font-bold line-through absolute -top-4 left-4">
                EGP {prod.old_price}
              </span>
            )}
            <span className="font-extrabold text-lg text-slate-900 dark:text-white">EGP {prod.price.toFixed(2)}</span>
          </div>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd?.(e); }} className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full hover:scale-110 shadow-lg transition-transform active:scale-95"><ShoppingCart size={18} /></button>
        </div>
      </div>
    </div>
  );
};


export const MinimalPosterCard = ({ prod, rtl, onAdd }: any) => {
  const { cardAnimClass, imgAnimClass } = useCardAnimations();
  const { toggleWishlist, wishlist } = useStore();
  const isFavorite = wishlist.some(p => p.id === prod.id);

  return (
    <div 
      className={`group relative w-full h-[400px] rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-lg transition-all duration-300 overflow-hidden ${cardAnimClass}`}
    >
      <Link to={`/products/${prod.id}`} className="absolute inset-0 bg-slate-50 dark:bg-[#0a0a0a] z-0 overflow-hidden">
        <ManualImageGallery images={prod.images} imageUrl={prod.image_url} imgAnimClass={imgAnimClass} />
      </Link>

      {prod.is_best_seller === 1 && (
        <div className="absolute top-6 left-6 z-30 bg-accent-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-xl pointer-events-none">
          {rtl ? 'الأكثر مبيعاً' : 'Best Seller'}
        </div>
      )}

      {/* Heart Button for Minimal Style */}
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(prod); }}
        className={`absolute top-6 right-6 z-30 p-3 rounded-2xl backdrop-blur-md shadow-xl transition-all active:scale-75 ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/40'}`}
      >
        <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
      </button>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-2 pointer-events-none transition-transform duration-300 translate-y-4 group-hover:translate-y-0 z-20">
        <span className="text-primary-400 font-bold text-[10px] tracking-widest uppercase drop-shadow-sm opacity-0 group-hover:opacity-100 transition-opacity delay-100">
          {rtl ? 'تصفح التفاصيل' : 'View Details'}
        </span>
        <h3 className="text-2xl font-bold text-white mb-2 leading-tight drop-shadow-md line-clamp-2">{rtl ? prod.name_ar : prod.name_en}</h3>
        
        <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 pointer-events-auto">
          <div className="flex flex-col">
            {prod.old_price > prod.price && (
              <span className="text-sm text-white/50 line-through font-medium">EGP {prod.old_price}</span>
            )}
            <span className="text-xl font-black text-white">EGP {prod.price.toFixed(2)}</span>
          </div>
          <div className="flex gap-2">
            <Link to={`/products/${prod.id}`} className="p-2 bg-white/20 text-white rounded-xl hover:bg-white/40 transition-colors backdrop-blur-sm flex items-center justify-center"><Eye size={20} className="m-1" /></Link>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd?.(e); }} className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-600 transition-colors shadow-lg active:scale-95"><ShoppingCart size={18} /> {rtl ? 'إضافة' : 'Add'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};
