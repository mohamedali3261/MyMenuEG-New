import { motion } from 'framer-motion';
import { useStore } from '../../../store/store';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  const { rtl } = useStore();

  return (
    <section className="relative w-full min-h-[85vh] flex items-center justify-center px-6 py-20 overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-500/30 rounded-full mix-blend-multiply filter blur-[100px]"></div>
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-accent-500/30 rounded-full mix-blend-multiply filter blur-[100px]"></div>
      
      <div className="relative z-10 max-w-7xl w-full grid md:grid-cols-2 gap-12 items-center">
        
        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, x: rtl ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-600 dark:text-primary-400 w-fit">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
            </span>
            <span className="text-sm font-semibold">{rtl ? 'أفضل حلول التغليف' : 'Best Packaging Solutions'}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
            {rtl ? 'ارتقِ بتغليف' : 'Elevate Your'}<br/>
            <span className="text-gradient">{rtl ? 'منتجاتك' : 'Packaging'}</span><br/>
            {rtl ? 'إلى مستوى آخر' : 'To The Next Level'}
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-xl">
            {rtl 
              ? 'نقدم لشركتك أفضل المنتجات الورقية والبلاستيكية للتغليف بأعلى جودة وأفضل الأسعار لتعزيز علامتك التجارية.' 
              : 'We provide your business with the best paper and plastic packaging products at the highest quality and best prices to boost your brand.'}
          </p>

          <div className="flex items-center gap-4 mt-4">
            <Link to="/products" className="btn-primary group flex items-center gap-2">
              {rtl ? 'تصفح المنتجات' : 'Browse Products'}
              {rtl ? <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> : <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </Link>
            <Link to="/categories" className="glass-card px-8 py-3 font-semibold hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
              {rtl ? 'عرض الأقسام' : 'View Categories'}
            </Link>
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full h-[500px]"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-accent-500/20 rounded-[3rem] rotate-6 scale-95 blur-xl"></div>
          <div className="absolute inset-0 glass-card rounded-[3rem] overflow-hidden flex items-center justify-center border-white/20">
            {/* Placeholder for packaging image */}
            <div className="text-center p-8">
              <div className="w-48 h-48 mx-auto bg-gradient-to-br from-primary-400 to-accent-500 rounded-2xl rotate-12 shadow-2xl mb-8 flex items-center justify-center">
                <span className="text-6xl text-white font-bold">📦</span>
              </div>
              <h3 className="text-2xl font-bold dark:text-white">{rtl ? 'تغليف متميز' : 'Premium Packaging'}</h3>
            </div>
          </div>
        </motion.div>
        
      </div>
    </section>
  )
}
