import { useState, useEffect } from 'react';
import { useStore } from '../../../store/store';
import { ShoppingCart, Heart, Flame, Users, Package, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  product: {
    id: string;
    name_ar: string;
    name_en: string;
    price: number;
    old_price: number;
    description_ar: string;
    description_en: string;
    category_id: string;
    stock: number;
    status: string;
    is_best_seller?: boolean | number;
    view_count?: number;
    carton_details_ar?: string;
    carton_details_en?: string;
    image_url?: string;
    images?: string[];
    quantity_prices?: { quantity_label: string; price: number; old_price?: number }[];
    variants?: { label_ar?: string; label_en?: string; sku?: string; price: number; old_price?: number; stock?: number; is_default?: boolean; image_url?: string; imageUrl?: string }[];
    brand_ar?: string;
    brand_en?: string;
    material_ar?: string;
    material_en?: string;
    dimensions_ar?: string;
    dimensions_en?: string;
    usage_notes_ar?: string;
    usage_notes_en?: string;
  };
  onVariantChange?: (variant: { quantity_label: string; price: number; old_price?: number } | null) => void;
  onRealVariantSelect?: (variant: { label_ar?: string; label_en?: string; sku?: string; price: number; old_price?: number; stock?: number; is_default?: boolean; image_url?: string; imageUrl?: string } | null) => void;
}

