import { useEffect } from 'react';
import { useStore } from '../../store/store';
import MainSlider from './components/MainSlider';
import HomeFeatures from './components/HomeFeatures';
import HomeStats from './components/HomeStats';
import CategorySection from './components/CategorySection';
import { motion } from 'framer-motion';

export default function Home() {
  const { products, categories, isDataLoaded, rtl, branding } = useStore();

  useEffect(() => {
    document.title = `${rtl ? 'الرئيسية' : 'Home'} | ${branding.storeName}`;
  }, [rtl, branding]);

  if (!isDataLoaded) {
     return (
        <div className="min-h-screen flex items-center justify-center">
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
             className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"
           />
        </div>
     );
  }

  return (
    <div className="w-full flex flex-col pb-24 overflow-hidden">
      <MainSlider />
      
      {/* Dynamic Category Sections */}
      <div className="mt-12 space-y-10">
        {categories.map((cat: any, idx: number) => {
          const catProducts = products.filter((p: any) => p.category_id === cat.id && p.status?.toLowerCase() === 'active');
          if (catProducts.length === 0) return null;
          
          return (
            <motion.div 
              key={cat.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <CategorySection
                category={cat}
                products={catProducts}
              />
            </motion.div>
          );
        })}
      </div>

      <HomeFeatures />
      <HomeStats />
    </div>
  );
}
