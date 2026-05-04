import { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store/store';
import ProductCard from '../../components/ProductCard';
import ProductPageSlider from '../Home/components/ProductPageSlider';
import DynamicPagesStrip from '../Home/components/DynamicPagesStrip';
import { 
  Sparkles, 
  Home, 
  ChevronRight, 
  TrendingUp, 
  ChevronDown,
  ShoppingBag,
  Search,
  Clock,
  Star,
  Zap
} from 'lucide-react';
import { api } from '../../api';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AxiosError } from 'axios';
import { usePageSEO } from './usePageSEO';

type DynamicPageInfo = {
  id: string;
  slug: string;
  status?: string | null;
  name_ar?: string | null;
  name_en?: string | null;
  meta_title?: string | null;
  meta_desc?: string | null;
  banner_url?: string | null;
  banner_size?: string | null;
  views?: number | null;
  spotlight_product_id?: string | null;
  countdown_end_date?: string | null;
  show_search?: boolean | null;
};

export default function DynamicPage() {
  const { rtl, products, isDataLoaded, branding, categories, addToCart } = useStore();
  const { slug } = useParams();
  const navigate = useNavigate();

  // Advanced Features State
  const [searchQuery, setSearchQuery] = useState('');
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  // Parallax Setup
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 800], [0, 250]);
  const opacityFade = useTransform(scrollY, [0, 400], [1, 0.5]);
  const [pageInfo, setPageInfo] = useState<DynamicPageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchPageInfo = async () => {
      if (!slug) {
        navigate('/not-found', { replace: true });
        return;
      }

      setLoading(true);
      setPageError(null);
      try {
        const res = await api.get(`/pages/${slug}`);
        setPageInfo(res.data as DynamicPageInfo);
      } catch (err) {
        const error = err as AxiosError;
        if (error.response?.status === 404) {
          // Backward-compatible fallback in case the running backend
          // does not yet support GET /pages/:slug.
          try {
            const listRes = await api.get('/pages');
            const pages = listRes.data as DynamicPageInfo[];
            const current = pages.find((p) => p.slug === slug && p.status !== 'draft');
            if (current) {
              setPageInfo(current);
              return;
            }
          } catch (fallbackErr) {
            console.error(fallbackErr);
          }
          navigate('/not-found', { replace: true });
        } else {
          console.error(err);
          setPageInfo(null);
          setPageError(
            rtl
              ? 'حدث خطأ أثناء تحميل الصفحة. حاول مرة أخرى.'
              : 'Failed to load this page. Please try again.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPageInfo();
  }, [slug, navigate, retryCount, rtl]);

  useEffect(() => {
    if (pageInfo?.id) {
      api.post(`/pages/${pageInfo.id}/view`).catch(console.error);
    }
  }, [pageInfo?.id]);

  usePageSEO({ pageInfo, rtl, storeName: branding.storeName });

  // Keep hooks order stable across all renders.
  // Countdown Logic
  useEffect(() => {
    if (!pageInfo?.countdown_end_date) return;
    
    const interval = setInterval(() => {
      const end = new Date(pageInfo.countdown_end_date!).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(interval);
      } else {
        setTimeLeft({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pageInfo?.countdown_end_date]);

  const filteredProducts = useMemo(() => {
    if (!products || !pageInfo) return [];
    const pageProducts = products.filter(p => p.page_id === pageInfo.id && p.status === 'active' && !((p as any).bundle_items && (p as any).bundle_items.length > 0));
    
    if (!searchQuery.trim()) return pageProducts;
    
    const q = searchQuery.toLowerCase().trim();
    return pageProducts.filter(p => 
      (p.name_ar || '').toLowerCase().includes(q) || 
      (p.name_en || '').toLowerCase().includes(q) ||
      (p.description_ar || '').toLowerCase().includes(q) ||
      (p.description_en || '').toLowerCase().includes(q)
    );
  }, [products, pageInfo, searchQuery]);

  const spotlightProduct = useMemo(() => {
    if (!pageInfo?.spotlight_product_id || !products) return null;
    return products.find(p => p.id === pageInfo.spotlight_product_id);
  }, [pageInfo?.spotlight_product_id, products]);

  const categorizedProducts = useMemo(
    () =>
      categories
        .map((cat) => ({
          ...cat,
          products: filteredProducts.filter((p) => p.category_id === cat.id),
        }))
        .filter((cat) => cat.products.length > 0),
    [categories, filteredProducts]
  );

  if (loading || !isDataLoaded) {
    return (
      <div className="min-h-screen container mx-auto px-6 mt-12 space-y-16 animate-pulse">
        <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800/70"></div>
        <div className="space-y-6">
          <div className="h-8 w-72 rounded-lg bg-slate-200 dark:bg-slate-800/70"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800/70"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass-card max-w-xl w-full p-10 text-center text-slate-600 dark:text-slate-300">
          <Sparkles size={52} className="mx-auto mb-5 opacity-30" />
          <h2 className="text-2xl font-black mb-3 text-accent-600 dark:text-accent-400">
            {rtl ? 'تعذر تحميل الصفحة' : 'Unable to load page'}
          </h2>
          <p className="mb-6 opacity-80">{pageError}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              type="button"
              onClick={() => setRetryCount((prev) => prev + 1)}
              className="px-5 py-2.5 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition"
            >
              {rtl ? 'إعادة المحاولة' : 'Retry'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/', { replace: true })}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {rtl ? 'العودة للرئيسية' : 'Back to Home'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!pageInfo) return <div className="min-h-screen" />;

  return (
    <div className="min-h-screen pb-24 overflow-hidden relative">
      {/* 1. Dynamic Page Banner - ULTRA PREMIUM HERO */}
      {pageInfo?.banner_url && (
          <div 
            className={`w-full relative overflow-hidden group mb-12 shadow-2xl -mt-28 lg:-mt-32 ${
              pageInfo.banner_size === 'small' ? 'h-[40vh] md:h-[45vh]' : 
              pageInfo.banner_size === 'large' ? 'h-[100vh]' : 
              'h-[60vh] md:h-[65vh]'
            }`}
          >
             {/* Parallax Image Container */}
             <motion.div 
               style={{ y: yParallax, opacity: opacityFade }}
               className="absolute inset-x-0 top-0 h-[120%] w-full pointer-events-none"
             >
               <img 
                 src={pageInfo.banner_url} 
                 alt="" 
                 className="w-full h-full object-cover" 
               />
             </motion.div>
             
             {/* Complex Premium Overlays */}
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60 pointer-events-none" />
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(var(--primary-500-rgb),0.15),transparent_70%)] pointer-events-none" />
             
             {/* 1.1 Glass Breadcrumbs */}
             <div className="absolute top-44 left-0 right-0 z-[40] pointer-events-none">
                <div className="container mx-auto px-6">
                   <motion.div 
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 text-[10px] font-black text-white uppercase tracking-widest shadow-xl pointer-events-auto cursor-pointer"
                   >
                     <Link to="/" className="hover:text-primary-400 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg relative z-[45] pointer-events-auto"><Home size={10}/> {rtl ? 'الرئيسية' : 'Home'}</Link>
                     <ChevronRight size={10} className={`${rtl ? 'rotate-180' : ''} opacity-40`} />
                     <span className="opacity-70">{rtl ? pageInfo.name_ar : pageInfo.name_en}</span>
                   </motion.div>
                </div>
             </div>

             
             {/* 1.3 Main Title Section */}
             <div className="absolute bottom-10 md:bottom-16 left-0 right-0 z-20 container mx-auto px-6">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  <div className="flex flex-col gap-3">
                    <span className="text-primary-500 font-black text-sm md:text-xl uppercase tracking-[0.5em] drop-shadow-lg">
                      {rtl ? 'اكتشف مجموعتنا' : 'Exploration / Collections'}
                    </span>
                    <h1 className="text-4xl md:text-7xl font-black text-white mb-6 drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)] leading-none uppercase">
                      {rtl ? pageInfo.name_ar : pageInfo.name_en}
                    </h1>
                  </div>
                </motion.div>
             </div>

             {/* 1.4 Scroll Indicator (Mouse) */}
             {pageInfo.banner_size !== 'small' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2"
                >
                   <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1.5">
                      <motion.div 
                        animate={{ y: [0, 12, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-1 h-2 bg-primary-500 rounded-full"
                      />
                   </div>
                   <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">{rtl ? 'انزل للأسفل' : 'Scroll Down'}</span>
                </motion.div>
             )}

             {/* Reflection sweep animation */}
             <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] group-hover:left-[150%] transition-all duration-[3000ms] pointer-events-none" />
          </div>
      )}

       {/* 2. Countdown Banner */}
       {timeLeft && (
         <div className="container mx-auto px-6 -mt-10 relative z-40">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               className="bg-white dark:bg-[#0f172a] shadow-2xl rounded-3xl p-6 border border-primary-500/10 flex flex-col md:flex-row items-center justify-between gap-6"
            >
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                     <Clock className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase text-slate-800 dark:text-white">
                       {rtl ? 'ينتهي العرض قريباً!' : 'Offer Ends Soon!'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                       {rtl ? 'احصل على منتجاتك قبل فوات الأوان' : 'Grab your favorites before they are gone'}
                    </p>
                  </div>
               </div>
               
               <div className="flex items-center gap-2 md:gap-4">
                  {[
                    { val: timeLeft.d, label: rtl ? 'يوم' : 'D' },
                    { val: timeLeft.h, label: rtl ? 'ساعة' : 'H' },
                    { val: timeLeft.m, label: rtl ? 'دقيقة' : 'M' },
                    { val: timeLeft.s, label: rtl ? 'ثانية' : 'S' }
                  ].map((unit, i) => (
                    <div key={i} className="flex flex-col items-center">
                       <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-white/10">
                          <span className="text-xl md:text-2xl font-black text-primary-500">{String(unit.val).padStart(2, '0')}</span>
                       </div>
                       <span className="text-[10px] mt-1 font-bold text-slate-400 uppercase">{unit.label}</span>
                    </div>
                  ))}
               </div>
            </motion.div>
         </div>
       )}

       {/* 3. Product Spotlight Section */}
       {spotlightProduct && (
         <div className="container mx-auto px-6 mt-20">
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               className="relative group rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-slate-900 to-primary-900 shadow-3xl min-h-[400px] flex flex-col md:flex-row items-center border border-white/5"
            >
               <div className="flex-1 p-10 md:p-16 z-10 relative text-left">
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                        <Star size={12} fill="currentColor" /> {rtl ? 'منتج الأسبوع المتميز' : 'Product Spotlight'}
                     </div>
                     {categories.find(c => c.id === spotlightProduct.category_id) && (
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold text-white/80 uppercase tracking-widest border border-white/5">
                          {rtl ? categories.find(c => c.id === spotlightProduct.category_id)?.name_ar : categories.find(c => c.id === spotlightProduct.category_id)?.name_en}
                       </div>
                     )}
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                    {rtl ? spotlightProduct.name_ar : spotlightProduct.name_en}
                  </h2>
                  <p className="text-white/60 text-base mb-8 max-w-sm line-clamp-2">
                    {rtl ? spotlightProduct.description_ar : spotlightProduct.description_en}
                  </p>
                  <div className="flex items-center gap-6 mb-10">
                     <div className="flex flex-col">
                        <div className="text-4xl md:text-5xl font-black text-primary-400">
                           {branding.currency} {spotlightProduct.price}
                        </div>
                        {spotlightProduct.old_price > spotlightProduct.price && (
                          <div className="flex items-center gap-3 mt-1">
                             <span className="text-white/40 line-through text-lg font-bold">
                                {branding.currency} {spotlightProduct.old_price}
                             </span>
                             <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md animate-pulse">
                                {Math.round(((spotlightProduct.old_price - spotlightProduct.price) / spotlightProduct.old_price) * 100)}% {rtl ? 'خصم' : 'OFF'}
                             </span>
                          </div>
                        )}
                     </div>
                  </div>
                  <button 
                    onClick={() => {
                      addToCart({
                        id: spotlightProduct.id,
                        name: rtl ? spotlightProduct.name_ar : spotlightProduct.name_en,
                        price: spotlightProduct.price,
                        quantity: 1,
                        image: spotlightProduct.image_url
                      });
                      // If showToast is available in store
                      const showToast = (useStore.getState() as any).showToast;
                      if (showToast) {
                        showToast(rtl ? `تمت إضافة ${spotlightProduct.name_ar} للسلة` : `${spotlightProduct.name_en} added to cart!`);
                      }
                    }}
                    className="px-10 py-5 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-primary-500/20 transform transition active:scale-95 flex items-center gap-3"
                  >
                     <ShoppingBag /> {rtl ? 'أضف للسلة الآن' : 'Add to Cart Now'}
                  </button>
               </div>

               <div className="flex-1 w-full h-[400px] md:h-full relative overflow-hidden">
                  <img 
                    src={spotlightProduct.image_url} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    alt="Spotlight" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent hidden md:block" />
               </div>
               
               <Zap className="absolute top-10 right-10 text-white/5 w-64 h-64 rotate-12 -z-0" />
            </motion.div>
         </div>
       )}

      {/* Dynamic Page Product-Focused Slider */}
      {pageInfo && <ProductPageSlider pageId={pageInfo.id} />}

      <div className="container mx-auto px-6 space-y-20 relative z-10 pt-12">
        {/* Internal Smart Search */}
        {pageInfo.show_search && (
          <div className="max-w-2xl mx-auto mb-12">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                <input 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  type="text" 
                  placeholder={rtl ? 'البحث في منتجات هذه الصفحة...' : 'Search within these products...'}
                  className="w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                />
             </div>
          </div>
        )}

        {/* Dynamic Pages Strip - Products for this page */}
        <DynamicPagesStrip pageId={pageInfo.id} />
        {!pageInfo?.banner_url && (
           <h1 className="text-4xl md:text-5xl font-black mb-12 text-slate-900 dark:text-white">
             {rtl ? pageInfo.name_ar : pageInfo.name_en}
           </h1>
        )}
        {categorizedProducts.length === 0 ? (
          <div className="glass-card p-20 text-center text-slate-500">
            <Sparkles size={64} className="mx-auto mb-6 opacity-20" />
            <h2 className="text-2xl font-bold mb-2 text-accent-600 dark:text-accent-400">{rtl ? 'لا توجد منتجات حالياً' : 'No products found'}</h2>
            <p className="opacity-60">{rtl ? 'سيتم إضافة المنتجات قريباً لهذه الصفحة.' : 'Products will be added soon to this page.'}</p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="px-5 py-2.5 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition"
              >
                {rtl ? 'تصفح المنتجات المتاحة' : 'Browse Available Products'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/track')}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {rtl ? 'تتبع طلبك' : 'Track Your Order'}
              </button>
            </div>
          </div>
        ) : (
          categorizedProducts.map((cat) => (
            <div key={cat.id} className="space-y-8">
              {/* Category Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-white/5 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-1 bg-primary-500 rounded-full"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-500/80">
                      {rtl ? 'تصفح القسم' : 'BROWSE CATEGORY'}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight text-primary-600 dark:text-primary-400 uppercase">
                    {rtl ? cat.name_ar : cat.name_en}
                  </h2>
                  {(rtl ? cat.subtitle_ar : cat.subtitle_en) && (
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-2xl">
                      {rtl ? cat.subtitle_ar : cat.subtitle_en}
                    </p>
                  )}
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {cat.products.map((p, pIdx) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: pIdx * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
