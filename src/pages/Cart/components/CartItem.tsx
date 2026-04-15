import { useStore } from '../../../store/store';
import { Trash2, Plus, Minus } from 'lucide-react';

interface Props {
  item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    variant?: string;
  }
}

export default function CartItem({ item }: Props) {
  const { rtl, removeFromCart, addToCart, decreaseQuantity } = useStore();

  const handleDecrease = () => {
    decreaseQuantity(item.id, item.variant);
  };

  const handleIncrease = () => {
    addToCart({ ...item, quantity: 1 });
  };

  return (
    <div className="glass-card flex sm:flex-row flex-col items-center gap-6 p-4">
      {/* Product Image */}
      <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 text-3xl overflow-hidden relative">
        {item.image ? (
          <img src={item.image.startsWith('http') ? item.image : '' + item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span>📦</span>
        )}
      </div>

      <div className="flex-grow text-center sm:text-start w-full">
        <h3 className="font-bold text-lg mb-1">{item.name}</h3>
        {item.variant && (
          <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1.5 bg-slate-100 dark:bg-white/5 inline-block px-2 py-0.5 rounded-full">
            {rtl ? 'العدد:' : 'Qty:'} {item.variant}
          </p>
        )}
        <p className="text-primary-600 dark:text-primary-400 font-extrabold max-sm:mb-4">
          EGP {item.price.toFixed(2)}
        </p>
      </div>

      <div className="flex items-center gap-6 sm:w-auto w-full justify-between sm:justify-end">
        {/* Quantity Controls */}
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
            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-500 hover:text-white transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Total & Remove */}
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg w-20 text-end">
            EGP {(item.price * item.quantity).toFixed(2)}
          </span>
          <button 
            onClick={() => removeFromCart(item.id, item.variant)}
            className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 rounded-full transition-colors"
            title={rtl ? 'احذف المنتج' : 'Remove item'}
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
