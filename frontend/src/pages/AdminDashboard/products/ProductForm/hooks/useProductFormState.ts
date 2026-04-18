import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../../../../store/store';
import { api } from '../../../../../api';
import { getProductTemplateByKey } from '../../productTemplates';
import { DIMENSION_PRESET_MAP } from '../constants';
import type { FormData, QuantityPrice, DetailItem, ProductFaq, ProductVariant, ProductFormTab, OptionItem } from '../types';

export function useProductFormState() {
  const { rtl, showToast } = useStore();
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Tabs & General
  const [activeTab, setActiveTab] = useState<ProductFormTab>('basic');
  const [loading, setLoading] = useState(false);
  const [templateKey, setTemplateKey] = useState('');
  
  // Dropdown Options
  const [categories, setCategories] = useState<OptionItem[]>([]);
  const [pages, setPages] = useState<OptionItem[]>([]);

  // Form State
  const [formData, setFormData] = useState<FormData>({
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
    video_url: '',
    allow_custom_print: false
  });

  const [specs, setSpecs] = useState([{ key_ar: '', key_en: '', val_ar: '', val_en: '' }]);
  const [images, setImages] = useState<string[]>([]);
  const [quantityPrices, setQuantityPrices] = useState<QuantityPrice[]>([]);
  const [detailItems, setDetailItems] = useState<DetailItem[]>([]);
  const [faqs, setFaqs] = useState<ProductFaq[]>([]);
  const [fbtIds, setFbtIds] = useState<string[]>([]);
  const [fbtProductDetails, setFbtProductDetails] = useState<any[]>([]);
  const [fbtSearch, setFbtSearch] = useState('');
  const [fbtResults, setFbtResults] = useState<any[]>([]);
  const [searchingFbt, setSearchingFbt] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [dimensionsPreset, setDimensionsPreset] = useState('');
  const [productType, setProductType] = useState<'simple' | 'variants' | 'custom' | 'bundle'>('simple');
  
  // Bundle Options
  const [bundleItems, setBundleItems] = useState<any[]>([]);
  const [bundleSearch, setBundleSearch] = useState('');
  const [bundleResults, setBundleResults] = useState<any[]>([]);
  const [searchingBundle, setSearchingBundle] = useState(false);

  // Handlers
  const updateForm = <K extends keyof FormData>(key: K, val: FormData[K]) =>
    setFormData(prev => ({ ...prev, [key]: val }));

  const addSpec = () => setSpecs([...specs, { key_ar: '', key_en: '', val_ar: '', val_en: '' }]);
  const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));
  const updateSpec = (index: number, key: string, val: string) => {
    setSpecs(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: val };
      return updated;
    });
  };

  const addQuantityPrice = () => setQuantityPrices([...quantityPrices, { quantity_label: '', price: 0, old_price: 0 }]);
  const removeQuantityPrice = (index: number) => setQuantityPrices(quantityPrices.filter((_, i) => i !== index));
  const updateQuantityPrice = (index: number, key: keyof QuantityPrice, val: string | number) => {
    setQuantityPrices(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: val };
      return updated;
    });
  };

  const addDetailItem = () => setDetailItems([...detailItems, { label_ar: '', label_en: '', value_ar: '', value_en: '', order_index: detailItems.length }]);
  const removeDetailItem = (index: number) => setDetailItems(detailItems.filter((_, i) => i !== index));
  const updateDetailItem = (index: number, key: keyof DetailItem, val: string | number) => {
    setDetailItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: val };
      return updated;
    });
  };

  const addFaq = () => setFaqs([...faqs, { question_ar: '', question_en: '', answer_ar: '', answer_en: '', order_index: faqs.length }]);
  const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index));
  const updateFaq = (index: number, key: keyof ProductFaq, val: string | number) => {
    setFaqs(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: val };
      return updated;
    });
  };

  const addVariant = () => setVariants([...variants, { label_ar: '', label_en: '', sku: '', price: 0, old_price: 0, stock: 0, is_default: variants.length === 0, image_url: '', images: [] }]);
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));
  const updateVariant = (index: number, key: keyof ProductVariant, val: string | number | boolean | string[]) => {
    setVariants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: val } as ProductVariant;
      if (key === 'is_default' && Boolean(val)) {
        for (let i = 0; i < updated.length; i += 1) updated[i].is_default = i === index;
      }
      return updated;
    });
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      setLoading(true);
      const data = new FormData();
      data.append('image', file);
      data.append('page', 'products');
      if (formData.name_en) data.append('productName', formData.name_en);
      if (formData.category_id) data.append('categoryId', formData.category_id);
      
      try {
        const res = await api.post('/upload', data);
        if (res.data.url) {
          setImages(prev => [...prev, res.data.url]);
          showToast(rtl ? 'تم رفع الصورة' : 'Image uploaded', 'success');
        }
      } catch (err) {
        showToast(rtl ? 'فشل رفع الصورة' : 'Upload failed', 'error');
      } finally {
        setLoading(false);
      }
    };
    input.click();
  };
  
  const removeImage = async (index: number) => {
    const url = images[index];
    if (url) {
      try {
        await api.delete('/upload', { data: { url } });
      } catch (err) {
        console.error('Failed to delete image from server:', err);
      }
    }
    setImages(images.filter((_, i) => i !== index));
  };

  const handleVariantImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setLoading(true);
    const files = Array.from(e.target.files);
    
    try {
      const uploadPromises = files.map(async (file) => {
        const data = new FormData();
        data.append('image', file);
        data.append('page', 'products');
        // Add context for folders
        if (formData.name_en) data.append('productName', formData.name_en);
        if (formData.category_id) data.append('categoryId', formData.category_id);
        
        const res = await api.post('/upload', data);
        return res.data.url;
      });

      const urls = await Promise.all(uploadPromises);
      const filteredUrls = urls.filter(Boolean);

      if (filteredUrls.length > 0) {
        const updated = [...variants];
        const currentImages = updated[index].images || [];
        updated[index].images = [...currentImages, ...filteredUrls];
        setVariants(updated);
        showToast(rtl ? 'تم رفع صور النسخة' : 'Variant images uploaded', 'success');
      }
    } catch (err) {
      showToast(rtl ? 'فشل رفع بعض الصور' : 'Some uploads failed', 'error');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const removeVariantImage = async (variantIndex: number, imageIndex: number) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    if (variant.images) {
      const url = variant.images[imageIndex];
      if (url) {
        try {
          await api.delete('/upload', { data: { url } });
        } catch (err) {
          console.error('Failed to delete variant image from server:', err);
        }
      }
      updated[variantIndex].images = variant.images.filter((_, i) => i !== imageIndex);
      setVariants(updated);
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setLoading(true);
    const file = e.target.files[0];
    const data = new FormData();
    data.append('image', file);
    data.append('page', 'products');
    // Add context for folders
    if (formData.name_en) data.append('productName', formData.name_en);
    if (formData.category_id) data.append('categoryId', formData.category_id);
    
    try {
      const res = await api.post('/upload', data);
      if (res.data.url) {
        setImages(prev => [...prev, res.data.url]);
        showToast(rtl ? 'تم رفع الصورة' : 'Image uploaded', 'success');
      }
    } catch (err) {
      showToast(rtl ? 'فشل رفع الصورة' : 'Upload failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFbtSearch = async () => {
    if (!fbtSearch.trim()) return;
    setSearchingFbt(true);
    try {
      const res = await api.get(`/products?q=${encodeURIComponent(fbtSearch)}&limit=10`);
      setFbtResults((res.data.products || []).filter((p: any) => p.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingFbt(false);
    }
  };

  const addFbt = (prod: any) => {
    if (fbtIds.includes(prod.id)) return;
    setFbtIds([...fbtIds, prod.id]);
    setFbtProductDetails([...fbtProductDetails, prod]);
    setFbtResults([]);
    setFbtSearch('');
  };

  const removeFbt = (prodId: string) => {
    setFbtIds(fbtIds.filter(f => f !== prodId));
    setFbtProductDetails(fbtProductDetails.filter(p => p.id !== prodId));
  };

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
    setActiveTab('basic');
    showToast(rtl ? 'تم تطبيق القالب وملء البيانات' : 'Template applied', 'success');
  };

  const saveProduct = async () => {
    if (!formData.name_ar || !formData.name_en) {
      return showToast(rtl ? 'برجاء إدخال اسم المنتج' : 'Please enters product name', 'error');
    }
    setLoading(true);
    try {
      const finalPrice = productType === 'variants' && variants.length > 0 ? (variants[0].price || 1) : formData.price;
      const finalOldPrice = productType === 'variants' && variants.length > 0 ? (variants[0].old_price || 0) : formData.old_price;
      const finalStock = productType === 'variants' ? variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) : formData.stock;

      await api.post('/products', {
        id, 
        ...formData,
        price: finalPrice,
        old_price: finalOldPrice,
        stock: finalStock,
        image_url: images.length > 0 ? images[0] : undefined,
        specs: specs || [],
        images: images || [],
        quantity_prices: quantityPrices || [],
        detail_items: detailItems || [],
        faqs: faqs || [],
        fbt_ids: fbtIds || [],
        template_key: templateKey || '',
        variants: (variants || []).map(v => ({ ...v, images: v.images || [] })),
        allow_custom_print: productType === 'custom' || formData.allow_custom_print,
        bundle_items: bundleItems || []
      });
      showToast(rtl ? 'تم حفظ المنتج بنجاح!' : 'Product saved successfully!', 'success');
      navigate('/admin/products');
    } catch (error: any) {
      showToast(error.response?.data?.error || (rtl ? 'فشل حفظ المنتج' : 'Save failed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Initial Data Fetch
  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(console.error);
    api.get('/pages').then(res => setPages(res.data)).catch(console.error);

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
            video_url: prod.video_url || '',
            allow_custom_print: !!prod.allow_custom_print
          });
          setTemplateKey(prod.template_key || '');
          setProductType(
            prod.bundle_items?.length ? 'bundle' : 
            prod.allow_custom_print ? 'custom' : 
            (prod.variants?.length ? 'variants' : 'simple')
          );
          if (prod.specs) setSpecs(prod.specs);
          if (prod.images) setImages(prod.images);
          if (prod.quantity_prices) setQuantityPrices(prod.quantity_prices);
          if (prod.detail_items) setDetailItems(prod.detail_items);
          if (prod.faqs) setFaqs(prod.faqs);
          if (prod.fbt_products) {
            setFbtIds(prod.fbt_products.map((p: any) => p.id));
            setFbtProductDetails(prod.fbt_products);
          }
          if (prod.bundle_items) {
             setBundleItems(prod.bundle_items);
          }
          if (prod.variants && prod.variants.length > 0) {
             setVariants(prod.variants.map((v: any) => ({ 
               ...v, 
               image_url: v.image_url || v.imageUrl || '',
               images: v.images || []
             })));
          }
          if (prod.template_key) setTemplateKey(prod.template_key);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  return {
    rtl, id, navigate, loading, setLoading,
    activeTab, setActiveTab,
    templateKey, setTemplateKey,
    categories, pages,
    formData, setFormData, updateForm,
    specs, setSpecs, addSpec, removeSpec, updateSpec,
    images, setImages, addImage, removeImage, handleGalleryImageUpload,
    quantityPrices, setQuantityPrices, addQuantityPrice, removeQuantityPrice, updateQuantityPrice,
    detailItems, setDetailItems, addDetailItem, removeDetailItem, updateDetailItem,
    faqs, setFaqs, addFaq, removeFaq, updateFaq,
    fbtSearch, setFbtSearch, fbtResults, searchingFbt, fbtProductDetails, handleFbtSearch, addFbt, removeFbt,
    variants, setVariants, addVariant, removeVariant, updateVariant, handleVariantImageUpload, removeVariantImage,
    dimensionsPreset, setDimensionsPreset, handleDimensionsPresetChange,
    productType, setProductType,
    bundleItems, setBundleItems, bundleSearch, setBundleSearch, bundleResults, setBundleResults, searchingBundle, setSearchingBundle,
    applyTemplate, saveProduct
  };
}
