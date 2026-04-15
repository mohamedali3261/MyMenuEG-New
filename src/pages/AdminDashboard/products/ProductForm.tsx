import { useState, useEffect } from 'react';
import { useStore } from '../../../store/store';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, Trash2, Save, Loader2, Tag, Layout } from 'lucide-react';
import type { AxiosError } from 'axios';
import { api } from '../../../api';
import PremiumDropdown from '../../../components/ui/PremiumDropdown';
import { PRODUCT_TEMPLATE_OPTIONS, getProductTemplateByKey, type ProductVariantTemplate } from './productTemplates';
import { resolveAssetUrl } from '../../../utils/assetUrl';

interface OptionItem {
  id: string;
  name_ar: string;
  name_en: string;
}

interface QuantityPrice {
  quantity_label: string;
  price: number;
  old_price: number;
}

interface DetailItem {
  label_ar: string;
  label_en: string;
  value_ar: string;
  value_en: string;
  order_index: number;
}

type ProductVariant = ProductVariantTemplate;

const DIMENSION_PRESET_MAP: Record<string, { ar: string; en: string }> = {
  cup_4oz: { ar: 'قطر 6 سم × ارتفاع 6 سم (4 أونصة)', en: '6 cm diameter × 6 cm height (4 oz)' },
  cup_8oz: { ar: 'قطر 8 سم × ارتفاع 9 سم (8 أونصة)', en: '8 cm diameter × 9 cm height (8 oz)' },
  cup_12oz: { ar: 'قطر 9 سم × ارتفاع 11 سم (12 أونصة)', en: '9 cm diameter × 11 cm height (12 oz)' },
  cup_16oz: { ar: 'قطر 9.5 سم × ارتفاع 13 سم (16 أونصة)', en: '9.5 cm diameter × 13 cm height (16 oz)' },
  cup_22oz: { ar: 'قطر 9.8 سم × ارتفاع 16 سم (22 أونصة)', en: '9.8 cm diameter × 16 cm height (22 oz)' },
  cup_32oz: { ar: 'قطر 10.5 سم × ارتفاع 17.5 سم (32 أونصة)', en: '10.5 cm diameter × 17.5 cm height (32 oz)' },
  box_small: { ar: '20 × 15 × 8 سم', en: '20 × 15 × 8 cm' },
  box_medium: { ar: '25 × 20 × 10 سم', en: '25 × 20 × 10 cm' },
  box_large: { ar: '30 × 25 × 12 سم', en: '30 × 25 × 12 cm' },
  box_xl: { ar: '35 × 30 × 14 سم', en: '35 × 30 × 14 cm' },
  bag_small: { ar: '18 × 10 × 25 سم', en: '18 × 10 × 25 cm' },
  bag_medium: { ar: '24 × 12 × 32 سم', en: '24 × 12 × 32 cm' },
  bag_large: { ar: '32 × 14 × 40 سم', en: '32 × 14 × 40 cm' },
  lid_80mm: { ar: 'قطر 80 مم', en: '80 mm diameter' },
  lid_90mm: { ar: 'قطر 90 مم', en: '90 mm diameter' },
  sleeve_standard: { ar: '12 × 6 سم', en: '12 × 6 cm' }
};

type ProductFormTab = 'basic' | 'advanced' | 'media';

