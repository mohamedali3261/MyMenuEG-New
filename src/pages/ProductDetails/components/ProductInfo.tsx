import { useState, useEffect } from 'react';
import { useStore } from '../../../store/store';
import { ShoppingCart, Heart, Flame, Users, Package, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductShare from './ProductShare';

interface Props {
  product: {
    id: string;
    name_ar: string;
    name_en: string;
    price: number;
    old_price: number;
    description_ar: string;
    description_en: string;
    stock: number;
    status: string;
    is_best_seller?: boolean | number;
    view_count?: number;
    carton_details_ar?: string;
    carton_details_en?: string;
    image_url?: string;
    images?: any[];
  }
}


export default function ProductInfo({ product }: Props) {
  const { rtl, addToCart, wishlist, toggleWishlist, showToast } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [fakeViewers, setFakeViewers] = useState(Math.floor(Math.random() * 8) + 3);

  useEffect(() => {
    const timer = setInterval(() => {
      setFakeViewers(prev => Math.max(2, prev + (Math.random() > 0.5 ? 1 : -1)));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleAdd = () => {
    addToCart({
      id: product.id,
      name: rtl ? product.name_ar : product.name_en,
      price: product.price,
      quantity,
      image: product.image_url || (product.images && product.images[0])
    });
    showToast(rtl ? 'تمت الإضافة للسلة' : 'Added to cart!');
  };

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Status Badges & Social Proof */}
      <div className="flex flex-wrap items-center gap-3">
        <motion.span 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 backdrop-blur-md shadow-lg ${product.stock > 0 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}
        >
          <div className={`w-1.5 h-1.5 rounded-full animate-ping ${product.stock > 0 ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'bg-rose-500'}`} />
          {product.stock > 0 ? (rtl ? 'متوفر فوري' : 'In Stock') : (rtl ? 'نافذ' : 'Out of Stock')}
        </motion.span>
        
        {product.is_best_seller === 1 && (
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl shadow-amber-500/20"
          >
            <Flame size={12} fill="currentColor" />
            {rtl ? 'تصدّر المبيعات' : 'Best Seller'}
          </motion.span>
        )}

        <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-[10px] font-black px-4 py-2 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
           <Users size={14} className="text-primary-500" />
           {rtl ? `${fakeViewers} يشاهدون` : `${fakeViewers} views`}
        </div>
      </div>

      {/* 2. Main Title Section */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-slate-900 dark:text-white uppercase">
          {rtl ? product.name_ar : product.name_en}
        </h1>
        <div className="h-1.5 w-24 bg-gradient-to-r from-primary-500 to-transparent rounded-full" />
      </div>

      {/* 3. Pricing Matrix */}
      <div className="relative group p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:scale-125 transition-transform duration-1000">
           <ShoppingCart size={60} className="text-primary-500" />
        </div>
        
        <div className="relative z-10 flex flex-wrap items-end gap-4">
          <div className="flex flex-col">
             <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary-500 mb-1">{rtl ? 'السعر' : 'PRICE'}</span>
             <div className="flex items-baseline">
                <span className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                   <span className="text-base font-bold opacity-30 mr-1">EGP</span>
                   {product.price.toLocaleString()}
                </span>
             </div>
          </div>
          
          {product.old_price > product.price && (
            <div className="flex flex-col mb-1 pb-1 border-l border-slate-300 dark:border-white/10 pl-4 animate-in fade-in slide-in-from-left-4 duration-500">
               <div className="flex items-center gap-2">
                 <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{rtl ? 'قبل' : 'WAS'}</span>
                 <span className="bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-lg shadow-rose-500/20">
                    -{Math.round(((product.old_price - product.price) / product.old_price) * 100)}%
                 </span>
               </div>
               <span className="text-base font-bold text-slate-400 line-through">
                  EGP {product.old_price.toLocaleString()}
               </span>
            </div>
          )}
        </div>
      </div>

      {/* Carton Info Note (Dynamic) */}
      {(product.carton_details_ar || product.carton_details_en) && (
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 w-full">
          <Package size={22} className="text-amber-500 shrink-0" />
          <span className="text-sm font-black text-amber-600 dark:text-amber-400">
            {rtl ? (product.carton_details_ar || product.carton_details_en) : (product.carton_details_en || product.carton_details_ar)}
          </span>
        </div>
      )}

      {/* 4. Action Layer: Quantity + Add to Cart */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
        {/* Futuristic Quantity Hub */}
        <div className="flex items-center w-full sm:w-auto bg-white dark:bg-black/60 rounded-2xl border border-slate-200 dark:border-white/10 p-1.5 shadow-xl">
          <button 
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="w-12 h-12 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all text-2xl font-light"
          >
            -
          </button>
          
          <div className="w-12 flex flex-col items-center justify-center">
             <span className="text-[7px] font-black text-primary-500 uppercase tracking-widest">{rtl ? 'كمية' : 'QTY'}</span>
             <span className="text-lg font-black text-slate-900 dark:text-white">{quantity}</span>
          </div>

          <button 
            onClick={() => setQuantity(q => q + 1)}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all text-2xl font-light"
          >
            +
          </button>
        </div>

        {/* Cinematic Purchase Button */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAdd}
          className="relative w-full h-14 px-8 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 bg-[length:200%_auto] rounded-2xl flex items-center justify-center gap-3 text-sm font-black text-white shadow-2xl shadow-primary-500/40 uppercase tracking-[0.2em] transform transition-all group overflow-hidden"
        >
          <ShoppingCart size={20} className="group-hover:rotate-12 transition-transform" />
          {rtl ? 'اشتري الآن' : 'Buy Now'}
        </motion.button>
        
        {/* Micro-Actions */}
        <div className="flex gap-4 w-full sm:w-auto">
          <button 
            onClick={() => toggleWishlist(product as any)}
            className={`h-14 w-14 flex items-center justify-center rounded-2xl transition-all shrink-0 shadow-lg group active:scale-75 ${wishlist.some(p => p.id === product.id) ? 'bg-red-500 text-white border-red-600' : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:text-rose-500'}`}
          >
            <Heart 
              size={20} 
              className="group-hover:scale-125 transition-transform" 
              fill={wishlist.some(p => p.id === product.id) ? "currentColor" : "none"}
            />
          </button>
          <ProductShare />
        </div>
      </div>

      {/* 5. Trust Bar Lite */}
      <div className="pt-2 flex items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700 overflow-x-auto scrollbar-hide">
         <div className="flex items-center gap-2 shrink-0">
            <Package size={16} />
            <span className="text-[8px] font-bold uppercase tracking-widest">{rtl ? 'تغليف آمن' : 'SAFE'}</span>
         </div>
         <div className="flex items-center gap-2 shrink-0">
            <Users size={16} />
            <span className="text-[8px] font-bold uppercase tracking-widest">{rtl ? 'رضا عملاء' : 'HAPPY USERS'}</span>
         </div>
         <div className="flex items-center gap-2 shrink-0">
            <Shield size={16} />
            <span className="text-[8px] font-bold uppercase tracking-widest">{rtl ? 'ضمان' : 'WARRANTY'}</span>
         </div>
      </div>
      
    </div>
  )
}
