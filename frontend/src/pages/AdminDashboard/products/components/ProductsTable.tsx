import { Edit2, Trash2, Package, ChevronLeft, ChevronRight, Activity, Ban } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../../../../store/store';
import { api } from '../../../../api';
import ConfirmModal from '../../components/ConfirmModal';
import PremiumDropdown from '../../../../components/ui/PremiumDropdown';
import { resolveAssetUrl } from '../../../../utils/assetUrl';

interface ProductsTableProps {
  rtl: boolean;
  products: ProductItem[];
  onRefresh: () => void;
  loading: boolean;
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    limit: number;
  };
  onPageChange: (page: number) => void;
}

interface ProductItem {
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

export default function ProductsTable({ 
  rtl, products = [], onRefresh, loading, pagination, onPageChange 
}: ProductsTableProps) {
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: string | null }>({
    isOpen: false,
    id: null
  });
  const { showToast } = useStore();

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await api.delete(`/products/${deleteModal.id}`);
      onRefresh();
      setDeleteModal({ isOpen: false, id: null });
      showToast(rtl ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully');
    } catch(err) {
      console.error(err);
    }
  };

  const statusOptions = [
    { value: 'active', labelAr: 'نشط', labelEn: 'Active', icon: <Activity size={14} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { value: 'archived', labelAr: 'معطل', labelEn: 'Disabled', icon: <Ban size={14} />, color: 'text-rose-500', bg: 'bg-rose-500/10' }
  ];

  const normalizeStatus = (status?: string) => {
    const value = status?.toLowerCase();
    if (value === 'disabled') return 'archived';
    if (value === 'active' || value === 'draft' || value === 'archived') return value;
    return 'active';
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
     try {
        await api.patch(`/products/${id}/status`, { status: newStatus });
        onRefresh();
        showToast(rtl ? 'تم تحديث الحالة بنجاح' : 'Status updated successfully', 'success');
     } catch(err) {
        console.error(err);
        showToast(rtl ? 'فشل تحديث الحالة' : 'Failed to update status', 'error');
     }
  };

  return (
    <div className={`space-y-4 ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
      
      {/* Desktop/Tablet Table View */}
      <div className="hidden md:block glass-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-primary-500/10 scrollbar-track-transparent">
          <table className="w-full text-left" dir={rtl ? 'rtl' : 'ltr'}>
            <thead className="bg-slate-100/30 dark:bg-black/40 border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-6 py-5 font-bold text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">{rtl ? 'المنتج' : 'Product'}</th>
                <th className="px-6 py-5 font-bold text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 hidden lg:table-cell">{rtl ? 'التصنيف' : 'Category'}</th>
                <th className="px-6 py-5 font-bold text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">{rtl ? 'السعر' : 'Price'}</th>
                <th className="px-6 py-5 font-bold text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 hidden lg:table-cell">{rtl ? 'المخزون' : 'Stock'}</th>
                <th className="px-6 py-5 font-bold text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">{rtl ? 'الحالة' : 'Status'}</th>
                <th className="px-6 py-5 font-bold text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">{rtl ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {products.map((product) => (
                <tr key={product.id} className="group hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-all duration-300">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      {product.image_url ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden ring-1 ring-white/20 shadow-lg shrink-0">
                          <img src={resolveAssetUrl(product.image_url)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 shrink-0 border border-dashed border-white/20">
                          <Package size={20} />
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white line-clamp-1 text-sm">{rtl ? product.name_ar : product.name_en}</span>
                        <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 lg:hidden">
                          {product.cat_name_ar ? (rtl ? product.cat_name_ar : product.cat_name_en) : (rtl ? 'بدون قسم' : 'No Category')}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 hidden lg:table-cell">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-primary-500/10 text-primary-600 dark:text-primary-400 px-3 py-1.5 rounded-full border border-primary-500/20 whitespace-nowrap">
                      {product.cat_name_ar ? (rtl ? product.cat_name_ar : product.cat_name_en) : (rtl ? '-- غير مصنف --' : '-- Uncategorized --')}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-bold">
                     <div className="flex flex-col">
                        <div className="text-sm text-slate-900 dark:text-white">{product.price?.toLocaleString()} <span className="text-[9px] font-black opacity-50 uppercase tracking-tighter">EGP</span></div>
                        {product.old_price > product.price && (
                           <span className="text-[10px] text-slate-400 line-through opacity-60 font-black italic">{product.old_price.toLocaleString()}</span>
                        )}
                     </div>
                  </td>
                  <td className="px-6 py-5 hidden lg:table-cell">
                    <div className="flex flex-col gap-1.5 w-24">
                      <div className="flex items-center justify-between text-[9px] font-black tracking-widest">
                        <span className={product.stock < 10 ? 'text-rose-500' : 'text-slate-500'}>{product.stock} {rtl ? 'قطعة' : 'PCS'}</span>
                      </div>
                      <div className="w-full h-1 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                         <div className={`h-full ${product.stock < 10 ? 'bg-rose-500' : 'bg-primary-500'}`} style={{ width: `${Math.min(product.stock, 100)}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <PremiumDropdown 
                      value={normalizeStatus(product.status)} 
                      options={statusOptions}
                      rtl={rtl} 
                      onChange={(newStatus) => handleStatusChange(product.id, newStatus)} 
                    />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <Link to={`/admin/products/edit/${product.id}`} className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 hover:text-primary-500 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 transition-all">
                        <Edit2 size={14} />
                      </Link>
                      <button onClick={() => setDeleteModal({ isOpen: true, id: product.id })} className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 hover:text-red-500 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {products.map((product) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={product.id} 
            className="glass-card p-3 flex flex-col gap-3 relative overflow-hidden"
          >
            <div className="flex gap-3">
              {product.image_url ? (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden shrink-0 shadow-md ring-1 ring-white/10">
                  <img src={resolveAssetUrl(product.image_url)} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 shrink-0 border border-dashed border-white/10">
                  <Package size={20} />
                </div>
              )}
              <div className="flex-grow min-w-0 flex flex-col justify-center">
                <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{rtl ? product.name_ar : product.name_en}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[8px] font-black uppercase tracking-widest bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded-full">
                    {product.cat_name_ar ? (rtl ? product.cat_name_ar : product.cat_name_en) : (rtl ? 'بدون قسم' : 'No Category')}
                  </span>
                  <span className={`text-[8px] font-black ${product.stock < 10 ? 'text-rose-500' : 'text-slate-500'}`}>{product.stock} {rtl ? 'قطعة' : 'Units'}</span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-sm font-extrabold text-primary-500">EGP {product.price?.toLocaleString()}</span>
                  {product.old_price > product.price && (
                    <span className="text-[9px] text-slate-400 line-through font-black italic">{product.old_price.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/5 gap-2">
              <div className="w-[110px] shrink-0">
                <PremiumDropdown 
                  value={normalizeStatus(product.status)} 
                  options={statusOptions}
                  rtl={rtl} 
                  onChange={(newStatus) => handleStatusChange(product.id, newStatus)} 
                />
              </div>
              <div className="flex gap-1.5">
                <Link to={`/admin/products/edit/${product.id}`} className="p-2.5 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 active:scale-90 transition-transform">
                  <Edit2 size={14} />
                </Link>
                <button onClick={() => setDeleteModal({ isOpen: true, id: product.id })} className="p-2.5 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 text-rose-500/70 active:scale-90 transition-transform">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* No Results Fallback */}
      {products.length === 0 && !loading && (
        <div className="p-20 text-center text-slate-500 flex flex-col items-center gap-4">
          <div className="p-6 bg-slate-100 dark:bg-white/5 rounded-full">
            <Package size={48} className="opacity-20" />
          </div>
          <p className="font-bold">{rtl ? 'لا توجد منتجات حالياً في هذا القسم.' : 'No products found in this section.'}</p>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="bg-slate-50/50 dark:bg-black/40 backdrop-blur-md px-4 py-5 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-white/10">
        <div className="text-xs font-black uppercase tracking-widest text-slate-400">
          {rtl ? `عرض ${products.length} من أصل ${pagination.total}` : `Showing ${products.length} of ${pagination.total}`}
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            disabled={pagination.currentPage === 1 || loading}
            onClick={() => onPageChange(pagination.currentPage - 1)}
            className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-primary-500/20 transition-all shadow-sm"
          >
            <ChevronLeft size={18} className={rtl ? 'rotate-180' : ''} />
          </button>
          
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 dark:bg-black/20 rounded-2xl border border-white/5">
             {[...Array(pagination.pages)].map((_, i) => {
               const page = i + 1;
               // Simplify pagination for many pages
               if (pagination.pages > 5 && Math.abs(page - pagination.currentPage) > 2) return null;
               
               return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`min-w-[32px] h-8 rounded-lg text-xs font-black transition-all ${
                    pagination.currentPage === page 
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-110' 
                      : 'text-slate-400 hover:text-primary-500'
                  }`}
                >
                  {page}
                </button>
               );
             })}
          </div>

          <button 
            disabled={pagination.currentPage === pagination.pages || loading}
            onClick={() => onPageChange(pagination.currentPage + 1)}
            className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-primary-500/20 transition-all shadow-sm"
          >
            <ChevronRight size={18} className={rtl ? 'rotate-180' : ''} />
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        rtl={rtl}
      />
    </div>
  );
}
