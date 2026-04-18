import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  GlassWater, ChevronRight, Tag
} from 'lucide-react';
import { CATEGORY_ICONS } from '../constants/categoryIcons';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1 }
};

interface MegaMenuProps {
  categories: Array<{
    id: string;
    name_ar: string;
    name_en: string;
  }>;
  rtl: boolean;
  onClose: () => void;
  pageSlug: string;
  pageName: string;
}

export default function MegaMenu({ categories, rtl, onClose, pageSlug, pageName }: MegaMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95 }}
      className="mx-auto w-[90vw] max-w-[920px] bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl p-6 shadow-2xl border border-slate-200 dark:border-white/10 z-[10] overflow-hidden rounded-[2rem]"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
         <GlassWater size={160} className="rotate-12" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
           <div className="flex flex-col">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500">
                {rtl ? 'تصفح أقسام' : 'Browse Categories of'}
              </h3>
              <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">{pageName}</span>
           </div>
           <div className="h-px flex-grow mx-6 bg-white/5" />
           <span className="text-[9px] text-slate-500 font-bold">{categories.length} {rtl ? 'قسم' : 'sections'}</span>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {categories.length > 0 ? categories.map(cat => (
            <motion.div key={cat.id} variants={itemVariants}>
              <Link
                to={`/p/${pageSlug}#${cat.id}`}
                onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-500/5 dark:bg-white/5 border border-white/5 hover:bg-white hover:shadow-xl hover:scale-105 dark:hover:bg-primary-500/10 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-white dark:from-white/10 dark:to-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary-500 group-hover:from-primary-500/20 group-hover:to-primary-500/10 transition-all duration-500 shrink-0">
                  {CATEGORY_ICONS[cat.id] ?? <Tag size={18} />}
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-[11px] font-black group-hover:text-primary-500 transition-colors uppercase tracking-wider truncate mb-0.5">
                    {rtl ? cat.name_ar : cat.name_en}
                  </h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                     {rtl ? 'استكشف الآن' : 'Explore Now'}
                  </p>
                </div>
              </Link>
            </motion.div>
          )) : (
            <div className="col-span-full py-12 text-center">
               <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-white/5 mb-4 text-slate-400">
                  <Tag size={32} />
               </div>
               <p className="text-slate-500 italic text-sm font-bold">
                  {rtl ? 'لا توجد أقسام متوفرة لهذه الصفحة حالياً.' : 'No categories available for this page yet.'}
               </p>
            </div>
          )}
        </motion.div>
 
        <Link
          to={`/p/${pageSlug}`}
          onClick={onClose}
          className="mt-6 flex items-center justify-center gap-3 py-3 rounded-2xl bg-primary-500 text-white shadow-lg shadow-primary-500/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.2em] text-[10px] font-black group"
        >
          {rtl ? `عرض كل ${pageName}` : `View All ${pageName}`}
          <ChevronRight size={16} className={`transition-transform group-hover:translate-x-1 ${rtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
        </Link>
      </div>
    </motion.div>
  );
}
