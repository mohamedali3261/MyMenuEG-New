import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/store';
import { ShoppingCart, Moon, Sun, Languages, Search, Package, Tag, Mail, Bell, Heart } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MegaMenu from './MegaMenu';
import FavoritesDrawer from './FavoritesDrawer';
import NotificationsDrawer from './NotificationsDrawer';
import { CATEGORY_ICONS } from '../constants/categoryIcons';
import { resolveAssetUrl } from '../utils/assetUrl';

export default function Navbar() {
  const { theme, toggleTheme, rtl, toggleRtl, cart, wishlist, branding, products, categories, pages, notifications, fetchNotifications, markNotificationsAsRead, trackedOrders } = useStore();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [results, setResults] = useState<Array<(typeof products)[number]>>([]);
  const [showResults, setShowResults] = useState(false);
  const [hoveredPageId, setHoveredPageId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (trackedOrders.length === 0) return;
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, trackedOrders.length]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const menuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch.trim().length > 1) {
      const filtered = products.filter(p =>
        (rtl ? p.name_ar : p.name_en).toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      setResults(filtered.slice(0, 5));
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [debouncedSearch, products, rtl]);

  useEffect(() => () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
  }, []);

  const unreadNotificationsCount = useMemo(
    () => notifications?.filter((n: { is_read?: boolean }) => !n.is_read).length ?? 0,
    [notifications]
  );

  const handleMenuEnter = (pageId: string) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setHoveredPageId(pageId);
  };

  const handleMenuLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setHoveredPageId(null);
    }, 150);
  };

  const getCategoriesForPage = (pageId: string) => {
    // Filter categories that have at least one product on this page
    return categories.filter(cat => 
      products.some(p => p.page_id === pageId && p.category_id === cat.id && p.status === 'active')
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4">
      {/* Primary Row */}
      <div className={`max-w-7xl mx-auto bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl flex items-center justify-between px-4 md:px-8 py-3 md:py-4 relative border-0 shadow-[0_30px_70px_rgba(0,0,0,0.3)] transition-all duration-700 ease-in-out rounded-[2rem] md:rounded-[2.5rem] ${isScrolled ? 'mb-0 shadow-none rounded-b-[1.4rem] md:rounded-b-[1.7rem]' : 'mb-2'}`}>
        {/* Logo */}
        <Link to="/" className="text-xl md:text-2xl font-bold flex items-center gap-2 z-[60] shrink-0 group">
           {branding.logoUrl ? (
             <img src={resolveAssetUrl(branding.logoUrl)} alt={branding.storeName} className="h-8 md:h-12 w-auto object-contain transition-transform group-hover:scale-110" />
           ) : (
             <div className="flex items-center">
                <span className="text-primary-500 font-black text-3xl">{branding.storeName.substring(0, 2)}</span>
                <span className="text-slate-900 dark:text-white font-black text-3xl">{branding.storeName.substring(2)}</span>
             </div>
           )}
        </Link>

        {/* Primary Desktop Links */}
        <div className="hidden md:flex items-center gap-10 font-black">
          {[
            { to: '/', label: rtl ? 'الرئيسية' : 'Home' },
            { to: '/products', label: rtl ? 'جميع المنتجات' : 'All Products' },
            { to: '/contact', label: rtl ? 'اتصل بنا' : 'Contact Us' }
          ].map((link) => (
            <Link 
              key={link.to} 
              to={link.to} 
              className="relative group py-2"
            >
              <span className={`text-xs md:text-sm font-black uppercase tracking-[0.15em] transition-colors ${location.pathname === link.to ? 'text-primary-500' : 'text-slate-700 dark:text-slate-300 group-hover:text-primary-500'}`}>
                {link.label}
              </span>
              {location.pathname === link.to && (
                <motion.div 
                  layoutId="nav-glow"
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-primary-500 rounded-full blur-[2px] opacity-70"
                />
              )}
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 rounded-full transition-all group-hover:w-full opacity-40" />
            </Link>
          ))}
        </div>

        {/* Search Bar - Desktop Only */}
        <div className="hidden lg:flex relative w-52 xl:w-72" ref={searchRef}>
           <div className="relative w-full group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => search.length > 1 && setShowResults(true)}
                placeholder={rtl ? "ابحث عن منتجاتك..." : "Search products..."}
                aria-label={rtl ? 'البحث في المنتجات' : 'Search products'}
                className="w-full bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:border-primary-500/50 focus:bg-white dark:focus:bg-slate-900 transition-all text-xs font-bold placeholder:text-slate-400"
              />
           </div>

           <AnimatePresence>
              {showResults && results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 4, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  className={`absolute top-full ${isScrolled ? 'mt-8' : 'mt-0'} left-0 right-0 glass-card p-2 shadow-2xl z-[200] border border-slate-200 dark:border-white/20`}
                >
                  {results.map(p => (
                    <Link key={p.id} to={`/products/${p.id}`} onClick={() => setShowResults(false)} className="flex items-center gap-3 p-2 hover:bg-primary-500/5 rounded-xl transition group">
                       <div className="w-10 h-10 bg-slate-200 dark:bg-white/5 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                         {p.image_url ? <img src={resolveAssetUrl(p.image_url)} alt={rtl ? p.name_ar : p.name_en} className="w-full h-full object-cover" /> : <Package size={16} className="text-slate-400" />}
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

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3 z-[60]">
          <div className="hidden md:flex items-center gap-1 mr-2 border-r border-slate-200 dark:border-white/10 pr-4">
            <button onClick={toggleRtl} className="p-2.5 rounded-xl hover:bg-primary-500/10 text-slate-500 transition-all"><Languages size={18} /></button>
            <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-primary-500/10 transition-all">
              {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-primary-600" />}
            </button>
          </div>

          <button onClick={() => { setIsNotificationsOpen(true); markNotificationsAsRead(); }} aria-label={rtl ? 'الإشعارات' : 'Notifications'} className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-300 hover:text-primary-500 transition-all">
            <Bell size={20} className={unreadNotificationsCount > 0 ? "text-primary-500 fill-current" : ""} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary-500 text-white text-[7px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-950">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsFavoritesOpen(true)}
            aria-label={rtl ? 'المفضلة' : 'Favorites'}
            className={`relative p-2.5 rounded-xl border transition-all active:scale-95 ${
              wishlist.length > 0
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-lg shadow-rose-500/20'
                : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-300 hover:text-rose-500 hover:border-rose-500/30'
            }`}
          >
            <Heart size={20} className={wishlist.length > 0 ? 'fill-current' : ''} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[7px] font-black min-w-4 h-4 px-1 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-950">
                {wishlist.length > 99 ? '99+' : wishlist.length}
              </span>
            )}
          </button>

          <Link to="/cart" aria-label={rtl ? 'السلة' : 'Cart'} className="relative p-2.5 rounded-xl bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:scale-110 active:scale-95 transition-all">
            <ShoppingCart size={20} className="!text-white" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[7px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-800">
                {cart.length}
              </span>
            )}
          </Link>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={rtl ? 'فتح القائمة' : 'Toggle mobile menu'}
            className="md:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-1 w-10 h-10 active:scale-90"
          >
            <motion.span animate={isMobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className="w-5 h-0.5 bg-slate-900 dark:bg-white rounded-full" />
            <motion.span animate={isMobileMenuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }} className="w-5 h-0.5 bg-slate-900 dark:bg-white rounded-full" />
            <motion.span animate={isMobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className="w-5 h-0.5 bg-slate-900 dark:bg-white rounded-full" />
          </button>
        </div>
      </div>

      {/* Secondary Row (Sub-Navbar) - Desktop Only */}
      <div className={`hidden md:flex justify-center w-full transition-all duration-500 ease-in-out relative z-40 ${isScrolled ? '-mt-[2px]' : 'mt-2'} mb-1`}>
        <div className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-0 shadow-[0_18px_42px_rgba(0,0,0,0.16)] px-2 py-1.5 flex items-center justify-center gap-1.5 transition-all duration-500 w-max mx-auto relative ${isScrolled ? 'rounded-b-[2rem] rounded-t-none' : 'rounded-b-[2rem] rounded-t-[1rem]'}`}>
          {/* All Pages with Mega Menu logic */}
          {pages.filter(p => p.show_in_navbar && p.status !== 'draft').map((page) => (
             <div
              key={page.id}
              className="relative"
              onMouseEnter={() => handleMenuEnter(page.id)}
              onMouseLeave={handleMenuLeave}
            >
              <Link
                to={`/p/${page.slug}`}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${hoveredPageId === page.id ? 'bg-primary-500/10 text-primary-500' : (location.pathname === `/p/${page.slug}` ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white')}`}
              >
                {rtl ? page.name_ar : page.name_en}
                {page.slug === 'disposables' && <Tag size={12} className={location.pathname === '/p/disposables' ? 'text-white' : 'text-primary-500'} />}
              </Link>

              <AnimatePresence>
                {hoveredPageId === page.id && (
                  <div
                    className="pt-4"
                    style={{
                      position: 'absolute',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      top: '100%', 
                      width: 'min(920px, 90vw)',
                      zIndex: 200,
                    }}
                    onMouseEnter={() => handleMenuEnter(page.id)}
                    onMouseLeave={handleMenuLeave}
                  >
                    <MegaMenu 
                      categories={getCategoriesForPage(page.id)} 
                      rtl={rtl} 
                      onClose={() => setHoveredPageId(null)} 
                      pageSlug={page.slug || ''}
                      pageName={rtl ? (page.name_ar || '') : (page.name_en || '')}
                    />
                  </div>
                )}
              </AnimatePresence>
            </div>
          ))}
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[50] md:hidden"
            />
            
            <motion.div 
              initial={{ x: rtl ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: rtl ? '100%' : '-100%' }}
              transition={{ type: "spring", damping: 35, stiffness: 400, mass: 0.8 }}
              style={{ willChange: 'transform' }}
              className={`fixed top-0 bottom-0 w-[85%] max-w-[320px] bg-white/95 dark:bg-[#080808]/95 backdrop-blur-xl z-[55] md:hidden shadow-2xl p-6 pt-24 overflow-y-auto ${rtl ? 'right-0 border-l' : 'left-0 border-r'} border-white/10`}
            >
              <div className="flex flex-col gap-8">
                {/* Mobile Links */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary-500 mb-2">{rtl ? 'الروابط' : 'Menu'}</span>
                  {[
                    { to: '/', labelAr: 'الرئيسية', labelEn: 'Home', icon: <Package size={16} /> },
                    { to: '/products', labelAr: 'المنتجات', labelEn: 'Products', icon: <ShoppingCart size={16} /> },
                    ...pages.filter(p => p.show_in_navbar && p.status !== 'draft').map(p => ({
                       to: `/p/${p.slug}`,
                       labelAr: p.name_ar,
                       labelEn: p.name_en,
                       icon: <Tag size={16} />
                    })),
                    { to: '/contact', labelAr: 'اتصل بنا', labelEn: 'Contact Us', icon: <Mail size={16} /> },
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
      <NotificationsDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </nav>
  );
}
