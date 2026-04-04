import { motion } from 'framer-motion';
import { useStore } from '../../../store/store';
import { Zap, ShieldCheck, Heart, Award } from 'lucide-react';

export default function HomeFeatures() {
  const { rtl } = useStore();

  const features = [
    { 
      icon: Zap, 
      label_ar: 'توصيل سريع', label_en: 'Fast Delivery', 
      desc_ar: 'نلتزم بمواعيد التسليم لضمان سير أعمالك.', desc_en: 'We commit to delivery dates to ensure your business continuity.' 
    },
    { 
      icon: ShieldCheck, 
      label_ar: 'جودة متميزة', label_en: 'Premium Quality', 
      desc_ar: 'نستخدم أفضل الخامات الورقية والبلاستيكية.', desc_en: 'We use the finest paper and plastic materials.' 
    },
    { 
      icon: Award, 
      label_ar: 'أسعار تنافسية', label_en: 'Best Prices', 
      desc_ar: 'نوفر لك أفضل جودة بأقل تكلفة ممكنة.', desc_en: 'We provide you with the best quality at the lowest cost.' 
    },
    { 
      icon: Heart, 
      label_ar: 'صديق للبيئة', label_en: 'Eco Friendly', 
      desc_ar: 'حلول تغليف مستدامة تحافظ على الكوكب.', desc_en: 'Sustainable packaging solutions that preserve the planet.' 
    }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-16 space-y-4">
         <motion.span 
           initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
           className="text-primary-500 font-bold uppercase tracking-widest text-sm"
         >
           {rtl ? 'لماذا تختارنا؟' : 'Why Choose Us?'}
         </motion.span>
         <h2 className="text-4xl font-extrabold">{rtl ? 'نحن شركاؤك في النجاح' : 'Your Partners In Success'}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card group p-8 hover:border-primary-500/40 hover:bg-primary-500/5 transition-all duration-300"
          >
             <div className="w-14 h-14 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
               <f.icon size={28} />
             </div>
             <h3 className="text-xl font-bold mb-3">{rtl ? f.label_ar : f.label_en}</h3>
             <p className="text-slate-500 text-sm leading-relaxed">{rtl ? f.desc_ar : f.desc_en}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
