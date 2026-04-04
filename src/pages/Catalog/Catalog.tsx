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
  TrendingDown
} from 'lucide-react';
import { ClassicElegantCard, Floating3DCard, MinimalPosterCard } from '../Home/components/ProductCardVariants';
import PremiumDropdown from '../../components/ui/PremiumDropdown';

/* --- List View Card Component --- */
const ListViewCard = ({ prod, rtl, onAdd }: any) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="glass-card w-full p-4 flex flex-col md:flex-row gap-6 items-center hover:bg-white/5 transition-colors"
  >
    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
      <button onClick={(e) => { e.preventDefault(); prod.onQuickView?.(); }} className="p-2 text-slate-400 hover:text-primary-500 bg-white/50 dark:bg-black/20 rounded-full backdrop-blur-md">
        العرض السريع
      </button>
    </div>
    <Link to={`/products/${prod.id}`} className="shrink-0 w-full md:w-48 h-48 rounded-xl bg-slate-100 dark:bg-[#111] border border-slate-200 dark:border-white/10 flex items-center justify-center relative overflow-hidden group">
      {prod.image_url ? (
        <img src={'http://localhost:5000' + prod.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <Package size={64} strokeWidth={1} className="text-slate-300 dark:text-white/20" />
      )}
    </Link>
    
    <div className="flex-grow flex flex-col justify-between h-full w-full space-y-4">
      <div>
        <div className="flex justify-between items-start">
          <Link to={`/products/${prod.id}`}>
            <h3 className="text-2xl font-bold hover:text-primary-500 transition-colors mb-2">
              {rtl ? prod.name_ar : prod.name_en}
            </h3>
          </Link>
          <span className="text-2xl font-extrabold text-primary-500">
            EGP {prod.price?.toFixed(2)}
          </span>
        </div>
        <p className="text-slate-500 line-clamp-3">
          {rtl ? prod.description_ar : prod.description_en}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-1 text-accent-500">
          <Star size={18} fill="currentColor" />
          <Star size={18} fill="currentColor" />
          <Star size={18} fill="currentColor" />
          <Star size={18} fill="currentColor" />
          <Star size={18} />
        </div>
        <button onClick={onAdd} className="btn-primary flex items-center gap-2 py-2">
           <ShoppingCart size={18} />
           {rtl ? 'إضافة للسلة' : 'Add to Cart'}
        </button>
      </div>
    </div>
  </motion.div>
);

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
        return isActive && matchesCat && matchesSearch && matchesPrice && matchesStock;
      })
      .sort((a, b) => {
        if (sortOrder === 'price-asc') return a.price - b.price;
        if (sortOrder === 'price-desc') return b.price - a.price;
        return 0; // newest relies on default DB insert order for now
      });
  }, [products, search, maxPrice, sortOrder, inStockOnly]);

  const handleAdd = (prod: any) => {
    addToCart({ id: prod.id, name: rtl ? prod.name_ar : prod.name_en, price: prod.price, quantity: 1, image: prod.image_url || (prod.images && prod.images[0]) });
    showToast(rtl ? `تمت إضافة ${prod.name_ar} للسلة` : `${prod.name_en} added to cart!`);
  }

  const sortOptions = [
    { value: 'newest', labelAr: 'الأحدث أولاً', labelEn: 'Newest First', icon: <Sparkles size={14} />, color: 'text-primary-500', bg: 'bg-primary-500/10' },
    { value: 'price-asc', labelAr: 'السعر: من الأقل', labelEn: 'Price: Low to High', icon: <TrendingUp size={14} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { value: 'price-desc', labelAr: 'السعر: من الأعلى', labelEn: 'Price: High to Low', icon: <TrendingDown size={14} />, color: 'text-rose-500', bg: 'bg-rose-500/10' }
  ];

  return (
    <div className="min-h-screen py-24 px-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <span className="text-primary-500 font-bold uppercase tracking-wider mb-2 block">
          {rtl ? 'اكتشف مجموعتنا' : 'Discover Our Collection'}
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
          {rtl ? 'جميع المنتجات' : 'All Products'}
        </h1>

        {/* Categories Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <button 
            onClick={() => handleSetCategory('all')}
            className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${activeCategory === 'all' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'}`}
          >
            {rtl ? 'الكل' : 'All'}
          </button>
          
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => handleSetCategory(cat.id)}
              className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${activeCategory === cat.id ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'}`}
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
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
              <SlidersHorizontal size={20} />
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
                onChange={(v) => setSortOrder(v as any)}
              />
            </div>
            
          </div>
        </motion.div>

        {/* PRODUCTS GRID / LIST */}
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-6 bg-slate-50 dark:bg-[#111] p-2 rounded-2xl border border-slate-200 dark:border-white/5">
            <p className="px-4 text-slate-500 font-medium">
              {rtl ? `عرض ${filteredProducts.length} منتج` : `Showing ${filteredProducts.length} products`}
            </p>
            <div className="flex bg-white dark:bg-[#1a1a1a] shadow-sm p-1 rounded-xl">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <ListIcon size={20} />
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
                      <ListViewCard prod={prodWithFns} rtl={rtl} onAdd={() => handleAdd(prod)} />
                    ) : (
                      <>
                        {cardStyle === 'classic' && <ClassicElegantCard prod={prodWithFns} rtl={rtl} onAdd={() => handleAdd(prod)} />}
                        {cardStyle === 'floating' && <Floating3DCard prod={prodWithFns} rtl={rtl} onAdd={() => handleAdd(prod)} />}
                        {cardStyle === 'minimal' && <MinimalPosterCard prod={prodWithFns} rtl={rtl} onAdd={() => handleAdd(prod)} />}
                      </>
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
