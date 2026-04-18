import type { ProductVariantTemplate } from '../productTemplates';

export interface OptionItem {
  id: string;
  name_ar: string;
  name_en: string;
}

export interface QuantityPrice {
  quantity_label: string;
  price: number;
  old_price: number;
}

export interface DetailItem {
  label_ar: string;
  label_en: string;
  value_ar: string;
  value_en: string;
  order_index: number;
}

export interface BundleItem {
  product_id: string;
  quantity: number;
}

export interface ProductFaq {
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
  order_index: number;
}

export type ProductVariant = ProductVariantTemplate;

export type ProductFormTab = 'basic' | 'pricing' | 'media' | 'specs' | 'shipping' | 'relations' | 'bundle';

export interface FormData {
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  price: number;
  old_price: number;
  stock: number;
  category_id: string;
  page_id: string;
  is_best_seller: boolean;
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
  video_url: string;
  allow_custom_print: boolean;
}
