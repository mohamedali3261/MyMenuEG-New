import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useStore } from './store/store';
import Navbar from './components/Navbar';
import PromotionStrip from './components/PromotionStrip';
import WhatsAppButton from './components/WhatsAppButton';
import Preloader from './components/Preloader';
import { Toaster, toast } from 'react-hot-toast';
import { api } from './api';
import { resolveAssetUrl } from './utils/assetUrl';
import ProtectedRoute from './components/ProtectedRoute';
import OfferPopup from './components/OfferPopup';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import RouteErrorBoundary from './components/RouteErrorBoundary';
const Home = lazy(() => import('./pages/Home/Home'));
const Catalog = lazy(() => import('./pages/Catalog/Catalog'));
const Cart = lazy(() => import('./pages/Cart/Cart'));
const ProductDetails = lazy(() => import('./pages/ProductDetails/ProductDetails'));
const Contact = lazy(() => import('./pages/Contact/Contact'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));
const FAQ = lazy(() => import('./pages/FAQ/FAQ'));
const AdminLayout = lazy(() => import('./pages/AdminDashboard/AdminLayout'));
const Overview = lazy(() => import('./pages/AdminDashboard/Overview'));
const ProductsList = lazy(() => import('./pages/AdminDashboard/products/ProductsList'));
const ProductForm = lazy(() => import('./pages/AdminDashboard/products/ProductForm'));
const CategoriesList = lazy(() => import('./pages/AdminDashboard/categories/CategoriesList'));
const CustomersList = lazy(() => import('./pages/AdminDashboard/customers/CustomersList'));
const SliderManager = lazy(() => import('./pages/AdminDashboard/slider/SliderManager'));
const CouponsManager = lazy(() => import('./pages/AdminDashboard/coupons/CouponsManager'));
const OrderTracking = lazy(() => import('./pages/OrderTracking/OrderTracking'));
const OrdersList = lazy(() => import('./pages/AdminDashboard/orders/OrdersList'));
const Settings = lazy(() => import('./pages/AdminDashboard/settings/Settings'));
const Login = lazy(() => import('./pages/AdminDashboard/Login'));
const UserManagement = lazy(() => import('./pages/AdminDashboard/UserManagement'));
const DatabaseBackups = lazy(() => import('./pages/AdminDashboard/database/DatabaseBackups'));
const PagesManager = lazy(() => import('./pages/AdminDashboard/pages/PagesManager'));
const OffersManager = lazy(() => import('./pages/AdminDashboard/offers/OffersManager'));
const ContactPagePanel = lazy(() => import('./pages/AdminDashboard/settings/components/ContactPagePanel'));
const DynamicPage = lazy(() => import('./pages/DynamicPage/DynamicPage'));
const Terms = lazy(() => import('./pages/Legal/Terms'));
const Privacy = lazy(() => import('./pages/Legal/Privacy'));
const Wishlist = lazy(() => import('./pages/Wishlist/Wishlist'));
const Checkout = lazy(() => import('./pages/Checkout/Checkout'));
const PaymentCallback = lazy(() => import('./pages/Payment/PaymentCallback'));
const PaymentSettingsPanel = lazy(() => import('./pages/AdminDashboard/settings/components/PaymentSettingsPanel'));

type Hsl = { h: number; s: number; l: number };
type Rgb = { r: number; g: number; b: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const hexToRgb = (hex: string): Rgb | null => {
  const normalized = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16)
  };
};

const rgbToHsl = ({ r, g, b }: Rgb): Hsl => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  if (delta !== 0) {
    if (max === rn) h = 60 * (((gn - bn) / delta) % 6);
    else if (max === gn) h = 60 * ((bn - rn) / delta + 2);
    else h = 60 * ((rn - gn) / delta + 4);
  }

  if (h < 0) h += 360;
  return { h, s, l };
};

const hslToRgb = ({ h, s, l }: Hsl): Rgb => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (h < 60) [r1, g1, b1] = [c, x, 0];
  else if (h < 120) [r1, g1, b1] = [x, c, 0];
  else if (h < 180) [r1, g1, b1] = [0, c, x];
  else if (h < 240) [r1, g1, b1] = [0, x, c];
  else if (h < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255)
  };
};