export default function ProductForm() {
  const { rtl, showToast } = useStore();
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Basic states
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<OptionItem[]>([]);
  const [pages, setPages] = useState<OptionItem[]>([]);
  const [activeTab, setActiveTab] = useState<ProductFormTab>('basic');
  const [templateKey, setTemplateKey] = useState('');
  const [formData, setFormData] = useState({
    name_ar: '', name_en: '', description_ar: '', description_en: '', 
    price: 0, old_price: 0, stock: 0, category_id: '', page_id: '',
    is_best_seller: false,
    shipping_info_ar: '', shipping_info_en: '',
    warranty_info_ar: '', warranty_info_en: '',
    carton_details_ar: '', carton_details_en: '',
    brand_ar: '', brand_en: '',
    material_ar: '', material_en: '',
    dimensions_ar: '', dimensions_en: '',
    usage_notes_ar: '', usage_notes_en: '',
    video_url: ''
  });

  // Dynamic features/specs state
  const [specs, setSpecs] = useState([{ key_ar: '', key_en: '', val_ar: '', val_en: '' }]);
  const [images, setImages] = useState<string[]>([]);
  const [quantityPrices, setQuantityPrices] = useState<QuantityPrice[]>([]);
  const [detailItems, setDetailItems] = useState<DetailItem[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [dimensionsPreset, setDimensionsPreset] = useState('');
  
  const addSpec = () => setSpecs([...specs, { key_ar: '', key_en: '', val_ar: '', val_en: '' }]);
  const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));

  const addQuantityPrice = () => setQuantityPrices([...quantityPrices, { quantity_label: '', price: 0, old_price: 0 }]);
  const removeQuantityPrice = (index: number) => setQuantityPrices(quantityPrices.filter((_, i) => i !== index));
  const updateQuantityPrice = (index: number, key: keyof QuantityPrice, val: string | number) => {
    const updated = [...quantityPrices];
    updated[index] = { ...updated[index], [key]: val };
    setQuantityPrices(updated);
  };

  const addDetailItem = () => setDetailItems([...detailItems, { label_ar: '', label_en: '', value_ar: '', value_en: '', order_index: detailItems.length }]);
  const removeDetailItem = (index: number) => setDetailItems(detailItems.filter((_, i) => i !== index));
  const updateDetailItem = (index: number, key: keyof DetailItem, val: string | number) => {
    const updated = [...detailItems];
    updated[index] = { ...updated[index], [key]: val };
    setDetailItems(updated);
  };

  const addVariant = () => setVariants([...variants, { label_ar: '', label_en: '', sku: '', price: 0, old_price: 0, stock: 0, is_default: variants.length === 0, image_url: '' }]);
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));
  const updateVariant = (index: number, key: keyof ProductVariant, val: string | number | boolean) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [key]: val } as ProductVariant;
    if (key === 'is_default' && Boolean(val)) {
      for (let i = 0; i < updated.length; i += 1) updated[i].is_default = i === index;
    }
    setVariants(updated);
  };

  const updateForm = <K extends keyof typeof formData>(key: K, val: (typeof formData)[K]) =>
    setFormData(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    // Fetch categories and pages for the dropdowns
    api.get('/categories').then(res => setCategories(res.data)).catch(console.error);
    api.get('/pages').then(res => setPages(res.data)).catch(console.error);

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
            page_id: prod.page_id || '',
            is_best_seller: !!prod.is_best_seller,
            shipping_info_ar: prod.shipping_info_ar || '',
            shipping_info_en: prod.shipping_info_en || '',
            warranty_info_ar: prod.warranty_info_ar || '',
            warranty_info_en: prod.warranty_info_en || '',
            carton_details_ar: prod.carton_details_ar || '',
            carton_details_en: prod.carton_details_en || '',
            brand_ar: prod.brand_ar || '',
            brand_en: prod.brand_en || '',
            material_ar: prod.material_ar || '',
            material_en: prod.material_en || '',
            dimensions_ar: prod.dimensions_ar || '',
            dimensions_en: prod.dimensions_en || '',
            usage_notes_ar: prod.usage_notes_ar || '',
            usage_notes_en: prod.usage_notes_en || '',
            video_url: prod.video_url || ''
          });
          if (prod.specs) setSpecs(prod.specs);
          if (Array.isArray(prod.images) && prod.images.length > 0) {
            setImages(prod.images);
          } else if (prod.image_url) {
            setImages([prod.image_url]);
          }
          if (prod.quantity_prices) setQuantityPrices(prod.quantity_prices);
          if (prod.detail_items) setDetailItems(prod.detail_items);
          if (prod.variants) {
            const normalized = (prod.variants as any[]).map((v) => ({
              ...v,
              image_url: v?.image_url ?? v?.imageUrl ?? '',
            }));
            setVariants(normalized);
          }
          if (prod.template_key) setTemplateKey(prod.template_key);
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

  const handleVariantImageUpload = async (variantIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setLoading(true);
    const file = e.target.files[0];
    const data = new FormData();
    data.append('image', file);
    data.append('page', 'products');

    try {
      const res = await api.post('/upload', data);
      if (res.data.url) {
        updateVariant(variantIndex, 'image_url', res.data.url);
        showToast(rtl ? 'تم رفع صورة النسخة' : 'Variant image uploaded', 'success');
      }
    } catch (err) {
      console.error('Variant upload failed', err);
      showToast(rtl ? 'فشل رفع صورة النسخة' : 'Variant image upload failed', 'error');
    } finally {
      setLoading(false);
      // allow re-uploading the same file
      e.target.value = '';
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setLoading(true);
    const file = e.target.files[0];
    const data = new FormData();
    data.append('image', file);
    data.append('page', 'products');

    try {
      const res = await api.post('/upload', data);
      if (res.data.url) {
        setImages((prev) => [...prev, res.data.url]);
        showToast(rtl ? 'تم رفع الصورة' : 'Image uploaded', 'success');
      }
    } catch (err) {
      console.error('Upload failed', err);
      showToast(rtl ? 'فشل رفع الصورة' : 'Image upload failed', 'error');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleGalleryImageReplace = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setLoading(true);
    const file = e.target.files[0];
    const data = new FormData();
    data.append('image', file);
    data.append('page', 'products');

    try {
      const res = await api.post('/upload', data);
      if (res.data.url) {
        setImages((prev) => prev.map((img, i) => (i === index ? res.data.url : img)));
        showToast(rtl ? 'تم استبدال الصورة' : 'Image replaced', 'success');
      }
    } catch (err) {
      console.error('Replace failed', err);
      showToast(rtl ? 'فشل استبدال الصورة' : 'Replace failed', 'error');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const saveProduct = async () => {
    if (!formData.name_ar.trim() || !formData.name_en.trim()) {
      return showToast(rtl ? 'برجاء إدخال اسم المنتج بالعربي والإنجليزي' : 'Please enter product name in Arabic and English', 'error');
    }
    if (formData.price <= 0) {
      return showToast(rtl ? 'السعر الأساسي يجب أن يكون أكبر من صفر' : 'Base price must be greater than zero', 'error');
    }
    if (!formData.category_id) {
      return showToast(rtl ? 'برجاء اختيار التصنيف' : 'Please select a category', 'error');
    }
    if (!formData.page_id) {
       return showToast(rtl ? 'برجاء اختيار الصفحة المستهدفة' : 'Please select a target page', 'error');
    }
    const invalidQuantityPrice = quantityPrices.find(qp => !qp.quantity_label.trim() || qp.price <= 0);
    if (invalidQuantityPrice) {
      return showToast(
        rtl ? 'تأكد أن كل سعر كمية يحتوي على عدد وسعر أكبر من صفر' : 'Ensure each quantity price has a label and price greater than zero',
        'error'
      );
    }
    const invalidVariant = variants.find(variant => variant.price <= 0);
    if (invalidVariant) {
      return showToast(rtl ? 'سعر كل Variant يجب أن يكون أكبر من صفر' : 'Each variant price must be greater than zero', 'error');
    }
    setLoading(true);
    try {
      const normalizedVariants = variants.map((v) => ({
        ...v,
        image_url: v.image_url || '',
      }));
      await api.post('/products', {
        id, 
        ...formData,
        image_url: images[0] || undefined,
        specs,
        images,
        quantity_prices: quantityPrices,
        detail_items: detailItems,
        template_key: templateKey,
        variants: normalizedVariants
      });
      showToast(rtl ? 'تم حفظ المنتج بنجاح!' : 'Product saved successfully!', 'success');
      navigate('/admin/products');
    } catch (error: unknown) {
      console.error('Save product failed', error);
      const axiosError = error as AxiosError<{ error?: string; details?: string[] }>;
      const apiDetails = axiosError.response?.data?.details;
      const apiError = axiosError.response?.data?.error;
      const backendMessage = Array.isArray(apiDetails) && apiDetails.length > 0
        ? apiDetails[0]
        : apiError;
      showToast(
        backendMessage || (rtl ? 'فشل حفظ المنتج' : 'Failed to save product'),
        'error'
      );
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

  const pageOptions = [
    { value: '', labelAr: '-- الصفحة العامة --', labelEn: '-- General Products --', icon: <Layout size={14} className="opacity-40" /> },
    ...pages.map(p => ({
      value: p.id,
      labelAr: p.name_ar,
      labelEn: p.name_en,
      icon: <Layout size={14} />,
      color: 'text-primary-500',
      bg: 'bg-primary-500/10'
    }))
  ];

  const dimensionsPresetOptions = [
    { value: '', labelAr: '-- اكتب أبعاد مخصصة --', labelEn: '-- Custom dimensions --' },
    { value: 'cup_4oz', labelAr: 'كوب 4 أونصة', labelEn: 'Cup 4 oz' },
    { value: 'cup_8oz', labelAr: 'كوب 8 أونصة', labelEn: 'Cup 8 oz' },
    { value: 'cup_12oz', labelAr: 'كوب 12 أونصة', labelEn: 'Cup 12 oz' },
    { value: 'cup_16oz', labelAr: 'كوب 16 أونصة', labelEn: 'Cup 16 oz' },
    { value: 'cup_22oz', labelAr: 'كوب 22 أونصة', labelEn: 'Cup 22 oz' },
    { value: 'cup_32oz', labelAr: 'كوب 32 أونصة', labelEn: 'Cup 32 oz' },
    { value: 'box_small', labelAr: 'علبة صغيرة', labelEn: 'Small Box' },
    { value: 'box_medium', labelAr: 'علبة متوسطة', labelEn: 'Medium Box' },
    { value: 'box_large', labelAr: 'علبة كبيرة', labelEn: 'Large Box' },
    { value: 'box_xl', labelAr: 'علبة كبيرة جدًا', labelEn: 'XL Box' },
    { value: 'bag_small', labelAr: 'كيس صغير', labelEn: 'Small Bag' },
    { value: 'bag_medium', labelAr: 'كيس متوسط', labelEn: 'Medium Bag' },
    { value: 'bag_large', labelAr: 'كيس كبير', labelEn: 'Large Bag' },
    { value: 'lid_80mm', labelAr: 'غطاء 80 مم', labelEn: 'Lid 80 mm' },
    { value: 'lid_90mm', labelAr: 'غطاء 90 مم', labelEn: 'Lid 90 mm' },
    { value: 'sleeve_standard', labelAr: 'حامل قياسي', labelEn: 'Standard Sleeve' }
  ];

  const templateOptions = [
    { value: '', labelAr: '-- بدون قالب --', labelEn: '-- No template --' },
    ...PRODUCT_TEMPLATE_OPTIONS
  ];

  const handleDimensionsPresetChange = (presetKey: string) => {
    setDimensionsPreset(presetKey);
    const preset = DIMENSION_PRESET_MAP[presetKey];
    if (!preset) return;
    setFormData(prev => ({ ...prev, dimensions_ar: preset.ar, dimensions_en: preset.en }));
  };

  const applyTemplate = (key: string) => {
    setTemplateKey(key);
    const tpl = getProductTemplateByKey(key);
    if (!tpl) return;
    const clonedSpecs = tpl.preset.specs.map(spec => ({ ...spec }));
    const clonedDetailItems = tpl.preset.detail_items.map(item => ({ ...item }));
    const clonedVariants = tpl.preset.variants.map(variant => ({ ...variant }));
    setFormData(prev => ({
      ...prev,
      name_ar: tpl.preset.name_ar,
      name_en: tpl.preset.name_en,
      description_ar: tpl.preset.description_ar,
      description_en: tpl.preset.description_en,
      price: tpl.preset.price,
      old_price: tpl.preset.old_price,
      stock: tpl.preset.stock,
      shipping_info_ar: tpl.preset.shipping_info_ar,
      shipping_info_en: tpl.preset.shipping_info_en,
      warranty_info_ar: tpl.preset.warranty_info_ar,
      warranty_info_en: tpl.preset.warranty_info_en,
      carton_details_ar: tpl.preset.carton_details_ar,
      carton_details_en: tpl.preset.carton_details_en,
      brand_ar: tpl.preset.brand_ar,
      brand_en: tpl.preset.brand_en,
      material_ar: tpl.preset.material_ar,
      material_en: tpl.preset.material_en,
      dimensions_ar: tpl.preset.dimensions_ar,
      dimensions_en: tpl.preset.dimensions_en,
      usage_notes_ar: tpl.preset.usage_notes_ar,
      usage_notes_en: tpl.preset.usage_notes_en
    }));
    setDimensionsPreset('');
    setSpecs(clonedSpecs);
    setDetailItems(clonedDetailItems);
    setVariants(clonedVariants);
    setActiveTab('advanced');
    showToast(rtl ? 'تم تطبيق القالب وملء البيانات' : 'Template applied and fields populated', 'success');
  };

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
            onClick={() => setActiveTab(tab.id as ProductFormTab)}
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
              <label className="block mb-2 font-medium">{rtl ? 'قالب المنتج' : 'Product Template'}</label>
              <PremiumDropdown value={templateKey} options={templateOptions} rtl={rtl} onChange={applyTemplate} />
            </div>
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
                  <input value={formData.price} onChange={e => updateForm('price', Number(e.target.value))} type="number" min={0} step="0.01" placeholder={rtl ? 'مثال: 150' : 'Example: 150'} className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block mb-2 font-medium">{rtl ? 'السعر قبل الخصم (EGP)' : 'Price Before Discount (EGP)'}</label>
                  <input value={formData.old_price} onChange={e => updateForm('old_price', Number(e.target.value))} type="number" min={0} step="0.01" placeholder={rtl ? 'مثال: 200' : 'Example: 200'} className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block mb-2 font-medium">{rtl ? 'المخزون' : 'Stock'}</label>
                  <input value={formData.stock} onChange={e => updateForm('stock', Number(e.target.value))} type="number" min={0} step="1" placeholder={rtl ? 'مثال: 500' : 'Example: 500'} className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500" />
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
                <div className="md:col-span-1">
                  <label className="block mb-2 font-medium">{rtl ? 'الصفحة المستهدفة' : 'Target Page'}</label>
                  <PremiumDropdown 
                    value={formData.page_id}
                    options={pageOptions}
                    rtl={rtl}
                    onChange={(v) => updateForm('page_id', v)}
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
              <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">{rtl ? 'تفاصيل أساسية إضافية' : 'Additional Basic Details'}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium">{rtl ? 'العلامة التجارية (عربي)' : 'Brand (Arabic)'}</label>
                  <input value={formData.brand_ar} onChange={e => updateForm('brand_ar', e.target.value)} type="text" className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block mb-2 font-medium">{rtl ? 'العلامة التجارية (إنجليزي)' : 'Brand (English)'}</label>
                  <input value={formData.brand_en} onChange={e => updateForm('brand_en', e.target.value)} dir="ltr" type="text" className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block mb-2 font-medium">{rtl ? 'الخامة (عربي)' : 'Material (Arabic)'}</label>
                  <input value={formData.material_ar} onChange={e => updateForm('material_ar', e.target.value)} type="text" className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block mb-2 font-medium">{rtl ? 'الخامة (إنجليزي)' : 'Material (English)'}</label>
                  <input value={formData.material_en} onChange={e => updateForm('material_en', e.target.value)} dir="ltr" type="text" className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block mb-2 font-medium">{rtl ? 'الأبعاد (عربي)' : 'Dimensions (Arabic)'}</label>
                  <input value={formData.dimensions_ar} onChange={e => { setDimensionsPreset(''); updateForm('dimensions_ar', e.target.value); }} type="text" className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block mb-2 font-medium">{rtl ? 'الأبعاد (إنجليزي)' : 'Dimensions (English)'}</label>
                  <input value={formData.dimensions_en} onChange={e => { setDimensionsPreset(''); updateForm('dimensions_en', e.target.value); }} dir="ltr" type="text" className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500" />
                </div>
                <div className="md:col-span-2 max-w-[280px]">
                  <label className="block mb-2 font-medium">{rtl ? 'قائمة الأبعاد الجاهزة (يمكنك الكتابة يدويًا أيضًا)' : 'Dimensions Preset (you can still type custom values)'}</label>
                  <PremiumDropdown
                    value={dimensionsPreset}
                    options={dimensionsPresetOptions}
                    rtl={rtl}
                    onChange={handleDimensionsPresetChange}
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">{rtl ? 'ملاحظات الاستخدام (عربي)' : 'Usage Notes (Arabic)'}</label>
                  <textarea value={formData.usage_notes_ar} onChange={e => updateForm('usage_notes_ar', e.target.value)} rows={3} className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500"></textarea>
                </div>
                <div>
                  <label className="block mb-2 font-medium">{rtl ? 'ملاحظات الاستخدام (إنجليزي)' : 'Usage Notes (English)'}</label>
                  <textarea value={formData.usage_notes_en} onChange={e => updateForm('usage_notes_en', e.target.value)} dir="ltr" rows={3} className="w-full bg-slate-100 dark:bg-[#111] border border-slate-300 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary-500"></textarea>
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

            {/* Quantity Pricing Section */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <h2 className="text-xl font-bold">{rtl ? 'الأسعار حسب العدد / الكمية' : 'Quantity-Based Pricing'}</h2>
                <button onClick={addQuantityPrice} className="btn-primary py-2 px-4 text-xs flex items-center gap-2">
                  <Plus size={14} /> {rtl ? 'إضافة خيار سعر' : 'Add Price Option'}
                </button>
              </div>
              <div className="space-y-4">
                {quantityPrices.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">{rtl ? 'لا توجد خيارات كمية مضافة. سيتم استخدام السعر الأساسي.' : 'No quantity options. Default price will be used.'}</p>
                )}
                {quantityPrices.map((qp, i) => (
                  <div key={i} className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="grid grid-cols-3 gap-4 flex-grow">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">{rtl ? 'العدد (مثلاً: 1000)' : 'Quantity'}</label>
                        <input value={qp.quantity_label} onChange={e => updateQuantityPrice(i, 'quantity_label', e.target.value)} placeholder="1000" className="w-full bg-slate-100 dark:bg-black/20 p-3 rounded-lg outline-none focus:border-primary-500 border border-transparent" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">{rtl ? 'السعر (EGP)' : 'Price'}</label>
                        <input value={qp.price} onChange={e => updateQuantityPrice(i, 'price', Number(e.target.value))} type="number" min={0} step="0.01" placeholder={rtl ? 'مثال: 100' : 'Example: 100'} className="w-full bg-slate-100 dark:bg-black/20 p-3 rounded-lg outline-none focus:border-primary-500 border border-transparent" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">{rtl ? 'السعر القديم' : 'Old Price'}</label>
                        <input value={qp.old_price || ''} onChange={e => updateQuantityPrice(i, 'old_price', Number(e.target.value))} type="number" min={0} step="0.01" placeholder={rtl ? 'مثال: 150' : 'Example: 150'} className="w-full bg-slate-100 dark:bg-black/20 p-3 rounded-lg outline-none focus:border-primary-500 border border-transparent" />
                      </div>
                    </div>
                    <button onClick={() => removeQuantityPrice(i)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-full transition mt-5"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <h2 className="text-xl font-bold">{rtl ? 'تفاصيل إضافية مخصصة' : 'Custom Extra Details'}</h2>
                <button onClick={addDetailItem} className="btn-primary py-2 px-4 text-xs flex items-center gap-2">
                  <Plus size={14} /> {rtl ? 'إضافة تفصيلة' : 'Add Detail Item'}
                </button>
              </div>
              <div className="space-y-4">
                {detailItems.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">{rtl ? 'لا توجد تفاصيل مخصصة بعد.' : 'No custom detail items yet.'}</p>
                )}
                {detailItems.map((item, i) => (
                  <div key={i} className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="grid grid-cols-2 gap-4 flex-grow">
                      <input value={item.label_ar} onChange={e => updateDetailItem(i, 'label_ar', e.target.value)} placeholder={rtl ? 'اسم الخاصية (عربي)' : 'Label (Arabic)'} className="bg-slate-100 dark:bg-black/20 p-2 rounded-lg outline-none" />
                      <input value={item.label_en} onChange={e => updateDetailItem(i, 'label_en', e.target.value)} placeholder="Label (English)" dir="ltr" className="bg-slate-100 dark:bg-black/20 p-2 rounded-lg outline-none" />
                      <input value={item.value_ar} onChange={e => updateDetailItem(i, 'value_ar', e.target.value)} placeholder={rtl ? 'القيمة (عربي)' : 'Value (Arabic)'} className="bg-slate-100 dark:bg-black/20 p-2 rounded-lg outline-none" />
                      <input value={item.value_en} onChange={e => updateDetailItem(i, 'value_en', e.target.value)} placeholder="Value (English)" dir="ltr" className="bg-slate-100 dark:bg-black/20 p-2 rounded-lg outline-none" />
                    </div>
                    <button onClick={() => removeDetailItem(i)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-full transition"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <h2 className="text-xl font-bold">{rtl ? 'النسخ الفعلية للمنتج' : 'Real Variants'}</h2>
                <button onClick={addVariant} className="btn-primary py-2 px-4 text-xs flex items-center gap-2">
                  <Plus size={14} /> {rtl ? 'إضافة نسخة' : 'Add Variant'}
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                {rtl
                  ? 'استخدم هذا القسم لتعريف كل نسخة حقيقية من المنتج (مثل: مقاس/سعة/لون) بسعر ومخزون وSKU مستقل.'
                  : 'Use this section to define each real product variant (size/capacity/color) with independent price, stock, and SKU.'}
              </p>
              <div className="space-y-4">
                {variants.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">{rtl ? 'لا توجد نسخ فعلية مضافة بعد.' : 'No variants yet.'}</p>
                )}
                {variants.map((variant, i) => (
                  <div key={i} className="flex gap-4 items-start bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-grow">
                      <input value={variant.label_ar} onChange={e => updateVariant(i, 'label_ar', e.target.value)} placeholder={rtl ? 'اسم النسخة (عربي) - مثال: 12 أونصة' : 'Variant Label (AR)'} className="bg-slate-100 dark:bg-black/20 p-2 rounded-lg outline-none" />
                      <input value={variant.label_en} onChange={e => updateVariant(i, 'label_en', e.target.value)} placeholder={rtl ? 'اسم النسخة (إنجليزي)' : 'Variant Label (EN)'} dir="ltr" className="bg-slate-100 dark:bg-black/20 p-2 rounded-lg outline-none" />
                      <input value={variant.sku} onChange={e => updateVariant(i, 'sku', e.target.value)} placeholder={rtl ? 'كود الصنف SKU' : 'SKU'} dir="ltr" className="bg-slate-100 dark:bg-black/20 p-2 rounded-lg outline-none" />
                      <input value={variant.price} onChange={e => updateVariant(i, 'price', Number(e.target.value))} type="number" min={0} step="0.01" placeholder={rtl ? 'السعر - مثال: 75' : 'Price'} className="bg-slate-100 dark:bg-black/20 p-2 rounded-lg outline-none" />
                      <input value={variant.old_price} onChange={e => updateVariant(i, 'old_price', Number(e.target.value))} type="number" min={0} step="0.01" placeholder={rtl ? 'السعر القديم - مثال: 95' : 'Old Price'} className="bg-slate-100 dark:bg-black/20 p-2 rounded-lg outline-none" />
                      <input value={variant.stock} onChange={e => updateVariant(i, 'stock', Number(e.target.value))} type="number" min={0} step="1" placeholder={rtl ? 'المخزون - مثال: 200' : 'Stock'} className="bg-slate-100 dark:bg-black/20 p-2 rounded-lg outline-none" />
                      <div className="col-span-2 md:col-span-4">
                        <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                          {rtl ? 'صورة النسخة (اختياري)' : 'Variant Image (optional)'}
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-slate-100 dark:bg-black/20 shrink-0">
                              {variant.image_url ? (
                                <img src={resolveAssetUrl(variant.image_url)} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full" />
                              )}
                            </div>
                            <label className="btn-primary py-2 px-4 text-xs flex items-center gap-2 cursor-pointer">
                              <Plus size={14} />
                              {rtl ? 'رفع صورة' : 'Upload'}
                              <input
                                type="file"
                                className="hidden"
                                accept=".png,.jpg,.jpeg,.gif,.webp,image/png,image/jpeg,image/gif,image/webp"
                                onChange={(e) => handleVariantImageUpload(i, e)}
                              />
                            </label>
                            {variant.image_url && (
                              <button
                                type="button"
                                onClick={() => updateVariant(i, 'image_url', '')}
                                className="text-red-500 hover:bg-red-500/10 px-3 py-2 rounded-xl text-xs font-bold transition"
                              >
                                {rtl ? 'إزالة' : 'Remove'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <input type="checkbox" checked={variant.is_default} onChange={e => updateVariant(i, 'is_default', e.target.checked)} />
                        {rtl ? 'افتراضي' : 'Default'}
                      </label>
                    </div>
                    <button onClick={() => removeVariant(i)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-full transition"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>
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
                  <div key={i} className="w-40 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                    <div className="relative group">
                      <img src={resolveAssetUrl(img)} alt="" className="w-full h-28 object-cover" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 bg-black/40">
                        <label className="btn-primary py-2 px-3 text-[10px] flex items-center gap-2 cursor-pointer">
                          <Plus size={14} />
                          {rtl ? 'استبدال' : 'Replace'}
                          <input
                            type="file"
                            className="hidden"
                            accept=".png,.jpg,.jpeg,.gif,.webp,image/png,image/jpeg,image/gif,image/webp"
                            onChange={(e) => handleGalleryImageReplace(i, e)}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                          className="text-red-500 bg-white/90 hover:bg-white px-3 py-2 rounded-xl text-[10px] font-black transition"
                        >
                          {rtl ? 'حذف' : 'Delete'}
                        </button>
                      </div>
                    </div>
                    <div className="p-2 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {rtl ? `صورة ${i + 1}` : `Image ${i + 1}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                        className="text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition"
                        aria-label="Remove image"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="w-40 h-[168px] rounded-2xl border border-dashed border-white/20 bg-white/5 flex items-center justify-center">
                  <label className="btn-primary py-2 px-4 text-xs flex items-center gap-2 cursor-pointer">
                    <Plus size={14} /> {rtl ? 'رفع صورة' : 'Upload Image'}
                    <input
                      type="file"
                      className="hidden"
                      accept=".png,.jpg,.jpeg,.gif,.webp,image/png,image/jpeg,image/gif,image/webp"
                      onChange={handleGalleryImageUpload}
                    />
                  </label>
                </div>
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
