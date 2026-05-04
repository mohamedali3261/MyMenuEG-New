import { useState, useEffect } from 'react';
import { useStore } from '../../../../store/store';
import { Clock, Play } from 'lucide-react';
import { api } from '../../../../api';
import SaveButton from '../../../../components/SaveButton';

export default function SliderSettingsPanel() {
  const { rtl, showToast } = useStore();
  const [interval, setIntervalVal] = useState('3');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        if (res.data.sliderInterval) {
          setIntervalVal(res.data.sliderInterval);
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post('/settings', { sliderInterval: interval });
      showToast(rtl ? 'تم حفظ إعدادات السلايدر' : 'Slider settings saved successfully');
    } catch {
      showToast('Error saving settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 mt-8">
      <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
        <Play size={24} className="text-primary-500" />
        {rtl ? 'إعدادات السلايدر الرئيسي' : 'Home Slider Settings'}
      </h2>

      <div className="flex flex-col md:flex-row items-center gap-8">
         <div className="flex-1 space-y-2">
            <h3 className="font-bold text-lg flex items-center gap-2">
               <Clock size={20} className="text-slate-400" />
               {rtl ? 'توقيت التنقل التلقائي' : 'Auto-play Interval'}
            </h3>
            <p className="text-slate-500 text-sm">
               {rtl ? 'حدد عدد الثواني التي تظهر فيها كل شريحة قبل الانتقال للتالية.' : 'Specify the number of seconds each slide is displayed before transitioning to the next.'}
            </p>
         </div>

         <div className="flex items-center gap-4 bg-slate-100 dark:bg-white/5 p-4 rounded-2xl border border-white/10">
            <input 
              type="number" 
              min="1" 
              max="60"
              value={interval} 
              onChange={e => setIntervalVal(e.target.value)}
              className="w-20 bg-transparent text-center text-2xl font-black text-primary-500 outline-none"
            />
            <span className="font-bold text-slate-400">{rtl ? 'ثانية' : 'sec'}</span>
            
            <SaveButton
              onClick={handleSave}
              isSaving={loading}
              rtl={rtl}
              color="glass"
              checkHasChanges={false}
            />
         </div>
      </div>
    </div>
  );
}
