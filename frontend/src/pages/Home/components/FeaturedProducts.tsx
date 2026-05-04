import { motion } from 'framer-motion';
import { useStore } from '../../../store/store';
import { ClassicElegantCard, Floating3DCard, MinimalPosterCard, InteractiveRevealCard } from './ProductCardVariants';
import ProductCard from '../../../components/ProductCard';
import { useEffect, useState } from 'react';
import { api } from '../../../api';

interface FeaturedProduct {
  id: string;
  name_ar: string;
  name_en: string;
  price: number;
  image_url?: string;
  images?: string[];
}

export default function FeaturedProducts() {
  const { rtl, addToCart, cardStyle } = useStore();
  const [products, setProducts] = useState<FeaturedProduct[]>([]);

  useEffect(() => {
    api.get('/products')
      .then((res: { data: FeaturedProduct[] }) => setProducts(res.data.filter((p: any) => !(p.bundle_items && p.bundle_items.length > 0)).slice(0, 4)))
      .catch(console.error);
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">{rtl ? 'المنتجات المميزة' : 'Featured Products'}</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {rtl ? 'اكتشف أفضل حلول التغليف مبيعاً والتي يثق بها عملاؤنا.' : 'Discover our best-selling packaging solutions trusted by our clients.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((prod, index) => (
          <motion.div 
            key={prod.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <ProductCard product={{
              ...prod,
              description_ar: '', // FeaturedProducts interface doesn't have descriptions, ProductCard handles it
              description_en: ''
            }} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
