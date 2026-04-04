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
  categories: any[];
  rtl: boolean;
  onClose: () => void;
}

export default function MegaMenu({ categories, rtl, onClose }: MegaMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95 }}
      className="mx-auto w-[90vw] max-w-[920px] bg-white dark:bg-slate-950 p-6 shadow-2xl border border-slate-200 dark:border-white/10 z-[10] overflow-hidden rounded-[2rem]"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">
         <GlassWater size={160} className="rotate-12" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500">
             {rtl ? 'تصفح كافة الأقسام' : 'Browse All Categories'}
           </h3>
           <div className="h-px flex-grow mx-3 bg-white/5" />
           <span className="text-[9px] text-slate-500 font-bold">{categories.length} {rtl ? 'قسم' : 'sections'}</span>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1"
        >
          {categories.map(cat => (
            <motion.div key={cat.id} variants={itemVariants}>
              <Link
                to={`/disposables#${cat.id}`}
                onClick={onClose}
                className="flex items-center gap-2 py-2 rounded-lg hover:bg-white/5 transition-all group px-2"
              >
                <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary-500 group-hover:bg-primary-500/10 transition-colors shrink-0">
                  {CATEGORY_ICONS[cat.id] ?? <Tag size={14} />}
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-xs font-bold group-hover:text-primary-500 transition-colors uppercase tracking-wide truncate">
                    {rtl ? cat.name_ar : cat.name_en}
                  </h4>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <Link
          to="/disposables"
          onClick={onClose}
          className="mt-4 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary-500/5 border border-primary-500/10 text-[10px] font-bold text-primary-500 hover:bg-primary-500/10 transition-all uppercase tracking-widest"
        >
          {rtl ? 'عرض كافة المستلزمات' : 'View All Disposables'}
          <ChevronRight size={14} className={rtl ? 'rotate-180' : ''} />
        </Link>
      </div>
    </motion.div>
  );
}
