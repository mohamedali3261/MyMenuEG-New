import { useState } from 'react';
import { useStore } from '../../../store/store';
import { Image as ImageIcon, Sparkles } from 'lucide-react';
import LogosTab from './LogosTab';
import SvgMarqueeTab from './SvgMarqueeTab';

export default function MarqueeManager() {
  const { rtl } = useStore();
  const [activeTab, setActiveTab] = useState<'logos' | 'svg'>('logos');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ImageIcon size={32} className="text-primary-500" />
            {rtl ? 'إدارة الماركي' : 'Marquee Manager'}
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            {rtl ? 'إدارة الشريط المتحرك والشريط الرسومي في الصفحة الرئيسية' : 'Manage animated strip and graphical strip on the home page'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-1.5 rounded-xl">
          <button
            onClick={() => setActiveTab('logos')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'logos'
                ? 'bg-white dark:bg-slate-800 text-primary-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {rtl ? 'الشريط المتحرك' : 'Animated Strip'}
          </button>
          <button
            onClick={() => setActiveTab('svg')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'svg'
                ? 'bg-white dark:bg-slate-800 text-primary-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles size={16} />
            {rtl ? 'الشريط الرسومي' : 'Graphical Strip'}
          </button>
        </div>
      </div>

      {/* Logos Tab */}
      {activeTab === 'logos' && <LogosTab />}

      {/* SVG Marquee Tab */}
      {activeTab === 'svg' && <SvgMarqueeTab />}
    </div>
  );
}
