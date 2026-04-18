export interface ProductVariantTemplate {
  label_ar: string;
  label_en: string;
  sku: string;
  price: number;
  old_price: number;
  stock: number;
  is_default: boolean;
  image_url?: string;
  imageUrl?: string;
  images?: string[];
  color_value?: string;
  size_value?: string;
  color_ar?: string;
  color_en?: string;
  size_ar?: string;
  size_en?: string;
}

export interface ProductTemplate {
  nameAr: string;
  nameEn: string;
  preset: {
    name_ar: string;
    name_en: string;
    description_ar: string;
    description_en: string;
    price: number;
    old_price: number;
    stock: number;
    shipping_info_ar: string;
    shipping_info_en: string;
    warranty_info_ar: string;
    warranty_info_en: string;
    carton_details_ar: string;
    carton_details_en: string;
    brand_ar: string;
    brand_en: string;
    material_ar: string;
    material_en: string;
    dimensions_ar: string;
    dimensions_en: string;
    usage_notes_ar: string;
    usage_notes_en: string;
    specs: Array<{ key_ar: string; key_en: string; val_ar: string; val_en: string }>;
    detail_items: Array<{ label_ar: string; label_en: string; value_ar: string; value_en: string; order_index: number }>;
    variants: ProductVariantTemplate[];
  };
}

export const PRODUCT_TEMPLATE_OPTIONS = [
  { value: 'cups', labelAr: 'قالب الأكواب', labelEn: 'Cups Template' },
  { value: 'boxes', labelAr: 'قالب العلب', labelEn: 'Boxes Template' },
  { value: 'bags', labelAr: 'قالب الأكياس', labelEn: 'Bags Template' }
] as const;

