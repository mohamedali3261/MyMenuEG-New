import { useState, useEffect } from 'react';
import { useStore } from '../../../store/store';
import { api } from '../../../api';
import ProductCard from '../../../components/ProductCard';

interface RelatedProps {
  categoryId?: string;
  currentId?: string;
}

type RelatedProduct = {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  price: number;
  category_id?: string;
};

export default function RelatedProducts({ categoryId, currentId }: RelatedProps) {
  const { rtl } = useStore();
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) return;
    
    api.get('/products')
      .then(res => {
        // Correctly handle paginated response: { products: [...], total, ... }
        const rawProds = res.data.products || [];
        const related = (rawProds as RelatedProduct[]).filter((p) =>
          p.category_id === categoryId && p.id !== currentId
        ).slice(0, 4);
        setProducts(related);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categoryId, currentId]);

  if (loading && categoryId) {
    return (
      <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="aspect-[4/5] glass-card animate-pulse" />)}
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="mt-16 w-full animate-in fade-in duration-700">
      <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
        <div className="w-2 h-8 bg-primary-500 rounded-full"></div>
        {rtl ? 'منتجات قد تعجبك أيضاً' : 'You Might Also Like'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </div>
  )
}
