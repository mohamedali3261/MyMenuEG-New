import { motion } from 'framer-motion';
import { useStore } from '../../../store/store';
import { ClassicElegantCard, Floating3DCard, MinimalPosterCard } from './ProductCardVariants';
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
      .then((res: { data: FeaturedProduct[] }) => setProducts(res.data.slice(0, 4))) // Featured gets Top 4
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
            {cardStyle === 'classic' && (
              <ClassicElegantCard prod={prod} rtl={rtl} onAdd={() => addToCart({ id: prod.id, name: rtl ? prod.name_ar : prod.name_en, price: prod.price, quantity: 1, image: prod.image_url || (prod.images && prod.images[0]) })} />
            )}
            
            {cardStyle === 'floating' && (
              <Floating3DCard prod={prod} rtl={rtl} onAdd={() => addToCart({ id: prod.id, name: rtl ? prod.name_ar : prod.name_en, price: prod.price, quantity: 1, image: prod.image_url || (prod.images && prod.images[0]) })} />
            )}

            {cardStyle === 'minimal' && (
              <MinimalPosterCard prod={prod} rtl={rtl} onAdd={() => addToCart({ id: prod.id, name: rtl ? prod.name_ar : prod.name_en, price: prod.price, quantity: 1, image: prod.image_url || (prod.images && prod.images[0]) })} />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  )
}
