import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../../store/store';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../../api';

// Extracted Components
import ProductsFilter from './components/ProductsFilter';
import ProductsTable from './components/ProductsTable';

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

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{rtl ? 'قائمة المنتجات' : 'Products List'}</h1>
          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">{rtl ? 'إدارة محتوى المتجر' : 'Store Content Management'}</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 shadow-xl shadow-primary-500/20">
          <Plus size={20} />
          <span className="font-bold">{rtl ? 'إضافة منتج جديد' : 'New Product'}</span>
        </Link>
      </div>

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
