import { useStore } from '../../../../store/store';
import { Paintbrush, CheckCircle2, Palette, MousePointer2, ZoomIn, ArrowUpToLine, Sun, Ban } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../../api';

export default function CardStylePanel() {
  const { rtl, cardStyle, setCardStyle, cardHoverAnimation, setCardHoverAnimation, showToast } = useStore();

  const styles = [
    { id: 'classic', name: rtl ? 'الكارت الكلاسيكي الأنيق' : 'Classic Elegant Card' },
    { id: 'floating', name: rtl ? 'الكارت العائم المائل' : 'Floating 3D Card' },
    { id: 'minimal', name: rtl ? 'كارت الصورة الواسع' : 'Minimal Poster Card' },
  ];

  const hoverAnimations = [
    { id: 'zoom', name: rtl ? 'تكبير الصورة (Zoom)' : 'Zoom In', icon: <ZoomIn size={32} /> },
    { id: 'lift', name: rtl ? 'رفع للأعلى (Lift)' : 'Lift Up', icon: <ArrowUpToLine size={32} /> },
    { id: 'glow', name: rtl ? 'توهج (Glow)' : 'Glow', icon: <Sun size={32} /> },
    { id: 'none', name: rtl ? 'بدون (None)' : 'None', icon: <Ban size={32} /> },
  ];

  const handleStyleChange = (id: string) => {
    setCardStyle(id as any);
    api.post('/settings', { cardStyle: id });
    showToast(rtl ? 'تم تغيير شكل الكارت' : 'Card style updated', 'success');
  };

  const handleAnimChange = (id: string) => {
    setCardHoverAnimation(id as any);
    api.post('/settings', { cardHoverAnimation: id });
    showToast(rtl ? 'تم تغيير تأثير الحركة' : 'Animation updated', 'success');
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
        <Paintbrush size={24} className="text-primary-500" />
        {rtl ? 'شكل كروت العرض' : 'Product Cards Style'}
      </h2>

      <p className="text-slate-500 dark:text-slate-400 mb-6">
        {rtl ? 'اختر كيف يظهر تصميم كروت المنتجات لعملائك في الصفحة الرئيسية وصفحة المنتجات:' : 'Choose how the product cards should look to your customers on the Home and Products pages:'}
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {styles.map((style) => {
          const isActive = cardStyle === style.id;
          return (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={style.id}
              onClick={() => handleStyleChange(style.id)}
              className={`relative flex flex-col p-6 rounded-[2rem] text-center items-center justify-center gap-4 transition-all duration-300 border-2 ${
                isActive 
                  ? 'border-primary-500 bg-primary-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                  : 'border-slate-200 dark:border-white/10 glass hover:border-primary-400'
              }`}
            >
              {isActive && (
                 <div className="absolute top-4 right-4 text-primary-500">
                   <CheckCircle2 size={24} fill="currentColor" className="text-white" />
                 </div>
              )}
              
              <div className="w-24 h-24 bg-gradient-to-tr from-primary-500/30 to-accent-500/30 rounded-full flex items-center justify-center shadow-inner mb-2 text-primary-500">
                <Palette size={48} />
              </div>
              
              <h3 className="font-bold text-lg">{style.name}</h3>
            </motion.button>
          )
        })}
      </div>

      <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
        <MousePointer2 size={24} className="text-primary-500" />
        {rtl ? 'تأثيرات تمرير الماوس' : 'Card Hover Animations'}
      </h2>

      <p className="text-slate-500 dark:text-slate-400 mb-6">
        {rtl ? 'اختر التأثير الحركي الذي يظهر عند تمرير الماوس على المنتجات:' : 'Choose the animation effect that triggers when customers hover over the cards:'}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {hoverAnimations.map((anim) => {
          const isActive = cardHoverAnimation === anim.id;
          return (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={anim.id}
              onClick={() => handleAnimChange(anim.id)}
              className={`relative flex flex-col p-4 rounded-2xl text-center items-center justify-center gap-3 transition-all duration-300 border-2 ${
                isActive 
                  ? 'border-primary-500 bg-primary-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                  : 'border-slate-200 dark:border-white/10 glass hover:border-primary-400'
              }`}
            >
              {isActive && (
                 <div className="absolute top-2 right-2 text-primary-500">
                   <CheckCircle2 size={18} fill="currentColor" className="text-white" />
                 </div>
              )}
              
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-primary-500 mb-1">
                {anim.icon}
              </div>
              
              <h3 className="font-bold text-sm">{anim.name}</h3>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
