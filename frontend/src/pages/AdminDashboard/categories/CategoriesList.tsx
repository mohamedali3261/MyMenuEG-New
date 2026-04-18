import { useState, useEffect } from 'react';
import { useStore } from '../../../store/store';
import { Plus, Trash2, Tag, Loader2 } from 'lucide-react';
import { api } from '../../../api';
import ConfirmModal from '../components/ConfirmModal';

interface CategoryItem {
  id: string;
  name_ar: string;
  name_en: string;
  subtitle_ar?: string;
  subtitle_en?: string;
  status?: string;
}

export default function CategoriesList() {
  const { rtl, showToast } = useStore();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, id: string | null}>({
    isOpen: false,
    id: null
  });

  // Add state
  const [adding, setAdding] = useState(false);
  const [newCat, setNewCat] = useState({ 
    name_ar: '', 
    name_en: '', 
    subtitle_ar: '', 
    subtitle_en: '', 
    icon: 'Tag', 
    status: 'active' 
  });

  const fetchCategories = () => {
    setLoading(true);
    api.get('/categories')
      .then(res => setCategories(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!newCat.name_ar || !newCat.name_en) {
      return showToast(rtl ? 'يرجى كتابة اسم التصنيف' : 'Please provide category name', 'error');
    }
    setAdding(true);
    try {
      await api.post('/categories', newCat);
      setNewCat({ 
        name_ar: '', 
        name_en: '', 
        subtitle_ar: '', 
        subtitle_en: '', 
        icon: 'Tag', 
        status: 'active' 
      });
      fetchCategories();
      showToast(rtl ? 'تم إضافة القسم بنجاح' : 'Category added successfully', 'success');
    } catch(err) {
      console.error(err);
      showToast(rtl ? 'فشل إضافة القسم' : 'Failed to add category', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await api.delete(`/categories/${deleteModal.id}`);
      fetchCategories();
      setDeleteModal({ isOpen: false, id: null });
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Tag size={32} className="text-primary-500" />
          {rtl ? 'إدارة التصنيفات' : 'Categories Management'}
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ADD CATEGORY FORM */}
        <div className="glass-card p-6 h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">{rtl ? 'إضافة تصنيف جديد' : 'Add New Category'}</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{rtl ? 'الاسم (عربي)' : 'Name (Arabic)'}</label>
              <input value={newCat.name_ar} onChange={e => setNewCat({...newCat, name_ar: e.target.value})} type="text" className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary-500" placeholder="عطور..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{rtl ? 'الاسم (إنجليزي)' : 'Name (English)'}</label>
              <input value={newCat.name_en} onChange={e => setNewCat({...newCat, name_en: e.target.value})} type="text" dir="ltr" className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary-500" placeholder="Perfumes..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{rtl ? 'عنوان فرعي (عربي)' : 'Subtitle (Arabic)'}</label>
              <input value={newCat.subtitle_ar} onChange={e => setNewCat({...newCat, subtitle_ar: e.target.value})} type="text" className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary-500" placeholder="أفضل أنواع العطور..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{rtl ? 'عنوان فرعي (إنجليزي)' : 'Subtitle (English)'}</label>
              <input value={newCat.subtitle_en} onChange={e => setNewCat({...newCat, subtitle_en: e.target.value})} type="text" dir="ltr" className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary-500" placeholder="Best perfumes selection..." />
            </div>
            <button onClick={handleCreate} disabled={adding} className="btn-primary w-full flex items-center justify-center gap-2 mt-4">
              {adding ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
              {rtl ? 'حفظ للتصنيفات' : 'Save Category'}
            </button>
          </div>
        </div>

        {/* CATEGORIES LIST */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
             <div className="flex justify-center p-12"><Loader2 size={32} className="text-primary-500 animate-spin" /></div>
          ) : categories.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-500">
               <Tag size={48} className="mx-auto mb-4 opacity-50" />
               {rtl ? 'لا توجد تصنيفات حالياً.' : 'No categories found.'}
            </div>
          ) : (
             categories.map(cat => (
               <div key={cat.id} className="glass-card p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
                     <Tag size={24} />
                   </div>
                   <div>
                      <h3 className="font-bold text-lg leading-tight">{rtl ? cat.name_ar : cat.name_en}</h3>
                      {cat.subtitle_ar && (
                        <p className="text-xs text-slate-500 mt-0.5 mb-1">{rtl ? cat.subtitle_ar : cat.subtitle_en}</p>
                      )}
                      <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{rtl ? cat.name_en : cat.name_ar}</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold">
                     {cat.status === 'active' ? (rtl ? 'نشط' : 'Active') : ''}
                   </span>
                    <button onClick={() => setDeleteModal({ isOpen: true, id: cat.id })} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition">
                      <Trash2 size={20} />
                    </button>
                 </div>
               </div>
             ))
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title={rtl ? 'تأكيد حذف القسم' : 'Confirm Category Deletion'}
        message={rtl 
          ? 'هل أنت متأكد؟ سيتم حذف جميع المنتجات الموجودة داخل هذا القسم أيضاً.' 
          : 'Are you sure? All products inside this category will also be deleted.'}
        rtl={rtl}
      />
    </div>
  )
}
