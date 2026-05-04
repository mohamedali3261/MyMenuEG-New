import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/store';
import { 
  Search, 
  LayoutGrid, 
  List as ListIcon, 
  SlidersHorizontal, 
  ShoppingCart, 
  Star, 
  Package, 
  CheckSquare,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  Truck,
  ShieldCheck,
  Zap,
  Box
} from 'lucide-react';
import { ClassicElegantCard, Floating3DCard, MinimalPosterCard, InteractiveRevealCard } from '../Home/components/ProductCardVariants';
import ProductCard from '../../components/ProductCard';
import PremiumDropdown from '../../components/ui/PremiumDropdown';

type CatalogProduct = {
  id: string;
  category_id: string;
  status?: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  price: number;
  image_url?: string;
  images?: string[];
  old_price?: number;
};

/* --- List View Card Component --- */
const ListViewCard = ({ prod, rtl, onAdd, categories, wishlist, onToggleWishlist }: { 
  prod: CatalogProduct & { onQuickView?: () => void }, 
  rtl: boolean, 
  onAdd: () => void,
  categories: any[],
  wishlist: any[],
  onToggleWishlist: (p: any) => void
}) => {
  const category = categories.find(c => c.id === prod.category_id);
  const isFavorite = wishlist.some(p => p.id === prod.id);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card w-full p-4 flex flex-col md:flex-row gap-6 items-start hover:bg-white/5 transition-all duration-300 group relative overflow-hidden"
    >
      {/* Product Image */}
      <Link to={`/products/${prod.id}`} className="shrink-0 w-full md:w-56 h-56 rounded-2xl bg-slate-100 dark:bg-[#111] border border-slate-200 dark:border-white/10 flex items-center justify-center relative overflow-hidden group">
        {prod.image_url ? (
          <img src={'' + prod.image_url} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <Package size={64} strokeWidth={1} className="text-slate-300 dark:text-white/20" />
        )}
        
        {/* Category Badge on Image (Mobile) */}
        <div className="absolute top-3 right-3 md:hidden z-10 px-3 py-1 rounded-full bg-primary-500/90 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
          {rtl ? category?.name_ar : category?.name_en}
        </div>
      </Link>
      
      {/* Content Section */}
      <div className="flex-grow flex flex-col min-h-[14rem] w-full">
        <div className="flex justify-between items-start mb-2">
          <div className="space-y-1">
            <div className="hidden md:flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-500 text-[10px] font-black uppercase tracking-widest">
                {rtl ? category?.name_ar : category?.name_en}
              </span>
              {prod.old_price && prod.old_price > prod.price && (
                <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest">
                  {rtl ? 'خصم' : 'Sale'}
                </span>
              )}
            </div>
            <Link to={`/products/${prod.id}`}>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white hover:text-primary-500 transition-colors tracking-tight">
                {rtl ? prod.name_ar : prod.name_en}
              </h3>
            </Link>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-primary-500 tracking-tighter">
              <span className="text-sm font-bold mr-1 opacity-60">EGP</span>
              {prod.price?.toLocaleString()}
            </div>
            {prod.old_price && prod.old_price > prod.price && (
              <div className="text-sm text-slate-400 line-through font-bold opacity-60">
                EGP {prod.old_price.toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Description Section */}
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2 md:line-clamp-3 max-w-2xl">
          {rtl ? prod.description_ar : prod.description_en}
        </p>

        {/* Feature Tags / Extra Details */}
        <div className="flex flex-wrap gap-4 mb-auto">
           <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap bg-slate-100 dark:bg-white/5 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-white/5">
              <Truck size={14} className="text-primary-500" />
              {rtl ? 'شحن سريع' : 'Fast Shipping'}
           </div>
           <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap bg-slate-100 dark:bg-white/5 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-white/5">
              <ShieldCheck size={14} className="text-primary-500" />
              {rtl ? 'ضمان عامان' : '2 Year Warranty'}
           </div>
           <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap bg-slate-100 dark:bg-white/5 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-white/5">
              <Box size={14} className="text-primary-500" />
              {rtl ? 'جودة ممتازة' : 'Premium Quality'}
           </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Link 
              to={`/products/${prod.id}`}
              className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-primary-500 border border-slate-200 dark:border-white/10 shadow-sm transition-all hover:scale-110 active:scale-95"
              title={rtl ? 'عرض التفاصيل' : 'View Details'}
            >
              <Eye size={20} />
            </Link>
            <button 
              onClick={(e) => { e.preventDefault(); onToggleWishlist(prod); }}
              className={`relative p-2.5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm transition-all hover:scale-110 active:scale-90 ${isFavorite ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-red-500'}`}
              title={rtl ? 'إضافة للمفضلة' : 'Add to Wishlist'}
            >
              <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>

          <button 
            onClick={onAdd} 
            className="flex items-center gap-3 px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-black text-sm shadow-lg shadow-primary-500/20 transition-all hover:translate-y-[-2px] active:translate-y-0 active:scale-95"
          >
             <ShoppingCart size={18} />
             {rtl ? 'إضافة للسلة' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function Catalog() {
  const { rtl, cardStyle, addToCart, showToast, products, categories, isDataLoaded, branding } = useStore();
  
  useEffect(() => {
    document.title = `${rtl ? 'جميع المنتجات' : 'All Products'} | ${branding.storeName}`;
  }, [rtl, branding]);
  const [searchParams, setSearchParams] = useSearchParams();
  const catParam = searchParams.get('category');

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();
  
  // Filters
  const [activeCategory, setActiveCategory] = useState(catParam || 'all');

  useEffect(() => {
    if (catParam) setActiveCategory(catParam);
  }, [catParam]);

  const handleSetCategory = (id: string) => {
    setActiveCategory(id);
    if (id === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', id);
    }
    setSearchParams(searchParams);
  };
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState(10000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  const filteredProducts = useMemo(() => {
    if (!isDataLoaded) return [];
    return products
      .filter(p => {
        const isActive = p.status?.toLowerCase() === 'active';
        const matchesCat = activeCategory === 'all' || p.category_id === activeCategory;
        const matchesSearch = (p.name_ar || '').includes(search) || (p.name_en || '').includes(search);
        const matchesPrice = p.price <= maxPrice;
        const matchesStock = inStockOnly ? p.stock > 0 : true;
        const isBundle = p.bundle_items && p.bundle_items.length > 0;
        return isActive && matchesCat && matchesSearch && matchesPrice && matchesStock && !isBundle;
      })
      .sort((a, b) => {
        if (sortOrder === 'price-asc') return a.price - b.price;
        if (sortOrder === 'price-desc') return b.price - a.price;
        return 0; // newest relies on default DB insert order for now
      });
  }, [products, search, maxPrice, sortOrder, inStockOnly, activeCategory, isDataLoaded]);

  const handleAdd = (prod: CatalogProduct) => {
    addToCart({ id: prod.id, name: rtl ? prod.name_ar : prod.name_en, price: prod.price, quantity: 1, image: prod.image_url || (prod.images && prod.images[0]) });
    showToast(rtl ? `تمت إضافة ${prod.name_ar} للسلة` : `${prod.name_en} added to cart!`);
  }

  const sortOptions = [
    { value: 'newest', labelAr: 'الأحدث أولاً', labelEn: 'Newest First', icon: <Sparkles size={14} />, color: 'text-primary-500', bg: 'bg-primary-500/10' },
    { value: 'price-asc', labelAr: 'السعر: من الأقل', labelEn: 'Price: Low to High', icon: <TrendingUp size={14} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { value: 'price-desc', labelAr: 'السعر: من الأعلى', labelEn: 'Price: High to Low', icon: <TrendingDown size={14} />, color: 'text-rose-500', bg: 'bg-rose-500/10' }
  ];

  return (
    <div className="min-h-screen py-24 px-6 max-w-7xl mx-auto bg-transparent">
      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center mb-16"
      >
        {/* Decorative Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-[80px] -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-500 font-black text-[10px] uppercase tracking-[0.2em] mb-4 shadow-sm backdrop-blur-md">
           <Sparkles size={14} className="animate-pulse" />
           {rtl ? 'اكتشف مجموعتنا' : 'Discover Our Collection'}
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-10 text-primary-600 dark:text-primary-400 tracking-tight">
          {rtl ? 'جميع المنتجات' : 'All Products'}
        </h1>

        {/* Categories Pills Container */}
        <div className="relative inline-flex flex-wrap justify-center gap-2 p-2 bg-slate-100/50 dark:bg-white/5 backdrop-blur-xl rounded-full border border-slate-200 dark:border-white/10 shadow-2xl shadow-black/5">
          <button 
            onClick={() => handleSetCategory('all')}
            className={`px-6 md:px-8 py-2.5 rounded-full font-black text-xs md:text-sm transition-all duration-300 active:scale-95 ${activeCategory === 'all' ? 'bg-primary-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 hover:text-primary-500'}`}
          >
            {rtl ? 'الكل' : 'All'}
          </button>
          
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => handleSetCategory(cat.id)}
              className={`px-6 md:px-8 py-2.5 rounded-full font-black text-xs md:text-sm transition-all duration-300 active:scale-95 ${activeCategory === cat.id ? 'bg-primary-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 hover:text-primary-500'}`}
            >
              {rtl ? cat.name_ar : cat.name_en}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR FILTERS */}
        <motion.div 
          initial={{ opacity: 0, x: rtl ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-1/4 shrink-0"
        >
          <div className="glass-card p-6 sticky top-24">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4 text-slate-900 dark:text-white">
              <div className="relative p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                <SlidersHorizontal size={18} />
              </div>
              {rtl ? 'تصفية النتائج' : 'Filters'}
            </h3>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">{rtl ? 'بحث...' : 'Search...'}</label>
              <div className="relative">
                <Search size={18} className="absolute top-3 right-3 text-slate-400" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl py-2 px-10 focus:outline-none focus:border-primary-500" 
                />
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className="flex justify-between block text-sm font-medium mb-4">
                <span>{rtl ? 'السعر حتى' : 'Price up to'}</span>
                <span className="text-primary-500 font-bold">EGP {maxPrice}</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="10000" 
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary-500" 
              />
            </div>

            {/* In Stock Only */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div onClick={() => setInStockOnly(!inStockOnly)} className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${inStockOnly ? 'bg-primary-500 text-white' : 'bg-slate-200 dark:bg-white/10 text-transparent group-hover:bg-slate-300 dark:group-hover:bg-white/20'}`}>
                  <CheckSquare size={16} />
                </div>
                <span className="text-sm font-medium select-none">{rtl ? 'متوفر بالمخزون فقط' : 'In Stock Only'}</span>
              </label>
            </div>

            {/* Sort */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">{rtl ? 'ترتيب حسب' : 'Sort By'}</label>
              <PremiumDropdown 
                value={sortOrder}
                options={sortOptions}
                rtl={rtl}
                onChange={(v) => setSortOrder(v as 'newest' | 'price-asc' | 'price-desc')}
              />
            </div>
            
          </div>
        </motion.div>

        {/* PRODUCTS GRID / LIST */}
        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 relative p-2 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 backdrop-blur-md">
            <p className="px-4 text-slate-500 font-bold text-sm uppercase tracking-widest opacity-60">
              {rtl ? `عرض ${filteredProducts.length} منتج` : `Showing ${filteredProducts.length} products`}
            </p>
            <div className="flex items-center gap-1.5 p-1 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-sm">
              <button 
                onClick={() => setViewMode('grid')}
                className={`relative p-2.5 rounded-xl transition-all duration-300 active:scale-95 ${viewMode === 'grid' ? 'bg-primary-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-primary-500 hover:bg-white dark:hover:bg-white/5'}`}
                title={rtl ? 'عرض شبكي' : 'Grid View'}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`relative p-2.5 rounded-xl transition-all duration-300 active:scale-95 ${viewMode === 'list' ? 'bg-primary-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-primary-500 hover:bg-white dark:hover:bg-white/5'}`}
                title={rtl ? 'عرض قائمة' : 'List View'}
              >
                <ListIcon size={18} />
              </button>
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {filteredProducts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center py-24 text-slate-400"
              >
                <Search size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-xl">{rtl ? 'لم نجد أي منتجات تطابق بحثك.' : 'No products match your search.'}</p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-6"}
              >
                {filteredProducts.map((prod) => {
                  const prodWithFns = { ...prod, onQuickView: () => navigate(`/products/${prod.id}`) };
                  return (
                  <div key={prod.id}>
                    {viewMode === 'list' ? (
                      <ListViewCard 
                        prod={prodWithFns} 
                        rtl={rtl} 
                        onAdd={() => handleAdd(prod)} 
                        categories={categories}
                        wishlist={useStore.getState().wishlist}
                        onToggleWishlist={(p) => useStore.getState().toggleWishlist(p)}
                      />
                    ) : (
                      <ProductCard product={prodWithFns} />
                    )}
                  </div>
                )})}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}
