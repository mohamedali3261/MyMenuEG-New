import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingCart, Trash2, ArrowRight, Package } from 'lucide-react';
import { useStore } from '../store/store';
import { Link } from 'react-router-dom';

export default function FavoritesDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { wishlist, toggleWishlist, addToCart, rtl, showToast, branding } = useStore();

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: rtl ? product.name_ar : product.name_en,
      price: product.price,
      quantity: 1,
      image: product.image_url
    });
    showToast(rtl ? 'تمت الإضافة للسلة' : 'Added to cart');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: rtl ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: rtl ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 bottom-0 w-full max-w-md bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-2xl z-[101] shadow-2xl flex flex-col ${
              rtl ? 'left-0 border-r' : 'right-0 border-l'
            } border-white/10`}
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                  <Heart size={20} fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{rtl ? 'المفضلة' : 'Favorites'}</h2>
                  <p className="text-xs text-slate-400 font-medium">{wishlist.length} {rtl ? 'منتجات' : 'Items Saved'}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="flex-grow overflow-y-auto p-6">
              {wishlist.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-slate-700"
                  >
                    <Heart size={48} />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-lg">{rtl ? 'قائمة الأمنيات فارغة' : 'Your Wishlist is Empty'}</h3>
                    <p className="text-sm text-slate-400 max-w-[240px] mt-2">
                      {rtl ? 'ابدأ بإضافة المنتجات التي تعجبك لتجدها هنا لاحقاً' : 'Start adding products you love to find them here later.'}
                    </p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-2xl font-bold hover:bg-primary-600 transition-all active:scale-95"
                  >
                    {rtl ? 'تصفح المتجر' : 'Browse Store'} <ArrowRight size={18} className={rtl ? 'rotate-180' : ''} />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {wishlist.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: 50 }}
                        className="group relative flex gap-4 p-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-red-500/30 transition-all shadow-sm"
                      >
                        <div className="w-20 h-20 rounded-xl bg-slate-50 dark:bg-black/20 overflow-hidden flex-shrink-0">
                          {item.image_url ? (
                            <img src={'http://localhost:5000' + item.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={24} /></div>
                          )}
                        </div>
                        <div className="flex-grow flex flex-col justify-between py-1">
                          <div>
                            <h4 className="font-bold text-sm line-clamp-1">{rtl ? item.name_ar : item.name_en}</h4>
                            <p className="text-primary-500 font-black text-sm mt-1">EGP {item.price.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                             <button 
                               onClick={() => handleAddToCart(item)}
                               className="flex-grow flex items-center justify-center gap-2 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold hover:bg-primary-500 dark:hover:bg-primary-500 hover:text-white transition-all active:scale-95"
                             >
                               <ShoppingCart size={14} /> {rtl ? 'أضف' : 'Add'}
                             </button>
                             <Link 
                               to="/cart"
                               onClick={onClose}
                               className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg transition-all active:scale-75"
                             >
                               <ShoppingCart size={14} />
                             </Link>
                             <button 
                               onClick={() => toggleWishlist(item)}
                               className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all active:scale-75"
                             >
                               <Trash2 size={14} />
                             </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {wishlist.length > 0 && (
              <div className="p-6 border-t border-white/5 bg-slate-50/50 dark:bg-black/20 backdrop-blur-md">
                <Link 
                  to="/cart"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-primary-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all active:scale-95 group"
                >
                  <ShoppingCart size={18} className="group-hover:rotate-12 transition-transform" />
                  {rtl ? 'الذهاب للسلة' : 'Go to Cart'}
                </Link>
                <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-black opacity-30 mt-4">
                  {branding.storeName} Luxury Experience
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
