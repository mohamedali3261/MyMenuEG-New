import { useEffect } from 'react';
import { useStore } from '../../store/store';
import { motion } from 'framer-motion';
import CartItemComponent from './components/CartItem';
import CartBundleItem from './components/CartBundleItem';
import CartSummary from './components/CartSummary';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { cart, rtl, clearCart, branding } = useStore();

  useEffect(() => {
    document.title = `${rtl ? 'سلة المشتريات' : 'Shopping Cart'} | ${branding.storeName}`;
  }, [rtl, branding]);

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 min-h-[80vh]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <ShoppingBag className="text-primary-500" size={36} />
          {rtl ? 'سلة المشتريات' : 'Shopping Cart'}
        </h1>
        {cart.length > 0 && (
          <button onClick={clearCart} className="text-red-500 hover:text-red-600 font-semibold text-sm transition">
            {rtl ? 'إفراغ السلة' : 'Clear Cart'}
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card flex flex-col items-center justify-center p-16 text-center"
        >
          <div className="w-32 h-32 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
            <span className="text-6xl text-slate-300">🛒</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">{rtl ? 'سلتك فارغة' : 'Your cart is empty'}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
            {rtl ? 'لم تقم بإضافة أي منتجات إلى سلتك حتى الآن. استكشف منتجاتنا المميزة لتجد ما يناسبك.' : 'You haven\'t added any items to your cart yet. Browse our premium products to find what you need.'}
          </p>
          <Link to="/products" className="btn-primary">
            {rtl ? 'استكشف المنتجات' : 'Browse Products'}
          </Link>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <motion.div
                key={`${item.id}-${item.variant || ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {item.is_bundle ? (
                  <CartBundleItem item={item} />
                ) : (
                  <CartItemComponent item={item} />
                )}
              </motion.div>
            ))}
          </div>
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      )}
    </div>
  )
}
