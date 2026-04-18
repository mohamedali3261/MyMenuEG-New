import { Search, Plus, Trash2, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../../../api';
import { useCallback, useRef } from 'react';

interface Props {
  rtl: boolean;
  bundleItems: any[];
  setBundleItems: (items: any[]) => void;
  bundleSearch: string;
  setBundleSearch: (val: string) => void;
  bundleResults: any[];
  setBundleResults: (res: any[]) => void;
  searchingBundle: boolean;
  setSearchingBundle: (val: boolean) => void;
}

export function BundleSection({
  rtl, bundleItems, setBundleItems,
  bundleSearch, setBundleSearch, bundleResults, setBundleResults,
  searchingBundle, setSearchingBundle
}: Props) {

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSearch = useCallback((query: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim() || query.length < 2) {
      setBundleResults([]);
      setSearchingBundle(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(query)}&limit=10`);
        setBundleResults(res.data.products || []);
      } catch (err) {
        console.error('Failed to search bundle products', err);
      } finally {
        setSearchingBundle(false);
      }
    }, 400);
  }, [setBundleResults, setSearchingBundle]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBundleSearch(val);
    setSearchingBundle(true);
    performSearch(val);
  };

  const addBundleItem = (prod: any) => {
    if (bundleItems.find(i => i.product_id === prod.id)) return;
    setBundleItems([...bundleItems, { product_id: prod.id, quantity: 1, product: prod }]);
    setBundleSearch('');
    setBundleResults([]);
  };

  const removeBundleItem = (id: string) => {
    setBundleItems(bundleItems.filter(i => i.product_id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    setBundleItems(bundleItems.map(i => i.product_id === id ? { ...i, quantity: qty } : i));
  };

  return (
    <div className="bg-white dark:bg-[#111] p-6 lg:p-10 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl" />
      <div className="relative">
        <h2 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-900 dark:text-white uppercase tracking-widest">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
            <Package size={20} />
          </div>
          {rtl ? 'محتويات الباقة (Bundle Items)' : 'Bundle Configuration'}
        </h2>

        {/* Search Input */}
        <div className="relative mb-8 z-10">
          <Search className={`absolute ${rtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
          <input
            type="text"
            className={`w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3 ${rtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all shadow-inner`}
            placeholder={rtl ? 'ابحث عن منتج لإضافته للباقة...' : 'Search for products to bundle...'}
            value={bundleSearch}
            onChange={handleSearch}
          />
          {searchingBundle && (
            <div className={`absolute ${rtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin`} />
          )}

          {/* Typeahead Results */}
          {bundleResults.length > 0 && bundleSearch.length >= 2 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-60 overflow-y-auto"
            >
              {bundleResults.map(res => (
                <button
                  key={res.id}
                  onClick={() => addBundleItem(res)}
                  className="w-full text-start px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between group border-b border-slate-100 dark:border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <img src={res.image_url || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                    <span className="text-sm font-bold">{rtl ? res.name_ar : res.name_en}</span>
                  </div>
                  <Plus size={16} className="text-slate-400 group-hover:text-rose-500" />
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Selected Bundle Items */}
        <div className="space-y-4">
          {bundleItems.map((item) => (
            <motion.div
              key={item.product_id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-2xl"
            >
              <div className="w-12 h-12 bg-white dark:bg-black/20 rounded-xl overflow-hidden flex-shrink-0">
                 <img src={item.product?.image_url || 'https://via.placeholder.com/50'} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold truncate">{item.product ? (rtl ? item.product.name_ar : item.product.name_en) : 'Loading...'}</h4>
                <div className="text-xs text-rose-500 font-black tracking-widest mt-1">EGP {item.product?.price || 0}</div>
              </div>

              {/* Quantity Adjuster */}
              <div className="flex items-center gap-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-1">
                <input 
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value) || 1)}
                  className="w-12 text-center bg-transparent text-sm font-bold focus:outline-none"
                />
              </div>

              <button
                onClick={() => removeBundleItem(item.product_id)}
                className="w-10 h-10 rounded-xl bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/10 transition-colors flex-shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
          {bundleItems.length === 0 && (
            <div className="text-center py-12 text-sm text-slate-500 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
              {rtl ? 'لم تقم بتحديد أي منتجات داخل الباقة' : 'No items added to this bundle yet.'}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
