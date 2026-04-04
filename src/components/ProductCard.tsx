import { useStore } from '../store/store';
import { ClassicElegantCard, Floating3DCard, MinimalPosterCard } from '../pages/Home/components/ProductCardVariants';

export default function ProductCard({ product }: { product: any }) {
  const { cardStyle, rtl, addToCart, showToast } = useStore();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ 
      id: product.id, 
      name: rtl ? product.name_ar : product.name_en, 
      price: product.price, 
      quantity: 1,
      image: product.image_url || (product.images && product.images[0])
    });
    showToast(rtl ? `تمت إضافة ${product.name_ar} للسلة` : `${product.name_en} added to cart!`);
  };

  const Card = cardStyle === 'classic' ? ClassicElegantCard : cardStyle === 'minimal' ? MinimalPosterCard : Floating3DCard;

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
