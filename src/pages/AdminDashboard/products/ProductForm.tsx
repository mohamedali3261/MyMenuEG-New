import { useState, useEffect } from 'react';
import { useStore } from '../../../store/store';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, Trash2, Save, Loader2, Tag } from 'lucide-react';
import { api } from '../../../api';
import PremiumDropdown from '../../../components/ui/PremiumDropdown';

export default function ProductForm() {
  const { rtl, showToast } = useStore();
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Basic states
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'media'>('basic');
  const [formData, setFormData] = useState({
    name_ar: '', name_en: '', description_ar: '', description_en: '', 
    price: 0, old_price: 0, stock: 0, category_id: '',
    is_best_seller: false,
    shipping_info_ar: '', shipping_info_en: '',
    warranty_info_ar: '', warranty_info_en: '',
    carton_details_ar: '', carton_details_en: '',
    video_url: ''
  });

  // Dynamic features/specs state
  const [specs, setSpecs] = useState([{ key_ar: '', key_en: '', val_ar: '', val_en: '' }]);
  const [images, setImages] = useState<string[]>([]);
  
  const addSpec = () => setSpecs([...specs, { key_ar: '', key_en: '', val_ar: '', val_en: '' }]);
  const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));

  const updateForm = (key: string, val: any) => setFormData(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    // Fetch categories for the dropdown
    api.get('/categories').then(res => setCategories(res.data)).catch(console.error);

    // If editing, fetch product data
    if (id) {
      setLoading(true);
      api.get(`/products/${id}`)
        .then(res => {
          const prod = res.data;
          setFormData({
            name_ar: prod.name_ar || '',
            name_en: prod.name_en || '',
            description_ar: prod.description_ar || '',
            description_en: prod.description_en || '',
            price: prod.price || 0,
            old_price: prod.old_price || 0,
            stock: prod.stock || 0,
            category_id: prod.category_id || '',
            is_best_seller: !!prod.is_best_seller,
            shipping_info_ar: prod.shipping_info_ar || '',
            shipping_info_en: prod.shipping_info_en || '',
            warranty_info_ar: prod.warranty_info_ar || '',
            warranty_info_en: prod.warranty_info_en || '',
            carton_details_ar: prod.carton_details_ar || '',
            carton_details_en: prod.carton_details_en || '',
            video_url: prod.video_url || ''
          });
          if (prod.specs) setSpecs(prod.specs);
          if (prod.images) setImages(prod.images);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setLoading(true);
    const file = e.target.files[0];
    const data = new FormData();
    data.append('image', file);
    data.append('page', 'products'); 

    try {
      const res = await api.post('/upload', data);
      if (res.data.url) {
        setImages([...images, res.data.url]);
        showToast(rtl ? 'تم رفع الصورة' : 'Image uploaded', 'success');
      }
    } catch (err) {
      console.error('Upload failed', err);
      showToast(rtl ? 'فشل رفع الصورة' : 'Image upload failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveProduct = async () => {
    setLoading(true);
    try {
      await api.post('/products', {
        id, 
        ...formData,
        specs,
        images
      });
      showToast(rtl ? 'تم حفظ المنتج بنجاح!' : 'Product saved successfully!', 'success');
      navigate('/admin/products');
    } catch (err) {
      showToast(rtl ? 'فشل حفظ المنتج' : 'Failed to save product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = [
    { value: '', labelAr: '-- بدون تصنيف --', labelEn: '-- Uncategorized --', icon: <Tag size={14} className="opacity-40" /> },
    ...categories.map(c => ({
      value: c.id,
      labelAr: c.name_ar,
      labelEn: c.name_en,
      icon: <Tag size={14} />,
      color: 'text-primary-500',
      bg: 'bg-primary-500/10'
    }))
  ];

  return (
    <div className="max-w-5xl mx-auto pb-12">
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/products" className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition">
            <ArrowRight size={24} className={rtl ? '' : 'rotate-180'} />
          </Link>
          <h1 className="text-3xl font-bold">{rtl ? 'إضافة/تعديل منتج بريميوم' : 'Add/Edit Premium Product'}</h1>
        </div>
        <button onClick={saveProduct} disabled={loading} className="btn-primary flex items-center gap-2 px-8">
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          {rtl ? 'حفظ التغييرات' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs Header */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {[
          { id: 'basic', label: rtl ? 'الأساسية' : 'Basic Info' },
          { id: 'advanced', label: rtl ? 'تفاصيل متقدمة' : 'Advanced Details' },
          { id: 'media', label: rtl ? 'الوسائط والمواصفات' : 'Media & Specs' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-xl font-bold transition-all shrink-0 ${activeTab === tab.id ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-white/5 hover:bg-white/10 text-slate-400'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">{rtl ? 'الاسم والوصف' : 'Name & Description'}</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block mb-2 font-medium">{rtl ? 'الاسم (عربي)' : 'Name (Arabic)'}</label>
                  <input value={formData.name_ar} onChange={e => updateForm('name_ar', e.target.value)} type="text" className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block mb-2 font-medium">{rtl ? 'الاسم (إنجليزي)' : 'Name (English)'}</label>
                  <input value={formData.name_en} onChange={e => updateForm('name_en', e.target.value)} type="text" dir="ltr" className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium">{rtl ? 'الوصف (عربي)' : 'Description (Arabic)'}</label>
                  <textarea value={formData.description_ar} onChange={e => updateForm('description_ar', e.target.value)} rows={6} className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500"></textarea>
                </div>
                <div>
                  <label className="block mb-2 font-medium">{rtl ? 'الوصف (إنجليزي)' : 'Description (English)'}</label>
                  <textarea value={formData.description_en} onChange={e => updateForm('description_en', e.target.value)} dir="ltr" rows={6} className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500"></textarea>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 grid md:grid-cols-4 gap-6">
               <div>
                  <label className="block mb-2 font-medium">{rtl ? 'السعر الحالي (EGP)' : 'Current Price (EGP)'}</label>
                  <input value={formData.price} onChange={e => updateForm('price', Number(e.target.value))} type="number" className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block mb-2 font-medium">{rtl ? 'السعر قبل الخصم (EGP)' : 'Price Before Discount (EGP)'}</label>
                  <input value={formData.old_price} onChange={e => updateForm('old_price', Number(e.target.value))} type="number" className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block mb-2 font-medium">{rtl ? 'المخزون' : 'Stock'}</label>
                  <input value={formData.stock} onChange={e => updateForm('stock', Number(e.target.value))} type="number" className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500" />
                </div>
                <div className="md:col-span-1">
                  <label className="block mb-2 font-medium">{rtl ? 'التصنيف' : 'Category'}</label>
                  <PremiumDropdown 
                    value={formData.category_id}
                    options={categoryOptions}
                    rtl={rtl}
                    onChange={(v) => updateForm('category_id', v)}
                  />
                </div>
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">{rtl ? 'الشحن والضمان' : 'Shipping & Warranty'}</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block mb-2 font-medium">{rtl ? 'معلومات الشحن (عربي)' : 'Shipping Info (Arabic)'}</label>
                  <textarea value={formData.shipping_info_ar} onChange={e => updateForm('shipping_info_ar', e.target.value)} rows={3} className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500" placeholder="شحن خلال 48 ساعة..."></textarea>
                </div>
                <div>
                  <label className="block mb-2 font-medium">{rtl ? 'معلومات الشحن (إنجليزي)' : 'Shipping Info (English)'}</label>
                  <textarea value={formData.shipping_info_en} onChange={e => updateForm('shipping_info_en', e.target.value)} dir="ltr" rows={3} className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500" placeholder="Ships in 48h..."></textarea>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium">{rtl ? 'الضمان والاسترجاع (عربي)' : 'Warranty & Returns (Arabic)'}</label>
                  <textarea value={formData.warranty_info_ar} onChange={e => updateForm('warranty_info_ar', e.target.value)} rows={3} className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500" placeholder="ضمان لمدة عام..."></textarea>
                </div>
                <div>
                  <label className="block mb-2 font-medium">{rtl ? 'الضمان والاسترجاع (إنجليزي)' : 'Warranty & Returns (English)'}</label>
                  <textarea value={formData.warranty_info_en} onChange={e => updateForm('warranty_info_en', e.target.value)} dir="ltr" rows={3} className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500" placeholder="1 year warranty..."></textarea>
                </div>
              </div>
              
              {/* Carton Details Section */}
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block mb-2 font-medium">{rtl ? 'تفاصيل الكرتونة (عربي)' : 'Carton Details (Arabic)'}</label>
                  <input value={formData.carton_details_ar} onChange={e => updateForm('carton_details_ar', e.target.value)} type="text" className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500" placeholder="تحتوي الكرتونه علي 198 عبوه + غطاء" />
                </div>
                <div>
                  <label className="block mb-2 font-medium">{rtl ? 'تفاصيل الكرتونة (إنجليزي)' : 'Carton Details (English)'}</label>
                  <input value={formData.carton_details_en} onChange={e => updateForm('carton_details_en', e.target.value)} type="text" dir="ltr" className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500" placeholder="Carton contains 198 pieces + lid" />
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <label className="block mb-2 font-bold">{rtl ? 'رابط فيديو المنتج (اختياري)' : 'Product Video URL (Optional)'}</label>
              <input value={formData.video_url} onChange={e => updateForm('video_url', e.target.value)} type="text" placeholder="https://youtube.com/..." className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500" />
            </div>
            
            <div className="glass-card p-6 flex items-center gap-4">
               <input 
                  type="checkbox" 
                  id="best-seller"
                  checked={formData.is_best_seller} 
                  onChange={e => updateForm('is_best_seller', e.target.checked)} 
                  className="w-6 h-6 rounded-lg text-primary-500" 
                />
                <label htmlFor="best-seller" className="font-bold cursor-pointer">{rtl ? 'تمييز كأكثر مبيعاً ⭐' : 'Highlight as Best Seller ⭐'}</label>
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-6">
            {/* Gallery */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">{rtl ? 'معرض الصور' : 'Photo Gallery'}</h2>
              <div className="flex gap-4 mb-6 flex-wrap">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img.startsWith('http') ? img : 'http://localhost:5000' + img} alt="" className="w-24 h-24 object-cover rounded-xl border border-white/10" />
                    <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/5 transition relative">
                   <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageUpload} />
                   <Plus size={24} className="text-slate-500" />
                </label>
              </div>
            </div>

            {/* Specs */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <h2 className="text-xl font-bold">{rtl ? 'المواصفات التقنية' : 'Technical Specs'}</h2>
                <button onClick={addSpec} className="btn-primary py-2 px-4 text-xs flex items-center gap-2">
                  <Plus size={14} /> {rtl ? 'إضافة مواصفة' : 'Add Spec'}
                </button>
              </div>
              <div className="space-y-4">
                {specs.map((spec, i) => (
                  <div key={i} className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="grid grid-cols-2 gap-4 flex-grow">
                      <input value={spec.key_ar} onChange={e => { const s = [...specs]; s[i].key_ar = e.target.value; setSpecs(s); }} placeholder="الخاصية (ع)" className="bg-slate-100 dark:bg-black/20 p-2 rounded-lg outline-none" />
                      <input value={spec.val_ar} onChange={e => { const s = [...specs]; s[i].val_ar = e.target.value; setSpecs(s); }} placeholder="القيمة (ع)" className="bg-slate-100 dark:bg-black/20 p-2 rounded-lg outline-none" />
                      <input value={spec.key_en} onChange={e => { const s = [...specs]; s[i].key_en = e.target.value; setSpecs(s); }} placeholder="Key (en)" className="bg-slate-100 dark:bg-black/20 p-2 rounded-lg outline-none" dir="ltr" />
                      <input value={spec.val_en} onChange={e => { const s = [...specs]; s[i].val_en = e.target.value; setSpecs(s); }} placeholder="Value (en)" className="bg-slate-100 dark:bg-black/20 p-2 rounded-lg outline-none" dir="ltr" />
                    </div>
                    <button onClick={() => removeSpec(i)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-full transition"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