const buildShades = (baseHsl: Hsl): Record<number, Rgb> => {
  const lightnessMap: Record<number, number> = {
    50: 0.95,
    100: 0.9,
    200: 0.8,
    300: 0.7,
    400: 0.58,
    500: clamp(baseHsl.l, 0.42, 0.58),
    600: 0.45,
    700: 0.36,
    800: 0.28,
    900: 0.22,
    950: 0.15
  };

  const saturation = clamp(baseHsl.s, 0.45, 0.95);
  const shades: Record<number, Rgb> = {};
  Object.entries(lightnessMap).forEach(([key, lightness]) => {
    shades[Number(key)] = hslToRgb({ h: baseHsl.h, s: saturation, l: lightness });
  });
  return shades;
};

const applyColorScaleVars = (prefix: 'primary' | 'accent', shades: Record<number, Rgb>) => {
  Object.entries(shades).forEach(([step, rgb]) => {
    document.documentElement.style.setProperty(`--${prefix}-${step}-rgb`, `${rgb.r} ${rgb.g} ${rgb.b}`);
  });
};

const BackgroundEffect = ({ style, theme }: { style: string, theme: string }) => {
  if (style === 'blobs') {
    return (
      <div
        className="fixed inset-0 z-0 dark:bg-slate-950 pointer-events-none overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: theme === 'dark' ? undefined : 'rgb(var(--light-bg-rgb))' }}
      >
        <div className="absolute top-[-10%] left-[0%] w-[60%] h-[60%] rounded-full bg-primary-500/40 dark:bg-primary-500/30 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[0%] w-[70%] h-[70%] rounded-full bg-accent-500/30 dark:bg-accent-500/20 blur-[120px]"></div>
      </div>
    );
  }
  if (style === 'grid') {
    return (
      <div
        className="fixed inset-0 z-0 dark:bg-[#020617] pointer-events-none transition-colors duration-300"
        style={{
          backgroundColor: theme === 'dark' ? undefined : 'rgb(var(--light-bg-rgb))',
          backgroundImage: theme === 'dark'
            ? 'linear-gradient(rgb(var(--primary-500-rgb) / 0.15) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--primary-500-rgb) / 0.15) 1px, transparent 1px)'
            : 'linear-gradient(rgb(var(--primary-500-rgb) / 0.25) 2px, transparent 2px), linear-gradient(90deg, rgb(var(--primary-500-rgb) / 0.25) 2px, transparent 2px)',
          backgroundSize: '40px 40px'
        }}
      ></div>
    )
  }
  if (style === 'cinema') {
    return (
      <div
        className="fixed inset-0 z-0 dark:bg-black pointer-events-none transition-colors duration-300"
        style={{
          backgroundColor: theme === 'dark' ? undefined : 'rgb(var(--light-bg-rgb))',
          backgroundImage: theme === 'dark'
            ? 'radial-gradient(circle at 50% 0%, rgb(var(--primary-500-rgb) / 0.5) 0%, transparent 60%), radial-gradient(circle at 50% 100%, rgb(var(--accent-500-rgb) / 0.4) 0%, transparent 60%)'
            : 'radial-gradient(circle at 50% 0%, rgb(var(--primary-500-rgb) / 0.3) 0%, transparent 60%), radial-gradient(circle at 50% 100%, rgb(var(--accent-500-rgb) / 0.25) 0%, transparent 60%)',
          backgroundAttachment: 'fixed'
        }}
      ></div>
    )
  }
  // default
  return (
    <div
      className="fixed inset-0 z-0 dark:bg-dark-bg transition-colors duration-300 pointer-events-none"
      style={{ backgroundColor: theme === 'dark' ? undefined : 'rgb(var(--light-bg-rgb))' }}
    ></div>
  );
}

