import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../api'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
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
  stock: number;
  status: string;
  is_best_seller?: boolean | number;
  view_count?: number;
  specs?: any[];
  images?: any[];
  shipping_info_ar?: string;
  shipping_info_en?: string;
  warranty_info_ar?: string;
  warranty_info_en?: string;
}

interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  icon?: string;
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
  removeFromCart: (id: string) => void
  clearCart: () => void

  // Core Data
  products: Product[];
  categories: Category[];
  isDataLoaded: boolean;
  fetchInitialData: () => Promise<void>;

  // Branding State
  branding: {
    primaryColor: string;
    storeName: string;
    logoUrl: string;
  }
  updateBranding: (branding: Partial<AppState['branding']>) => void

  // Wishlist State
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
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
        const existing = state.cart.find(i => i.id === item.id)
        if (existing) {
          return { cart: state.cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity, image: item.image || i.image } : i) }
        }
        return { cart: [...state.cart, item] }
      }),
      removeFromCart: (id) => set((state) => ({ cart: state.cart.filter(i => i.id !== id) })),
      clearCart: () => set({ cart: [] }),
      
      // Core Data Implementation
      products: [],
      categories: [],
      isDataLoaded: false,
      fetchInitialData: async () => {
        try {
          const [prodRes, catRes] = await Promise.all([
            api.get('/products?limit=2000'),
            api.get('/categories')
          ]);
          
          const rawProds = prodRes.data;
          const prods = Array.isArray(rawProds) ? rawProds : (rawProds.products || []);
          
          set({ 
            products: prods, 
            categories: catRes.data,
            isDataLoaded: true 
          });
        } catch (error) {
          console.error('Failed to fetch initial data:', error);
        }
      },

      branding: {
        primaryColor: '#eb5e28',
        storeName: 'MyMenuEG',
        logoUrl: ''
      },
      updateBranding: (newBranding) => set((state) => ({
        branding: { ...state.branding, ...newBranding }
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
    }),
    {
      name: 'mymenueg-storage',
      // Only persist UI settings, not the transient data
      partialize: (state) => ({
        theme: state.theme,
        rtl: state.rtl,
        cardStyle: state.cardStyle,
        cardHoverAnimation: state.cardHoverAnimation,
        backgroundStyle: state.backgroundStyle,
        cart: state.cart,
        branding: state.branding,
        wishlist: state.wishlist          // Correctly persist wishlist
      }),
    }
  )
)
