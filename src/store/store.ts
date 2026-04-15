import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../api'

let refreshBlockedUntilMs = 0;

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  variant?: string
}

interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  price: number;
  old_price: number;
  description_ar: string;
  description_en: string;
  image_url: string;
  category_id: string;
  page_id?: string;
  stock: number;
  status: string;
  is_best_seller?: boolean | number;
  view_count?: number;
  specs?: Array<{ key_ar?: string; key_en?: string; val_ar?: string; val_en?: string }>;
  images?: string[];
  quantity_prices?: { quantity_label: string; price: number }[];
  variants?: Array<{
    label_ar?: string;
    label_en?: string;
    sku?: string;
    price: number;
    old_price?: number;
    stock?: number;
    is_default?: boolean;
    image_url?: string;
    imageUrl?: string;
  }>;
  shipping_info_ar?: string;
  shipping_info_en?: string;
  warranty_info_ar?: string;
  warranty_info_en?: string;
  carton_details_ar?: string;
  carton_details_en?: string;
  brand_ar?: string;
  brand_en?: string;
  material_ar?: string;
  material_en?: string;
  dimensions_ar?: string;
  dimensions_en?: string;
  usage_notes_ar?: string;
  usage_notes_en?: string;
  template_key?: string;
  detail_items?: Array<{
    label_ar?: string;
    label_en?: string;
    value_ar?: string;
    value_en?: string;
    order_index?: number;
  }>;
}

interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  subtitle_ar?: string;
  subtitle_en?: string;
  icon?: string;
}

interface StorePage {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  show_in_navbar: boolean | number;
  is_dynamic: boolean | number;
  status?: string;
  order_index?: number;
}

interface AdminUser {
  id: string;
  username: string;
  is_super_admin: boolean;
  permissions: string[];
}

interface SettingsResponse {
  sliderInterval?: string | number;
  [key: string]: unknown;
}

interface NotificationItem {
  id: string;
  is_read: boolean;
  type: string;
  title_ar: string;
  title_en: string;
  message_ar: string;
  message_en: string;
  created_at: string;
}

