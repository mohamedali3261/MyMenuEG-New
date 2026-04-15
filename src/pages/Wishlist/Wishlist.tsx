import { motion } from 'framer-motion';
import { useStore } from '../../store/store';
import { Heart, ShoppingCart, Trash2, ArrowRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart, rtl, showToast, branding } = useStore();

  useEffect(() => {
    document.title = `${rtl ? 'المفضلة' : 'Wishlist'} | ${branding.storeName}`;
  }, [rtl, branding]);

  const handleAddToCart = (product: { id: string; name_ar: string; name_en: string; price: number; image_url?: string }) => {
    addToCart({
      id: product.id,
      name: rtl ? product.name_ar : product.name_en,
      price: product.price,
      quantity: 1,
      image: product.image_url
    });
    showToast(rtl ? 'تمت الإضافة للسلة ✓' : 'Added to cart ✓');
  };

  const handleAddAllToCart = () => {
    wishlist.forEach(product => {
      addToCart({
        id: product.id,
        name: rtl ? product.name_ar : product.name_en,
        price: product.price,
        quantity: 1,
        image: product.image_url
      });
    });
    showToast(rtl ? 'تمت إضافة جميع المنتجات للسلة ✓' : 'All items added to cart ✓');
  };

  return (
    <div className="min-h-screen py-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-red-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-6"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10 border border-red-500/20">
            <Heart size={40} fill="currentColor" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
            {rtl ? 'قائمة المفضلة' : 'My Wishlist'}
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
            {rtl 
              ? `لديك ${wishlist.length} منتج${wishlist.length !== 1 ? 'ات' : ''} محفوظة في قائمة أمنياتك`
              : `You have ${wishlist.length} item${wishlist.length !== 1 ? 's' : ''} saved in your wishlist`}
          </p>
          {wishlist.length > 0 && (
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button
                onClick={handleAddAllToCart}
                className="flex items-center gap-2 px-8 py-3 bg-primary-500 text-white rounded-2xl font-bold hover:bg-primary-600 transition-all active:scale-95 shadow-xl shadow-primary-500/20"
              >
                <ShoppingCart size={18} />
                {rtl ? 'أضف الكل للسلة' : 'Add All to Cart'}
              </button>
              <Link
                to="/cart"
                className="flex items-center gap-2 px-8 py-3 bg-slate-100 dark:bg-white/5 border border-white/10 text-slate-700 dark:text-white rounded-2xl font-bold hover:bg-primary-500/10 hover:border-primary-500/30 transition-all"
              >
                {rtl ? 'الذهاب للسلة' : 'Go to Cart'}
                <ArrowRight size={18} className={rtl ? 'rotate-180' : ''} />
              </Link>
            </div>
          )}
        </motion.div>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center py-20"
          >
            <div className="w-32 h-32 mx-auto bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-8">
              <Heart size={64} className="text-slate-300 dark:text-slate-700" />
            </div>
            <h2 className="text-2xl font-bold mb-3">{rtl ? 'قائمة المفضلة فارغة' : 'Your Wishlist is Empty'}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              {rtl 
                ? 'لم تقم بإضافة أي منتجات لقائمة المفضلة بعد. تصفح منتجاتنا واضغط على أيقونة القلب لحفظ ما يعجبك.' 
                : 'You haven\'t added any products to your wishlist yet. Browse our products and tap the heart icon to save your favorites.'}
            </p>
            <Link 
              to="/products" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-white rounded-2xl font-bold hover:bg-primary-600 transition-all active:scale-95 shadow-xl shadow-primary-500/20"
            >
              {rtl ? 'استكشف المنتجات' : 'Browse Products'}
              <ArrowRight size={18} className={rtl ? 'rotate-180' : ''} />
            </Link>
          </motion.div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative bg-white/5 dark:bg-[#0b1120]/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-xl hover:border-primary-500/30 transition-all hover:-translate-y-1"
              >
                {/* Image */}
                <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-50 dark:bg-black/20">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={rtl ? product.name_ar : product.name_en}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                      <Package size={48} />
                    </div>
                  )}
                  
                  {/* Remove button */}
                  <button
                    onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all active:scale-90"
                  >
                    <Heart size={18} fill="currentColor" />
                  </button>

                  {/* Old price badge */}
                  {product.old_price > product.price && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-black">
                      -{Math.round(((product.old_price - product.price) / product.old_price) * 100)}%
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="p-5 space-y-3">
                  <Link to={`/products/${product.id}`}>
                    <h3 className="font-bold text-sm line-clamp-2 hover:text-primary-500 transition-colors">
                      {rtl ? product.name_ar : product.name_en}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-primary-500">EGP {product.price.toFixed(2)}</span>
                    {product.old_price > product.price && (
                      <span className="text-sm text-slate-400 line-through">EGP {product.old_price.toFixed(2)}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-grow flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:bg-primary-500 dark:hover:bg-primary-500 hover:text-white dark:hover:text-white transition-all active:scale-95 shadow-md"
                    >
                      <ShoppingCart size={16} />
                      {rtl ? 'أضف للسلة' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => toggleWishlist(product)}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90 border border-slate-200 dark:border-white/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
