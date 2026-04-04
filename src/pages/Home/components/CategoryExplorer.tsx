import { useEffect, useState } from 'react';
import { useStore } from '../../../store/store';
import { api } from '../../../api';
import { motion } from 'framer-motion';
import { Tag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CategoryExplorer() {
  const { rtl } = useStore();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data.slice(0, 6))) // Top 6 Categories on Home
      .catch(console.error);
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="text-3xl font-bold mb-2">{rtl ? 'استكشف الفئات' : 'Explore Categories'}</h2>
          <p className="text-slate-500 dark:text-slate-400">{rtl ? 'تصفح منتجاتنا حسب تخصصها.' : 'Browse our products by their categories.'}</p>
        </div>
        <Link to="/products" className="text-primary-500 font-bold flex items-center gap-2 hover:gap-3 transition-all">
          {rtl ? 'عرض الكل' : 'View All'}
          <ArrowRight size={20} className={rtl ? 'rotate-180' : ''} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Link 
              to={`/products?category=${cat.id}`}
              className="glass-card group p-6 flex flex-col items-center text-center gap-4 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300 shadow-lg shadow-primary-500/0 group-hover:shadow-primary-500/20">
                <Tag size={32} />
              </div>
              <span className="font-bold text-slate-800 dark:text-white group-hover:text-primary-500 transition-colors">
                {rtl ? cat.name_ar : cat.name_en}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
