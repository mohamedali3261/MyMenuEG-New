import { useState, useEffect } from 'react';
import { useStore } from '../../../store/store';
import { Plus, Trash2, Layout, Image as ImageIcon, Loader2, Save } from 'lucide-react';
import { api } from '../../../api';
import ConfirmModal from '../components/ConfirmModal';

export default function SliderManager() {
  const { rtl, showToast } = useStore();
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [interval, setIntervalVal] = useState('3'); // Duration in seconds

  // Modal State
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, id: string | null}>({
    isOpen: false,
    id: null
  });

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    image_url: '',
    title_ar: '',
    title_en: '',
    subtitle_ar: '',
    subtitle_en: '',
    btn_text_ar: '',
    btn_text_en: '',
    btn_link: '/products',
    order_index: 0
  });

  const fetchSlides = () => {
    setLoading(true);
    api.get('/slides')
      .then(res => setSlides(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));

    api.get('/settings')
      .then(res => setIntervalVal(res.data.sliderInterval || '3'))
      .catch(console.error);
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setSaving(true);
    const fd = new FormData();
    fd.append('image', e.target.files[0]);
    fd.append('page', 'slider');

    try {
      const res = await api.post('/upload', fd);
      setFormData({ ...formData, image_url: res.data.url });
      showToast(rtl ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
    } catch (err) {
      showToast('Error uploading image', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!formData.image_url) return showToast(rtl ? 'يرجى رفع صورة أولاً' : 'Please upload an image first', 'error');
    setSaving(true);
    try {
      await api.post('/slides', formData);
      showToast(rtl ? 'تم حفظ الشريحة بنجاح' : 'Slide saved successfully');
      setShowForm(false);
      setFormData({ id: '', image_url: '', title_ar: '', title_en: '', subtitle_ar: '', subtitle_en: '', btn_text_ar: '', btn_text_en: '', btn_link: '/products', order_index: slides.length });
      fetchSlides();
    } catch (err) {
      showToast('Error saving slide', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await api.delete(`/slides/${deleteModal.id}`);
      fetchSlides();
      setDeleteModal({ isOpen: false, id: null });
      showToast(rtl ? 'تم حذف الشريحة بنجاح' : 'Slide deleted successfully');
    } catch (err) {
      showToast('Error deleting slide', 'error');
    }
  };

  const openEdit = (slide: any) => {
    setFormData(slide);
    setShowForm(true);
  };

  const saveInterval = async () => {
    setSaving(true);
    try {
      await api.post('/settings', { sliderInterval: interval });
      showToast(rtl ? 'تم حفظ التوقيت بنجاح' : 'Interval saved successfully');
    } catch(err) {
      showToast('Error saving interval', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Layout size={32} className="text-primary-500" />
          {rtl ? 'إدارة السلايدر الرئيسي' : 'Home Slider Management'}
        </h1>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="glass-card flex items-center gap-3 px-4 py-1.5 flex-1 md:flex-none">
             <span className="text-sm font-semibold whitespace-nowrap">{rtl ? 'توقيت السلايد (ثانية):' : 'Slide Interval (sec):'}</span>
             <input value={interval} onChange={e => setIntervalVal(e.target.value)} type="number" min="1" className="w-16 bg-slate-100 dark:bg-white/5 border border-white/10 rounded-lg p-1 text-center font-bold outline-none" />
             <button onClick={saveInterval} className="p-1.5 text-primary-500 hover:bg-primary-500/10 rounded-lg transition-colors">
                <Save size={18} />
             </button>
          </div>
          
          {!showForm && (
            <button 
              onClick={() => {
                setFormData({ id: '', image_url: '', title_ar: '', title_en: '', subtitle_ar: '', subtitle_en: '', btn_text_ar: '', btn_text_en: '', btn_link: '/products', order_index: slides.length });
                setShowForm(true);
              }} 
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={20} />
              {rtl ? 'إضافة شريحة' : 'Add Slide'}
            </button>
          )}
        </div>
      </div>

      {showForm ? (
        <div className="glass-card p-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold">{formData.id ? (rtl ? 'تعديل شريحة' : 'Edit Slide') : (rtl ? 'إضافة شريحة جديدة' : 'Add New Slide')}</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white transition-colors">{rtl ? 'إلغاء' : 'Cancel'}</button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
             {/* Text Data */}
             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{rtl ? 'العنوان (عربي)' : 'Title (Arabic)'}</label>
                    <input type="text" value={formData.title_ar} onChange={e => setFormData({...formData, title_ar: e.target.value})} className="w-full bg-slate-100 dark:bg-[#111] border border-white/10 rounded-xl p-3 focus:border-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{rtl ? 'العنوان (إنجليزي)' : 'Title (English)'}</label>
                    <input type="text" value={formData.title_en} onChange={e => setFormData({...formData, title_en: e.target.value})} className="w-full bg-slate-100 dark:bg-[#111] border border-white/10 rounded-xl p-3 focus:border-primary-500 outline-none" dir="ltr" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{rtl ? 'الوصف (عربي)' : 'Subtitle (Arabic)'}</label>
                    <textarea value={formData.subtitle_ar} onChange={e => setFormData({...formData, subtitle_ar: e.target.value})} className="w-full bg-slate-100 dark:bg-[#111] border border-white/10 rounded-xl p-3 focus:border-primary-500 outline-none" rows={3}></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{rtl ? 'الوصف (إنجليزي)' : 'Subtitle (English)'}</label>
                    <textarea value={formData.subtitle_en} onChange={e => setFormData({...formData, subtitle_en: e.target.value})} className="w-full bg-slate-100 dark:bg-[#111] border border-white/10 rounded-xl p-3 focus:border-primary-500 outline-none" rows={3} dir="ltr"></textarea>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                   <div>
                      <label className="block text-sm font-medium mb-1">{rtl ? 'نص الزر (AR)' : 'Btn Text (AR)'}</label>
                      <input type="text" value={formData.btn_text_ar} onChange={e => setFormData({...formData, btn_text_ar: e.target.value})} className="w-full bg-slate-100 dark:bg-[#111] border border-white/10 rounded-xl p-3 focus:border-primary-500 outline-none" />
                   </div>
                   <div>
                      <label className="block text-sm font-medium mb-1">{rtl ? 'نص الزر (EN)' : 'Btn Text (EN)'}</label>
                      <input type="text" value={formData.btn_text_en} onChange={e => setFormData({...formData, btn_text_en: e.target.value})} className="w-full bg-slate-100 dark:bg-[#111] border border-white/10 rounded-xl p-3 focus:border-primary-500 outline-none" dir="ltr" />
                   </div>
                   <div>
                      <label className="block text-sm font-medium mb-1">{rtl ? 'رابط الزر' : 'Btn Link'}</label>
                      <input type="text" value={formData.btn_link} onChange={e => setFormData({...formData, btn_link: e.target.value})} className="w-full bg-slate-100 dark:bg-[#111] border border-white/10 rounded-xl p-3 focus:border-primary-500 outline-none" dir="ltr" />
                   </div>
                </div>
             </div>

             {/* Image Upload */}
             <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl p-6 bg-slate-50 dark:bg-white/5">
                {formData.image_url ? (
                  <div className="relative group w-full aspect-video rounded-2xl overflow-hidden">
                    <img src={formData.image_url.startsWith('/') ? 'http://localhost:5000' + formData.image_url : formData.image_url} className="w-full h-full object-cover" alt="" />
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <ImageIcon className="text-white" size={40} />
                      <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-3 cursor-pointer p-12">
                    <div className="w-16 h-16 bg-primary-500/10 text-primary-500 rounded-full flex items-center justify-center">
                      <ImageIcon size={32} />
                    </div>
                    <span className="font-semibold text-slate-500">{rtl ? 'اضغط لرفع صورة الشريحة' : 'Upload Slide Image'}</span>
                    <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                  </label>
                )}
                <p className="mt-4 text-xs text-slate-500 text-center">{rtl ? 'يفضل مقاس كبير (1920x1080) بجودة عالية' : 'Recommended size: 1920x1080 high quality'}</p>
             </div>
          </div>

          <div className="mt-8 flex justify-end gap-4 border-t border-white/10 pt-6">
             <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl hover:bg-white/5 transition-colors">{rtl ? 'إلغاء' : 'Cancel'}</button>
             <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-10">
               {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
               {rtl ? 'حفظ الشريحة' : 'Save Slide'}
             </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
           {loading ? (
             <div className="flex justify-center p-20"><Loader2 size={40} className="animate-spin text-primary-500" /></div>
           ) : slides.length === 0 ? (
             <div className="glass-card p-20 text-center space-y-4">
                <Layout size={60} className="mx-auto text-slate-300 opacity-20" />
                <p className="text-slate-500 text-lg">{rtl ? 'لا توجد شرائح حالياً، ابدأ بإضافة أول شريحة' : 'No slides yet, start by adding your first one'}</p>
             </div>
           ) : (
             slides.map((slide, idx) => (
               <div key={slide.id} className="glass-card overflow-hidden flex flex-col md:flex-row gap-6 p-4 group hover:border-primary-500/30 transition-all duration-300">
                  <div className="w-full md:w-64 aspect-video rounded-xl overflow-hidden relative">
                     <img src={slide.image_url.startsWith('/') ? 'http://localhost:5000' + slide.image_url : slide.image_url} className="w-full h-full object-cover" alt="" />
                     <div className="absolute top-2 left-2 bg-primary-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                     </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center gap-1">
                     <h3 className="text-xl font-bold">{rtl ? slide.title_ar : slide.title_en}</h3>
                     <p className="text-slate-500 line-clamp-2 text-sm">{rtl ? slide.subtitle_ar : slide.subtitle_en}</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <button onClick={() => openEdit(slide)} className="p-3 rounded-full hover:bg-primary-500/10 text-primary-500 transition-colors" title={rtl ? 'تعديل' : 'Edit'}>
                        <ImageIcon size={24} />
                     </button>
                     <button onClick={() => setDeleteModal({ isOpen: true, id: slide.id })} className="p-3 rounded-full hover:bg-red-500/10 text-red-500 transition-colors" title={rtl ? 'حذف' : 'Delete'}>
                        <Trash2 size={24} />
                     </button>
                  </div>
               </div>
             ))
           )}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title={rtl ? 'تأكيد حذف الشريحة' : 'Confirm Slide Deletion'}
        message={rtl 
          ? 'هل أنت متأكد؟ سيتم حذف صورة الشريحة نهائياً من السيرفر.' 
          : 'Are you sure? The slide image will be permanently removed from the server.'}
        rtl={rtl}
      />
    </div>
  )
}
