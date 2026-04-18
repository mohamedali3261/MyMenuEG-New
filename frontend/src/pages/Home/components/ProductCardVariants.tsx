import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, Heart, ShoppingBag, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../../store/store';
import { resolveAssetUrl } from '../../../utils/assetUrl';

type CardProduct = {
  id: string;
  name?: string;
  description?: string;
  onQuickView?: () => void;
  onAdd?: (event: React.MouseEvent) => void;
  name_ar?: string;
  name_en?: string;
  description_ar?: string;
  description_en?: string;
  category_id?: string;
  stock?: number;
  status?: string;
  price: number;
  old_price?: number;
  image_url?: string;
  images?: string[];
  is_best_seller?: number | boolean;
  rating?: number;
};

type CardProps = {
  prod: CardProduct;
  rtl: boolean;
  onAdd?: (event: React.MouseEvent) => void;
};

const ManualImageGallery = ({ images, imageUrl, imgAnimClass }: { images?: string[]; imageUrl?: string; imgAnimClass: string }) => {
  const [index, setIndex] = useState(0);
  
  let allImages: string[] = [];
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
             src={resolveAssetUrl(allImages[index])} 
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
            {allImages.map((_, i: number) => (
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

export const ClassicElegantCard = ({ prod, rtl, onAdd }: CardProps) => {
  const { cardAnimClass, imgAnimClass } = useCardAnimations();
  const { toggleWishlist, wishlist } = useStore();
  const isFavorite = wishlist.some(p => p.id === prod.id);

  return (
    <div 
      className={`group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all duration-300 h-full ${cardAnimClass}`}
    >
      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden">
        {prod.is_best_seller === 1 && (
          <div className="absolute bottom-3 left-3 z-30 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-sm shadow-lg uppercase tracking-tighter transform -rotate-1 origin-bottom-left">
            {rtl ? 'الأكثر مبيعاً' : 'Best Seller'}
          </div>
        )}
        <div className="absolute top-3 left-3 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-4 group-hover:translate-x-0">
            <Link 
              to={`/products/${prod.id}`} 
              className="relative p-2.5 rounded-xl bg-white/90 dark:bg-slate-800 text-slate-500 hover:text-primary-500 shadow-sm backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-90"
              title={rtl ? 'عرض التفاصيل' : 'View Details'}
            >
              <Eye size={16} />
            </Link>
        </div>
        <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(prod as Parameters<typeof toggleWishlist>[0]); }}
              className={`relative p-2.5 rounded-xl shadow-sm backdrop-blur-md transition-all hover:scale-110 active:scale-75 ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 dark:bg-slate-800 text-slate-400 dark:text-slate-300 hover:text-red-500'}`}
              title={rtl ? 'إضافة للمفضلة' : 'Add to Wishlist'}
            >
              <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
            </button>
        </div>
        <Link to={`/products/${prod.id}`} className="block w-full h-full relative z-0">
          <ManualImageGallery images={prod.images} imageUrl={prod.image_url} imgAnimClass={imgAnimClass} />
        </Link>
      </div>

      <div className="flex flex-col flex-grow p-4 justify-between">
        <Link to={`/products/${prod.id}`} className="block mb-2">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 hover:text-primary-600 transition-colors line-clamp-2 mb-1">
            {rtl ? prod.name_ar : prod.name_en}
          </h3>
          <div className="flex items-center gap-1 text-amber-400">
            <Star size={12} className="fill-current" />
            <span className="text-[10px] text-slate-500 ml-1 font-medium">{prod.rating || 4.5}</span>
          </div>
        </Link>

        <div className="flex flex-col pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
              EGP {prod.price.toFixed(2)}
            </span>
            {(prod.old_price ?? 0) > prod.price && (
              <span className="text-[10px] text-slate-400 line-through">
                {(prod.old_price ?? 0).toFixed(2)}
              </span>
            )}
          </div>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd?.(e); }} 
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-300 rounded-lg font-bold hover:bg-primary-500 hover:text-white transition-all active:scale-95 mt-1 border border-slate-200 dark:border-white/10 group/btn"
          >
            <ShoppingCart size={14} className="group-hover/btn:rotate-12 transition-transform" /> 
            <span className="text-xs font-bold uppercase tracking-wide">{rtl ? 'إضافة' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};


export const Floating3DCard = ({ prod, rtl, onAdd }: CardProps) => {
  const { cardAnimClass, imgAnimClass } = useCardAnimations();
  const { toggleWishlist, wishlist } = useStore();
  const isFavorite = wishlist.some(p => p.id === prod.id);

  return (
    <div 
      className={`group flex flex-col items-center p-3 bg-gradient-to-b from-white/60 to-white/30 dark:from-white/10 dark:to-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/20 rounded-[1.5rem] shadow-2xl relative h-full transition-all duration-300 ${cardAnimClass}`}
    >
      {prod.is_best_seller === 1 && (
        <div className="absolute bottom-1/3 left-4 z-30 bg-primary-500 text-white text-[8px] font-black px-3 py-1 rounded-full shadow-xl shadow-primary-500/30 -rotate-6 pointer-events-none transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
          {rtl ? 'الأكثر مبيعاً' : 'Best Seller'}
        </div>
      )}
      <div className="absolute top-4 left-4 z-30 md:opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        <Link 
          to={`/products/${prod.id}`} 
          className="relative p-2.5 rounded-xl bg-white/90 dark:bg-black/40 text-slate-600 dark:text-slate-300 hover:text-primary-500 backdrop-blur-xl shadow-sm flex items-center justify-center transition-all hover:scale-110 active:scale-90"
          title={rtl ? 'عرض التفاصيل' : 'View Details'}
        >
          <Eye size={16} />
        </Link>
      </div>
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 md:opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        <button 
             onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(prod as Parameters<typeof toggleWishlist>[0]); }}
          className={`relative p-2.5 rounded-xl backdrop-blur-xl shadow-sm flex items-center justify-center transition-all hover:scale-110 active:scale-75 ${isFavorite ? 'bg-red-500 text-white shadow-red-500/10' : 'bg-white/90 dark:bg-black/40 text-slate-500 dark:text-slate-300 hover:text-red-500'}`}
          title={rtl ? 'إضافة للمفضلة' : 'Add to Wishlist'}
        >
          <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      <Link to={`/products/${prod.id}`} className="block w-full aspect-square mb-4 rounded-[1rem] shadow-inner bg-white/10 p-1 flex-shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="w-full h-full rounded-[0.9rem] relative z-10 bg-slate-50 dark:bg-[#111] overflow-hidden">
          <ManualImageGallery images={prod.images} imageUrl={prod.image_url} imgAnimClass={imgAnimClass} />
        </div>
      </Link>

      <div className="text-center w-full flex flex-col flex-grow z-10">
        <h3 className="text-base font-bold mb-3 text-slate-900 dark:text-white line-clamp-2 my-auto">{rtl ? prod.name_ar : prod.name_en}</h3>
        <div className="flex items-center justify-between bg-white/50 dark:bg-black/30 p-1 pl-3 rounded-full border border-slate-200 dark:border-white/20 mt-auto relative">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-slate-900 dark:text-white">EGP {prod.price.toFixed(2)}</span>
            {(prod.old_price ?? 0) > prod.price && (
              <span className="text-[9px] text-rose-500 font-bold line-through">
                {prod.old_price ?? 0}
              </span>
            )}
          </div>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd?.(e); }} 
            className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-300 hover:bg-primary-500 hover:text-white border border-slate-200 dark:border-white/10 transition-all active:scale-95 group/btn shadow-sm"
          >
            <ShoppingCart size={14} className="group-hover/btn:rotate-12 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};


export const MinimalPosterCard = ({ prod, rtl, onAdd }: CardProps) => {
  const { cardAnimClass, imgAnimClass } = useCardAnimations();
  const { toggleWishlist, wishlist } = useStore();
  const isFavorite = wishlist.some(p => p.id === prod.id);

  return (
    <div 
      className={`group relative w-full h-[320px] rounded-[1.5rem] border border-slate-200 dark:border-white/10 shadow-lg transition-all duration-300 overflow-hidden ${cardAnimClass}`}
    >
      <Link to={`/products/${prod.id}`} className="absolute inset-0 bg-slate-50 dark:bg-[#0a0a0a] z-0 overflow-hidden">
        <ManualImageGallery images={prod.images} imageUrl={prod.image_url} imgAnimClass={imgAnimClass} />
      </Link>

      {prod.is_best_seller === 1 && (
        <div className="absolute bottom-24 left-4 z-30 bg-accent-500 text-white text-[8px] font-black px-4 py-1.5 rounded-full shadow-2xl pointer-events-none transform -translate-x-10 group-hover:translate-x-0 transition-transform duration-500">
          {rtl ? 'الأكثر مبيعاً' : 'Best Seller'}
        </div>
      )}

      {/* Action Buttons for Minimal Style */}
      <div className="absolute top-4 left-4 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-4 group-hover:translate-y-0">
        <Link 
          to={`/products/${prod.id}`} 
          className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md shadow-2xl border border-white/10 transition-all hover:scale-110 active:scale-90 flex items-center justify-center"
          title={rtl ? 'عرض التفاصيل' : 'View Details'}
        >
          <Eye size={18} />
        </Link>
      </div>

      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(prod as Parameters<typeof toggleWishlist>[0]); }}
        className={`absolute top-4 right-4 z-30 p-2.5 rounded-xl backdrop-blur-md shadow-2xl transition-all hover:scale-110 active:scale-75 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 duration-300 delay-75 ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'}`}
        title={rtl ? 'إضافة للمفضلة' : 'Add to Wishlist'}
      >
        <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
      </button>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-1.5 pointer-events-none transition-transform duration-300 translate-y-4 group-hover:translate-y-0 z-20">
        <span className="text-primary-400 font-bold text-[8px] tracking-widest uppercase drop-shadow-sm opacity-0 group-hover:opacity-100 transition-opacity delay-100">
          {rtl ? 'تصفح التفاصيل' : 'View Details'}
        </span>
        <h3 className="text-lg font-bold text-white mb-1 leading-tight drop-shadow-md line-clamp-2">{rtl ? prod.name_ar : prod.name_en}</h3>
        
        <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-white">EGP {prod.price.toFixed(2)}</span>
            {(prod.old_price ?? 0) > prod.price && (
              <span className="text-xs text-white/50 line-through font-medium">{prod.old_price ?? 0}</span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd?.(e); }} className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-xl font-black uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all shadow-2xl active:scale-95 group/btn">
              <ShoppingCart size={14} className="group-hover/btn:rotate-12 transition-transform" /> 
              {rtl ? 'إضافة' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const InteractiveRevealCard = ({ prod, rtl, onAdd }: CardProps) => {
  const { cardHoverAnimation } = useStore();
  const { toggleWishlist, wishlist } = useStore();
  const isFavorite = wishlist.some(p => p.id === prod.id);

  // Palette assignment
  const palette = ['#EB5160', '#8F3985', '#8DAA91', '#888DA7'];
  const prodIdStr = String(prod.id || '0');
  const index = Math.abs(prodIdStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % palette.length;
  const bgColor = palette[index];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative w-full max-w-[280px] mx-auto mb-10"
    >
      <div 
        className="relative p-5 pb-8 transition-all duration-500 rounded-3xl group-hover:scale-[1.02] shadow-xl group-hover:shadow-2xl"
        style={{ backgroundColor: bgColor }}
      >
        {/* The Offset Border */}
        <div className="absolute inset-0 border border-white/20 -left-1.5 -top-1.5 pointer-events-none transition-all duration-300 group-hover:left-0 group-hover:top-0 rounded-3xl" />
        
        {/* Floating Image Section */}
        <div className="relative -mt-10 mx-auto w-full aspect-square bg-slate-900 border-2 border-white/30 overflow-hidden shadow-2xl transition-all duration-500 group-hover:-translate-y-3 rounded-2xl">
          <Link to={`/products/${prod.id}`} className="block w-full h-full">
            <ManualImageGallery images={prod.images} imageUrl={prod.image_url} imgAnimClass={cardHoverAnimation === 'zoom' ? 'group-hover:scale-110' : ''} />
          </Link>
          
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
             <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(prod as any); }}
              className={`p-2 rounded-xl backdrop-blur-md transition-all active:scale-75 shadow-lg ${isFavorite ? 'bg-red-500 text-white' : 'bg-black/40 text-white hover:bg-red-500'}`}
             >
                <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
             </button>
          </div>
        </div>

        {/* Text Content */}
        <div className="mt-4 relative z-10 flex flex-col items-center text-center">
          <h3 className="text-base font-black text-white leading-tight mb-3 drop-shadow-sm line-clamp-2 uppercase tracking-tight">
            {rtl ? prod.name_ar : prod.name_en}
          </h3>
          
          <div className="w-full flex items-center justify-between mt-auto bg-black/10 p-3 rounded-2xl backdrop-blur-sm border border-white/5">
            <div className="flex flex-col items-start translate-x-1">
               <span className="text-[8px] text-white/40 font-black uppercase tracking-widest">{rtl ? 'سعر رائع' : 'Great Price'}</span>
               <span className="text-lg font-black text-white italic">EGP {Number(prod.price).toLocaleString()}</span>
            </div>
            
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd?.(e); }}
              className="p-2.5 bg-white text-slate-900 rounded-xl hover:bg-slate-900 hover:text-white transition-all active:scale-75 shadow-lg border border-white/20 group/btn"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>

        {/* Hot tag */}
        {prod.is_best_seller === 1 && (
            <div className="absolute -top-2 -right-2 bg-white text-slate-900 px-2.5 py-0.5 font-black text-[8px] uppercase tracking-widest italic shadow-xl rotate-12 z-40 rounded-sm">
                Hot
            </div>
        )}
      </div>
    </motion.div>
  );
};

