import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/store';
import { ShoppingCart, Moon, Sun, Languages, Search, X, Package, Tag, Heart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MegaMenu from './MegaMenu';
import FavoritesDrawer from './FavoritesDrawer';
import { CATEGORY_ICONS } from '../constants/categoryIcons';

export default function Navbar() {
  const { theme, toggleTheme, rtl, toggleRtl, cart, wishlist, branding, products, categories } = useStore();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const menuTimeoutRef = useRef<any>(null);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsFavoritesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  useEffect(() => {
    if (search.trim().length > 1) {
      const filtered = products.filter(p =>
        (rtl ? p.name_ar : p.name_en).toLowerCase().includes(search.toLowerCase())
      );
      setResults(filtered.slice(0, 5));
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [search, products, rtl]);

  const handleMenuEnter = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setShowMegaMenu(true);
  };

  const handleMenuLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setShowMegaMenu(false);
    }, 150);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4">
      {/* Main Navbar Container */}
      <div className="max-w-7xl mx-auto glass rounded-2xl flex items-center justify-between px-4 md:px-6 py-4 relative border border-white/10 shadow-2xl backdrop-blur-xl">

        {/* Logo */}
        <Link to="/" className="text-xl md:text-2xl font-bold flex items-center gap-2 z-[60]">
           {branding.logoUrl ? (
             <img src={'http://localhost:5000' + branding.logoUrl} alt={branding.storeName} className="h-8 md:h-10 w-auto object-contain" />
           ) : (
             <div className="flex items-center">
                <span className="text-primary-500 font-extrabold">{branding.storeName.substring(0, 2)}</span>
                <span className="text-slate-900 dark:text-white font-extrabold">{branding.storeName.substring(2)}</span>
             </div>
           )}
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 font-medium">
          <Link to="/" className="hover:text-primary-500 transition-colors whitespace-nowrap text-sm font-bold uppercase tracking-widest">{rtl ? 'الرئيسية' : 'Home'}</Link>
          <Link to="/products" className="hover:text-primary-500 transition-colors whitespace-nowrap text-sm font-bold uppercase tracking-widest">{rtl ? 'المنتجات' : 'Products'}</Link>

          <div
            className="relative"
            onMouseEnter={handleMenuEnter}
            onMouseLeave={handleMenuLeave}
          >
            <Link
              to="/disposables"
              className={`hover:text-primary-500 transition-colors whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest border ${showMegaMenu ? 'bg-primary-500/10 border-primary-500/20 text-primary-500' : 'border-transparent'}`}
            >
              {rtl ? 'الأقسام' : 'Categories'}
            </Link>

            <AnimatePresence>
              {showMegaMenu && (
                <div
                  className="pt-3"
                  style={{
                    position: 'fixed',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: '80px',
                    width: 'min(920px, 98vw)',
                    zIndex: 200,
                  }}
                  onMouseEnter={handleMenuEnter}
                  onMouseLeave={handleMenuLeave}
                >
                  <MegaMenu categories={categories} rtl={rtl} onClose={() => setShowMegaMenu(false)} />
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Bar */}
          <div className="relative w-64 lg:w-80" ref={searchRef}>
             <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={() => search.length > 1 && setShowResults(true)}
                  placeholder={rtl ? "ابحث..." : "Search..."}
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-primary-500 transition-all text-xs font-bold"
                />
                <AnimatePresence>
                  {search && (
                    <motion.button 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearch('')} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-500"
                    >
                      <X size={12} />
                    </motion.button>
                  )}
                </AnimatePresence>
             </div>

             <AnimatePresence>
                {showResults && results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 4, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="absolute top-full mt-2 left-0 right-0 glass-card p-2 shadow-2xl z-[100] border border-slate-200 dark:border-white/20"
                  >
                    {results.map(p => (
                      <Link key={p.id} to={`/products/${p.id}`} onClick={() => setShowResults(false)} className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition group">
                         <div className="w-10 h-10 bg-slate-200 dark:bg-white/5 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                            {p.image_url ? <img src={'http://localhost:5000' + p.image_url} alt="" className="w-full h-full object-cover" /> : <Package size={16} className="text-slate-400" />}
                         </div>
                         <div className="flex-grow overflow-hidden">
                            <h4 className="font-bold text-[10px] truncate uppercase tracking-tighter text-slate-900 dark:text-white group-hover:text-primary-500">{rtl ? p.name_ar : p.name_en}</h4>
                            <p className="text-[10px] text-primary-500 font-black">EGP {p.price?.toFixed(2)}</p>
                         </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>

        {/* Actions & Hamburger */}
        <div className="flex items-center gap-1.5 md:gap-4 z-[60]">
          {/* Theme & Language Toggles */}
          <div className="hidden md:flex items-center gap-1.5">
            <button 
              onClick={toggleRtl} 
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 active:scale-95 transition-transform"
            >
              <Languages size={16} />
            </button>
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 active:scale-95 transition-transform"
            >
              {theme === 'dark' ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-primary-600" />}
            </button>
          </div>

          {/* Favorites Button */}
          <button 
            onClick={() => setIsFavoritesOpen(true)}
            className="group relative p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 active:scale-95 transition-transform shadow-sm"
          >
            <Heart size={18} className={wishlist.length > 0 ? "text-red-500 fill-current animate-pulse-subtle" : ""} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-950">
                {wishlist.length}
              </span>
            )}
          </button>

          <Link to="/cart" className="relative p-2.5 rounded-xl bg-primary-500 text-white shadow-xl shadow-primary-500/20 active:scale-95 transition-transform">
            <ShoppingCart size={18} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-950">
                {cart.length}
              </span>
            )}
          </Link>

          {/* Animated Hamburger Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-1 w-10 h-10 transition-all active:scale-90"
          >
            <motion.span 
              animate={isMobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="w-5 h-0.5 bg-slate-900 dark:bg-white rounded-full transition-all"
            />
            <motion.span 
              animate={isMobileMenuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
              className="w-5 h-0.5 bg-slate-900 dark:bg-white rounded-full transition-all"
            />
            <motion.span 
              animate={isMobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="w-5 h-0.5 bg-slate-900 dark:bg-white rounded-full transition-all"
            />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[50] md:hidden"
            />
            
            <motion.div 
              initial={{ x: rtl ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: rtl ? '100%' : '-100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={`fixed top-0 bottom-0 w-[85%] max-w-[320px] bg-white/95 dark:bg-[#080808]/95 backdrop-blur-3xl z-[55] md:hidden shadow-2xl p-6 pt-24 overflow-y-auto ${rtl ? 'right-0 border-l' : 'left-0 border-r'} border-white/10`}
            >
              <div className="flex flex-col gap-8">
                {/* Mobile Links */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary-500 mb-2">{rtl ? 'الروابط' : 'Menu'}</span>
                  {[
                    { to: '/', labelAr: 'الرئيسية', labelEn: 'Home', icon: <Package size={16} /> },
                    { to: '/products', labelAr: 'المنتجات', labelEn: 'Products', icon: <ShoppingCart size={16} /> },
                    { to: '/disposables', labelAr: 'الأقسام', labelEn: 'Categories', icon: <Tag size={16} /> },
                  ].map((link, idx) => (
                    <Link key={idx} to={link.to} className="flex items-center gap-3 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5 font-bold text-sm hover:text-primary-500">
                      <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500">{link.icon}</div>
                      {rtl ? link.labelAr : link.labelEn}
                    </Link>
                  ))}
                </div>

                {/* Categories */}
                <div className="flex flex-col gap-2">
                   <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary-500">{rtl ? 'أهم الأقسام' : 'Quick Access'}</span>
                    <div className="grid grid-cols-1 gap-2">
                      {categories.slice(0, 6).map((cat) => (
                        <Link key={cat.id} to={`/disposables#${cat.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-500/5 group">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary-500">
                            {CATEGORY_ICONS[cat.id] ?? <Tag size={14} />}
                          </div>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-white">
                            {rtl ? cat.name_ar : cat.name_en}
                          </span>
                        </Link>
                      ))}
                    </div>
                </div>

                {/* Mobile Toggles */}
                <div className="flex flex-col gap-4 mt-4 border-t border-white/5 pt-8">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-white/5">
                      <span className="text-xs font-bold">{rtl ? 'اللغة' : 'Language'}</span>
                      <button onClick={toggleRtl} className="p-3 bg-white dark:bg-white/10 rounded-xl"><Languages size={18} /></button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-white/5">
                      <span className="text-xs font-bold">{rtl ? 'المظهر' : 'Theme'}</span>
                      <button onClick={toggleTheme} className="p-3 bg-white dark:bg-white/10 rounded-xl">
                        {theme === 'dark' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-primary-600" />}
                      </button>
                    </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <FavoritesDrawer isOpen={isFavoritesOpen} onClose={() => setIsFavoritesOpen(false)} />
    </nav>
  );
}
