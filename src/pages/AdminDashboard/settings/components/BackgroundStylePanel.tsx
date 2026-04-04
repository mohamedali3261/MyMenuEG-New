import { useStore } from '../../../../store/store';
import { Monitor, CheckCircle2, Sparkles, Grid3X3, Film, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../../api';

export default function BackgroundStylePanel() {
  const { rtl, backgroundStyle, setBackgroundStyle, showToast } = useStore();

  const bgStyles = [
    { id: 'blobs', name: rtl ? 'الهالة المتحركة' : 'Animated Blobs', icon: <Sparkles size={28} /> },
    { id: 'grid', name: rtl ? 'الشبكة الداكنة' : 'Tech Grid', icon: <Grid3X3 size={28} /> },
    { id: 'cinema', name: rtl ? 'توهج السينما' : 'Cinema Glow', icon: <Film size={28} /> },
    { id: 'default', name: rtl ? 'المظهر الافتراضي' : 'Default', icon: <Moon size={28} /> },
  ];

  const handleStyleChange = (id: string) => {
    setBackgroundStyle(id as any);
    api.post('/settings', { backgroundStyle: id });
    showToast(rtl ? 'تم تغيير تأثير الخلفية' : 'Background effect updated', 'success');
  };

  return (
    <div className="glass-card p-6 mt-8">
      <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
        <Monitor size={24} className="text-accent-500" />
        {rtl ? 'تأثيرات خلفية الموقع' : 'Global Background Effects'}
      </h2>

      <div className="grid md:grid-cols-4 gap-6">
        {bgStyles.map((style) => {
          const isActive = backgroundStyle === style.id;
          return (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={style.id}
              onClick={() => handleStyleChange(style.id)}
              className={`relative flex flex-col p-6 rounded-[2rem] text-center items-center justify-center gap-4 transition-all duration-300 border-2 ${
                isActive 
                  ? 'border-accent-500 bg-accent-500/10 shadow-[0_0_20px_rgba(249,115,22,0.2)]' 
                  : 'border-slate-200 dark:border-white/10 glass hover:border-accent-400'
              }`}
            >
              {isActive && (
                 <div className="absolute top-4 right-4 text-accent-500">
                   <CheckCircle2 size={24} fill="currentColor" className="text-white" />
                 </div>
              )}
              
              <div className="w-16 h-16 bg-gradient-to-tr from-accent-500/30 to-primary-500/30 rounded-full flex items-center justify-center shadow-inner mb-2 text-accent-500">
                {style.icon}
              </div>
              
              <h3 className="font-bold text-sm">{style.name}</h3>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
