import { useState, useEffect } from 'react';
import { useStore } from '../../../../store/store';
import { Paintbrush, CheckCircle2, Palette, MousePointer2, ZoomIn, ArrowUpToLine, Sun, Ban } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../../api';
import SaveButton from '../../../../components/SaveButton';

type CardStyle = 'classic' | 'floating' | 'minimal' | 'reveal' | 'modern';
type CardHoverAnimation = 'zoom' | 'lift' | 'glow' | 'none';

export default function CardStylePanel() {
  const { rtl, cardStyle, setCardStyle, cardHoverAnimation, setCardHoverAnimation, showToast } = useStore();
  
  // Local state for temporary selection
  const [selectedStyle, setSelectedStyle] = useState<CardStyle>(cardStyle);
  const [selectedAnim, setSelectedAnim] = useState<CardHoverAnimation>(cardHoverAnimation);
  const [isSaving, setIsSaving] = useState(false);

  // Sync with store if it changes externally
  useEffect(() => {
    setSelectedStyle(cardStyle);
    setSelectedAnim(cardHoverAnimation);
  }, [cardStyle, cardHoverAnimation]);

  const styles: Array<{ id: CardStyle; name: string }> = [
    { id: 'classic', name: rtl ? 'الكارت الكلاسيكي الأنيق' : 'Classic Elegant Card' },
    { id: 'floating', name: rtl ? 'الكارت العائم المائل' : 'Floating 3D Card' },
    { id: 'minimal', name: rtl ? 'كارت الصورة الواسع' : 'Minimal Poster Card' },
    { id: 'reveal', name: rtl ? 'كارت العرض التفاعلي' : 'Interactive Reveal Card' },
    { id: 'modern', name: rtl ? 'كارت الزجاج العصري' : 'Modern Glass Card' },
  ];

  const hoverAnimations: Array<{ id: CardHoverAnimation; name: string; icon: React.ReactNode }> = [
    { id: 'zoom', name: rtl ? 'تكبير الصورة (Zoom)' : 'Zoom In', icon: <ZoomIn size={32} /> },
    { id: 'lift', name: rtl ? 'رفع للأعلى (Lift)' : 'Lift Up', icon: <ArrowUpToLine size={32} /> },
    { id: 'glow', name: rtl ? 'توهج (Glow)' : 'Glow', icon: <Sun size={32} /> },
    { id: 'none', name: rtl ? 'بدون (None)' : 'None', icon: <Ban size={32} /> },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.post('/settings', { 
        cardStyle: selectedStyle,
        cardHoverAnimation: selectedAnim 
      });
      
      // Update store only after successful API call
      setCardStyle(selectedStyle);
      setCardHoverAnimation(selectedAnim);
      
      showToast(rtl ? 'تم حفظ إعدادات الكروت بنجاح' : 'Card settings saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save card settings:', error);
      showToast(rtl ? 'فشل حفظ الإعدادات' : 'Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = selectedStyle !== cardStyle || selectedAnim !== cardHoverAnimation;

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <Paintbrush size={24} className="text-primary-500" />
          {rtl ? 'شكل كروت العرض' : 'Product Cards Style'}
        </h2>
        
        <SaveButton
          onClick={handleSave}
          isSaving={isSaving}
          hasChanges={hasChanges}
          rtl={rtl}
          color="glass"
        />
      </div>

      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-2xl">
        {rtl ? 'اختر كيف يظهر تصميم كروت المنتجات لعملائك في الصفحة الرئيسية وصفحة المنتجات:' : 'Choose how the product cards should look to your customers on the Home and Products pages:'}
      </p>

      <div className="grid md:grid-cols-5 gap-4 mb-12">
        {styles.map((style) => {
          const isActive = selectedStyle === style.id;
          return (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`relative flex flex-col p-4 rounded-xl text-center items-center justify-center gap-3 transition-all duration-300 border-2 ${
                isActive 
                  ? 'border-primary-500 bg-primary-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                  : 'border-slate-200 dark:border-white/10 glass hover:border-primary-400'
              }`}
            >
              {isActive && (
                 <div className="absolute top-2 right-2 text-primary-500 bg-white rounded-full p-0.5">
                   <CheckCircle2 size={16} fill="currentColor" />
                 </div>
              )}
              
              <div className="w-14 h-14 bg-gradient-to-tr from-primary-500/30 to-accent-500/30 rounded-full flex items-center justify-center shadow-inner mb-1 text-primary-500">
                <Palette size={28} />
              </div>
              
              <h3 className="font-bold text-xs">{style.name}</h3>
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {hoverAnimations.map((anim) => {
          const isActive = selectedAnim === anim.id;
          return (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={anim.id}
              onClick={() => setSelectedAnim(anim.id)}
              className={`relative flex flex-col p-4 rounded-2xl text-center items-center justify-center gap-3 transition-all duration-300 border-2 ${
                isActive 
                  ? 'border-primary-500 bg-primary-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                  : 'border-slate-200 dark:border-white/10 glass hover:border-primary-400'
              }`}
            >
              {isActive && (
                 <div className="absolute top-2 right-2 text-primary-500 bg-white rounded-full p-0.5">
                   <CheckCircle2 size={18} fill="currentColor" />
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
