import { useStore } from '../store/store';
import { ClassicElegantCard, Floating3DCard, MinimalPosterCard, InteractiveRevealCard, ModernGlassCard } from '../pages/Home/components/ProductCardVariants';
import { VisualBundleCard } from '../pages/Home/components/BundleCard';

interface ProductCardData {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  price: number;
  image_url?: string;
  images?: string[];
  variants?: Array<{ image_url?: string; images?: string[] }>;
  bundle_items?: Array<{
    product_id: string;
    quantity: number;
    discount?: number;
    product?: {
      id: string;
      name_ar?: string;
      name_en?: string;
      price: number;
      image_url?: string;
      images?: string[];
    };
  }>;
}

export default function ProductCard({ product }: { product: ProductCardData }) {
  const { cardStyle, rtl, addToCart, showToast } = useStore();

  const imagesForFallback = [
    product.image_url,
    ...(product.images || []),
    ...(product.variants?.flatMap(v => v.images || []) || []),
    ...(product.variants?.map(v => v.image_url) || [])
  ].filter(Boolean);

  const finalImage = imagesForFallback[0] || '';

  const isBundle = product.bundle_items && product.bundle_items.length > 0;

  const bundleActualPrice = isBundle
    ? product.price || product.bundle_items!.reduce((sum, bi) => sum + (((bi.product?.price || 0) - (bi.discount || 0)) * bi.quantity), 0)
    : product.price;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: rtl ? product.name_ar : product.name_en,
      price: bundleActualPrice,
      quantity: 1,
      image: finalImage,
      ...(isBundle ? {
        is_bundle: true,
        bundle_items: product.bundle_items!.map(bi => ({
          product_id: bi.product_id,
          quantity: bi.quantity,
          discount: bi.discount,
          name_ar: bi.product?.name_ar,
          name_en: bi.product?.name_en,
          price: bi.product?.price || 0,
          image_url: bi.product?.image_url,
        }))
      } : {})
    });
    showToast(isBundle
      ? (rtl ? `تمت إضافة الباقة ${product.name_ar} للسلة` : `Bundle ${product.name_en} added to cart!`)
      : (rtl ? `تمت إضافة ${product.name_ar} للسلة` : `${product.name_en} added to cart!`)
    );
  };

  if (isBundle) {
    return (
      <VisualBundleCard 
        prod={product} 
        rtl={rtl} 
        onAdd={handleAdd}
      />
    );
  }

  const Card = 
    cardStyle === 'classic' ? ClassicElegantCard : 
    cardStyle === 'minimal' ? MinimalPosterCard : 
    cardStyle === 'reveal' ? InteractiveRevealCard :
    cardStyle === 'modern' ? ModernGlassCard :
    Floating3DCard;

  return (
    <Card 
      prod={{
        ...product,
        name: rtl ? product.name_ar : product.name_en,
        description: rtl ? product.description_ar : product.description_en,
        onAdd: handleAdd
      }} 
      rtl={rtl} 
      onAdd={handleAdd}
    />
  );
}
