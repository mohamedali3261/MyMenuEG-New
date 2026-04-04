import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useStore } from '../../store/store';
import ProductCard from '../../components/ProductCard';
import { 
  Trash2, GlassWater, ShoppingBag, 
  Pizza, Box, CircleDot, Layout, Layers,
  Droplets, Coffee, Utensils, Zap, Palette,
  Briefcase, Archive, Container, CupSoda,
  Sparkles, ChevronRight
} from 'lucide-react';

const CATEGORY_MAP: Record<string, any> = {
  'cat-can-plastic': { icon: <Container size={24} />, color: 'from-blue-500 to-indigo-600' },
  'cat-can-plastic-cups': { icon: <CupSoda size={24} />, color: 'from-cyan-500 to-blue-600' },
  'cat-general-cups': { icon: <GlassWater size={24} />, color: 'from-teal-500 to-emerald-600' },
  'cat-single-cups-1c': { icon: <Zap size={24} />, color: 'from-amber-500 to-orange-600' },
  'cat-single-cups-2c': { icon: <Palette size={24} />, color: 'from-orange-500 to-red-600' },
  'cat-fabric-bags': { icon: <ShoppingBag size={24} />, color: 'from-stone-500 to-stone-700' },
  'cat-kraft-bags': { icon: <Briefcase size={24} />, color: 'from-amber-700 to-orange-900' },
  'cat-pizza-boxes': { icon: <Pizza size={24} />, color: 'from-red-600 to-orange-700' },
  'cat-paper-boxes': { icon: <Box size={24} />, color: 'from-yellow-600 to-amber-800' },
  'cat-paper-box-item': { icon: <Archive size={24} />, color: 'from-slate-400 to-slate-600' },
  'cat-lids': { icon: <CircleDot size={24} />, color: 'from-blue-300 to-blue-500' },
  'cat-cup-holders': { icon: <Layout size={24} />, color: 'from-indigo-500 to-purple-600' },
  'cat-sandwich-covers': { icon: <Layers size={24} />, color: 'from-lime-500 to-green-600' },
  'cat-plastic-cups-1c': { icon: <Droplets size={24} />, color: 'from-sky-500 to-blue-600' },
  'cat-plastic-cups-2c': { icon: <Coffee size={24} />, color: 'from-pink-500 to-purple-600' },
  'cat-double-paper-cups': { icon: <Container size={24} />, color: 'from-cyan-600 to-blue-800' },
  'cat-cutlery-covers': { icon: <Utensils size={24} />, color: 'from-slate-600 to-slate-800' },
  'cat-consumables': { icon: <Trash2 size={24} />, color: 'from-orange-600 to-red-600' }
};

