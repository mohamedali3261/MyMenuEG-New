import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../../store/store';
import { 
  ShoppingCart, 
  ChevronRight, 
  Home, 
  ShoppingBag,
  ArrowLeft,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Premium Components
import ProductGallery from './components/ProductGallery';
import ProductInfo from './components/ProductInfo';
import ProductSections from './components/ProductSections';
import ProductTrustBadges from './components/ProductTrustBadges';
import FrequentlyBoughtTogether from './components/FrequentlyBoughtTogether';
import ProductCard from '../../components/ProductCard';
import ProductReviews from './components/ProductReviews';

type QuantityVariant = { quantity_label: string; price: number; old_price?: number };
type RealVariant = { label_ar?: string; label_en?: string; sku?: string; price: number; old_price?: number; stock?: number; is_default?: boolean; image_url?: string; imageUrl?: string; images?: string[] };

export default function ProductDetails() {
  const { id } = useParams();
  const { products, pages, isDataLoaded, rtl, addToCart, wishlist, toggleWishlist, showToast, branding } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [selectedVariantDoc, setSelectedVariantDoc] = useState<QuantityVariant | null>(null);
  const [selectedRealVariant, setSelectedRealVariant] = useState<RealVariant | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setScrolled(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  const product = products.find(p => p.id === id);

  // Unified Gallery Logic
  const allImages = useMemo(() => {
    if (!product) return [];
    
    const generalImages = [
      ...(product.images && product.images.length > 0 ? product.images : [product.image_url])
    ].filter(Boolean);

    const variantImages = (product.variants || [])
      .flatMap(v => v.images || (v.image_url ? [v.image_url] : []))
      .filter(Boolean);

    return Array.from(new Set([...generalImages, ...variantImages])) as string[];
  }, [product]);

  // Jump to variant image index
  const activeGalleryIndex = useMemo(() => {
    if (!selectedRealVariant || !allImages.length) return undefined;
    
    const variantFirstImage = (selectedRealVariant.images && selectedRealVariant.images[0]) || selectedRealVariant.image_url;
    if (!variantFirstImage) return undefined;

    const idx = allImages.indexOf(variantFirstImage);
    return idx >= 0 ? idx : undefined;
  }, [selectedRealVariant, allImages]);

  useEffect(() => {
    if (product) {
      document.title = `${rtl ? product.name_ar : product.name_en} | ${branding.storeName}`;
    }
  }, [product, branding, rtl]);
  const isAvailable = product && product.status?.toLowerCase() === 'active';
  const related = products
    .filter(p => p.category_id === product?.category_id && p.id !== id && p.status?.toLowerCase() === 'active')
    .slice(0, 4);

  if (!isDataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent dark:bg-[#070707]">
        <div className="relative">
           <div className="w-20 h-20 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
           </div>
        </div>
      </div>
    );
  }

  if (!product || !isAvailable) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-transparent dark:bg-[#070707]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 max-w-md w-full"
        >
           <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={40} />
           </div>
           <h1 className="text-3xl font-black mb-4 text-slate-900 dark:text-white uppercase">{rtl ? 'المنتج غير موجود' : 'Item Not Found'}</h1>
           <p className="text-slate-500 mb-8">{rtl ? 'عذراً، يبدو أن المنتج الذي تبحث عنه لم يعد متوفراً.' : 'The product you are looking for might have been moved or removed.'}</p>
           <Link to="/" className="btn-primary w-full inline-flex items-center justify-center gap-2">
              <ArrowLeft size={18} className={rtl ? 'rotate-180' : ''} />
              {rtl ? 'العودة للرئيسية' : 'Back to Gallery'}
           </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative pb-16 lg:pb-10 overflow-hidden bg-transparent dark:bg-[#070707] transition-colors duration-500">
      {/* Cinematic Background Lume */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[800px] bg-primary-500/[0.07] dark:bg-primary-500/10 blur-[150px] -z-10 rounded-full opacity-50" />
      <div className="absolute top-[800px] -right-64 w-[600px] h-[600px] bg-accent-500/[0.03] dark:bg-accent-500/5 blur-[120px] -z-10 rounded-full opacity-30" />

      {/* Breadcrumbs */}
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <nav className="flex items-center gap-2 text-sm text-slate-400 font-bold overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link to="/" className="relative p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-all flex items-center gap-1 shrink-0">
            <Home size={14} />
            {rtl ? 'الرئيسية' : 'Home'}
          </Link>
          <ChevronRight size={14} className={`shrink-0 ${rtl ? 'rotate-180' : ''}`} />
          {product.page_id ? (
            <>
              <Link to={`/p/${pages.find(p => p.id === product.page_id)?.slug || 'disposables'}`} className="hover:text-primary-500 transition-colors shrink-0">
                {rtl ? pages.find(p => p.id === product.page_id)?.name_ar : pages.find(p => p.id === product.page_id)?.name_en}
              </Link>
              <ChevronRight size={14} className={`shrink-0 ${rtl ? 'rotate-180' : ''}`} />
            </>
          ) : (
            <>
              <Link to={`/products`} className="hover:text-primary-500 transition-colors shrink-0">
                {rtl ? 'المنتجات' : 'Products'}
              </Link>
              <ChevronRight size={14} className={`shrink-0 ${rtl ? 'rotate-180' : ''}`} />
            </>
          )}
          <span className="text-slate-900 dark:text-white truncate max-w-[200px] shrink-0 font-black uppercase tracking-tight">
            {rtl ? product.name_ar : product.name_en}
          </span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Gallery Sticky Column */}
          <div className="lg:sticky lg:top-32">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
               <div className="absolute -inset-8 bg-primary-500/[0.05] blur-[100px] rounded-[5rem] -z-10" />
               <ProductGallery
                 images={allImages}
                 activeIndex={activeGalleryIndex}
                 onImageSelect={(idx) => {
                   const selectedImageUrl = allImages[idx];
                   if (selectedImageUrl && product.variants) {
                      const matchingVariant = product.variants.find(v => 
                        (v.images && v.images.includes(selectedImageUrl)) || 
                        v.image_url === selectedImageUrl || v.imageUrl === selectedImageUrl
                      );
                      if (matchingVariant) {
                        setSelectedRealVariant(matchingVariant);
                      }
                   }
                 }}
               />
            </motion.div>
          </div>

          {/* Info Column */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <ProductInfo 
              product={product} 
              onVariantChange={setSelectedVariantDoc} 
              onRealVariantSelect={setSelectedRealVariant}
              externalSelectedRealVariant={selectedRealVariant}
            />
            <div className="pt-6 border-t border-slate-200 dark:border-white/10">
               <ProductTrustBadges />
            </div>
          </motion.div>
        </div>

        {/* Frequently Bought Together */}
        <FrequentlyBoughtTogether 
          currentProduct={{
            id: product.id,
            name_ar: product.name_ar,
            name_en: product.name_en,
            price: product.price,
            image_url: product.image_url || (product.images && product.images[0]) || ''
          }} 
          fbtProducts={product.fbt_products || []} 
        />

        {/* Detailed Sections (Stacked Vertically) */}
        <ProductSections 
          description={rtl ? product.description_ar : product.description_en} 
          specs={product.specs?.map((s: { key_ar?: string; key_en?: string; val_ar?: string; val_en?: string }) => ({ key: rtl ? s.key_ar : s.key_en, value: rtl ? s.val_ar : s.val_en })) || []}
          shipping={rtl ? product.shipping_info_ar ?? '' : product.shipping_info_en ?? ''}
          warranty={rtl ? product.warranty_info_ar ?? '' : product.warranty_info_en ?? ''}
          extraDetails={product.detail_items}
          faqs={product.faqs}
        />

        {/* Product Reviews */}
        <ProductReviews productId={product.id} />

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center justify-between mb-7">
               <div className="space-y-1">
                 <h2 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{rtl ? 'قـد يـعجبك أيضاً' : 'Suggestons'}</h2>
                 <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[8px]">{rtl ? 'منتجات مختارة' : 'Handpicked for you'}</p>
               </div>
               <div className="h-px flex-grow mx-8 bg-gradient-to-r from-primary-500/20 via-slate-500/10 to-transparent hidden xl:block" />
               <Link to="/products" className="text-primary-500 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-transform inline-flex items-center gap-2 group">
                 {rtl ? 'عرض الكل' : 'View All'}
                 <ChevronRight size={14} className={`${rtl ? 'rotate-180' : ''} group-hover:translate-x-1 transition-transform`} />
               </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Add to Cart - Floating Dock Style */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-6 right-6 z-50 lg:hidden"
          >
            <div className="glass shadow-2xl shadow-primary-500/20 border border-primary-500/20 p-4 rounded-[2.5rem] flex items-center justify-between gap-6">
                <div className="flex flex-col items-start px-4 border-r border-slate-200 dark:border-white/10 shrink-0">
                   <span className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5">{rtl ? 'السعر' : 'PRICE'}</span>
                   <div className="flex flex-col">
                      {selectedVariantDoc ? (
                         <>
                            {selectedVariantDoc.old_price && selectedVariantDoc.old_price > selectedVariantDoc.price && (
                                <span className="text-[10px] text-rose-500 font-bold line-through -mb-1 opacity-70">
                                  {selectedVariantDoc.old_price}
                                </span>
                            )}
                            <span className="text-base font-black text-slate-900 dark:text-white whitespace-nowrap">
                              <span className="text-[10px] opacity-40 mr-0.5">EGP</span>{selectedVariantDoc.price}
                            </span>
                         </>
                      ) : (
                         <>
                            {product.old_price > product.price && (
                              <span className="text-[10px] text-rose-500 font-bold line-through -mb-1 opacity-70">
                                {product.old_price}
                              </span>
                            )}
                            <span className="text-base font-black text-slate-900 dark:text-white whitespace-nowrap">
                              <span className="text-[10px] opacity-40 mr-0.5">EGP</span>{product.price}
                            </span>
                         </>
                      )}
                   </div>
                </div>
                <button 
                  onClick={() => toggleWishlist(product)}
                  className={`h-14 w-14 rounded-2xl flex items-center justify-center border transition-all active:scale-75 shrink-0 ${wishlist.some(p => p.id === product.id) ? 'bg-red-500 text-white border-red-600 shadow-sm' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-300 hover:text-red-500'}`}
                >
                  <Heart size={20} fill={wishlist.some(p => p.id === product.id) ? "currentColor" : "none"} />
                </button>
                <button 
                 onClick={() => {
                   addToCart({ 
                     id: product.id, 
                     name: rtl ? product.name_ar : product.name_en, 
                     price: selectedVariantDoc ? selectedVariantDoc.price : product.price, 
                     quantity: 1, 
                     image: product.image_url || (product.images && product.images[0]),
                     variant: selectedVariantDoc?.quantity_label 
                   });
                   showToast(rtl ? 'تمت الإضافة للسلة' : 'Added to cart!');
                 }}
                 className="btn-primary flex-grow h-14 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-primary-500/30 group"
               >
                 <ShoppingCart size={18} className="group-hover:rotate-12 transition-transform" />
                 {rtl ? 'اشتري الآن' : 'Buy Now'}
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