export default function ProductInfo({ product, onVariantChange, onRealVariantSelect }: Props) {
  const { rtl, addToCart, wishlist, toggleWishlist, showToast } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [fakeViewers, setFakeViewers] = useState(Math.floor(Math.random() * 8) + 3);

  const hasRealVariants = product.variants && product.variants.length > 0;
  const defaultRealVariant = hasRealVariants
    ? (product.variants!.find((v) => v.is_default) || product.variants![0])
    : null;
  const [selectedRealVariant, setSelectedRealVariant] = useState(defaultRealVariant);

  // Dynamic price state based on variant
  const hasVariants = product.quantity_prices && product.quantity_prices.length > 0;
  const initialVariant = hasVariants ? product.quantity_prices![0] : null;
  const [selectedVariant, setSelectedVariant] = useState(initialVariant);

  const unitPrice = selectedRealVariant
    ? selectedRealVariant.price
    : selectedVariant
      ? selectedVariant.price
      : product.price;
  const unitOldPrice = selectedRealVariant && selectedRealVariant.old_price && selectedRealVariant.old_price > 0
    ? selectedRealVariant.old_price
    : selectedVariant && selectedVariant.old_price && selectedVariant.old_price > 0
      ? selectedVariant.old_price
      : product.old_price;

  const displayPrice = unitPrice;
  const displayOldPrice = unitOldPrice;
  const totalPrice = unitPrice * quantity;

  useEffect(() => {
    // Reset selected variant if product changes
    if (hasRealVariants) {
      const nextRealVariant = product.variants!.find((v) => v.is_default) || product.variants![0];
      setSelectedRealVariant(nextRealVariant);
      onVariantChange?.({ price: nextRealVariant.price, old_price: nextRealVariant.old_price, quantity_label: (rtl ? nextRealVariant.label_ar : nextRealVariant.label_en) || '' });
      onRealVariantSelect?.(nextRealVariant);
    } else if (hasVariants) {
      setSelectedVariant(product.quantity_prices![0]);
      onVariantChange?.(product.quantity_prices![0]);
      onRealVariantSelect?.(null);
    } else {
      setSelectedVariant(null);
      setSelectedRealVariant(null);
      onVariantChange?.(null);
      onRealVariantSelect?.(null);
    }
  }, [hasRealVariants, hasVariants, onRealVariantSelect, onVariantChange, product.id, product.quantity_prices, product.variants, rtl]);

  useEffect(() => {
    const timer = setInterval(() => {
      setFakeViewers(prev => Math.max(2, prev + (Math.random() > 0.5 ? 1 : -1)));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleAdd = () => {
    // Determine the final quantity to add to cart.
    // If they selected a "Quantity Price" variant (e.g. 1000 items), the frontend's concept of 'quantity' for that variant 
    // will be '1' package of 1000. So we multiply the unit quantity state by the variant name if needed, 
    // or just pass the variant label. Our cart handles `quantity` * `price`.
    addToCart({
      id: product.id,
      name: rtl ? product.name_ar : product.name_en,
      price: unitPrice,
      quantity,
      image: selectedRealVariant?.image_url || (selectedRealVariant as any)?.imageUrl || product.image_url || (product.images && product.images[0]),
      variant: selectedRealVariant
        ? (rtl ? selectedRealVariant.label_ar : selectedRealVariant.label_en)
        : selectedVariant?.quantity_label
    });
    showToast(rtl ? 'تمت الإضافة للسلة' : 'Added to cart!');
  };

  return (
    <div className="flex flex-col gap-6">
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
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white uppercase">
          {rtl ? product.name_ar : product.name_en}
        </h1>
        <div className="h-1 w-20 bg-gradient-to-r from-primary-500 to-transparent rounded-full" />
      </div>

      {/* 3. Pricing Matrix */}
      <div className="relative group p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:scale-125 transition-transform duration-1000">
           <ShoppingCart size={60} className="text-primary-500" />
        </div>
        
         <div className="relative z-10 flex flex-wrap items-end gap-3">
          <div className="flex flex-col">
             <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary-500 mb-1">{rtl ? 'السعر' : 'PRICE'}</span>
             <div className="flex items-baseline">
                <span className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                   <span className="text-sm font-bold opacity-30 mr-1">EGP</span>
                   {displayPrice.toLocaleString()}
                </span>
             </div>
          </div>
          
          {displayOldPrice > displayPrice && (
            <div className="flex flex-col mb-1 pb-1 border-l border-slate-300 dark:border-white/10 pl-4 animate-in fade-in slide-in-from-left-4 duration-500">
               <div className="flex items-center gap-2">
                 <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{rtl ? 'قبل' : 'WAS'}</span>
                 <span className="bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-lg shadow-rose-500/20">
                    -{Math.round(((displayOldPrice - displayPrice) / displayOldPrice) * 100)}%
                 </span>
               </div>
               <span className="text-sm font-bold text-slate-400 line-through">
                  EGP {displayOldPrice.toLocaleString()}
               </span>
            </div>
          )}
        </div>
      </div>

      {/* Carton Info Note (Dynamic) */}
      {(product.carton_details_ar || product.carton_details_en) && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 w-full">
          <Package size={18} className="text-amber-500 shrink-0" />
          <span className="text-xs font-black text-amber-600 dark:text-amber-400">
            {rtl ? (product.carton_details_ar || product.carton_details_en) : (product.carton_details_en || product.carton_details_ar)}
          </span>
        </div>
      )}

      {hasRealVariants && (
        <div className="space-y-3">
          <label className="text-xs font-black uppercase text-slate-400 tracking-widest">{rtl ? 'اختر النوع' : 'Select Variant'}</label>
          <div className="flex flex-wrap gap-2">
            {product.variants!.map((variant, idx) => {
              const isSelected = selectedRealVariant?.sku
                ? selectedRealVariant.sku === variant.sku
                : selectedRealVariant === variant;
              return (
                <button
                  key={`${variant.sku || 'variant'}-${idx}`}
                  onClick={() => {
                    setSelectedRealVariant(variant);
                    onVariantChange?.({ price: variant.price, old_price: variant.old_price, quantity_label: (rtl ? variant.label_ar : variant.label_en) || '' });
                    onRealVariantSelect?.(variant);
                  }}
                  className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${isSelected ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'}`}
                >
                  {rtl ? (variant.label_ar || variant.label_en) : (variant.label_en || variant.label_ar)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {(product.brand_ar || product.brand_en || product.material_ar || product.material_en || product.dimensions_ar || product.dimensions_en) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(product.brand_ar || product.brand_en) && (
            <div className="rounded-xl border border-slate-200 dark:border-white/10 p-2.5 bg-slate-50 dark:bg-white/5">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{rtl ? 'العلامة التجارية' : 'Brand'}</p>
              <p className="font-bold text-slate-900 dark:text-white">{rtl ? (product.brand_ar || product.brand_en) : (product.brand_en || product.brand_ar)}</p>
            </div>
          )}
          {(product.material_ar || product.material_en) && (
            <div className="rounded-xl border border-slate-200 dark:border-white/10 p-2.5 bg-slate-50 dark:bg-white/5">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{rtl ? 'الخامة' : 'Material'}</p>
              <p className="font-bold text-slate-900 dark:text-white">{rtl ? (product.material_ar || product.material_en) : (product.material_en || product.material_ar)}</p>
            </div>
          )}
          {(product.dimensions_ar || product.dimensions_en) && (
            <div className="rounded-xl border border-slate-200 dark:border-white/10 p-2.5 bg-slate-50 dark:bg-white/5">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{rtl ? 'الأبعاد' : 'Dimensions'}</p>
              <p className="font-bold text-slate-900 dark:text-white">{rtl ? (product.dimensions_ar || product.dimensions_en) : (product.dimensions_en || product.dimensions_ar)}</p>
            </div>
          )}
        </div>
      )}

      {(product.usage_notes_ar || product.usage_notes_en) && (
      <div className="rounded-xl border border-primary-500/20 bg-primary-500/5 p-3">
          <p className="text-xs uppercase tracking-widest text-primary-500 mb-2">{rtl ? 'ملاحظات الاستخدام' : 'Usage Notes'}</p>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-200 whitespace-pre-line">
            {rtl ? (product.usage_notes_ar || product.usage_notes_en) : (product.usage_notes_en || product.usage_notes_ar)}
          </p>
        </div>
      )}

      {/* Quantity Pricing Variants (If available) */}
      {hasVariants && (
        <div className="space-y-3">
          <label className="text-xs font-black uppercase text-slate-400 tracking-widest">{rtl ? 'اختر العدد' : 'Select Quantity'}</label>
          <div className="flex flex-wrap gap-2">
            {product.quantity_prices!.map((variant, idx) => {
              const isSelected = selectedVariant?.quantity_label === variant.quantity_label;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedVariant(variant);
                    onVariantChange?.(variant);
                  }}
                  className={`relative px-4 py-2 rounded-xl border text-center transition-all flex items-center gap-2 ${isSelected ? 'border-primary-500 bg-primary-500/10 shadow-sm' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-black ${isSelected ? 'text-primary-500' : 'text-slate-800 dark:text-white'}`}>
                      {variant.quantity_label}
                    </span>
                    <span className="text-[10px] text-slate-300 font-black">|</span>
                    <span className={`text-xs font-bold ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500'}`}>
                      {variant.price.toLocaleString()} EGP
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 4. Action Layer: Quantity + Add to Cart */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mt-1">
        {/* Futuristic Quantity Hub */}
        <div className="flex items-center w-full sm:w-auto bg-slate-100 dark:bg-black/60 rounded-xl border border-slate-200 dark:border-white/10 p-1 shadow-xl">
          <button 
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all text-xl font-light"
          >
            -
          </button>
          
          <div className="w-10 flex flex-col items-center justify-center">
             <span className="text-[7px] font-black text-primary-500 uppercase tracking-widest">{rtl ? 'كمية' : 'QTY'}</span>
             <span className="text-base font-black text-slate-900 dark:text-white">{quantity}</span>
          </div>

          <button 
            onClick={() => setQuantity(q => q + 1)}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all text-xl font-light"
          >
            +
          </button>
        </div>

        {/* Cinematic Purchase Button */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAdd}
          className="relative w-full h-12 px-5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 bg-[length:200%_auto] rounded-xl flex items-center justify-between text-xs font-black text-white shadow-2xl shadow-primary-500/40 uppercase tracking-[0.15em] transform transition-all group overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <ShoppingCart size={18} className="group-hover:rotate-12 transition-transform" />
            <span>{rtl ? 'اشتري الآن' : 'Buy Now'}</span>
          </div>
          <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 backdrop-blur-md">
             <span className="text-[9px] opacity-70 mt-0.5">EGP</span>
             <span className="text-sm">{totalPrice.toLocaleString()}</span>
          </div>
        </motion.button>
        
        {/* Micro-Actions */}
        <div className="flex gap-4 w-full sm:w-auto">
          <button 
            onClick={() => toggleWishlist(product as Parameters<typeof toggleWishlist>[0])}
            className={`h-12 w-12 flex items-center justify-center rounded-xl transition-all shrink-0 shadow-lg group active:scale-75 ${wishlist.some(p => p.id === product.id) ? 'bg-red-500 text-white border-red-600' : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:text-rose-500'}`}
          >
            <Heart 
              size={20} 
              className="group-hover:scale-125 transition-transform" 
              fill={wishlist.some(p => p.id === product.id) ? "currentColor" : "none"}
            />
          </button>
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