export default function Disposables() {
  const { rtl, products, categories, isDataLoaded, branding } = useStore();
  const { hash } = useLocation();

  useEffect(() => {
    document.title = `${rtl ? 'منتجاتنا' : 'Departments'} | ${branding.storeName}`;
  }, [rtl, branding]);

  useEffect(() => {
    if (isDataLoaded && hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          const offset = 100;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }, 100);
      }
    } else if (isDataLoaded && !hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hash, isDataLoaded]);

  // Show ALL categories that have products — no hardcoded filter
  const activeCategories = categories;

  if (!isDataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen pt-4">
      {/* Hero Header */}
      <section className="relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden mb-12">
         <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/40 to-slate-950 z-10" />
            <img 
              src="https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=2070&auto=format&fit=crop" 
              className="w-full h-full object-cover scale-110 blur-sm"
              alt="Disposables"
            />
         </div>

         <div className="container mx-auto px-6 relative z-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-500 text-sm font-bold mb-6 backdrop-blur-md"
            >
              <Sparkles size={16} />
              {rtl ? 'كتالوج مستلزمات الفنادق والمطاعم' : 'Hospitality Supplies Catalog'}
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black mb-6 tracking-tight"
            >
              {rtl ? 'القطع القابلة للتخلص منها' : 'Disposables Department'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium"
            >
              {rtl 
                ? 'تشكيلة واسعة من مستلزمات المطاعم، التعبئة، والقفازات ذات الجودة العالية للاستخدام الواحد.' 
                : 'A wide range of high-quality single-use restaurant supplies, packaging, and safety gear.'}
            </motion.p>
         </div>
      </section>

      {/* Sticky Quick Nav */}
      <div className="sticky top-24 z-40 mb-16 px-6">
         <div className="max-w-7xl mx-auto glass rounded-3xl p-2 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {activeCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToSection(cat.id)}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-white/5 transition-all whitespace-nowrap group"
              >
                <div className={`p-2 rounded-xl bg-gradient-to-br ${CATEGORY_MAP[cat.id]?.color ?? 'from-slate-400 to-slate-600'} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  {CATEGORY_MAP[cat.id]?.icon ?? <Sparkles size={24} />}
                </div>
                <span className="font-black text-sm uppercase tracking-widest opacity-80 group-hover:opacity-100">
                  {rtl ? cat.name_ar : cat.name_en}
                </span>
              </button>
            ))}
         </div>
      </div>

      {/* Featured Picks Section */}
      <section className="container mx-auto px-6 mb-24">
         <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                  <Sparkles size={24} />
               </div>
               <h2 className="text-3xl md:text-5xl font-black">{rtl ? 'أفضل المختارات' : 'Featured Picks'}</h2>
            </div>
            <div className="h-0.5 flex-grow mx-8 bg-white/5 hidden md:block" />
         </div>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.filter(p => p.is_best_seller).map(p => (
               <ProductCard key={p.id} product={p} />
            ))}
         </div>
      </section>

      {/* Category Sections */}

      <div className="container mx-auto px-6 space-y-32 pb-32">
        {activeCategories.map((cat) => {
          const catProducts = products.filter(p => p.category_id === cat.id);
          if (catProducts.length === 0) return null;

          return (
            <motion.section 
              key={cat.id} 
              id={cat.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative"
            >
              {/* background accent */}
              <div className={`absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br ${CATEGORY_MAP[cat.id]?.color ?? 'from-slate-400 to-slate-600'} opacity-[0.03] blur-[120px] rounded-full pointer-events-none`} />

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${CATEGORY_MAP[cat.id]?.color ?? 'from-slate-400 to-slate-600'} flex items-center justify-center text-white shadow-2xl`}>
                        {CATEGORY_MAP[cat.id]?.icon ?? <Sparkles size={24} />}
                     </div>
                     <div className="h-0.5 w-12 bg-white/10" />
                     <span className="text-primary-500 font-black text-sm uppercase tracking-[0.2em]">
                        {rtl ? 'الأصناف' : 'Collection'}
                     </span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                    {rtl ? cat.name_ar : cat.name_en}
                  </h2>
                  <p className="text-slate-400 max-w-xl font-medium">
                    {rtl 
                      ? 'تصفح قائمة القطع المختارة بعناية لأعلى معطيات الجودة والكفاءة.' 
                      : 'Explore our carefully curated list of high-standard disposable items for your business.'}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                   <div className="text-right hidden md:block">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{rtl ? 'النماذج' : 'ITEMS'}</p>
                      <p className="text-2xl font-black text-white">{catProducts.length}</p>
                   </div>
                   <button className="btn-secondary group flex items-center gap-2 px-8">
                      {rtl ? 'مشاهدة الكل' : 'View All'}
                      <ChevronRight size={16} className={`group-hover:translate-x-1 transition-transform ${rtl ? 'rotate-180' : ''}`} />
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 overflow-x-auto pb-4 scrollbar-hide md:overflow-visible">
                {catProducts.map(p => (
                   <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>

      {/* Marketing Footer Section */}
      <section className="container mx-auto px-6 mb-32">
         <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 border border-white/5 p-12 md:p-24 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10 opacity-50" />
            <div className="relative z-10 max-w-4xl mx-auto">
               <h3 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
                 {rtl ? 'أفضل حلول التغليف والضيافة في مكان واحد.' : 'The Best Packaging & Hospitality Solutions in One Place.'}
               </h3>
               <p className="text-xl text-slate-400 mb-12 font-medium">
                 {rtl 
                   ? 'نحن نخدم أكثر من 500 مطعم وفندق في جميع أنحاء الجمهورية بأعلى معايير الجودة.' 
                   : 'Serving over 500+ restaurants and hotels nationwide with premium quality standards.'}
               </p>
               <button className="btn-primary h-16 px-12 text-lg rounded-2xl shadow-2xl shadow-primary-500/20">
                 {rtl ? 'تواصل مع فريق المبيعات' : 'Contact Sales Team'}
               </button>
            </div>
         </div>
      </section>
    </div>
  );
}
