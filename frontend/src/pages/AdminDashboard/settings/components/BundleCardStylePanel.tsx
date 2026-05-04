import { useState, useEffect } from 'react';
import { useStore } from '../../../../store/store';
import { Package, CheckCircle2, LayoutGrid, LayoutList, Layers, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../../api';
import SaveButton from '../../../../components/SaveButton';

type BundleStyle = 'A' | 'B' | 'C' | 'D';

export default function BundleCardStylePanel() {
  const { rtl, bundleCardStyle, setBundleCardStyle, showToast } = useStore();
  const [selected, setSelected] = useState<BundleStyle>(bundleCardStyle);
  const [savedStyle, setSavedStyle] = useState<BundleStyle>(bundleCardStyle);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelected(bundleCardStyle);
  }, [bundleCardStyle]);

  const styles: Array<{ id: BundleStyle; nameAr: string; nameEn: string; descAr: string; descEn: string; icon: React.ReactNode }> = [
    {
      id: 'A',
      nameAr: 'كارت مقسوم',
      nameEn: 'Split Card',
      descAr: 'فوق: grid صور المنتجات، تحت: الاسم والسعر وزر الإضافة',
      descEn: 'Top: product images grid, Bottom: name, price & add button',
      icon: <LayoutGrid size={40} />
    },
    {
      id: 'B',
      nameAr: 'كارت عريض',
      nameEn: 'Hero Banner',
      descAr: 'صورة رئيسية على اليمين + معلومات وشips على الشمال',
      descEn: 'Main image on right + info & chips on left',
      icon: <LayoutList size={40} />
    },
    {
      id: 'C',
      nameAr: 'طبقات متراكبة',
      nameEn: 'Stacked Layers',
      descAr: 'صور المنتجات متstacked فوق بعض + السعر وزر الإضافة',
      descEn: 'Stacked product images + price & add button',
      icon: <Layers size={40} />
    },
    {
      id: 'D',
      nameAr: 'زجاجي عصري',
      nameEn: 'Glassmorphism',
      descAr: 'خلفية blur مع gradient + صور دائرية + بطاقة شفافة',
      descEn: 'Blur gradient background + circular thumbnails + glass card',
      icon: <Sparkles size={40} />
    },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.post('/settings', { bundleCardStyle: selected });
      setBundleCardStyle(selected);
      setSavedStyle(selected);
      showToast(rtl ? 'تم حفظ شكل كارت الباقات بنجاح' : 'Bundle card style saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save bundle card style:', error);
      showToast(rtl ? 'فشل حفظ الإعدادات' : 'Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = selected !== savedStyle;

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <Package size={24} className="text-rose-500" />
          {rtl ? 'شكل كروت الباقات والعروض' : 'Bundle Cards Style'}
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
        {rtl ? 'اختر كيف يظهر تصميم كروت الباقات والعروض لعملائك في الصفحة الرئيسية:' : 'Choose how the bundle & deals cards should look to your customers on the Home page:'}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {styles.map((style) => {
          const isActive = selected === style.id;
          return (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              key={style.id}
              onClick={() => { setSelected(style.id); setBundleCardStyle(style.id); }}
              className={`relative flex flex-col p-5 rounded-2xl text-center items-center justify-center gap-3 transition-all duration-300 border-2 ${
                isActive
                  ? 'border-rose-500 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                  : 'border-slate-200 dark:border-white/10 glass hover:border-rose-400'
              }`}
            >
              {isActive && (
                <div className="absolute top-2 right-2 text-rose-500 bg-white rounded-full p-0.5">
                  <CheckCircle2 size={20} fill="currentColor" />
                </div>
              )}

              <div className="w-16 h-16 bg-gradient-to-tr from-rose-500/20 to-amber-500/20 rounded-full flex items-center justify-center shadow-inner text-rose-500">
                {style.icon}
              </div>

              <h3 className="font-bold text-sm">{rtl ? style.nameAr : style.nameEn}</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {rtl ? style.descAr : style.descEn}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
