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

export const BundleCardC = ({ prod, rtl, onAdd }: BundleCardProps) => {
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
      className="group flex flex-col bg-white dark:bg-slate-800 rounded-[1.5rem] overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full relative border border-slate-200/50 dark:border-white/5"
    >
      {/* Stacked Product Images */}
      <div className="relative pt-6 pb-4 px-6 flex items-center justify-center min-h-[160px]">
        {/* Wishlist */}
        <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(prod as any); }}
            className={`p-2 rounded-lg shadow-sm transition-all hover:scale-110 ${isFavorite ? 'bg-red-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500'}`}
          >
            <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Save Badge */}
        {savingsPercent > 0 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-accent-500 to-accent-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
            <Tag size={10} className="inline mr-1" />
            {rtl ? `وفّر ${savingsPercent}%` : `Save ${savingsPercent}%`}
          </div>
        )}

        {/* Stacked Cards Effect - Centered */}
        <div className="relative flex items-center justify-center" style={{ minHeight: '120px' }}>
          <div className="relative" style={{ width: `${(Math.min(bundleItems.length, 5) - 1) * 45 + 88}px`, margin: '0 auto' }}>
            {bundleItems.slice(0, 5).map((item, i) => {
              const offset = i * 45;
              const zIndex = 10 - i;
              return (
                <Link
                  key={item.product_id}
                  to={`/products/${item.product_id}`}
                  className="group/card absolute hover:scale-110 hover:z-50 transition-all cursor-pointer"
                  style={{ left: `${offset}px`, zIndex }}
                >
                <div className="w-[88px] h-[110px] rounded-xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800">
                  {item.product?.image_url ? (
                    <img src={resolveAssetUrl(item.product.image_url)} alt="" className="w-full h-[68px] object-cover" />
                  ) : (
                    <div className="w-full h-[68px] flex items-center justify-center bg-slate-50 dark:bg-white/5">
                      <Package size={18} className="text-slate-300" />
                    </div>
                  )}
                  <div className="px-1 py-0.5 text-center">
                    <p className="text-[7px] font-bold text-slate-600 dark:text-slate-300 truncate">
                      {rtl ? item.product?.name_ar : item.product?.name_en}
                    </p>
                  </div>
                  {item.quantity > 1 && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-500 text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-md">
                      ×{item.quantity}
                    </div>
                  )}
                </div>
                {/* Tooltip - appears above */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-[8px] font-bold px-2.5 py-1 rounded-lg opacity-0 scale-90 group-hover/card:opacity-100 group-hover/card:scale-100 transition-all duration-200 whitespace-nowrap z-[100] shadow-lg pointer-events-none">
                  {rtl ? item.product?.name_ar : item.product?.name_en}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-800 dark:bg-slate-100 rotate-45" />
                </div>
              </Link>
            );
          })}
          </div>
          {bundleItems.length > 5 && (
            <div className="absolute" style={{ left: `calc(50% + ${((Math.min(bundleItems.length, 5) - 1) * 45 + 88) / 2 - 44}px)`, top: '50%', transform: 'translateY(-50%)', zIndex: 5 }}>
              <div className="bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 rounded-xl w-[88px] h-[110px] flex items-center justify-center shadow-lg">
                <span className="text-xs font-black text-slate-400">+{bundleItems.length - 5}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bundle Label */}
      <div className="flex items-center justify-center gap-1.5 pt-6 pb-2 mt-4">
        <div className="flex items-center gap-1 bg-gradient-to-r from-primary-500/10 to-accent-500/10 text-primary-600 dark:text-primary-400 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary-200/50 dark:border-primary-500/20">
          <Package size={10} />
          {rtl ? 'باقة' : 'Bundle'}
        </div>
        <span className="text-[9px] text-slate-400 font-bold">
          {rtl ? `${bundleItems.length} منتجات` : `${bundleItems.length} items`}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow px-5 pb-5">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 line-clamp-2 text-center mb-3">
          {rtl ? prod.name_ar : prod.name_en}
        </h3>

        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col">
              {totalOriginal > bundlePrice && (
                <span className="text-[10px] text-slate-400 line-through font-bold">EGP {totalOriginal.toLocaleString()}</span>
              )}
              <span className="text-xl font-black text-slate-900 dark:text-white">EGP {bundlePrice.toLocaleString()}</span>
              {totalOriginal > bundlePrice && (
                <span className="text-[8px] font-black text-accent-500">
                  {rtl ? `وفّر EGP ${(totalOriginal - bundlePrice).toLocaleString()}` : `Save EGP ${(totalOriginal - bundlePrice).toLocaleString()}`}
                </span>
              )}
            </div>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd?.(e); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md shadow-primary-500/20 transition-all active:scale-95"
            >
              <ShoppingCart size={12} />
              {rtl ? 'أضف الباقة' : 'Add Bundle'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
