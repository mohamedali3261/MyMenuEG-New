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

export const BundleCardA = ({ prod, rtl, onAdd }: BundleCardProps) => {
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
      className="group flex flex-col bg-white dark:bg-slate-800 border-2 border-primary-200 dark:border-primary-500/20 rounded-[1.5rem] overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full relative"
    >
      {/* Top Section - Products Grid with gradient overlay using primary and accent */}
      <div className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-primary-500/10 dark:via-slate-800 dark:to-accent-500/10 p-6 pb-4">
        {/* Badges */}
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/30">
            <Package size={12} />
            {rtl ? 'باقة' : 'Bundle'}
          </div>
          {savingsPercent > 0 && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-accent-500 to-accent-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent-500/30">
              <Tag size={10} />
              {rtl ? `وفّر ${savingsPercent}%` : `Save ${savingsPercent}%`}
            </div>
          )}
        </div>

        {/* Wishlist */}
        <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(prod as any); }}
            className={`relative p-2.5 rounded-xl shadow-sm backdrop-blur-md transition-all hover:scale-110 active:scale-75 ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 dark:bg-slate-800 text-slate-400 dark:text-slate-300 hover:text-red-500'}`}
            title={rtl ? 'إضافة للمفضلة' : 'Add to Wishlist'}
          >
            <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Products Grid - 3 per row */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {bundleItems.map((item) => (
            <Link key={item.product_id} to={`/products/${item.product_id}`} className="relative rounded-xl overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm hover:scale-105 hover:border-accent-400 transition-all cursor-pointer">
              {item.product?.image_url ? (
                <img src={resolveAssetUrl(item.product.image_url)} alt="" className="w-full h-[72px] object-cover" />
              ) : (
                <div className="w-full h-[72px] flex items-center justify-center bg-slate-100 dark:bg-white/5">
                  <Package size={22} className="text-slate-300" />
                </div>
              )}
              <div className="px-2 py-1.5 text-center">
                <p className="text-[9px] font-bold text-slate-600 dark:text-slate-300 line-clamp-1">
                  {rtl ? item.product?.name_ar : item.product?.name_en}
                </p>
                {(item.discount || 0) > 0 && (
                  <p className="text-[8px] text-slate-400 line-through">EGP {(item.product?.price || 0) * item.quantity}</p>
                )}
                <p className="text-[10px] font-black text-accent-500">EGP {((item.product?.price || 0) - (item.discount || 0)) * item.quantity}</p>
              </div>
              {item.quantity > 1 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-sm">
                  ×{item.quantity}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Section - Info & Price */}
      <div className="flex flex-col flex-grow px-6 pb-6">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 line-clamp-2">
            {rtl ? prod.name_ar : prod.name_en}
          </h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            {rtl ? `${bundleItems.length} منتجات في الباقة` : `${bundleItems.length} items in bundle`}
          </p>
        </div>

        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col">
              {totalOriginal > bundlePrice && (
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-slate-400 line-through font-bold">
                    EGP {totalOriginal.toLocaleString()}
                  </span>
                  <span className="text-[9px] font-black text-accent-600 dark:text-accent-400 bg-accent-500/10 px-1.5 py-0.5 rounded-full">
                    {rtl ? `وفّر EGP ${(totalOriginal - bundlePrice).toLocaleString()}` : `Save EGP ${(totalOriginal - bundlePrice).toLocaleString()}`}
                  </span>
                </div>
              )}
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  EGP {bundlePrice.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd?.(e); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md shadow-primary-500/20 transition-all active:scale-95"
            >
              <ShoppingCart size={14} className="group-hover:rotate-12 transition-transform" />
              {rtl ? 'أضف الباقة' : 'Add Bundle'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="h-1 bg-gradient-to-r from-primary-500 via-accent-400 to-primary-500 opacity-60" />
    </motion.div>
  );
};
