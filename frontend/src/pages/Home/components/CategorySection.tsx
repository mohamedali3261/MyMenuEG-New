import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import ProductCard from '../../../components/ProductCard';
import { useStore } from '../../../store/store';

interface CategoryCarouselProps {
  category: {
    id: string;
    name_ar: string;
    name_en: string;
  };
  products: Array<{
    id: string;
    name_ar: string;
    name_en: string;
    description_ar: string;
    description_en: string;
    price: number;
    image_url?: string;
    images?: string[];
  }>;
}

export default function CategorySection({ category, products }: CategoryCarouselProps) {
  const { rtl } = useStore();

  if (products.length === 0) return null;

  return (
    <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header Info */}
      <div className="flex items-end justify-between mb-8 border-b border-white/5 pb-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-1 bg-primary-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-500/80">
                {rtl ? 'تصفح القسم' : 'BROWSE CATEGORY'}
              </span>
           </div>
           <h2 className="text-2xl md:text-3xl font-black tracking-tight text-primary-600 dark:text-primary-400">
             {rtl ? category.name_ar : category.name_en}
           </h2>
        </div>
        <button className="group flex items-center gap-2 text-xs font-bold text-accent-600 dark:text-accent-400 opacity-70 hover:opacity-100 transition-all">
           {rtl ? 'عرض الكل' : 'View All'}
           <ChevronRight size={16} className={`transition-transform ${rtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
        </button>
      </div>

      {/* Grid Area */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product, idx) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            viewport={{ once: true }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

