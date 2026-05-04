import { useStore } from '../../../store/store';
import { Link } from 'react-router-dom';
import { resolveAssetUrl } from '../../../utils/assetUrl';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const COLORS = [
  'from-primary-500/20 to-primary-600/10',
  'from-accent-500/20 to-accent-600/10',
  'from-blue-500/20 to-blue-600/10',
  'from-emerald-500/20 to-emerald-600/10',
  'from-violet-500/20 to-violet-600/10',
  'from-rose-500/20 to-rose-600/10',
  'from-amber-500/20 to-amber-600/10',
  'from-cyan-500/20 to-cyan-600/10',
];

interface DynamicPagesStripProps {
  pageId?: string;
  pageName?: string;
}

export default function DynamicPagesStrip({ pageId, pageName }: DynamicPagesStripProps) {
  const { rtl, pages, products } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter products based on pageId
  let displayProducts;
  if (pageId) {
    // Show products for specific page (dynamic page)
    displayProducts = products.filter(p => p.page_id === pageId && p.status === 'active' && !((p as any).bundle_items && (p as any).bundle_items.length > 0));
  } else {
    // Show products from all dynamic pages (home page)
    displayProducts = products.filter(p => p.page_id && p.status === 'active' && !((p as any).bundle_items && (p as any).bundle_items.length > 0));
  }

  // Auto-scroll every 3 seconds
  useEffect(() => {
    if (!scrollRef.current || displayProducts.length === 0) return;

    const interval = setInterval(() => {
      const container = scrollRef.current;
      if (!container) return;

      const cardWidth = container.firstChild ? (container.firstChild as HTMLElement).offsetWidth + 24 : 0; // card width + gap
      const maxScroll = container.scrollWidth - container.clientWidth;
      const currentScroll = container.scrollLeft;

      let newScroll;
      if (rtl) {
        newScroll = currentScroll - cardWidth;
        if (newScroll < 0) newScroll = maxScroll;
      } else {
        newScroll = currentScroll + cardWidth;
        if (newScroll > maxScroll) newScroll = 0;
      }

      container.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [displayProducts.length, rtl]);

  // Manual scroll functions
  const scrollPrev = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth = container.firstChild ? (container.firstChild as HTMLElement).offsetWidth + 24 : 0;
    container.scrollBy({ left: rtl ? cardWidth : -cardWidth, behavior: 'smooth' });
  };

  const scrollNext = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth = container.firstChild ? (container.firstChild as HTMLElement).offsetWidth + 24 : 0;
    container.scrollBy({ left: rtl ? -cardWidth : cardWidth, behavior: 'smooth' });
  };

  if (displayProducts.length === 0) return null;

  // Dynamic title
  const title = pageName
    ? (rtl ? pageName : pageName)
    : (rtl ? 'استكشف منتجاتنا' : 'Explore Our Products');

  return (
    <section className="w-full py-16 overflow-hidden bg-gradient-to-b from-white/50 to-transparent dark:from-[#0a0a0a]/50 dark:to-transparent">
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-2 h-8 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full" />
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium ml-6">
          {rtl ? 'تصفح أحدث المنتجات المميزة' : 'Browse our latest featured products'}
        </p>
      </div>

      <div className="relative group">
        {/* Navigation buttons */}
        <button
          onClick={scrollPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white dark:bg-[#0f172a] rounded-full shadow-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary-500 hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft size={24} className={rtl ? '' : 'rotate-180'} />
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white dark:bg-[#0f172a] rounded-full shadow-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary-500 hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
        >
          <ChevronRight size={24} className={rtl ? 'rotate-180' : ''} />
        </button>

        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white dark:from-[#050505] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white dark:from-[#050505] to-transparent z-10 pointer-events-none" />

        <div
          ref={scrollRef}
          className={`flex gap-8 overflow-x-auto pb-6 px-16 snap-x snap-mandatory scroll-smooth ${
            rtl ? 'scrollbar-hide rtl' : 'scrollbar-hide'
          }`}
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {displayProducts.map((product, i) => {
            const colorClass = COLORS[i % COLORS.length];
            const name = rtl ? product.name_ar : product.name_en;
            const initials = name.substring(0, 2).toUpperCase();

            return (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="shrink-0 w-72 md:w-80 snap-start group/card"
              >
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-white dark:bg-[#0f172a]">
                  <div className="absolute inset-0 rounded-3xl border-2 border-slate-200 dark:border-white/10 transition-all duration-500 group-hover/card:border-primary-500/50 z-10 pointer-events-none" />
                  {product.image_url ? (
                    <img
                      src={resolveAssetUrl(product.image_url)}
                      alt={name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110 group-hover/card:rotate-1"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                      <span className="text-4xl font-black text-primary-500/60 dark:text-primary-400/60">
                        {initials}
                      </span>
                    </div>
                  )}
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-primary-500/0 group-hover/card:bg-primary-500/10 transition-all duration-500 pointer-events-none z-0" />
                  {/* Price badge */}
                  <div className="absolute top-3 left-3 bg-white/95 dark:bg-black/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg transition-all duration-300 group-hover/card:scale-110 group-hover/card:shadow-primary-500/30 z-20">
                    <span className="text-base font-bold text-primary-600 dark:text-primary-400">
                      {product.price}
                    </span>
                  </div>
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-500 flex items-end p-5 z-10">
                    <span className="text-white text-sm font-bold bg-primary-500 hover:bg-primary-600 px-5 py-2.5 rounded-full shadow-lg transition-all duration-300 transform translate-y-2 group-hover/card:translate-y-0">
                      {rtl ? 'عرض التفاصيل' : 'View Details'}
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-200 text-center truncate group-hover/card:text-primary-500 transition-colors">
                  {name}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