export const ModernGlassCard = ({ prod, rtl, onAdd }: CardProps) => {
  const { cardHoverAnimation } = useStore();
  const { toggleWishlist, wishlist } = useStore();
  const isFavorite = wishlist.some(p => p.id === prod.id);

  return (
    <div className="group relative w-full h-full p-4">
      {/* Dynamic Glow Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 via-transparent to-accent-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[80px] -z-10" />
      
      <div className="relative h-full flex flex-col bg-white/40 dark:bg-slate-950/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
        
        {/* Header Badges */}
        <div className="absolute top-5 inset-x-5 flex justify-between items-center z-30">
          {prod.is_best_seller === 1 ? (
            <div className="px-4 py-1.5 rounded-full bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/30">
              {rtl ? 'مميز' : 'Elite'}
            </div>
          ) : <div />}
          
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(prod as any); }}
            className={`p-2.5 rounded-2xl backdrop-blur-md shadow-xl transition-all active:scale-75 ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 dark:bg-white/10 text-slate-500 dark:text-white/60 hover:text-red-500 hover:scale-110'}`}
          >
            <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Image Section */}
        <Link to={`/products/${prod.id}`} className="block w-full aspect-square p-4 flex-shrink-0 relative overflow-hidden group/img">
          <div className="w-full h-full rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-white/5 relative">
            <ManualImageGallery images={prod.images} imageUrl={prod.image_url} imgAnimClass={cardHoverAnimation === 'zoom' ? 'group-hover:scale-110' : ''} />
            
            {/* Hover Action Overlay */}
            <div className="absolute inset-0 bg-primary-500/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
               <div className="p-4 rounded-3xl bg-white/90 dark:bg-slate-900/90 text-primary-500 shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
                  <Eye size={24} />
               </div>
            </div>
          </div>
        </Link>

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-grow">
          <div className="mb-6">
             <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white line-clamp-2 tracking-tighter leading-tight group-hover:text-primary-500 transition-colors duration-300">
               {rtl ? prod.name_ar : prod.name_en}
             </h3>
             <div className="w-12 h-1 bg-primary-500/30 rounded-full mt-3 group-hover:w-20 group-hover:bg-primary-500 transition-all duration-500"></div>
          </div>

          <div className="mt-auto flex items-end justify-between gap-4">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{rtl ? 'السعر' : 'Price'}</span>
               <div className="flex items-baseline gap-2">
                 <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                    <span className="text-sm font-bold mr-1 opacity-50">EGP</span>
                    {prod.price.toLocaleString()}
                 </span>
                 {prod.old_price && prod.old_price > prod.price && (
                    <span className="text-xs text-slate-400 line-through decoration-red-500/50 opacity-60 font-bold">{prod.old_price}</span>
                 )}
               </div>
            </div>

            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd?.(e); }}
              className="relative w-14 h-14 flex items-center justify-center rounded-full bg-slate-900 dark:bg-primary-500 text-white hover:scale-110 active:scale-90 transition-all shadow-2xl shadow-slate-900/20 dark:shadow-primary-500/40 group/btn overflow-hidden border-4 border-white dark:border-slate-800"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
              <ShoppingCart size={22} className="relative z-10" />
            </button>
          </div>
        </div>

        {/* Animated Gradient Border - Only visible on hover */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-500/20 rounded-[2.5rem] transition-all duration-500 pointer-events-none" />
      </div>
    </div>
  );
};
