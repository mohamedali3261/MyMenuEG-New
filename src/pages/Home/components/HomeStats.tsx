import { motion } from 'framer-motion';
import { useStore } from '../../../store/store';

export default function HomeStats() {
  const { rtl } = useStore();

  const stats = [
    { label_ar: 'العملاء المستفيدين', label_en: 'Happy Clients', value: '500+', color: 'text-primary-500' },
    { label_ar: 'منتجات التغليف', label_en: 'Packaging Items', value: '1,200', color: 'text-accent-500' },
    { label_ar: 'شحنات يومية', label_en: 'Daily Shipments', value: '50+', color: 'text-primary-500' },
    { label_ar: 'سنة من الخبرة', label_en: 'Years Experience', value: '10+', color: 'text-accent-500' }
  ];

  return (
    <section className="w-full bg-slate-900 border-y border-white/5 py-24 relative overflow-hidden">
       {/* Background Decoration */}
       <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px]"></div>
       <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px]"></div>

       <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center relative z-10">
          {stats.map((s, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, scale: 0.8 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="space-y-2"
             >
                <div className={`text-4xl md:text-5xl font-black ${s.color}`}>
                   {s.value}
                </div>
                <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                   {rtl ? s.label_ar : s.label_en}
                </div>
             </motion.div>
          ))}
       </div>
    </section>
  )
}
