import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../../store/store';
import { ShoppingCart, Moon, Sun, Languages, Search, Package, Bell, Heart, LogOut, LogIn, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FavoritesDrawer from '../FavoritesDrawer';
import NotificationsDrawer from '../NotificationsDrawer';
import MegaMenu from '../MegaMenu';
import { resolveAssetUrl } from '../../utils/assetUrl';

export default function NavbarVariant3() {
  const { theme, toggleTheme, rtl, toggleRtl, cart, wishlist, branding, products, categories, pages, notifications, fetchNotifications, markNotificationsAsRead, trackedOrders, customer, logoutCustomer, googleLoginEnabled, fetchGoogleLoginSettings } = useStore();
  const [search, setSearch] = useState('');
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
      setIsScrolled(window.scrollY > 10);
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            {branding.logoUrl ? (
              <img src={resolveAssetUrl(branding.logoUrl)} alt={branding.storeName} className="h-10 w-auto object-contain" />
            ) : (
              <div className="flex items-center">
                <span className="text-primary-500 font-black text-2xl">{branding.storeName.substring(0, 2)}</span>
                <span className="text-slate-900 dark:text-white font-black text-2xl">{branding.storeName.substring(2)}</span>
              </div>
            )}
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center bg-slate-100/50 dark:bg-white/5 rounded-full px-1.5 py-1">
            {[
              { to: '/', label: rtl ? 'الرئيسية' : 'Home' },
              { to: '/products', label: rtl ? 'المنتجات' : 'Products' },
              { to: '/contact', label: rtl ? 'اتصل بنا' : 'Contact' }
            ].map((link, index, array) => (
              <div key={link.to} className="flex items-center">
                <Link
                  to={link.to}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${location.pathname === link.to ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10'}`}
                >
                  {link.label}
                </Link>
                {/* Divider */}
                {index < array.length - 1 && (
                  <span className="w-px h-3 bg-slate-300 dark:bg-slate-600 mx-1" />
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <div className="hidden lg:flex relative mr-2" ref={searchRef}>
              <div className="relative flex items-center">
                <Search size={18} className="absolute left-3 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={() => search.length > 1 && setShowResults(true)}
                  placeholder={rtl ? "بحث..." : "Search..."}
                  className="w-48 bg-slate-100/50 dark:bg-white/5 border-0 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm transition-all focus:w-64"
                />
              </div>
              <AnimatePresence>
                {showResults && results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden z-50"
                  >
                    {results.slice(0, 5).map(p => (
                      <Link key={p.id} to={`/products/${p.id}`} onClick={() => setShowResults(false)} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-white/5 border-b border-slate-100 dark:border-white/5 last:border-0">
                        {p.image_url ? <img src={resolveAssetUrl(p.image_url)} alt="" className="w-12 h-12 object-cover rounded-lg" /> : <Package size={20} className="text-slate-400" />}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{rtl ? p.name_ar : p.name_en}</p>
                          <p className="text-xs text-primary-500 font-black">EGP {p.price?.toFixed(2)}</p>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={toggleTheme}
              className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={toggleRtl}
              className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition"
            >
              <Languages size={20} />
            </button>

            <button
              onClick={() => setIsFavoritesOpen(true)}
              className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition relative"
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{wishlist.length}</span>
              )}
            </button>

            {customer && (
              <button
                onClick={() => {
                  setIsNotificationsOpen(true);
                  markNotificationsAsRead();
                }}
                className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{unreadCount}</span>
                )}
              </button>
            )}

            <Link to="/cart" className="p-3 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition relative shadow-lg shadow-primary-500/30">
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-primary-500 text-xs rounded-full flex items-center justify-center font-bold">{cart.length}</span>
              )}
            </Link>

            <div className="relative" ref={customerMenuRef}>
              <button
                onClick={() => setIsCustomerMenuOpen(!isCustomerMenuOpen)}
                className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition ml-2"
              >
                {customer ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center font-bold text-sm">
                    {(customer.name || customer.email).substring(0, 2).toUpperCase()}
                  </div>
                ) : (
                  <LogIn size={20} />
                )}
              </button>

              {customer && isCustomerMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-primary-500/10 to-transparent">
                    <p className="font-bold text-sm">{customer.name || customer.email}</p>
                    <p className="text-xs text-slate-500">{customer.email}</p>
                  </div>
                  <div className="p-2">
                    <Link to="/my-orders" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition">
                      <Package size={16} />
                      {rtl ? 'طلباتي' : 'My Orders'}
                    </Link>
                    <button
                      onClick={() => {
                        logoutCustomer();
                        setIsCustomerMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-xl transition"
                    >
                      <LogOut size={16} />
                      {rtl ? 'تسجيل الخروج' : 'Logout'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-3 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition ml-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Pages Strip */}
      <div className="hidden md:flex justify-center w-full pb-2">
        <div className="flex items-center bg-slate-100/80 dark:bg-white/5 rounded-full px-1.5 py-1">
          {pages.filter(p => p.show_in_navbar && p.status !== 'draft').map((page, index, array) => (
            <div key={page.id} className="flex items-center">
              <div
                className="relative"
                onMouseEnter={() => handleMenuEnter(page.id)}
                onMouseLeave={handleMenuLeave}
              >
                <Link
                  to={`/p/${page.slug}`}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${hoveredPageId === page.id ? 'bg-primary-500/10 text-primary-500' : (location.pathname === `/p/${page.slug}` ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10')}`}
                >
                  {rtl ? page.name_ar : page.name_en}
                </Link>

                <AnimatePresence>
                  {hoveredPageId === page.id && (
                    <div
                      className="pt-2"
                      style={{
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        top: '100%',
                        width: 'min(600px, 80vw)',
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
              {/* Divider */}
              {index < array.length - 1 && (
                <span className="w-px h-3 bg-slate-300 dark:bg-slate-600 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 right-0 bottom-0 w-80 bg-white dark:bg-slate-900 shadow-2xl z-[100] md:hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-xl">{rtl ? 'القائمة' : 'Menu'}</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-2">
                {/* Static Links */}
                {[
                  { to: '/', label: rtl ? 'الرئيسية' : 'Home' },
                  { to: '/products', label: rtl ? 'المنتجات' : 'Products' },
                  { to: '/contact', label: rtl ? 'اتصل بنا' : 'Contact' }
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block py-3 px-4 rounded-xl text-lg font-bold transition ${location.pathname === link.to ? 'bg-primary-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-white/5'}`}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Dynamic Pages */}
                {pages.filter(p => p.show_in_navbar && p.status !== 'draft').length > 0 && (
                  <>
                    <div className="h-px bg-slate-200 dark:bg-white/10 my-4" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4">{rtl ? 'الصفحات' : 'Pages'}</span>
                    {pages.filter(p => p.show_in_navbar && p.status !== 'draft').map((page) => (
                      <Link
                        key={page.id}
                        to={`/p/${page.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`block py-3 px-4 rounded-xl text-lg font-bold transition ${location.pathname === `/p/${page.slug}` ? 'bg-primary-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-white/5'}`}
                      >
                        {rtl ? page.name_ar : page.name_en}
                      </Link>
                    ))}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Favorites Drawer */}
      <FavoritesDrawer isOpen={isFavoritesOpen} onClose={() => setIsFavoritesOpen(false)} />

      {/* Notifications Drawer */}
      <NotificationsDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </nav>
  );
}
