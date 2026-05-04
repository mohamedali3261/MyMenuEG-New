import { useState, useEffect } from 'react';
import { useStore } from '../../../store/store';
import { Plus, Trash2, Layout, Loader2, ArrowUp, ArrowDown, Edit2, Save, FileText, ShieldAlert, Sparkles, CheckCircle2, RefreshCw, Eye, Check, XCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../api';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

export default function PagesManager() {
  const { rtl, fetchInitialData, products } = useStore();
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, id: string | null}>({ isOpen: false, id: null });
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);

  // Form State
  const defaultForm = { id: '', name_ar: '', name_en: '', slug: '', show_in_navbar: 1, order_index: 0, status: 'active', meta_title: '', meta_desc: '', banner_url: '', banner_size: 'medium', spotlight_product_id: '', countdown_end_date: '', show_search: false, image_url: '' };
  const [formData, setFormData] = useState(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const [spotlightSearch, setSpotlightSearch] = useState('');

  const fetchPages = () => {
    setLoading(true);
    api.get('/pages')
      .then(res => setPages(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleCreateOrUpdate = async () => {
    if (!formData.name_ar || !formData.name_en) {
      return toast.error(rtl ? 'الاسم مطلوب باللغتين' : 'Name is required in both languages');
    }
    setSaving(true);
    
    // Auto-generate slug if not provided and it's new
    let finalSlug = formData.slug;
    if (!finalSlug && !isEditing) {
       finalSlug = formData.name_en.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    }

    try {
      await api.post('/pages', { 
         ...formData, 
         slug: finalSlug,
         order_index: isEditing ? formData.order_index : pages.length // new pages go to the bottom
      });
      toast.success(rtl ? 'تم الحفظ بنجاح' : 'Saved successfully');
      setFormData(defaultForm);
      setIsEditing(false);
      fetchPages();
      fetchInitialData(); // update global store
    } catch(err) {
      console.error(err);
      toast.error(rtl ? 'فشل الحفظ' : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await api.delete(`/pages/${deleteModal.id}`);
      fetchPages();
      fetchInitialData();
      setDeleteModal({ isOpen: false, id: null });
      toast.success(rtl ? 'تم مسح الصفحة' : 'Page deleted');
      if (isEditing && formData.id === deleteModal.id) {
         setFormData(defaultForm);
         setIsEditing(false);
      }
    } catch(err) {
      console.error(err);
      toast.error(rtl ? 'فشل المسح' : 'Failed to delete');
    }
  };

  const openEdit = (page: PageItem) => {
    setFormData({
      id: page.id,
      name_ar: page.name_ar || '',
      name_en: page.name_en || '',
      slug: page.slug || '',
      show_in_navbar: page.show_in_navbar,
      order_index: page.order_index,
      status: page.status || 'active',
      meta_title: page.meta_title || '',
      meta_desc: page.meta_desc || '',
      banner_url: page.banner_url || '',
      banner_size: page.banner_size || 'medium',
      spotlight_product_id: page.spotlight_product_id || '',
      countdown_end_date: page.countdown_end_date ? new Date(page.countdown_end_date).toISOString().slice(0,16) : '',
      show_search: !!page.show_search,
      image_url: page.image_url || ''
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const movePage = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === pages.length - 1) return;

    setReordering(true);
    const newPages = [...pages];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap order_index
    const tempOrder = newPages[index].order_index;
    newPages[index].order_index = newPages[swapIndex].order_index;
    newPages[swapIndex].order_index = tempOrder;

    // Swap visually in array
    const tempPage = newPages[index];
    newPages[index] = newPages[swapIndex];
    newPages[swapIndex] = tempPage;

    setPages(newPages);

    try {
      await api.post('/pages/reorder', { pages: newPages.map(p => ({ id: p.id, order_index: p.order_index })) });
      fetchInitialData();
    } catch {
      toast.error(rtl ? 'فشل الترتيب' : 'Failed to reorder');
      fetchPages(); // revert
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
             <Layout className="text-primary-500" />
             {rtl ? 'إدارة الصفحات' : 'Pages Management'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
             {rtl ? 'تنظيم صفحات متجرك، التحكم في السيو الخاص بها، وتعديل حالة الظهور.' : 'Organize your store pages, manage SEO, and toggle visibility.'}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* ADD/EDIT PAGE FORM */}
        <div className="lg:col-span-5 h-fit sticky top-24">
          <div className={`rounded-3xl p-8 shadow-sm transition-all border ${isEditing ? 'bg-primary-500/5 border-primary-500/30' : 'bg-white dark:bg-[#0f172a] border-slate-200 dark:border-white/10'}`}>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-white/10">
               <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                 {isEditing ? <Edit2 size={24} className="text-primary-500" /> : <Plus size={24} className="text-primary-500" />}
                 {isEditing ? (rtl ? 'تعديل الصفحة' : 'Edit Page') : (rtl ? 'صفحة جديدة' : 'New Page')}
               </h2>
               {isEditing && (
                 <button onClick={() => { setIsEditing(false); setFormData(defaultForm); }} className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white btn-secondary px-3 py-1.5 rounded-lg">
                   {rtl ? 'إلغاء' : 'Cancel'}
                 </button>
               )}
            </div>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-[11px] uppercase tracking-wider font-bold mb-2 text-slate-500">{rtl ? 'الاسم (عربي)' : 'Name (Arabic)'}</label>
                   <input value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} type="text" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-bold" />
                 </div>
                 <div>
                   <label className="block text-[11px] uppercase tracking-wider font-bold mb-2 text-slate-500">{rtl ? 'الاسم (إنجليزي)' : 'Name (English)'}</label>
                   <input value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} type="text" dir="ltr" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-bold" />
                 </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold mb-2 text-slate-500 flex justify-between">
                   <span>{rtl ? 'الرابط الفرعي (Slug)' : 'URL Slug'}</span>
                   {isEditing && <span className="text-red-500">{rtl ? 'محمي ومثبت' : 'Locked'}</span>}
                </label>
                <input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-')})} type="text" dir="ltr" disabled={isEditing} className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-3 outline-none font-bold placeholder:font-normal ${isEditing ? 'opacity-50 cursor-not-allowed' : 'focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all'}`} placeholder={isEditing ? formData.slug : 'auto-generated'} />
                {isEditing && <p className="text-[10px] text-slate-400 mt-1">{rtl ? 'لا يمكن تغيير الرابط بعد الإنشاء من أجل السيو والروابط القديمة' : 'Slug cannot be changed after creation for SEO integrity'}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold mb-2 text-slate-500">{rtl ? 'حالة الظهور' : 'Status'}</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary-500 font-bold">
                       <option value="active">{rtl ? 'أكتيف (نشط)' : 'Active'}</option>
                       <option value="draft">{rtl ? 'مسودة (مخفي)' : 'Draft (Hidden)'}</option>
                    </select>
                 </div>
                 <div className="flex items-center gap-3 pt-6">
                    <input 
                     type="checkbox" 
                     checked={!!formData.show_in_navbar} 
                     onChange={e => setFormData({...formData, show_in_navbar: e.target.checked ? 1 : 0})}
                     id="show_nav" 
                     className="w-5 h-5 rounded border-none bg-slate-200 dark:bg-white/10 text-primary-500 focus:ring-0"
                    />
                    <label htmlFor="show_nav" className="text-sm font-bold cursor-pointer text-slate-700 dark:text-slate-200">{rtl ? 'أظهر بالنافبار' : 'Show in Navbar'}</label>
                 </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                 <h4 className="text-xs font-black uppercase text-primary-500 mb-4 flex items-center gap-2"><Sparkles size={14}/> {rtl ? 'تحسين محركات البحث (SEO)' : 'SEO Metadata'}</h4>
                 <div className="space-y-4">
                   <div>
                     <label className="block text-[11px] font-bold mb-2 text-slate-500">Meta Title</label>
                     <input value={formData.meta_title} onChange={e => setFormData({...formData, meta_title: e.target.value})} type="text" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary-500 transition-all text-sm" placeholder={rtl ? 'عنوان سيظهر في جوجل...' : 'Title snippet for Google'} />
                   </div>
                   <div>
                     <label className="block text-[11px] font-bold mb-2 text-slate-500">Meta Description</label>
                     <textarea rows={2} value={formData.meta_desc} onChange={e => setFormData({...formData, meta_desc: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary-500 transition-all text-sm resize-none" placeholder={rtl ? 'وصف قصير حول محتوى الصفحة لجذب الزوار...' : 'Short description to encourage click-throughs...'} />
                   </div>
                 </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black uppercase text-blue-500 flex items-center gap-2"><Layout size={14}/> {rtl ? 'صورة الغلاف (Banner)' : 'Page Banner'}</h4>
                    <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-lg gap-1">
                       {['small', 'medium', 'large'].map(s => (
                         <button 
                            key={s}
                            onClick={() => setFormData({...formData, banner_size: s})}
                            className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${formData.banner_size === s ? 'bg-white dark:bg-slate-800 text-blue-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                            {s === 'small' ? (rtl ? 'صغير' : 'Small') : s === 'medium' ? (rtl ? 'متوسط' : 'Med') : (rtl ? 'كبير' : 'Large')}
                         </button>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-3">
                    {formData.banner_url ? (
                      <div className={`relative rounded-xl overflow-hidden group transition-all duration-500 ${formData.banner_size === 'small' ? 'aspect-[16/5]' : formData.banner_size === 'large' ? 'aspect-[16/10]' : 'aspect-[16/7]'}`}>
                        <img src={formData.banner_url} className="w-full h-full object-cover" alt="Banner" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                           <button onClick={() => setFormData({...formData, banner_url: ''})} className="bg-red-500 text-white p-2 rounded-lg hover:scale-110 transition"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    ) : (
                      <label className={`flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-500 ${formData.banner_size === 'small' ? 'aspect-[16/5]' : formData.banner_size === 'large' ? 'aspect-[16/10]' : 'aspect-[16/7]'}`}>
                         <div className="flex flex-col items-center gap-1 text-slate-400">
                            <Plus size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{rtl ? 'إضافة بانر' : 'Upload Banner'}</span>
                         </div>
                         <input 
                           type="file" 
                           className="hidden" 
                           accept="image/*"
                           onChange={async (e) => {
                             const file = e.target.files?.[0];
                             if (!file) return;
                             const fd = new FormData();
                             fd.append('image', file);
                             fd.append('page', 'banners');
                             try {
                               const res = await api.post('/upload', fd);
                               setFormData({...formData, banner_url: res.data.url});
                             } catch {
                               toast.error('Upload failed');
                             }
                           }}
                         />
                      </label>
                    )}
                 </div>
              </div>

              {/* Advanced Page Features */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                 <h4 className="text-xs font-black uppercase text-blue-500 mb-4 flex items-center gap-2"><Sparkles size={14}/> {rtl ? 'ميزات متقدمة' : 'Advanced Features'}</h4>
                 <div className="space-y-4">
                    {/* Visual Spotlight Product Picker */}
                    <div>
                      <label className="block text-[11px] font-bold mb-3 text-slate-500 uppercase tracking-widest flex items-center justify-between">
                         <span>{rtl ? 'اختيار منتج الواجهة الأساسي' : 'Select Hero Spotlight Product'}</span>
                         {formData.spotlight_product_id && (
                           <button 
                             onClick={() => setFormData({...formData, spotlight_product_id: ''})} 
                             className="text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                           >
                             <XCircle size={12}/> {rtl ? 'إزالة الاختيار' : 'Clear'}
                           </button>
                         )}
                      </label>

                      {/* Search & Grid Container */}
                      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-4">
                        {/* Internal Mini Search */}
                        <div className="relative">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                           <input 
                             type="text"
                             value={spotlightSearch}
                             onChange={(e) => setSpotlightSearch(e.target.value)}
                             placeholder={rtl ? 'ابحث في منتجات هذه الصفحة...' : 'Search page products...'}
                             className="w-full bg-white dark:bg-slate-800 border-none rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-2 focus:ring-primary-500/20 transition-all"
                           />
                        </div>

                        {/* Visual Grid - Only shows if searching or specifically requested */}
                        <AnimatePresence>
                          {spotlightSearch.trim() && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar pt-2 border-t border-slate-200 dark:border-white/5"
                            >
                               {products
                                 .filter(p => p.page_id === formData.id && 
                                   (rtl ? p.name_ar : p.name_en).toLowerCase().includes(spotlightSearch.toLowerCase())
                                 )
                                 .map(p => {
                                   const isSelected = formData.spotlight_product_id === p.id;
                                   return (
                                     <motion.button
                                       key={p.id}
                                       whileHover={{ scale: 1.02 }}
                                       whileTap={{ scale: 0.98 }}
                                       onClick={() => {
                                         setFormData({...formData, spotlight_product_id: p.id});
                                         setSpotlightSearch(''); // Close results after pick
                                       }}
                                       type="button"
                                       className={`relative group flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${
                                         isSelected 
                                           ? 'border-primary-500 bg-primary-500/5 shadow-lg shadow-primary-500/10' 
                                           : 'border-transparent bg-white dark:bg-slate-800 hover:border-slate-200 dark:hover:border-white/10'
                                       }`}
                                     >
                                        <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
                                           <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                                           {isSelected && (
                                             <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center backdrop-blur-[2px]">
                                                <div className="bg-primary-500 text-white p-1 rounded-full shadow-lg">
                                                   <Check size={14} strokeWidth={3} />
                                                </div>
                                             </div>
                                           )}
                                        </div>
                                        <span className="text-[9px] font-black text-center line-clamp-1 opacity-80 uppercase tracking-tighter">
                                          {rtl ? p.name_ar : p.name_en}
                                        </span>
                                     </motion.button>
                                   );
                                 })
                               }
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {products.filter(p => p.page_id === formData.id).length === 0 && (
                          <div className="py-8 text-center bg-white/50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                            <p className="text-[10px] text-amber-500 font-bold px-4">
                              {rtl ? '⚠️ لا توجد منتجات مرتبطة بهذه الصفحة بعد.' : '⚠️ No products linked to this page yet.'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Countdown Timer */}
                    <div>
                      <label className="block text-[11px] font-bold mb-2 text-slate-500">{rtl ? 'تاريخ انتهاء العداد التنازلي' : 'Countdown End Date'}</label>
                      <input value={formData.countdown_end_date} onChange={e => setFormData({...formData, countdown_end_date: e.target.value})} type="datetime-local" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary-500 transition-all text-sm" />
                    </div>
                    {/* Internal Search Toggle */}
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-4 cursor-pointer" onClick={() => setFormData({...formData, show_search: !formData.show_search})}>
                       <div>
                         <h5 className="text-sm font-bold">{rtl ? 'تفعيل البحث الداخلي' : 'Enable Internal Search'}</h5>
                         <p className="text-[10px] text-slate-500">{rtl ? 'يظهر شريط بحث خاص لمنتجات هذه الصفحة.' : 'Shows a custom search bar for this page products.'}</p>
                       </div>
                       <button type="button" onClick={(e) => { e.stopPropagation(); setFormData({...formData, show_search: !formData.show_search}) }} className={`relative flex items-center w-12 h-6 rounded-full transition-all duration-300 ease-out ${formData.show_search ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30' : 'bg-slate-300 dark:bg-slate-600'}`}>
                         <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ease-out flex items-center justify-center ${formData.show_search ? 'translate-x-6 shadow-primary-500/20' : 'translate-x-0'}`}>
                           {formData.show_search && <span className="text-primary-500 text-[10px] font-bold">✓</span>}
                         </span>
                       </button>
                    </div>
                 </div>
              </div>

              <button onClick={handleCreateOrUpdate} disabled={saving} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all duration-300 bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 hover:scale-105 active:scale-95">
                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                {isEditing ? (rtl ? 'حفظ التعديلات' : 'Save Changes') : (rtl ? 'إضافة وطرح الصفحة' : 'Publish Page')}
              </button>
            </div>
          </div>
        </div>

        {/* PAGES LIST */}
        <div className="lg:col-span-7 space-y-4 relative">
          {reordering && (
             <div className="absolute inset-0 z-10 bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                <RefreshCw size={32} className="animate-spin text-primary-500" />
             </div>
          )}
          {loading ? (
             <div className="flex justify-center p-12 bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-white/10"><Loader2 size={32} className="text-primary-500 animate-spin" /></div>
          ) : pages.length === 0 ? (
            <div className="bg-white dark:bg-[#0f172a] p-12 rounded-3xl text-center text-slate-500 border border-slate-200 dark:border-white/10">
               <FileText size={48} className="mx-auto mb-4 opacity-50 text-primary-500" />
               {rtl ? 'لا توجد أي صفحات حالياً. قم ببناء متجرك الآن.' : 'No pages exist. Build your store pages now.'}
            </div>
          ) : (
             pages.map((page, idx) => (
               <div key={page.id} className={`bg-white dark:bg-[#0f172a] p-5 rounded-2xl flex items-center justify-between transition-all border ${isEditing && formData.id === page.id ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-md' : 'border-slate-200 dark:border-white/10 shadow-sm hover:border-slate-300 dark:hover:border-white/20'}`}>
                 <div className="flex items-center gap-5">
                   <div className="flex flex-col gap-1 pr-4 rtl:pr-0 rtl:pl-4 border-r rtl:border-l rtl:border-r-0 border-slate-100 dark:border-white/5">
                      <button disabled={idx===0} onClick={() => movePage(idx, 'up')} className="text-slate-400 hover:text-primary-500 disabled:opacity-20 transition"><ArrowUp size={18} /></button>
                      <button disabled={idx===pages.length-1} onClick={() => movePage(idx, 'down')} className="text-slate-400 hover:text-primary-500 disabled:opacity-20 transition"><ArrowDown size={18} /></button>
                   </div>
                   <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center relative">
                     {page.status === 'draft' ? <ShieldAlert size={20} className="text-amber-500" /> : <CheckCircle2 size={20} className="text-primary-500" />}
                   </div>
                   <div>
                     <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                       {rtl ? page.name_ar : page.name_en}
                       {page.status === 'draft' && <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">{rtl ? 'مسودة' : 'Draft'}</span>}
                     </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-primary-500 font-black bg-primary-500/10 px-2 py-0.5 rounded-md">/{page.slug}</span>
                        <span className="text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Eye size={10} /> {page.views || 0}
                        </span>
                      </div>
                   </div>
                 </div>

                 <div className="flex items-center gap-3">
                    {page.show_in_navbar && page.status !== 'draft' && (
                       <span className="hidden md:inline-block text-[10px] uppercase font-black tracking-widest text-slate-400">
                          {rtl ? 'يظهر بالنافبار' : 'On Navbar'}
                       </span>
                    )}
                    <div className="flex items-center bg-slate-50 dark:bg-black/20 rounded-xl p-1 border border-slate-100 dark:border-white/5">
                      <button onClick={() => openEdit(page)} className="p-2.5 text-slate-500 hover:text-primary-500 hover:bg-white dark:hover:bg-white/10 rounded-lg transition" title={rtl?'تعديل':'Edit'}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setDeleteModal({ isOpen: true, id: page.id })} className="p-2.5 text-red-500 hover:bg-white dark:hover:bg-white/10 rounded-lg transition" title={rtl?'مسح':'Delete'}>
                        <Trash2 size={16} />
                      </button>
                    </div>
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
        title={rtl ? 'تأكيد الحذف' : 'Confirm Deletion'}
        message={rtl 
          ? 'هل أنت متأكد من رغبتك في حذف هذه الصفحة؟ سيتم فصل المنتجات المرتبطة بها لكن لن يتم حذفها من المتجر.' 
          : 'Are you sure you want to delete this page? Linked products will not be deleted.'}
        rtl={rtl}
      />
    </div>
  )
}

interface PageItem {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  show_in_navbar: number;
  order_index: number;
  status: string;
  meta_title?: string;
  meta_desc?: string;
  banner_url?: string;
  banner_size?: string;
  views?: number;
  spotlight_product_id?: string;
  countdown_end_date?: string | Date;
  show_search?: boolean;
  image_url?: string;
}
