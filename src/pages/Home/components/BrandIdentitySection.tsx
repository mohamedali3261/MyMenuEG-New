import { motion } from 'framer-motion';
import { useStore } from '../../../store/store';
import { Palette, Zap, ShieldCheck, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureProps {
  icon: LucideIcon;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  rtl: boolean;
}

const Feature = ({ icon: Icon, titleAr, titleEn, descAr, descEn, rtl }: FeatureProps) => (
  <div className="flex items-start gap-4">
    <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 shrink-0 border border-primary-500/20 shadow-lg shadow-primary-500/5">
      <Icon size={22} />
    </div>
    <div>
      <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1">
        {rtl ? titleAr : titleEn}
      </h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px]">
        {rtl ? descAr : descEn}
      </p>
    </div>
  </div>
);

export default function BrandIdentitySection() {
  const { rtl } = useStore();

  return (
    <section className="relative w-full py-20 px-6 md:px-12 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-500/5 rounded-full blur-[120px] -z-10 -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto">
        <div className={`flex flex-col lg:flex-row items-center gap-16 ${rtl ? 'lg:flex-row-reverse' : ''}`}>
          
          {/* Text Content */}
          <div className="flex-grow space-y-10 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: rtl ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-500 font-black text-[10px] uppercase tracking-[0.2em]">
                <Palette size={14} />
                {rtl ? 'خدمة الهوية البصرية' : 'Brand Identity Service'}
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-primary-600 dark:text-primary-400 leading-[1.1] tracking-tight">
                {rtl ? 'تحويل الأكواب إلى هوية' : 'Transform Cups Into Your'} <br />
                <span className="text-accent-600 dark:text-accent-400">
                   {rtl ? 'علامتك التجارية' : 'Brand Identity'}
                </span>
              </h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed font-medium">
                {rtl 
                  ? 'اجعل كل كوب يحكي قصة نجاح مشروعك. نحن نقدم حلول طباعة احترافية مخصصة تعزز من قيمة منتجك وتجعله ينطق بهويتك الخاصة.' 
                  : 'Let every cup tell your project\'s success story. We offer professional custom printing solutions that enhance your product\'s value and make it speak your unique identity.'}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10"
            >
              <Feature 
                icon={Zap} 
                rtl={rtl}
                titleAr="طباعة فائقة الجودة"
                titleEn="High-Quality Printing"
                descAr="نستخدم أحدث تقنيات الطباعة لضمان وضوح الألوان وثباتها على الأكواب."
                descEn="We use cutting-edge printing technology to ensure vibrant, lasting colors on every cup."
              />
              <Feature 
                icon={ShieldCheck} 
                rtl={rtl}
                titleAr="خامات متميزة"
                titleEn="Premium Materials"
                descAr="أكواب متينة وصديقة للبيئة تضمن تجربة رائعة لعملائك ولعلامتك."
                descEn="Durable, eco-friendly cups that guarantee a great experience for your customers."
              />
              <Feature 
                icon={Globe} 
                rtl={rtl}
                titleAr="من الفكرة للتنفيذ"
                titleEn="Concept to Creation"
                descAr="نساعدك في تحويل فكرتك وشعارك إلى واقع ملموس باحترافية عالية."
                descEn="We help you turn your concepts and logos into professional physical reality."
              />
              <Link 
                to="/contact"
                className="group relative h-16 w-full md:w-fit px-8 bg-accent-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-accent-500/30 flex items-center justify-center gap-3"
              >
                <div className="absolute inset-0 bg-accent-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative z-10 flex items-center justify-center gap-3">
                   {rtl ? 'اطلب تصميمك الآن' : 'Order Your Design Now'}
                   <Palette size={18} />
                </span>
              </Link>
            </motion.div>
          </div>

          {/* Image Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: rtl ? 5 : -5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="w-full lg:w-[45%] order-1 lg:order-2"
          >
            <div className="relative group">
              {/* Decorative Glow */}
              <div className="absolute inset-0 bg-primary-500/20 blur-[60px] rounded-[3rem] -z-10 group-hover:bg-primary-500/30 transition-colors" />
              
              <div className="glass-card p-4 md:p-6 rounded-[3rem] border border-white/20 shadow-2xl overflow-hidden">
                <img 
                  src="/branding_cups.png" 
                  alt="Branded Cups Mockup" 
                  className="w-full aspect-square md:aspect-[4/5] object-cover rounded-[2rem] shadow-xl group-hover:scale-105 transition-transform duration-1000"
                />
                
                {/* Floating Badge */}
                <div className={`absolute bottom-12 ${rtl ? 'left-12' : 'right-12'} p-4 glass-card border border-white/20 rounded-2xl shadow-2xl backdrop-blur-3xl animate-bounce-subtle`}>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">✓</div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rtl ? 'جاهز للهوية' : 'Ready for Brand'}</p>
                        <p className="font-bold text-xs">{rtl ? '١٠٠٪ ضمان جودة' : '100% Quality Pro'}</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
