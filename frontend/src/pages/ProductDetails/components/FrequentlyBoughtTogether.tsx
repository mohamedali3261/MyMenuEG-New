import { useState, useEffect } from 'react';
import { useStore } from '../../../store/store';
import { Plus, ShoppingCart, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { resolveAssetUrl } from '../../../utils/assetUrl';

interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  price: number;
  image_url: string;
}

interface Props {
  currentProduct: Product;
  fbtProducts: Product[];
}

export default function FrequentlyBoughtTogether({ currentProduct, fbtProducts }: Props) {
  const { rtl, addToCart, showToast } = useStore();
  
  // By default, all are selected
  const [selectedIds, setSelectedIds] = useState<string[]>([
    currentProduct.id,
    ...fbtProducts.map(p => p.id)
  ]);

  const toggleProduct = (id: string) => {
    if (id === currentProduct.id) return; // Main product cannot be unselected
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectedProducts = [currentProduct, ...fbtProducts].filter(p => selectedIds.includes(p.id));
  const totalPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0);

  const handleAddAll = () => {
    selectedProducts.forEach(p => {
      addToCart({
        id: p.id,
        name: rtl ? p.name_ar : p.name_en,
        price: p.price,
        quantity: 1,
        image: p.image_url
      });
    });
    showToast(rtl ? 'تم إضافة المجموعة للسلة!' : 'Bundle added to cart!');
  };

  if (!fbtProducts || fbtProducts.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-12 glass-card p-6 md:p-8 border-primary-500/10 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-3xl -z-10 rounded-full" />
      
      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
        {/* Products Visual List */}
        <div className="flex-grow">
          <h3 className="text-lg md:text-xl font-black uppercase tracking-wider text-slate-900 dark:text-white mb-6">
            {rtl ? 'يُشترى معاً عادةً' : 'Frequently Bought Together'}
          </h3>
          
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            {/* Current Product */}
            <FBTItem 
              product={currentProduct} 
              isSelected={true} 
              isMain={true}
              rtl={rtl}
              onToggle={() => {}}
            />

            {[...fbtProducts].map((p, idx) => (
              <div key={p.id} className="flex items-center gap-4 md:gap-6">
                <div className="flex items-center justify-center relative p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400">
                  <Plus size={20} />
                </div>
                <FBTItem 
                  product={p} 
                  isSelected={selectedIds.includes(p.id)} 
                  rtl={rtl}
                  onToggle={() => toggleProduct(p.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bundle Action Box */}
        <div className="w-full lg:w-72 shrink-0 glass bg-primary-500/[0.03] border-primary-500/10 p-6 rounded-2xl flex flex-col gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
              {rtl ? 'إجمالي المجموعة' : 'BUNDLE TOTAL'}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {totalPrice.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-400">EGP</span>
            </div>
          </div>
          
          <button 
            onClick={handleAddAll}
            className="btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/20 group"
          >
            <ShoppingCart size={18} className="group-hover:translate-x-1 transition-transform" />
            {rtl ? 'إضافة الكل للسلة' : 'Add Bundle to Cart'}
          </button>
          
          <p className="text-[9px] text-center text-slate-400 font-bold uppercase">
            {rtl ? '* يتم إضافة المنتجات كأصناف منفصلة' : '* ITEMS ADDED SEPARATELY TO CART'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function FBTItem({ product, isSelected, isMain, rtl, onToggle }: { product: any, isSelected: boolean, isMain?: boolean, rtl: boolean, onToggle: () => void }) {
  return (
    <div 
      onClick={onToggle}
      className={`relative flex flex-col items-center gap-3 group cursor-pointer transition-all ${isSelected ? 'opacity-100' : 'opacity-40 grayscale'}`}
    >
      <div className={`relative w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 transition-all ${isSelected ? 'border-primary-500 shadow-lg shadow-primary-500/10' : 'border-slate-200 dark:border-white/10'}`}>
        {product.image_url && (
          <img 
            src={resolveAssetUrl(product.image_url)} 
            alt="" 
            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
          />
        )}
        
        {!isMain && (
          <div className={`absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${isSelected ? 'bg-primary-500 border-primary-600 text-white' : 'bg-white/80 dark:bg-black/60 border-slate-200 dark:border-white/10 text-transparent'}`}>
            <Check size={14} strokeWidth={4} />
          </div>
        )}
      </div>
      
      <div className="text-center max-w-[100px] md:max-w-[130px]">
        <p className="text-[10px] md:text-xs font-bold text-slate-900 dark:text-white truncate uppercase tracking-tight">
          {rtl ? product.name_ar : product.name_en}
        </p>
        <p className="text-[10px] font-black text-primary-500">
          {product.price} EGP
        </p>
      </div>
    </div>
  );
}
