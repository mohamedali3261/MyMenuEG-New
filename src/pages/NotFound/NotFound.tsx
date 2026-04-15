import { useStore } from '../../store/store';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Search, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const { rtl, branding, notfoundSettings } = useStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.title = `${rtl ? 'صفحة غير موجودة' : 'Page Not Found'} | ${branding.storeName}`;
  }, [rtl, branding]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 relative">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card max-w-2xl w-full p-10 md:p-16 text-center shadow-2xl relative overflow-hidden flex flex-col items-center"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[300px] font-black opacity-5 dark:opacity-[0.02] pointer-events-none select-none">
          404
        </div>
        
        <motion.div 
          initial={{ rotate: -15, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 bg-primary-500/10 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-8 relative z-10"
        >
          <AlertCircle size={56} />
        </motion.div>
        
        <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent relative z-10">
          {rtl ? notfoundSettings.titleAr : notfoundSettings.titleEn}
        </h1>
        
        <p className="text-xl text-slate-500 dark:text-slate-400 mb-10 relative z-10 max-w-lg mx-auto">
          {rtl ? notfoundSettings.descAr : notfoundSettings.descEn}
        </p>

        <div className="w-full max-w-md mx-auto relative z-10 mb-8">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                 type="text" 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full h-14 pl-12 pr-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-primary-500 transition-colors"
                 placeholder={rtl ? 'هل تبحث عن منتج معين؟' : 'Looking for a specific product?'}
              />
              {search.length > 2 && (
                 <Link to={`/products`} className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-bold">
                    {rtl ? 'بحث' : 'Search'}
                 </Link>
              )}
           </div>
        </div>

        <div className="flex justify-center flex-wrap gap-4 relative z-10">
          <Link 
            to="/" 
            className="btn-primary py-4 px-8 flex items-center justify-center gap-3 text-lg w-full md:w-auto shadow-lg shadow-primary-500/20"
          >
            <Home size={22} />
            {rtl ? 'العودة للرئيسية' : 'Back to Home'}
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="btn-secondary py-4 px-8 text-lg w-full md:w-auto hover:bg-slate-200 dark:hover:bg-white/10"
          >
            {rtl ? 'الرجوع للخلف' : 'Go Back'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
