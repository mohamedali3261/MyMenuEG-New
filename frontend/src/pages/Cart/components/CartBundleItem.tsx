import { useStore } from '../../../store/store';
import { Trash2, Plus, Minus, Package, Tag } from 'lucide-react';
import { resolveAssetUrl } from '../../../utils/assetUrl';

interface BundleItemData {
  product_id: string;
  quantity: number;
  discount?: number;
  name_ar?: string;
  name_en?: string;
  price: number;
  image_url?: string;
}

interface Props {
  item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    variant?: string;
    is_bundle?: boolean;
    bundle_items?: BundleItemData[];
  }
}

export default function CartBundleItem({ item }: Props) {
  const { rtl, removeFromCart, addToCart, decreaseQuantity } = useStore();
  const bundleItems = item.bundle_items || [];
  const totalOriginal = bundleItems.reduce((sum, bi) => sum + (bi.price * bi.quantity), 0);
  const savings = totalOriginal - item.price;

  const handleDecrease = () => {
    decreaseQuantity(item.id, item.variant, true);
  };

  const handleIncrease = () => {
    addToCart({ ...item, quantity: 1 });
  };

  return (
    <div className="glass-card p-4 border-2 border-rose-200 dark:border-rose-500/20 relative overflow-hidden">
      {/* Bundle Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />

      <div className="flex sm:flex-row flex-col items-start gap-4">
        {/* Bundle Header */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-16 h-16 bg-rose-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-rose-500/20">
            <Package size={28} className="text-rose-500" />
          </div>
          <div className="flex-grow sm:hidden">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-base">{item.name}</h3>
              <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                {rtl ? 'باقة' : 'Bundle'}
              </span>
            </div>
            <p className="text-primary-600 dark:text-primary-400 font-extrabold text-sm">
              EGP {item.price.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Bundle Info */}
        <div className="flex-grow w-full sm:w-auto">
          <div className="hidden sm:flex items-center gap-2 mb-2">
            <h3 className="font-bold text-lg">{item.name}</h3>
            <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
              {rtl ? 'باقة' : 'Bundle'}
            </span>
          </div>

          {/* Bundle Items List */}
          <div className="flex flex-wrap gap-2 mb-3">
            {bundleItems.map((bi) => (
              <div key={bi.product_id} className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1.5">
                {bi.image_url ? (
                  <img src={resolveAssetUrl(bi.image_url)} alt="" className="w-8 h-8 rounded-md object-cover flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-md bg-slate-200 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Package size={12} className="text-slate-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                    {rtl ? bi.name_ar : bi.name_en}
                  </p>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[9px] font-black text-slate-500">×{bi.quantity}</span>
                    <span className="text-[9px] font-black text-rose-500">EGP {(bi.price - (bi.discount || 0)) * bi.quantity}</span>
                    {(bi.discount || 0) > 0 && (
                      <>
                        <span className="text-[8px] text-slate-400 line-through">EGP {bi.price * bi.quantity}</span>
                        <span className="text-[7px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 px-1 py-0.5 rounded">
                          -EGP {(bi.discount || 0) * bi.quantity}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Savings Badge */}
          {savings > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <Tag size={12} className="text-amber-500" />
              <span className="text-[10px] font-black text-amber-500">
                {rtl ? `وفّرت EGP ${savings.toFixed(2)} على هذه الباقة!` : `You saved EGP ${savings.toFixed(2)} on this bundle!`}
              </span>
            </div>
          )}

          <p className="text-primary-600 dark:text-primary-400 font-extrabold text-sm sm:hidden">
            EGP {item.price.toFixed(2)}
          </p>
        </div>

        {/* Quantity & Total */}
        <div className="flex items-center gap-4 sm:w-auto w-full justify-between sm:justify-end">
          <div className="flex items-center gap-3 bg-slate-100 dark:bg-white/5 rounded-full p-1 border border-slate-200 dark:border-white/10">
            <button
              onClick={handleDecrease}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-white/20 transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="font-semibold w-6 text-center">{item.quantity}</span>
            <button
              onClick={handleIncrease}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          <span className="font-bold text-lg w-20 text-end">
            EGP {(item.price * item.quantity).toFixed(2)}
          </span>
          <button
            onClick={() => removeFromCart(item.id, item.variant, true)}
            className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 rounded-full transition-colors"
            title={rtl ? 'احذف الباقة' : 'Remove bundle'}
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
