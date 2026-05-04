import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../../store/store';
import { Plus, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../../api';
import { motion, AnimatePresence } from 'framer-motion';

// Extracted Components
import ProductsFilter from './components/ProductsFilter';
import ProductsTable from './components/ProductsTable';
import PagesStripPanel from '../settings/components/PagesStripPanel';

interface ProductListItem {
  id: string;
  image_url?: string;
  name_ar: string;
  name_en: string;
  cat_name_ar?: string;
  cat_name_en?: string;
  price: number;
  old_price: number;
  stock: number;
  status?: string;
  bundle_items?: Array<{
    product_id: string;
    quantity: number;
    discount?: number;
    product?: { price: number };
  }>;
}

interface ProductsResponse {
  products: ProductListItem[];
  total: number;
  pages: number;
  currentPage: number;
}

export default function ProductsList() {
  const { rtl } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1,
    limit: 10
  });

  const fetchProducts = useCallback((page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: pagination.limit.toString(),
      category_id: selectedCategory,
      q: searchTerm
    });

    api.get(`/products?${params.toString()}`)
      .then((res: { data: ProductListItem[] | ProductsResponse }) => {
        const data = res.data;
        if (Array.isArray(data)) {
          // Fallback for old API format
          setProducts(data);
          setPagination(prev => ({ ...prev, total: data.length, pages: 1 }));
        } else if (data && data.products) {
          // New paginated format
          setProducts(data.products || []);
          setPagination({
            total: data.total || 0,
            pages: data.pages || 1,
            currentPage: data.currentPage || 1,
            limit: pagination.limit
          });
        } else {
          setProducts([]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [pagination.limit, searchTerm, selectedCategory]);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const [showStripPanel, setShowStripPanel] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{rtl ? 'قائمة المنتجات' : 'Products List'}</h1>
          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">{rtl ? 'إدارة محتوى المتجر' : 'Store Content Management'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStripPanel(!showStripPanel)}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all duration-300 ${showStripPanel ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-primary-500 hover:text-white hover:shadow-lg hover:shadow-primary-500/20'}`}
          >
            <LayoutGrid size={20} />
            <span className="font-bold">{rtl ? 'صور الشريط' : 'Strip Images'}</span>
          </button>
          <Link to="/admin/products/new" className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl font-black text-sm transition-all duration-300 bg-primary-500 text-white shadow-lg shadow-primary-500/25 hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0 dark:bg-primary-600 dark:hover:bg-primary-500">
            <span className="w-7 h-7 rounded-lg bg-white/30 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
              <Plus size={16} strokeWidth={3} />
            </span>
            <span>{rtl ? 'إضافة منتج جديد' : 'New Product'}</span>
          </Link>
        </div>
      </div>

      {/* Pages Strip Panel (toggle) */}
      <AnimatePresence>
        {showStripPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-6"
          >
            <PagesStripPanel />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search / Filter */}
      <ProductsFilter 
        rtl={rtl} 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Data Table */}
      <ProductsTable 
        rtl={rtl} 
        products={products} 
        onRefresh={() => fetchProducts(pagination.currentPage)}
        loading={loading}
        pagination={pagination}
        onPageChange={(p: number) => fetchProducts(p)}
      />
    </div>
  )
}
