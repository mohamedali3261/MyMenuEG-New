import { useState, useEffect } from 'react';
import { useStore } from '../../../store/store';
import { Plus, Trash2, Layout, Image as ImageIcon, Loader2, Save, Layers } from 'lucide-react';
import { api } from '../../../api';
import ConfirmModal from '../components/ConfirmModal';
import PremiumDropdown from '../../../components/ui/PremiumDropdown';
import { SLIDER_TEMPLATES } from './sliderTemplates';
import { resolveAssetUrl } from '../../../utils/assetUrl';
import GsapSliderManager from './GsapSliderManager';

type Slide = {
  id: string;
  image_url: string;
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  btn_text_ar: string;
  btn_text_en: string;
  btn_link: string;
  order_index: number;
  page_id: string;
};

export default function SliderManager() {
  const { rtl, showToast, pages } = useStore();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [interval, setIntervalVal] = useState('3'); // Duration in seconds
  const [hideEmptySlider, setHideEmptySlider] = useState(false);

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
    order_index: 0,
    page_id: ''
  });
  const [templateKey, setTemplateKey] = useState('');
  const [showGsapPanel, setShowGsapPanel] = useState(false);

  const fetchSlides = () => {
    setLoading(true);
    api.get('/slides')
      .then(res => setSlides(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));

    api.get('/settings')
      .then(res => {
        setIntervalVal(res.data.sliderInterval || '3');
        setHideEmptySlider(res.data.hideEmptySlider === 'true');
      })
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
    } catch {
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
      setFormData({ id: '', image_url: '', title_ar: '', title_en: '', subtitle_ar: '', subtitle_en: '', btn_text_ar: '', btn_text_en: '', btn_link: '/products', order_index: slides.length, page_id: '' });
      fetchSlides();
    } catch {
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
    } catch {
      showToast('Error deleting slide', 'error');
    }
  };

  const openEdit = (slide: Slide) => {
    setFormData(slide);
    setTemplateKey('');
    setShowForm(true);
  };

  const applyTemplate = (key: string) => {
    setTemplateKey(key);
    const template = SLIDER_TEMPLATES.find(t => t.key === key);
    if (!template) return;
    setFormData(prev => ({
      ...prev,
      title_ar: template.title_ar,
      title_en: template.title_en,
      subtitle_ar: template.subtitle_ar,
      subtitle_en: template.subtitle_en,
      btn_text_ar: template.btn_text_ar,
      btn_text_en: template.btn_text_en,
      btn_link: template.btn_link
    }));
    showToast(rtl ? 'تم تطبيق القالب، أضف الصورة فقط' : 'Template applied, just add image');
  };

  const saveInterval = async () => {
    setSaving(true);
    try {
      await api.post('/settings', { sliderInterval: interval, hideEmptySlider: String(hideEmptySlider) });
      showToast(rtl ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
    } catch {
      showToast('Error saving settings', 'error');
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
          <div className="glass-card flex items-center gap-3 px-4 py-1.5">
             <span className="text-sm font-semibold whitespace-nowrap">{rtl ? 'إخفاء:' : 'Hide:'}</span>
             <button
               onClick={() => { const next = !hideEmptySlider; setHideEmptySlider(next); api.post('/settings', { hideEmptySlider: String(next) }).catch(() => {}); }}
               className={`relative w-11 h-6 rounded-full transition-colors ${hideEmptySlider ? 'bg-primary-500' : 'bg-slate-300 dark:bg-white/20'}`}
             >
               <span className={`absolute top-0.5 ${hideEmptySlider ? 'right-0.5' : 'left-0.5'} w-5 h-5 bg-white rounded-full shadow transition-all`} />
             </button>
          </div>
          
          {!showForm && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowGsapPanel(!showGsapPanel)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300 border-2 ${showGsapPanel ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/25' : 'border-slate-300 dark:border-white/20 text-slate-600 dark:text-slate-400 hover:border-primary-500 hover:text-primary-500'}`}
              >
                <Layers size={18} />
                <span>{rtl ? 'السلايدر المتقدم' : 'GSAP Slider'}</span>
              </button>
              <button 
                onClick={() => {
                  setFormData({ id: '', image_url: '', title_ar: '', title_en: '', subtitle_ar: '', subtitle_en: '', btn_text_ar: '', btn_text_en: '', btn_link: '/products', order_index: slides.length, page_id: '' });
                  setTemplateKey('');
                  setShowForm(true);
                }} 
                className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl font-black text-sm transition-all duration-300 bg-primary-500 text-white shadow-lg shadow-primary-500/25 hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0 dark:bg-primary-600 dark:hover:bg-primary-500 whitespace-nowrap"
              >
                <span className="w-7 h-7 rounded-lg bg-white/30 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                  <Plus size={16} strokeWidth={3} />
                </span>
                <span>{rtl ? 'إضافة شريحة' : 'Add Slide'}</span>
              </button>
            </div>
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
                <div>
                  <label className="block text-sm font-medium mb-1">{rtl ? 'قالب السلايدر الجاهز' : 'Slider Template'}</label>
                  <PremiumDropdown
                    value={templateKey}
                    rtl={rtl}
                    onChange={applyTemplate}
                    options={[
                      { value: '', labelAr: 'بدون قالب', labelEn: 'No Template' },
                      ...SLIDER_TEMPLATES.map(t => ({ value: t.key, labelAr: t.nameAr, labelEn: t.nameEn }))
                    ]}
                  />
                </div>
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

                <div className="pt-4">
                    <label className="block text-sm font-medium mb-2">{rtl ? 'الصفحة المستهدفة' : 'Target Page'}</label>
                    <PremiumDropdown 
                      value={formData.page_id || ''}
                      rtl={rtl}
                      onChange={(val: string) => setFormData({...formData, page_id: val})}
                      options={[
                        { value: '', labelAr: 'الصفحة الرئيسية', labelEn: 'Home Page' },
                        ...pages.map(p => ({ value: p.id, labelAr: p.name_ar, labelEn: p.name_en }))
                      ]}
                    />
                 </div>
             </div>

             {/* Image Upload */}
             <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl p-6 bg-slate-50 dark:bg-white/5">
                {formData.image_url ? (
                  <div className="relative group w-full aspect-video rounded-2xl overflow-hidden">
                    <img src={resolveAssetUrl(formData.image_url)} className="w-full h-full object-cover" alt="" />
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <ImageIcon className="text-white" size={40} />
                      <input type="file" onChange={handleImageUpload} className="hidden" accept=".png,.jpg,.jpeg,.gif,.webp,image/png,image/jpeg,image/gif,image/webp" />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-3 cursor-pointer p-12">
                    <div className="w-16 h-16 bg-primary-500/10 text-primary-500 rounded-full flex items-center justify-center">
                      <ImageIcon size={32} />
                    </div>
                    <span className="font-semibold text-slate-500">{rtl ? 'اضغط لرفع صورة الشريحة' : 'Upload Slide Image'}</span>
                    <input type="file" onChange={handleImageUpload} className="hidden" accept=".png,.jpg,.jpeg,.gif,.webp,image/png,image/jpeg,image/gif,image/webp" />
                  </label>
                )}
                <p className="mt-4 text-xs text-slate-500 text-center">{rtl ? 'يفضل مقاس كبير (1920x1080) بجودة عالية' : 'Recommended size: 1920x1080 high quality'}</p>
             </div>
          </div>

          <div className="mt-8 flex justify-end gap-4 border-t border-white/10 pt-6">
             <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl hover:bg-white/5 transition-colors">{rtl ? 'إلغاء' : 'Cancel'}</button>
             <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all duration-300 bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 hover:scale-105 active:scale-95">
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
                     <img src={resolveAssetUrl(slide.image_url)} className="w-full h-full object-cover" alt="" />
                     <div className="absolute top-2 left-2 bg-primary-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                     </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center gap-1">
                     <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">{rtl ? slide.title_ar : slide.title_en}</h3>
                        {slide.page_id && (
                          <span className="px-2 py-0.5 rounded-md bg-primary-500/10 text-primary-500 text-[10px] font-black uppercase tracking-widest border border-primary-500/20">
                            {rtl ? pages.find(p => p.id === slide.page_id)?.name_ar : pages.find(p => p.id === slide.page_id)?.name_en}
                          </span>
                        )}
                        {!slide.page_id && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-500/20">
                            {rtl ? 'الرئيسية' : 'Home'}
                          </span>
                        )}
                     </div>
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

      {showGsapPanel && <GsapSliderManager />}

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
