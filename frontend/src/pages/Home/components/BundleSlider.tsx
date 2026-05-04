import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useStore } from '../../../store/store';
import { api } from '../../../api';
import { VisualBundleCard } from './BundleCard';

type BundleProduct = {
  id: string;
  name_ar?: string;
  name_en?: string;
  price: number;
  old_price?: number;
  image_url?: string;
  images?: string[];
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
};

export default function BundleSlider() {
  const { rtl, addToCart, showToast } = useStore();
  const [bundles, setBundles] = useState<BundleProduct[]>([]);
  useEffect(() => {
    api.get('/products?limit=2000')
      .then(res => {
        const prods = Array.isArray(res.data) ? res.data : (res.data.products || []);
        const bundleProds = prods.filter((p: any) => p.bundle_items && p.bundle_items.length > 0);
        setBundles(bundleProds);
      })
      .catch(console.error);
  }, []);

  if (bundles.length === 0) return null;

  const handleAddBundle = (bundle: BundleProduct) => {
    const imagesForFallback = [
      bundle.image_url,
      ...(bundle.images || []),
      ...(bundle.bundle_items?.flatMap(bi => bi.product?.images || []) || []),
      ...(bundle.bundle_items?.map(bi => bi.product?.image_url) || [])
    ].filter(Boolean) as string[];

    const items = bundle.bundle_items || [];
    const actualPrice = bundle.price || items.reduce((sum, bi) => sum + (((bi.product?.price || 0) - (bi.discount || 0)) * bi.quantity), 0);

    addToCart({
      id: bundle.id,
      name: (rtl ? bundle.name_ar : bundle.name_en) || '',
      price: actualPrice,
      quantity: 1,
      image: imagesForFallback[0] || '',
      is_bundle: true,
      bundle_items: (bundle.bundle_items || []).map(bi => ({
        product_id: bi.product_id,
        quantity: bi.quantity,
        discount: bi.discount,
        name_ar: bi.product?.name_ar,
        name_en: bi.product?.name_en,
        price: bi.product?.price || 0,
        image_url: bi.product?.image_url,
      }))
    });
    showToast(rtl ? `تمت إضافة الباقة للسلة!` : `Bundle added to cart!`);
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-12">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-1 bg-rose-500 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-500/80">
              {rtl ? 'عروض حصرية' : 'EXCLUSIVE DEALS'}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Sparkles size={24} className="text-amber-500" />
            {rtl ? 'باقات وعروض' : 'Bundles & Deals'}
          </h2>
        </div>

      </div>

      {/* Grid - 3 cards per row */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {bundles.map((bundle, idx) => (
            <motion.div
              key={bundle.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="w-full"
            >
              <VisualBundleCard
                prod={bundle}
                rtl={rtl}
                onAdd={(e) => { e.preventDefault(); e.stopPropagation(); handleAddBundle(bundle); }}
              />
            </motion.div>
        ))}
      </div>

    </section>
  );
}
