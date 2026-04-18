import { useEffect, useState } from 'react';
import { useStore } from '../../../store/store';
import { api } from '../../../api';
import { motion } from 'framer-motion';
import { Star, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../../../components/ProductCard';

export default function BestSellers() {
  const { rtl } = useStore();
  const [products, setProducts] = useState<Array<{
    id: string;
    name_ar: string;
    name_en: string;
    description_ar: string;
    description_en: string;
    price: number;
    is_best_seller?: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products')
      .then(res => {
        const bestSellers = (res.data as Array<{
          id: string;
          name_ar: string;
          name_en: string;
          description_ar: string;
          description_en: string;
          price: number;
          is_best_seller?: number;
        }>).filter((p) => p.is_best_seller === 1);
        setProducts(bestSellers);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-2">
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             className="flex items-center gap-2 text-accent-500 font-bold uppercase tracking-widest text-sm"
           >
             <Star size={18} fill="currentColor" />
             {rtl ? 'الأكثر طلباً' : 'Best Sellers'}
           </motion.div>
           <h2 className="text-4xl font-extrabold">{rtl ? 'منتجاتنا الأكثر مبيعاً' : 'Our Most Loved Products'}</h2>
        </div>
        
        <Link to="/products" className="hidden md:flex items-center gap-2 text-primary-500 font-bold hover:gap-4 transition-all">
           {rtl ? 'عرض الكل' : 'View All'}
           {rtl ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {loading ? (
          [1,2,3,4].map(i => (
            <div key={i} className="h-[400px] bg-slate-200 dark:bg-white/5 animate-pulse rounded-[2.5rem]"></div>
          ))
        ) : (
          products.slice(0, 4).map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))
        )}
      </div>

      <div className="mt-10 md:hidden text-center">
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
           {rtl ? 'عرض كافة المنتجات' : 'View All Products'}
           <ArrowRight size={20} />
        </Link>
      </div>
    </section>
  );
}
