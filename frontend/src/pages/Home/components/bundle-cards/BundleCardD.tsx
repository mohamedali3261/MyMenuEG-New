import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Package, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../../../store/store';
import { resolveAssetUrl } from '../../../../utils/assetUrl';

type BundleProduct = {
  id: string;
  name_ar?: string;
  name_en?: string;
  price: number;
  image_url?: string;
  images?: string[];
};

type BundleItem = {
  product_id: string;
  quantity: number;
  discount?: number;
  product?: BundleProduct;
};

type BundleCardProduct = {
  id: string;
  name_ar?: string;
  name_en?: string;
  price: number;
  old_price?: number;
  image_url?: string;
  images?: string[];
  bundle_items?: BundleItem[];
};

interface BundleCardProps {
  prod: BundleCardProduct;
  rtl: boolean;
  onAdd?: (event: React.MouseEvent) => void;
}

export const BundleCardD = ({ prod, rtl, onAdd }: BundleCardProps) => {
  const { toggleWishlist, wishlist } = useStore();
  const isFavorite = wishlist.some((p: any) => p.id === prod.id);
  const bundleItems = prod.bundle_items || [];

  const totalOriginal = bundleItems.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);
  const totalDiscount = bundleItems.reduce((sum, item) => sum + ((item.discount || 0) * item.quantity), 0);
  const totalAfterDiscount = totalOriginal - totalDiscount;
  const bundlePrice = prod.price || totalAfterDiscount;
  const savingsPercent = totalOriginal > 0 ? Math.round(((totalOriginal - bundlePrice) / totalOriginal) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex flex-col relative rounded-[1.5rem] overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full max-w-sm mx-auto"
    >
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 via-white/80 to-accent-400/20 dark:from-primary-500/10 dark:via-slate-900/90 dark:to-accent-500/10 backdrop-blur-xl" />
      <div className="absolute inset-0 border border-white/30 dark:border-white/5 rounded-[1.5rem]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Top - Badges & Wishlist */}
        <div className="flex items-center justify-between p-4 pb-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-white/70 to-primary-50/50 dark:from-white/10 dark:to-primary-500/10 backdrop-blur-md text-primary-600 dark:text-primary-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary-200/30 dark:border-primary-500/20">
              <Package size={12} className="text-accent-500" />
              {rtl ? 'باقة' : 'Bundle'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {savingsPercent > 0 && (
              <div className="bg-gradient-to-br from-accent-500 to-accent-600 backdrop-blur-md text-white w-10 h-10 rounded-full flex flex-col items-center justify-center shadow-lg border border-accent-400/30">
                <span className="text-[10px] font-black leading-none">{savingsPercent}%</span>
                <span className="text-[5px] font-bold opacity-80">{rtl ? 'خصم' : 'OFF'}</span>
              </div>
            )}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(prod as any); }}
              className={`p-2 rounded-xl backdrop-blur-md shadow-sm transition-all hover:scale-110 ${isFavorite ? 'bg-red-500/80 text-white border border-red-400/30' : 'bg-white/60 dark:bg-white/10 text-slate-400 hover:text-red-500 border border-white/40 dark:border-white/10'}`}
            >
              <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Circular Product Thumbnails */}
        <div className="flex items-center justify-center gap-3 py-5 px-4 flex-wrap">
          {bundleItems.map((item) => (
            <Link key={item.product_id} to={`/products/${item.product_id}`} className="relative group/item hover:scale-110 transition-all cursor-pointer">
              <div className="w-[72px] h-[72px] rounded-full overflow-hidden border-2 border-white/60 dark:border-white/20 shadow-md bg-white/40 dark:bg-white/5 backdrop-blur-sm">
                {item.product?.image_url ? (
                  <img src={resolveAssetUrl(item.product.image_url)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={20} className="text-slate-400" />
                  </div>
                )}
              </div>
              {item.quantity > 1 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-sm border border-white">
                  ×{item.quantity}
                </div>
              )}
              {/* Tooltip on hover - appears above with enhanced animation */}
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-[9px] font-bold px-3 py-1.5 rounded-lg opacity-0 scale-90 group-hover/item:opacity-100 group-hover/item:scale-100 transition-all duration-200 ease-out whitespace-nowrap z-[100] shadow-xl shadow-black/30 pointer-events-none">
                {rtl ? item.product?.name_ar : item.product?.name_en}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 dark:bg-slate-100 rotate-45 rounded-sm" />
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col flex-grow mx-3 mb-3 p-3 rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1 mb-1">
            {rtl ? prod.name_ar : prod.name_en}
          </h3>
          <p className="text-[9px] text-slate-400 font-medium mb-2">
            {rtl ? `${bundleItems.length} منتجات في الباقة` : `${bundleItems.length} items in bundle`}
          </p>

          <div className="mt-auto flex items-end justify-between gap-2">
            <div className="flex flex-col">
              {totalOriginal > bundlePrice && (
                <span className="text-[9px] text-slate-400 line-through font-bold">EGP {totalOriginal.toLocaleString()}</span>
              )}
              <span className="text-lg font-black text-slate-900 dark:text-white">EGP {bundlePrice.toLocaleString()}</span>
              {totalOriginal > bundlePrice && (
                <span className="text-[7px] font-black text-accent-500">
                  {rtl ? `وفّر EGP ${(totalOriginal - bundlePrice).toLocaleString()}` : `Save EGP ${(totalOriginal - bundlePrice).toLocaleString()}`}
                </span>
              )}
            </div>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd?.(e); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-primary-500/90 to-accent-500/90 hover:from-primary-600 hover:to-accent-600 backdrop-blur-md text-white rounded-lg font-black text-[9px] uppercase tracking-widest shadow-lg shadow-primary-500/20 transition-all active:scale-95 border border-primary-400/30"
            >
              <ShoppingCart size={11} />
              {rtl ? 'أضف' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
