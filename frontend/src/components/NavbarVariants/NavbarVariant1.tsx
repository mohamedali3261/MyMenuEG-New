import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../../store/store';
import { ShoppingCart, Moon, Sun, Languages, Search, Package, Bell, Heart, LogOut, LogIn } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FavoritesDrawer from '../FavoritesDrawer';
import NotificationsDrawer from '../NotificationsDrawer';
import MegaMenu from '../MegaMenu';
import { resolveAssetUrl } from '../../utils/assetUrl';

export default function NavbarVariant1() {
  const { theme, toggleTheme, rtl, toggleRtl, cart, wishlist, branding, products, categories, pages, notifications, fetchNotifications, markNotificationsAsRead, trackedOrders, customer, logoutCustomer, googleLoginEnabled, fetchGoogleLoginSettings } = useStore();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [results, setResults] = useState<Array<(typeof products)[number]>>([]);
  const [showResults, setShowResults] = useState(false);
  const [hoveredPageId, setHoveredPageId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isCustomerMenuOpen, setIsCustomerMenuOpen] = useState(false);
  const customerMenuRef = useRef<HTMLDivElement>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    fetchGoogleLoginSettings();
  }, [fetchGoogleLoginSettings]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (trackedOrders.length === 0 && !customer) return;
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, trackedOrders.length, customer]);

  const searchRef = useRef<HTMLDivElement>(null);
  const menuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (search.length > 1) {
      const timer = setTimeout(() => {
        const filtered = products.filter(p =>
          (rtl ? p.name_ar : p.name_en).toLowerCase().includes(search.toLowerCase()) ||
          (p.name_en && p.name_en.toLowerCase().includes(search.toLowerCase()))
        );
        setResults(filtered);
        setShowResults(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [search, products, rtl]);

  const unreadCount = useMemo(
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
    return categories.filter(cat =>
      products.some(p => p.page_id === pageId && p.category_id === cat.id && p.status === 'active')
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4">
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

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-500 dark:hover:text-white transition-all group"
            title={rtl ? 'تبديل الوضع' : 'Toggle theme'}
          >
            {theme === 'dark' ? <Sun size={18} className="group-hover:rotate-180 transition-transform duration-500" /> : <Moon size={18} className="group-hover:rotate-180 transition-transform duration-500" />}
          </button>

          {/* RTL Toggle */}
          <button
            onClick={toggleRtl}
            className="p-2 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-500 dark:hover:text-white transition-all group"
            title={rtl ? 'English' : 'عربي'}
          >
            <Languages size={18} className="group-hover:scale-110 transition-transform" />
          </button>

          {/* Favorites */}
          <button
            onClick={() => setIsFavoritesOpen(true)}
            className="p-2 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-all group relative"
            title={rtl ? 'المفضلة' : 'Favorites'}
          >
            <Heart size={18} className="group-hover:scale-110 transition-transform" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Notifications */}
          {customer && (
            <button
              onClick={() => {
                setIsNotificationsOpen(true);
                markNotificationsAsRead();
              }}
              className="p-2 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-500 dark:hover:text-white transition-all group relative"
              title={rtl ? 'الإشعارات' : 'Notifications'}
            >
              <Bell size={18} className="group-hover:scale-110 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Cart */}
          <Link
            to="/cart"
            className="p-2 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-all group relative shadow-lg shadow-primary-500/30"
            title={rtl ? 'السلة' : 'Cart'}
          >
            <ShoppingCart size={18} className="group-hover:scale-110 transition-transform" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-primary-500 text-[10px] font-black rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Link>

          {/* Customer Menu */}
          <div className="relative" ref={customerMenuRef}>
            <button
              onClick={() => setIsCustomerMenuOpen(!isCustomerMenuOpen)}
              className="p-2 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-500 dark:hover:text-white transition-all group"
              title={customer ? rtl ? 'الحساب' : 'Account' : rtl ? 'تسجيل الدخول' : 'Login'}
            >
              {customer ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                  {(customer.name || customer.email).substring(0, 2).toUpperCase()}
                </div>
              ) : (
                <LogIn size={18} className="group-hover:scale-110 transition-transform" />
              )}
            </button>

            {customer && isCustomerMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 glass-card rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden z-[200]">
                <div className="p-4 border-b border-slate-200 dark:border-white/10">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{customer.name || customer.email}</p>
                  <p className="text-xs text-slate-500">{customer.email}</p>
                </div>
                <div className="p-2">
                  <Link to="/my-orders" className="block px-4 py-2 text-sm hover:bg-primary-500/10 rounded-xl transition text-slate-700 dark:text-slate-300">
                    {rtl ? 'طلباتي' : 'My Orders'}
                  </Link>
                  <button
                    onClick={() => {
                      logoutCustomer();
                      setIsCustomerMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-xl transition flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    {rtl ? 'تسجيل الخروج' : 'Logout'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Pages Strip */}
      <div className={`hidden md:flex justify-center w-full transition-all duration-500 ease-in-out relative z-40 ${isScrolled ? '-mt-[2px]' : 'mt-2'} mb-1`}>
        <div className={`bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-0 shadow-[0_18px_42px_rgba(0,0,0,0.16)] px-2 py-1.5 flex items-center justify-center gap-1.5 transition-all duration-500 w-max mx-auto relative ${isScrolled ? 'rounded-b-[2rem] rounded-t-none' : 'rounded-b-[2rem] rounded-t-[1rem]'}`}>
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
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-[0.12em] transition-all duration-300 ${hoveredPageId === page.id ? 'bg-primary-500/10 text-primary-500' : (location.pathname === `/p/${page.slug}` ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white')}`}
              >
                {rtl ? page.name_ar : page.name_en}
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <div
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[50] md:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 left-4 right-4 md:hidden glass-card rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 z-[60] p-4"
            >
              <div className="flex flex-col gap-4">
                {/* Static Links */}
                {[
                  { to: '/', label: rtl ? 'الرئيسية' : 'Home' },
                  { to: '/products', label: rtl ? 'جميع المنتجات' : 'All Products' },
                  { to: '/contact', label: rtl ? 'اتصل بنا' : 'Contact Us' }
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-primary-500 transition"
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Dynamic Pages */}
                {pages.filter(p => p.show_in_navbar && p.status !== 'draft').length > 0 && (
                  <>
                    <div className="h-px bg-slate-200 dark:bg-white/10 my-2" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{rtl ? 'الصفحات' : 'Pages'}</span>
                    {pages.filter(p => p.show_in_navbar && p.status !== 'draft').map((page) => (
                      <Link
                        key={page.id}
                        to={`/p/${page.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-primary-500 transition"
                      >
                        {rtl ? page.name_ar : page.name_en}
                      </Link>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Favorites Drawer */}
      <FavoritesDrawer isOpen={isFavoritesOpen} onClose={() => setIsFavoritesOpen(false)} />

      {/* Notifications Drawer */}
      <NotificationsDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </nav>
  );
}
