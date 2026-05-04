import { useEffect, useState } from 'react';
import { useStore } from '../../store/store';
import MainSlider from './components/MainSlider';
import BrandIdentitySection from './components/BrandIdentitySection';
import BundleSlider from './components/BundleSlider';
import HomeFeatures from './components/HomeFeatures';
import CategorySection from './components/CategorySection';
import DynamicPagesStrip from './components/DynamicPagesStrip';
import FaqSection from './components/FaqSection';
import GsapSlider from './components/GsapSlider';
import MarqueeX from './components/MarqueeX';
import SvgMarquee from './components/SvgMarquee';
import { motion } from 'framer-motion';
import { api } from '../../api';

interface HomeCategory {
  id: string;
  name_ar: string;
  name_en: string;
}

interface HomeProduct {
  id: string;
  category_id: string;
  status?: string;
}

export default function Home() {
  const { products, categories, isDataLoaded, rtl, branding } = useStore();
  const [gsapSlides, setGsapSlides] = useState<any[]>([]);

  useEffect(() => {
    document.title = `${rtl ? 'الرئيسية' : 'Home'} | ${branding.storeName}`;
  }, [rtl, branding]);

  useEffect(() => {
    api.get('/gsap-slides').then(res => setGsapSlides(res.data || [])).catch(() => {});
  }, []);

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
      {gsapSlides.length > 0 && <GsapSlider slides={gsapSlides} />}
      <MainSlider />
      <MarqueeX />
      <SvgMarquee />

      <BrandIdentitySection />

      <BundleSlider />

      <DynamicPagesStrip />
      
      {/* Dynamic Category Sections */}
      <div className="mt-12 space-y-10">
        {categories.map((cat: HomeCategory, idx: number) => {
          const catProducts = products.filter((p: any) => p.category_id === cat.id && p.status?.toLowerCase() === 'active' && !(p.bundle_items && p.bundle_items.length > 0));
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
      <FaqSection />
    </div>
  );
}