export const getProductTemplateByKey = (key: string): ProductTemplate | null => {
  const templates: Record<string, ProductTemplate> = {
    cups: {
      nameAr: 'قالب الأكواب',
      nameEn: 'Cups Template',
      preset: {
        name_ar: 'أكواب بلاستيك مطبوعة',
        name_en: 'Printed Plastic Cups',
        description_ar: 'أكواب عالية الجودة مناسبة للكافيهات والمطاعم مع إمكانية الطباعة.',
        description_en: 'High-quality cups suitable for cafes and restaurants with branding options.',
        price: 0,
        old_price: 0,
        stock: 0,
        shipping_info_ar: 'الشحن خلال 48 ساعة داخل القاهرة و72 ساعة للمحافظات.',
        shipping_info_en: 'Shipping within 48 hours in Cairo and 72 hours for other cities.',
        warranty_info_ar: 'استبدال خلال 7 أيام في حالة عيوب الصناعة.',
        warranty_info_en: 'Replacement within 7 days for manufacturing defects.',
        carton_details_ar: 'الكرتونة تحتوي على 1000 كوب.',
        carton_details_en: 'Carton contains 1000 cups.',
        brand_ar: 'MyMenuEG',
        brand_en: 'MyMenuEG',
        material_ar: 'بلاستيك غذائي',
        material_en: 'Food-grade plastic',
        dimensions_ar: 'قطر 9 سم × ارتفاع 11 سم (12 أونصة)',
        dimensions_en: '9 cm diameter × 11 cm height (12 oz)',
        usage_notes_ar: 'مناسب للمشروبات الباردة والساخنة حسب النوع.',
        usage_notes_en: 'Suitable for cold and hot beverages based on cup type.',
        specs: [
          { key_ar: 'نوع الطباعة', key_en: 'Printing Type', val_ar: 'أوفست', val_en: 'Offset' },
          { key_ar: 'الاستخدام', key_en: 'Usage', val_ar: 'مطاعم وكافيهات', val_en: 'Restaurants & Cafes' }
        ],
        detail_items: [
          { label_ar: 'عدد القطع بالكرتونة', label_en: 'Pieces per Carton', value_ar: '1000 قطعة', value_en: '1000 pcs', order_index: 0 }
        ],
        variants: [
          { label_ar: '8 أونصة', label_en: '8 oz', sku: '', price: 0, old_price: 0, stock: 0, is_default: true },
          { label_ar: '12 أونصة', label_en: '12 oz', sku: '', price: 0, old_price: 0, stock: 0, is_default: false }
        ]
      }
    },
    boxes: {
      nameAr: 'قالب العلب',
      nameEn: 'Boxes Template',
      preset: {
        name_ar: 'علب تغليف ورقية',
        name_en: 'Paper Packaging Boxes',
        description_ar: 'علب كرافت قوية مناسبة لتغليف المأكولات والحلويات.',
        description_en: 'Durable kraft boxes suitable for food and dessert packaging.',
        price: 0,
        old_price: 0,
        stock: 0,
        shipping_info_ar: 'الشحن خلال 2-4 أيام عمل حسب المنطقة.',
        shipping_info_en: 'Shipping in 2-4 business days depending on location.',
        warranty_info_ar: 'استرجاع خلال 14 يوم للعبوات غير المستخدمة.',
        warranty_info_en: 'Return within 14 days for unused packages.',
        carton_details_ar: 'الكرتونة تحتوي على 500 علبة.',
        carton_details_en: 'Carton contains 500 boxes.',
        brand_ar: 'MyMenuEG',
        brand_en: 'MyMenuEG',
        material_ar: 'ورق كرافت مقوى',
        material_en: 'Reinforced kraft paper',
        dimensions_ar: '25 × 20 × 10 سم',
        dimensions_en: '25 × 20 × 10 cm',
        usage_notes_ar: 'مناسب للتغليف وحفظ جودة المنتج.',
        usage_notes_en: 'Suitable for packaging and preserving product quality.',
        specs: [
          { key_ar: 'نوع الإغلاق', key_en: 'Closure Type', val_ar: 'لسان قفل', val_en: 'Lock tab' }
        ],
        detail_items: [
          { label_ar: 'تحمل الوزن', label_en: 'Weight Capacity', value_ar: 'حتى 2 كجم', value_en: 'Up to 2 kg', order_index: 0 }
        ],
        variants: [
          { label_ar: 'صغير', label_en: 'Small', sku: '', price: 0, old_price: 0, stock: 0, is_default: true },
          { label_ar: 'متوسط', label_en: 'Medium', sku: '', price: 0, old_price: 0, stock: 0, is_default: false },
          { label_ar: 'كبير', label_en: 'Large', sku: '', price: 0, old_price: 0, stock: 0, is_default: false }
        ]
      }
    },
    bags: {
      nameAr: 'قالب الأكياس',
      nameEn: 'Bags Template',
      preset: {
        name_ar: 'أكياس تعبئة',
        name_en: 'Packaging Bags',
        description_ar: 'أكياس عملية للمطاعم والمتاجر بخامات متعددة.',
        description_en: 'Practical bags for restaurants and stores in multiple materials.',
        price: 0,
        old_price: 0,
        stock: 0,
        shipping_info_ar: 'الشحن خلال 3 أيام عمل.',
        shipping_info_en: 'Shipping within 3 business days.',
        warranty_info_ar: 'ضمان جودة الخامة عند الاستلام.',
        warranty_info_en: 'Material quality guarantee upon delivery.',
        carton_details_ar: 'الكرتونة تحتوي على 800 كيس.',
        carton_details_en: 'Carton contains 800 bags.',
        brand_ar: 'MyMenuEG',
        brand_en: 'MyMenuEG',
        material_ar: 'بلاستيك/كرافت',
        material_en: 'Plastic/Kraft',
        dimensions_ar: '24 × 12 × 32 سم',
        dimensions_en: '24 × 12 × 32 cm',
        usage_notes_ar: 'يفضل التخزين بعيدًا عن الرطوبة والحرارة.',
        usage_notes_en: 'Store away from humidity and heat.',
        specs: [],
        detail_items: [
          { label_ar: 'نوع المقبض', label_en: 'Handle Type', value_ar: 'مقصوص', value_en: 'Die-cut', order_index: 0 }
        ],
        variants: [
          { label_ar: 'صغير', label_en: 'Small', sku: '', price: 0, old_price: 0, stock: 0, is_default: true },
          { label_ar: 'متوسط', label_en: 'Medium', sku: '', price: 0, old_price: 0, stock: 0, is_default: false }
        ]
      }
    }
  };

  return templates[key] ?? null;
};
