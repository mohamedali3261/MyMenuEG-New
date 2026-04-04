import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useStore } from './store/store';
import Navbar from './components/Navbar';
import PromotionStrip from './components/PromotionStrip';
import WhatsAppButton from './components/WhatsAppButton';
import { Toaster, toast } from 'react-hot-toast';
import { api } from './api';
import Home from './pages/Home/Home';
import Catalog from './pages/Catalog/Catalog';
import Cart from './pages/Cart/Cart';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import Disposables from './pages/Disposables/Disposables';

// Admin Imports
import AdminLayout from './pages/AdminDashboard/AdminLayout';
import Overview from './pages/AdminDashboard/Overview';
import ProductsList from './pages/AdminDashboard/products/ProductsList';
import ProductForm from './pages/AdminDashboard/products/ProductForm';
import CategoriesList from './pages/AdminDashboard/categories/CategoriesList';
import CustomersList from './pages/AdminDashboard/customers/CustomersList';
import SliderManager from './pages/AdminDashboard/slider/SliderManager';
import CouponsManager from './pages/AdminDashboard/coupons/CouponsManager';
import OrderTracking from './pages/OrderTracking/OrderTracking';
import OrdersList from './pages/AdminDashboard/orders/OrdersList';
import Settings from './pages/AdminDashboard/settings/Settings';

const BackgroundEffect = ({ style, theme }: { style: string, theme: string }) => {
  if (style === 'blobs') {
    return (
      <div className="fixed inset-0 z-0 bg-slate-50 dark:bg-slate-950 pointer-events-none overflow-hidden transition-colors duration-300">
        <div className="absolute top-[-10%] left-[0%] w-[60%] h-[60%] rounded-full bg-primary-500/40 dark:bg-primary-500/30 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[0%] w-[70%] h-[70%] rounded-full bg-accent-500/30 dark:bg-accent-500/20 blur-[120px]"></div>
      </div>
    );
  }
  if (style === 'grid') {
    return (
      <div className="fixed inset-0 z-0 bg-slate-100 dark:bg-[#020617] pointer-events-none transition-colors duration-300" style={{
        backgroundImage: theme === 'dark' 
          ? 'linear-gradient(rgba(16, 185, 129, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.15) 1px, transparent 1px)'
          : 'linear-gradient(rgba(16, 185, 129, 0.25) 2px, transparent 2px), linear-gradient(90deg, rgba(16, 185, 129, 0.25) 2px, transparent 2px)',
        backgroundSize: '40px 40px'
      }}></div>
    )
  }
  if (style === 'cinema') {
    return (
      <div className="fixed inset-0 z-0 bg-slate-50 dark:bg-black pointer-events-none transition-colors duration-300" style={{
        backgroundImage: theme === 'dark'
          ? 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.5) 0%, transparent 60%), radial-gradient(circle at 50% 100%, rgba(249, 115, 22, 0.4) 0%, transparent 60%)'
          : 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.3) 0%, transparent 60%), radial-gradient(circle at 50% 100%, rgba(249, 115, 22, 0.25) 0%, transparent 60%)',
        backgroundAttachment: 'fixed'
      }}></div>
    )
  }
  // default
  return <div className="fixed inset-0 z-0 bg-slate-50 dark:bg-dark-bg transition-colors duration-300 pointer-events-none"></div>;
}

export default function App() {
  const { theme, rtl, backgroundStyle, branding, updateBranding, toastMessage, hideToast, fetchInitialData } = useStore();

  // 1. Initial Load: Fetch Branding & Global Data
  useEffect(() => {
    fetchInitialData(); // Load products and categories globally
    
    api.get('/settings').then(res => {
      // Update store with specialized branding from general settings
      updateBranding({
        primaryColor: res.data.primary_color || '#eb5e28',
        storeName: res.data.store_name || 'MyMenuEG',
        logoUrl: res.data.logo_url || ''
      });
    }).catch(console.error);
  }, []);

  // 2. Dynamic Theme Injection (CSS Variables)
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-500', branding.primaryColor);
    // Simple way to generate 400/600 shades
    document.documentElement.style.setProperty('--primary-400', branding.primaryColor + 'cc');
    document.documentElement.style.setProperty('--primary-600', branding.primaryColor);
  }, [branding.primaryColor]);

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
             // Update timestamp
             lastOrderCheck = new Date().toISOString().replace('T', ' ').split('.')[0];
          }
       } catch (e) {
          console.error("Polling failed", e);
       }
    };

    const interval = setInterval(checkOrders, 30000); // 30s
    return () => clearInterval(interval);
  }, [rtl]);

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

    // 5. Favicon and Global Title Sync
    if (branding.logoUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = branding.logoUrl.startsWith('http') ? branding.logoUrl : `http://localhost:5000${branding.logoUrl}`;
    }
    
    // Default Title (if pages don't override it)
    if (!document.title.includes('|')) {
      document.title = branding.storeName;
    }
  }, [theme, rtl, branding]);

  return (
    <BrowserRouter>
      <div className={`min-h-screen relative overflow-hidden text-slate-900 dark:text-white flex flex-col ${theme} ${rtl ? 'rtl' : 'ltr'}`}>
        <Toaster 
          position="bottom-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: theme === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.85)',
              color: theme === 'dark' ? '#fff' : '#1e293b',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: '600',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <BackgroundEffect style={backgroundStyle || 'default'} theme={theme} />
        <PromotionStrip />
        <Navbar />
        <WhatsAppButton />
        <main className="flex-grow pt-24 z-10 mx-auto w-full max-w-[100vw]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Catalog />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/disposables" element={<Disposables />} />
            <Route path="/cart" element={<Cart />} />
            
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Overview />} />
              <Route path="products" element={<ProductsList />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/edit/:id" element={<ProductForm />} />
              <Route path="categories" element={<CategoriesList />} />
              <Route path="slider" element={<SliderManager />} />
              <Route path="orders" element={<OrdersList />} />
              <Route path="customers" element={<CustomersList />} />
              <Route path="coupons" element={<CouponsManager />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/track" element={<OrderTracking />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