function AppContent() {
  const { 
    theme, rtl, backgroundStyle, branding, updateBranding, 
    loadingScreen, updateLoadingScreen,
    toastMessage, hideToast, fetchInitialData, updateContactSettings,
    updateFaqSettings, updateNotFoundSettings, fetchSettings, refreshSession
  } = useStore();

  const [initialLoading, setInitialLoading] = useState(true);

  // 1. Initial Load: Fetch Branding & Global Data (run once; avoid dependency loops)
  useEffect(() => {
    let timer: number | null = null;
    let cancelled = false;

    const run = async () => {
      try {
        await refreshSession();
        await fetchInitialData();

        const settings = await fetchSettings();
        if (!settings) {
          if (!cancelled) setInitialLoading(false);
          return;
        }

        updateBranding({
          primaryColor: (settings.primary_color as string) || '#eb5e28',
          secondaryColor: (settings.secondary_color as string) || '#10b981',
          blendColors: settings.blend_colors === true || settings.blend_colors === 'true',
          lightBgColor: (settings.light_bg_color as string) || '#e2e8f0',
          storeName: (settings.store_name as string) || 'MyMenuEG',
          logoUrl: (settings.logo_url as string) || ''
        });

        let parsedLoadingScreen: Partial<typeof loadingScreen> | null = null;

        if (settings.loading_screen_settings) {
          try {
            parsedLoadingScreen = JSON.parse(settings.loading_screen_settings as string) as Partial<typeof loadingScreen>;
            if (parsedLoadingScreen) updateLoadingScreen(parsedLoadingScreen);
          } catch (e) {
            console.error("Failed to parse loading screen settings", e);
          }
        }

        if (settings.contact_settings) {
          try {
            updateContactSettings(JSON.parse(settings.contact_settings as string));
          } catch (e) {
            console.error("Failed to parse contact settings", e);
          }
        }

        if (settings.faq_settings) {
          try {
            updateFaqSettings(JSON.parse(settings.faq_settings as string));
          } catch (e) {
            console.error("Failed to parse faq settings", e);
          }
        }

        if (settings.notfound_settings) {
          try {
            updateNotFoundSettings(JSON.parse(settings.notfound_settings as string));
          } catch (e) {
            console.error("Failed to parse not found settings", e);
          }
        }

        const effectiveLoading = parsedLoadingScreen ?? useStore.getState().loadingScreen;
        const minDuration = effectiveLoading.enabled ? (effectiveLoading.minDuration || 1500) : 0;
        timer = window.setTimeout(() => {
          if (!cancelled) setInitialLoading(false);
        }, minDuration);
      } catch (err) {
        console.error('Settings fetch failed:', err);
        if (!cancelled) setInitialLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
      if (timer !== null) window.clearTimeout(timer);
    };
    // Intentionally run once; store actions are stable enough for this init sequence.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Dynamic Theme Injection (CSS Variables)
  useEffect(() => {
    const primaryRgb = hexToRgb(branding.primaryColor) ?? { r: 16, g: 185, b: 129 };
    const primaryHsl = rgbToHsl(primaryRgb);
    const primaryScale = buildShades(primaryHsl);
    applyColorScaleVars('primary', primaryScale);

    const accentRgb = hexToRgb(branding.secondaryColor) ?? { r: 249, g: 115, b: 22 };
    const accentHsl = rgbToHsl(accentRgb);
    const accentScale = buildShades(accentHsl);
    applyColorScaleVars('accent', accentScale);

    const lightBgRgb = hexToRgb(branding.lightBgColor) ?? { r: 226, g: 232, b: 240 };
    document.documentElement.style.setProperty('--light-bg-rgb', `${lightBgRgb.r} ${lightBgRgb.g} ${lightBgRgb.b}`);
  }, [branding.primaryColor, branding.secondaryColor, branding.lightBgColor]);

  // 3. New Orders Polling (Admin Only)
  useEffect(() => {
    const isAdmin = window.location.pathname.startsWith('/admin');
    if (!isAdmin) return;

    let lastOrderCheck = new Date().toISOString().replace('T', ' ').split('.')[0];
    
    const checkOrders = async () => {
       try {
          const res = await api.get(`/orders/new-check?lastCheck=${lastOrderCheck}`);
          if (res.data.count > 0) {
             toast.success(
               rtl ? `لديك ${res.data.count} طلب جديد! 🔔` : `You have ${res.data.count} new orders! 🔔`,
               {
                 duration: 6000,
                 icon: '🛒',
                 style: {
                    border: '1px solid #10b981',
                    background: theme === 'dark' ? '#064e3b' : '#ecfdf5',
                    color: theme === 'dark' ? '#34d399' : '#047857',
                 }
               }
             );
             lastOrderCheck = new Date().toISOString().replace('T', ' ').split('.')[0];
          }
       } catch (e) {
          console.error("Polling failed", e);
       }
    };

    const interval = setInterval(checkOrders, 30000);
    return () => clearInterval(interval);
  }, [rtl, theme]);

  // 4. Legacy Toast Sync
  useEffect(() => {
    if (toastMessage) {
      if (toastMessage.type === 'success') {
         toast.success(toastMessage.text, { position: 'bottom-center' });
      } else {
         toast.error(toastMessage.text, { position: 'bottom-center' });
      }
      hideToast();
    }
  }, [toastMessage, hideToast]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';

    if (branding.logoUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = resolveAssetUrl(branding.logoUrl);
    }
    
    if (!document.title.includes('|')) {
      document.title = branding.storeName;
    }
  }, [theme, rtl, branding]);

  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const isHomePage = location.pathname === '/';

  return (
    <div className={`dual-tone-theme ${branding.blendColors ? 'dual-tone-blended' : ''} min-h-screen relative overflow-hidden text-slate-900 dark:text-white flex flex-col ${theme} ${rtl ? 'rtl' : 'ltr'}`}>
      <Toaster 
        position="bottom-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: theme === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(241, 245, 249, 0.95)',
            color: theme === 'dark' ? '#fff' : '#1e293b',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '12px 24px',
            fontSize: '15px',
            fontWeight: '600',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      
      <Preloader isLoading={initialLoading} />

      <BackgroundEffect style={backgroundStyle || 'default'} theme={theme} />
      <PromotionStrip />
      <Navbar />
      <WhatsAppButton />
      <OfferPopup />
      
      <main className={`flex-grow z-10 mx-auto w-full max-w-[100vw] ${isAdminPath || isHomePage ? '' : 'pt-28 lg:pt-32'}`}>
        <Suspense fallback={<div className="min-h-[40vh]" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Catalog />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/disposables" element={<Navigate to="/p/disposables" replace />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route
              path="/p/:slug"
              element={
                <RouteErrorBoundary
                  resetKey={location.pathname}
                  fallback={
                    <div className="min-h-[50vh] flex items-center justify-center px-6">
                      <div className="glass-card max-w-xl w-full p-10 text-center text-slate-600 dark:text-slate-300">
                        <h2 className="text-2xl font-black mb-3 text-accent-600 dark:text-accent-400">
                          {rtl ? 'حدث خطأ في هذه الصفحة' : 'This page ran into an error'}
                        </h2>
                        <p className="mb-6 opacity-80">
                          {rtl
                            ? 'الصفحات الأخرى تعمل بشكل طبيعي. يمكنك تجربة صفحة ديناميكية أخرى.'
                            : 'Other pages are still working. You can try another dynamic page.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => window.location.reload()}
                          className="px-5 py-2.5 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition"
                        >
                          {rtl ? 'إعادة تحميل الصفحة' : 'Reload Page'}
                        </button>
                      </div>
                    </div>
                  }
                >
                  <DynamicPage />
                </RouteErrorBoundary>
              }
            />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            <Route path="/admin/login" element={<Login />} />
            
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Overview />} />
                <Route element={<ProtectedRoute permission="products" />}><Route path="products" element={<ProductsList />} /><Route path="products/new" element={<ProductForm />} /><Route path="products/edit/:id" element={<ProductForm />} /></Route>
                <Route element={<ProtectedRoute permission="categories" />}><Route path="categories" element={<CategoriesList />} /></Route>
                <Route element={<ProtectedRoute permission="slides" />}><Route path="slider" element={<SliderManager />} /></Route>
                <Route element={<ProtectedRoute permission="orders" />}><Route path="orders" element={<OrdersList />} /></Route>
                <Route element={<ProtectedRoute permission="customers" />}><Route path="customers" element={<CustomersList />} /></Route>
                <Route element={<ProtectedRoute permission="coupons" />}><Route path="coupons" element={<CouponsManager />} /></Route>
                <Route element={<ProtectedRoute permission="users" />}><Route path="users" element={<UserManagement />} /><Route path="database" element={<DatabaseBackups />} /></Route>
                <Route element={<ProtectedRoute permission="pages" />}><Route path="pages" element={<PagesManager />} /></Route>
                <Route element={<ProtectedRoute permission="settings" />}>
                  <Route path="offers" element={<OffersManager />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="contact" element={<div className="max-w-4xl mx-auto"><ContactPagePanel /></div>} />
                  <Route path="payment" element={<PaymentSettingsPanel />} />
                </Route>
              </Route>
            </Route>
            <Route path="/track" element={<OrderTracking />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminPath && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
}
