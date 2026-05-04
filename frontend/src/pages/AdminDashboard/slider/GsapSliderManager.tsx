import { useState, useEffect } from 'react';
import { useStore } from '../../../store/store';
import { Plus, Trash2, Save, Loader2, ArrowLeft, ArrowRight, Layout, CheckCircle2 } from 'lucide-react';
import PremiumDropdown from '../../../components/ui/PremiumDropdown';
import { api } from '../../../api';
import { resolveAssetUrl } from '../../../utils/assetUrl';
import toast from 'react-hot-toast';

interface GsapSlide {
  id: string;
  place: string;
  title: string;
  title2: string;
  description: string;
  image: string;
  btn_link?: string;
  page_id?: string;
  order_index: number;
}

export default function GsapSliderManager() {
  const { rtl, pages } = useStore();
  const [slides, setSlides] = useState<GsapSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
  const [interval, setInterval] = useState(5); // seconds

  useEffect(() => {
    fetchSlides();
    fetchInterval();
  }, []);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const res = await api.get('/gsap-slides');
      setSlides(res.data || []);
      if (res.data?.length > 0) {
        setActiveSlideId(res.data[0].id);
      }
    } catch {
      toast.error(rtl ? 'فشل تحميل الشرائح' : 'Failed to load slides');
    } finally {
      setLoading(false);
    }
  };

  const fetchInterval = async () => {
    try {
      const res = await api.get('/settings');
      setInterval(res.data.gsapSliderInterval || 5);
    } catch {
      // use default
    }
  };

  const saveInterval = async () => {
    try {
      await api.post('/settings', { gsapSliderInterval: interval });
      toast.success(rtl ? 'تم حفظ التوقيت' : 'Interval saved');
    } catch {
      toast.error(rtl ? 'فشل حفظ التوقيت' : 'Failed to save interval');
    }
  };

  const handleAddSlide = () => {
    const newSlide: GsapSlide = {
      id: `GSAP-${Date.now()}`,
      place: rtl ? 'المكان' : 'Place',
      title: 'TITLE',
      title2: 'SUBTITLE',
      description: rtl ? 'الوصف هنا...' : 'Description here...',
      image: '',
      btn_link: '/products',
      page_id: '',
      order_index: slides.length,
    };
    setSlides([...slides, newSlide]);
    setActiveSlideId(newSlide.id);
  };

  const handleRemoveSlide = (id: string) => {
    setSlides(slides.filter(s => s.id !== id));
    if (activeSlideId === id) {
      setActiveSlideId(slides.find(s => s.id !== id)?.id || null);
    }
  };

  const handleUpdateSlide = (id: string, updates: Partial<GsapSlide>) => {
    setSlides(slides.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleImageUpload = async (slideId: string, file: File) => {
    const fd = new FormData();
    fd.append('image', file);
    fd.append('page', 'gsap-slides');
    try {
      const res = await api.post('/upload', fd);
      handleUpdateSlide(slideId, { image: res.data.url });
      toast.success(rtl ? 'تم رفع الصورة' : 'Image uploaded');
    } catch {
      toast.error(rtl ? 'فشل رفع الصورة' : 'Upload failed');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/gsap-slides', { slides });
      toast.success(rtl ? 'تم الحفظ بنجاح' : 'Saved successfully');
    } catch {
      toast.error(rtl ? 'فشل الحفظ' : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === slides.length - 1) return;

    const newSlides = [...slides];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newSlides[index], newSlides[swapIndex]] = [newSlides[swapIndex], newSlides[index]];
    
    // Update order_index
    newSlides.forEach((slide, i) => slide.order_index = i);
    setSlides(newSlides);
  };

  const activeSlide = slides.find(s => s.id === activeSlideId);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={32} className="text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <Layout className="text-primary-500" size={32} />
            {rtl ? 'إدارة السلايدر المتقدم' : 'Advanced Slider Manager'}
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            {rtl ? 'إدارة شرائح السلايدر مع تأثيرات GSAP' : 'Manage GSAP animated slider slides'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddSlide}
            className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl font-black text-sm transition-all duration-300 bg-primary-500 text-white shadow-lg shadow-primary-500/25 hover:bg-primary-600"
          >
            <span className="w-7 h-7 rounded-lg bg-white/30 flex items-center justify-center">
              <Plus size={16} strokeWidth={3} />
            </span>
            <span>{rtl ? 'إضافة شريحة' : 'Add Slide'}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {rtl ? 'حفظ' : 'Save'}
          </button>
        </div>
      </div>

      {/* Interval Setting */}
      <div className="glass-card p-4 flex items-center gap-4">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {rtl ? 'توقيت السلايد (ثانية):' : 'Slide Interval (sec):'}
        </span>
        <input
          type="number"
          min="1"
          max="60"
          value={interval}
          onChange={(e) => setInterval(Number(e.target.value))}
          className="w-20 bg-slate-100 dark:bg-white/5 border border-white/10 rounded-lg p-2 text-center font-bold outline-none"
        />
        <button
          onClick={saveInterval}
          className="px-4 py-2 rounded-xl font-bold text-sm bg-primary-500 text-white hover:bg-primary-600 transition-colors"
        >
          {rtl ? 'حفظ' : 'Save'}
        </button>
        <span className="text-xs text-slate-500">
          {rtl ? '(0 = يدوي فقط)' : '(0 = manual only)'}
        </span>
      </div>

      {/* Preview Controls */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {rtl ? 'معاينة السلايدر:' : 'Slider Preview:'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.dispatchEvent(new Event('gsap-slider-prev'))}
              className="w-10 h-10 rounded-full border-2 border-slate-300 dark:border-white/30 flex items-center justify-center hover:border-primary-500 hover:text-primary-500 transition-colors"
              title={rtl ? 'السابق' : 'Previous'}
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={() => window.dispatchEvent(new Event('gsap-slider-next'))}
              className="w-10 h-10 rounded-full border-2 border-slate-300 dark:border-white/30 flex items-center justify-center hover:border-primary-500 hover:text-primary-500 transition-colors"
              title={rtl ? 'التالي' : 'Next'}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">{rtl ? 'انتقل إلى:' : 'Go to:'}</span>
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => window.dispatchEvent(new CustomEvent('gsap-slider-go-to', { detail: { index: idx } }))}
              className={`w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                activeSlideId === slides[idx]?.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Slides List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="font-bold text-slate-700 dark:text-slate-300">
            {rtl ? 'الشرائح' : 'Slides'} ({slides.length})
          </h3>
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              onClick={() => setActiveSlideId(slide.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                activeSlideId === slide.id
                  ? 'border-primary-500 bg-primary-500/5'
                  : 'border-slate-200 dark:border-white/10 hover:border-primary-500/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-16 h-12 rounded-lg bg-slate-100 dark:bg-white/5 overflow-hidden shrink-0">
                  {slide.image ? (
                    <img src={resolveAssetUrl(slide.image)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      {rtl ? 'لا توجد صورة' : 'No image'}
                    </div>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-sm truncate">{slide.place}</p>
                  <p className="text-xs text-slate-500 truncate">{slide.title} {slide.title2}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveSlide(idx, 'up'); }}
                    disabled={idx === 0}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded disabled:opacity-30"
                  >
                    <ArrowLeft size={14} className={rtl ? 'rotate-180' : ''} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveSlide(idx, 'down'); }}
                    disabled={idx === slides.length - 1}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded disabled:opacity-30"
                  >
                    <ArrowRight size={14} className={rtl ? 'rotate-180' : ''} />
                  </button>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveSlide(slide.id); }}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-8">
          {activeSlide ? (
            (() => {
              const slideId = activeSlide.id;
              return (
            <div className="glass-card p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                <h3 className="font-bold text-lg">{rtl ? 'تعديل الشريحة' : 'Edit Slide'}</h3>
                {activeSlide.image && (
                  <CheckCircle2 size={20} className="text-primary-500" />
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-500">
                  {rtl ? 'الصورة' : 'Image'}
                </label>
                {activeSlide.image ? (
                  <div className="relative rounded-xl overflow-hidden group aspect-video">
                    <img src={resolveAssetUrl(activeSlide.image)} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <label className="bg-white text-slate-700 px-4 py-2 rounded-lg font-bold cursor-pointer">
                        {rtl ? 'تغيير' : 'Change'}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(slideId, file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all aspect-video">
                    <Plus size={24} className="text-slate-400 mb-2" />
                    <span className="text-sm font-bold text-slate-400">
                      {rtl ? 'رفع صورة' : 'Upload Image'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(slideId, file);
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-2 text-slate-500 uppercase">
                    {rtl ? 'المكان' : 'Place'}
                  </label>
                  <input
                    value={activeSlide.place}
                    onChange={(e) => handleUpdateSlide(slideId, { place: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 font-bold outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-slate-500 uppercase">
                    {rtl ? 'العنوان الأول' : 'Title 1'}
                  </label>
                  <input
                    value={activeSlide.title}
                    onChange={(e) => handleUpdateSlide(slideId, { title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 font-bold outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-slate-500 uppercase">
                    {rtl ? 'العنوان الثاني' : 'Title 2'}
                  </label>
                  <input
                    value={activeSlide.title2}
                    onChange={(e) => handleUpdateSlide(slideId, { title2: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 font-bold outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-slate-500 uppercase">
                    {rtl ? 'رابط الزر' : 'Button Link'}
                  </label>
                  <input
                    value={activeSlide.btn_link || ''}
                    onChange={(e) => handleUpdateSlide(slideId, { btn_link: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 font-bold outline-none focus:border-primary-500"
                    placeholder="/products"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-slate-500 uppercase">
                    {rtl ? 'الصفحة المستهدفة' : 'Target Page'}
                  </label>
                  <PremiumDropdown
                    value={activeSlide.page_id || ''}
                    rtl={rtl}
                    onChange={(val: string) => handleUpdateSlide(slideId, { page_id: val })}
                    options={[
                      { value: '', labelAr: 'الصفحة الرئيسية', labelEn: 'Home Page' },
                      ...pages.map(p => ({ value: p.id, labelAr: p.name_ar, labelEn: p.name_en }))
                    ]}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-2 text-slate-500 uppercase">
                  {rtl ? 'الوصف' : 'Description'}
                </label>
                <textarea
                  value={activeSlide.description}
                  onChange={(e) => handleUpdateSlide(slideId, { description: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 font-bold outline-none focus:border-primary-500 resize-none"
                />
              </div>
            </div>
              );
            })()
          ) : (
            <div className="glass-card p-12 text-center text-slate-500">
              {rtl ? 'اختر شريحة للتعديل' : 'Select a slide to edit'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
