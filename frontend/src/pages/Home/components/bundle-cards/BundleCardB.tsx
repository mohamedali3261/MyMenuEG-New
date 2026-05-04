import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Package, Tag, Plus } from 'lucide-react';
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

export const BundleCardB = ({ prod, rtl, onAdd }: BundleCardProps) => {
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
      className="group flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full relative"
    >
      {/* Left - Main Image */}
      <div className="relative w-[200px] flex-shrink-0 bg-gradient-to-br from-primary-50 via-accent-50/50 to-primary-100 dark:from-primary-500/10 dark:via-accent-500/5 dark:to-primary-500/5 flex flex-col items-center justify-center p-5">
        {savingsPercent > 0 && (
          <div className="absolute top-4 left-4 bg-gradient-to-br from-accent-500 to-accent-600 text-white w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-xl shadow-accent-500/30 ring-4 ring-white/30 dark:ring-white/10">
            <span className="text-sm font-black leading-none">{savingsPercent}%</span>
            <span className="text-[8px] font-bold opacity-90 uppercase">{rtl ? 'خصم' : 'OFF'}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-700/80 text-accent-600 dark:text-accent-400 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 shadow-sm backdrop-blur-sm border border-accent-100 dark:border-accent-500/20">
          <Package size={12} />
          {rtl ? 'باقة' : 'Bundle'}
        </div>
        {prod.image_url ? (
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-br from-primary-400/20 to-accent-400/20 rounded-2xl blur-xl" />
            <img src={resolveAssetUrl(prod.image_url)} alt="" className="relative w-28 h-28 object-cover rounded-2xl shadow-lg ring-2 ring-white/50 dark:ring-white/10" />
          </div>
        ) : (
          <div className="w-28 h-28 rounded-2xl bg-white/60 dark:bg-white/10 flex items-center justify-center shadow-inner">
            <Package size={44} className="text-accent-300" />
          </div>
        )}
      </div>

      {/* Right - Info */}
      <div className="flex flex-col flex-grow p-5 min-w-0">
        {/* Wishlist */}
        <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(prod as any); }}
            className={`p-2 rounded-lg shadow-sm transition-all hover:scale-110 ${isFavorite ? 'bg-red-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500'}`}
          >
            <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 line-clamp-1 mb-3 pr-8">
          {rtl ? prod.name_ar : prod.name_en}
        </h3>

        {/* Product Chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {bundleItems.slice(0, 5).map((item) => (
            <Link key={item.product_id} to={`/products/${item.product_id}`} className="group/chip flex items-center gap-1.5 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-white/5 dark:to-white/10 border border-slate-200/60 dark:border-white/10 rounded-xl px-2.5 py-1.5 hover:border-accent-300 hover:shadow-sm hover:scale-105 transition-all cursor-pointer">
              {item.product?.image_url ? (
                <img src={resolveAssetUrl(item.product.image_url)} alt="" className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-white/10" />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                  <Package size={14} className="text-slate-400" />
                </div>
              )}
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 max-w-[70px] truncate">
                {rtl ? item.product?.name_ar : item.product?.name_en}
              </span>
              {item.quantity > 1 && (
                <span className="flex items-center justify-center min-w-[16px] h-4 bg-accent-500 text-white text-[7px] font-black rounded-full px-1">×{item.quantity}</span>
              )}
            </Link>
          ))}
          {bundleItems.length > 5 && (
            <div className="flex items-center justify-center h-9 px-3 bg-slate-100 dark:bg-white/5 rounded-xl text-[10px] font-bold text-slate-500">
              +{bundleItems.length - 5}
            </div>
          )}
        </div>

        {/* Price & Button */}
        <div className="mt-auto flex items-end justify-between gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
          <div className="flex flex-col">
            {totalOriginal > bundlePrice && (
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] text-slate-400 line-through font-bold">EGP {totalOriginal.toLocaleString()}</span>
                <span className="text-[9px] font-black text-accent-600 dark:text-accent-400 bg-accent-500/10 px-1.5 py-0.5 rounded-full">
                  {rtl ? `وفّر EGP ${(totalOriginal - bundlePrice).toLocaleString()}` : `Save EGP ${(totalOriginal - bundlePrice).toLocaleString()}`}
                </span>
              </div>
            )}
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">EGP {bundlePrice.toLocaleString()}</span>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd?.(e); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-accent-500/25 transition-all active:scale-95"
          >
            <ShoppingCart size={14} />
            {rtl ? 'أضف للسلة' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