interface AppState {
  theme: 'dark' | 'light'
  rtl: boolean
  cardStyle: 'classic' | 'floating' | 'minimal'
  cardHoverAnimation: 'zoom' | 'lift' | 'glow' | 'none'
  backgroundStyle: 'blobs' | 'grid' | 'cinema' | 'default'
  toastMessage: { text: string; type: 'success' | 'error' } | null
  showToast: (text: string, type?: 'success' | 'error') => void
  hideToast: () => void
  toggleTheme: () => void
  toggleRtl: () => void
  setCardStyle: (style: 'classic' | 'floating' | 'minimal') => void
  setCardHoverAnimation: (animation: 'zoom' | 'lift' | 'glow' | 'none') => void
  setBackgroundStyle: (style: 'blobs' | 'grid' | 'cinema' | 'default') => void
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string, variant?: string) => void
  decreaseQuantity: (id: string, variant?: string) => void
  clearCart: () => void

  // Core Data
  products: Product[];
  categories: Category[];
  pages: StorePage[];
  isDataLoaded: boolean;
  fetchInitialData: () => Promise<void>;
  settingsCache: { data: SettingsResponse | null; fetchedAt: number | null };
  fetchSettings: (force?: boolean) => Promise<SettingsResponse | null>;

  // Branding State
  branding: {
    primaryColor: string;
    secondaryColor: string;
    blendColors: boolean;
    lightBgColor: string;
    storeName: string;
    logoUrl: string;
  }
  updateBranding: (branding: Partial<AppState['branding']>) => void

  // Wishlist State
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;

  // Auth State
  user: AdminUser | null;
  token: string | null;
  authChecked: boolean;
  setAuthSession: (user: AdminUser, token: string) => void;
  clearAuthSession: () => void;
  refreshSession: () => Promise<void>;
  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  
  // Admins Management (Super Admin)
  admins: AdminUser[];
  fetchAdmins: () => Promise<void>;
  addAdmin: (data: { username: string; password: string; is_super_admin?: boolean; permissions: string[] }) => Promise<boolean>;
  updateAdmin: (id: string, data: Partial<{ username: string; password: string; is_super_admin: boolean; permissions: string[] }>) => Promise<boolean>;
  deleteAdmin: (id: string) => Promise<boolean>;

  // Loading Screen State
  loadingScreen: {
    enabled: boolean;
    type: 'animation' | 'custom';
    imageUrl: string;
    minDuration: number;
  }
  updateLoadingScreen: (settings: Partial<AppState['loadingScreen']>) => void;
  
  // Contact Page State
  contactSettings: {
    heroTitleAr: string;
    heroTitleEn: string;
    heroSubtitleAr: string;
    heroSubtitleEn: string;
    formTitleAr: string;
    formTitleEn: string;
    formSubtitleAr: string;
    formSubtitleEn: string;
    submitBtnAr: string;
    submitBtnEn: string;
    whatsapp: string;
    phone: string;
    email: string;
    addressAr: string;
    addressEn: string;
    workingHoursAr: string;
    workingHoursEn: string;
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    tiktokUrl?: string;
    snapchatUrl?: string;
    linkedinUrl?: string;
    youtubeUrl?: string;
  }
  updateContactSettings: (settings: Partial<AppState['contactSettings']>) => void;

  // FAQ Page State
  faqSettings: {
    enabled: boolean;
    items: { qAr: string; qEn: string; aAr: string; aEn: string; }[];
  };
  updateFaqSettings: (settings: Partial<AppState['faqSettings']>) => void;

  // Not Found Page State
  notfoundSettings: {
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
  };
  updateNotFoundSettings: (settings: Partial<AppState['notfoundSettings']>) => void;

  // Payment Settings
  paymentSettings: {
    onlinePaymentEnabled: boolean;
    cod: boolean;
    paymob: boolean;
    fawry: boolean;
    wallet: boolean;
    paymobApiKey: string;
    paymobIntegrationId: string;
    fawryMerchantCode: string;
    fawrySecurityKey: string;
  };
  updatePaymentSettings: (settings: Partial<AppState['paymentSettings']>) => void;

  // Tracked Orders & Notifications
  trackedOrders: string[];
  trackedOrderPhones: Record<string, string>;
  addTrackedOrder: (orderId: string, customerPhone?: string) => void;
  notifications: NotificationItem[];
  fetchNotifications: () => Promise<void>;
  markNotificationsAsRead: () => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      rtl: true,
      cardStyle: 'floating',
      cardHoverAnimation: 'zoom',
      backgroundStyle: 'blobs',
      toastMessage: null,
      showToast: (text, type = 'success') => {
        set({ toastMessage: { text, type } })
        setTimeout(() => set({ toastMessage: null }), 3000)
      },
      hideToast: () => set({ toastMessage: null }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      toggleRtl: () => set((state) => ({ rtl: !state.rtl })),
      setCardStyle: (style) => set({ cardStyle: style }),
      setCardHoverAnimation: (animation) => set({ cardHoverAnimation: animation }),
      setBackgroundStyle: (style) => set({ backgroundStyle: style }),
      cart: [],
      addToCart: (item) => set((state) => {
        const existing = state.cart.find(i => i.id === item.id && i.variant === item.variant)
        if (existing) {
          return { cart: state.cart.map(i => (i.id === item.id && i.variant === item.variant) ? { ...i, quantity: i.quantity + item.quantity, image: item.image || i.image } : i) }
        }
        return { cart: [...state.cart, item] }
      }),
      removeFromCart: (id, variant) => set((state) => ({ 
        cart: state.cart.filter(i => !(i.id === id && i.variant === variant)) 
      })),
      decreaseQuantity: (id, variant) => set((state) => {
        const item = state.cart.find(i => i.id === id && i.variant === variant);
        if (item && item.quantity > 1) {
          return { cart: state.cart.map(i => (i.id === id && i.variant === variant) ? { ...i, quantity: i.quantity - 1 } : i) };
        }
        return { cart: state.cart.filter(i => !(i.id === id && i.variant === variant)) };
      }),
      clearCart: () => set({ cart: [] }),
      
      // Core Data Implementation
      products: [],
      categories: [],
      pages: [],
      isDataLoaded: false,
      settingsCache: { data: null, fetchedAt: null },
      fetchInitialData: async () => {
        try {
          const [prodRes, catRes, pageRes] = await Promise.all([
            api.get('/products?limit=2000'),
            api.get('/categories'),
            api.get('/pages')
          ]);
          
          const rawProds = prodRes.data;
          const prods = Array.isArray(rawProds) ? rawProds : (rawProds.products || []);
          
          set({ 
            products: prods, 
            categories: catRes.data,
            pages: pageRes.data,
            isDataLoaded: true 
          });
        } catch (error) {
          console.error('Failed to fetch initial data:', error);
        }
      },
      fetchSettings: async (force = false) => {
        const cache = get().settingsCache;
        const now = Date.now();
        const isFresh = cache.fetchedAt !== null && (now - cache.fetchedAt) < 120000;

        if (!force && cache.data && isFresh) {
          return cache.data;
        }

        try {
          const res = await api.get('/settings');
          const payload = (res.data ?? null) as SettingsResponse | null;
          set({ settingsCache: { data: payload, fetchedAt: now } });
          return payload;
        } catch (error) {
          console.error('Failed to fetch settings:', error);
          return cache.data;
        }
      },

      branding: {
        primaryColor: '#eb5e28',
        secondaryColor: '#10b981',
        blendColors: false,
        lightBgColor: '#e2e8f0',
        storeName: 'MyMenuEG',
        logoUrl: ''
      },
      updateBranding: (newBranding) => set((state) => ({
        branding: { ...state.branding, ...newBranding }
      })),
      loadingScreen: {
        enabled: true,
        type: 'animation',
        imageUrl: '',
        minDuration: 1500
      },
      updateLoadingScreen: (newSettings) => set((state) => ({
        loadingScreen: { ...state.loadingScreen, ...newSettings }
      })),
      contactSettings: {
        heroTitleAr: "تواصل معنا - نحن هنا لمساعدتك",
        heroTitleEn: "Contact Us - We're Here to Help",
        heroSubtitleAr: "سواء كان لديك استفسار حول منتجاتنا، أو طلبات بالجملة، أو تحتاج إلى تصميم مخصص لمعدات مطعمك، فريقنا خبير وجاهز لتقديم الدعم الكامل عبر جميع وسائل التواصل.",
        heroSubtitleEn: "Whether you have an inquiry about our products, wholesale orders, or need custom designs for your restaurant supplies, our expert team is ready to fully support you.",
        formTitleAr: "أرسل لنا رسالة مباشرة",
        formTitleEn: "Send us a direct message",
        formSubtitleAr: "يرجى تعبئة النموذج أدناه وسيقوم أحد ممثلي المبيعات أو الدعم الفني بالرد عليك في غضون 24 ساعة كحد أقصى.",
        formSubtitleEn: "Please fill out the form below and one of our sales or technical support representatives will get back to you within 24 hours.",
        submitBtnAr: "إرسال الرسالة الآن",
        submitBtnEn: "Send Message Now",
        whatsapp: "+20 123 456 789",
        phone: "+20 123 456 789",
        email: "hello@mymenueg.com",
        addressAr: "القاهرة، مصر - شارع التسعين",
        addressEn: "90th St, Cairo, Egypt",
        workingHoursAr: "الأحد - الخميس: 9:00 AM - 6:00 PM | السبت: 10:00 AM - 4:00 PM",
        workingHoursEn: "Sun - Thu: 9:00 AM - 6:00 PM | Sat: 10:00 AM - 4:00 PM",
        facebookUrl: "",
        instagramUrl: "",
        twitterUrl: "",
        tiktokUrl: "",
        snapchatUrl: "",
        linkedinUrl: "",
        youtubeUrl: ""
      },
      updateContactSettings: (newSettings) => set((state) => ({
        contactSettings: { ...state.contactSettings, ...newSettings }
      })),
      
      faqSettings: {
        enabled: true,
        items: []
      },
      updateFaqSettings: (newSettings) => set((state) => ({
        faqSettings: { ...state.faqSettings, ...newSettings }
      })),

      notfoundSettings: {
        titleAr: 'أوبس! صفحة مفقودة',
        titleEn: 'Oops! Page Missing',
        descAr: 'يبدو أن الصفحة التي تبحث عنها غير موجودة، ربما تم تغيير الرابط أو إزالتها.',
        descEn: 'It looks like the page you are looking for doesn\'t exist, it might have been moved or removed.'
      },
      updateNotFoundSettings: (newSettings) => set((state) => ({
        notfoundSettings: { ...state.notfoundSettings, ...newSettings }
      })),

      // Payment Settings
      paymentSettings: {
        onlinePaymentEnabled: false,
        cod: true,
        paymob: false,
        fawry: false,
        wallet: false,
        paymobApiKey: '',
        paymobIntegrationId: '',
        fawryMerchantCode: '',
        fawrySecurityKey: ''
      },
      updatePaymentSettings: (newSettings) => set((state) => ({
        paymentSettings: { ...state.paymentSettings, ...newSettings }
      })),

      // Wishlist Implementation
      wishlist: [],
      toggleWishlist: (product) => set((state) => {
        const index = state.wishlist.findIndex(p => p.id === product.id);
        if (index > -1) {
           return { wishlist: state.wishlist.filter(p => p.id !== product.id) };
        }
        return { wishlist: [...state.wishlist, product] };
      }),

      // Auth Implementation
      user: null,
      token: null,
      authChecked: false,
      setAuthSession: (user, token) => set({ user, token, authChecked: true }),
      clearAuthSession: () => set({ user: null, token: null, authChecked: true }),
      refreshSession: async () => {
        const now = Date.now();
        if (now < refreshBlockedUntilMs) {
          set({ authChecked: true });
          return;
        }
        try {
          const res = await api.post('/auth/refresh');
          if (res.data?.token && res.data?.user) {
            set({ user: res.data.user, token: res.data.token, authChecked: true });
            return;
          }
          set({ user: null, token: null, authChecked: true });
        } catch (err) {
          const status = (err as any)?.response?.status;
          if (status === 429) {
            refreshBlockedUntilMs = Date.now() + 15000;
          }
          set({ user: null, token: null, authChecked: true });
        }
      },
      login: async (credentials) => {
        try {
          const res = await api.post('/auth/login', credentials);
          set({ user: res.data.user, token: res.data.token, authChecked: true });
          return true;
        } catch (error) {
          console.error('Login failed:', error);
          return false;
        }
      },
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          // best-effort logout, continue clearing local session
        }
        set({ user: null, token: null, authChecked: true });
      },

      // Tracked Orders & Notifications
      trackedOrders: [],
      trackedOrderPhones: {},
      addTrackedOrder: (orderId, customerPhone) => set((state) => {
        const nextPhones = { ...state.trackedOrderPhones };
        if (customerPhone && customerPhone.trim()) {
          nextPhones[orderId] = customerPhone.trim();
        }
        if (!state.trackedOrders.includes(orderId)) {
          return {
            trackedOrders: [...state.trackedOrders, orderId],
            trackedOrderPhones: nextPhones
          };
        }
        return { trackedOrderPhones: nextPhones };
      }),
      notifications: [],
      fetchNotifications: async () => {
        const orderIds = get().trackedOrders;
        if (orderIds.length === 0) return;
        try {
          const trackedOrderPhones = get().trackedOrderPhones || {};
          const customerPhone = trackedOrderPhones[orderIds[orderIds.length - 1]];
          const res = await api.post('/notifications/customer', { orderIds, customerPhone });
          set({ notifications: res.data });
        } catch (err) {
          console.error('Failed to fetch notifications', err);
        }
      },
      markNotificationsAsRead: async () => {
        const orderIds = get().trackedOrders;
        if (orderIds.length === 0) return;
        try {
          const trackedOrderPhones = get().trackedOrderPhones || {};
          const customerPhone = trackedOrderPhones[orderIds[orderIds.length - 1]];
          await api.put('/notifications/read', { orderIds, customerPhone });
          const updated = get().notifications.map(n => ({ ...n, is_read: true }));
          set({ notifications: updated });
        } catch (err) {
           console.error('Failed to mark read', err);
        }
      },

      // Admins Management
      admins: [],
      fetchAdmins: async () => {
        try {
          const res = await api.get('/admins');
          set({ admins: res.data });
        } catch {
          console.error('Failed to fetch admins');
        }
      },
      addAdmin: async (data) => {
        try {
          await api.post('/admins', data);
          return true;
        } catch {
          return false;
        }
      },
      updateAdmin: async (id, data) => {
        try {
          await api.put(`/admins/${id}`, data);
          // If updating current user, refresh store user data
          if (get().user?.id === id) {
            const upUser = { ...get().user!, ...data };
            if (data.permissions) upUser.permissions = data.permissions;
            set({ user: upUser });
          }
          return true;
        } catch {
          return false;
        }
      },
      deleteAdmin: async (id) => {
        try {
          await api.delete(`/admins/${id}`);
          return true;
        } catch {
          return false;
        }
      }
    }),
    {
      name: 'mymenueg-storage',
      // Only persist UI settings, not the transient data
      partialize: (state) => ({
        theme: state.theme,
        rtl: state.rtl,
        cardHoverAnimation: state.cardHoverAnimation,
        backgroundStyle: state.backgroundStyle,
        cart: state.cart,
        trackedOrders: state.trackedOrders,
        trackedOrderPhones: state.trackedOrderPhones,
        branding: state.branding,
        loadingScreen: state.loadingScreen,
        contactSettings: state.contactSettings,
        faqSettings: state.faqSettings,
        notfoundSettings: state.notfoundSettings,
        paymentSettings: state.paymentSettings,
        wishlist: state.wishlist,
        user: null,
        token: null
      }),
    }
  )
)
