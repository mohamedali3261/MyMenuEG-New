import { useState } from 'react';
import { useStore } from '../../../store/store';
import BrandingPanel from './components/BrandingPanel';
import LoadingScreenPanel from './components/LoadingScreenPanel';
import CardStylePanel from './components/CardStylePanel';
import BackgroundStylePanel from './components/BackgroundStylePanel';
import BundleCardStylePanel from './components/BundleCardStylePanel';
import MarketingPanel from './components/MarketingPanel';
import NotFoundSettingsPanel from './components/NotFoundSettingsPanel';
import { Palette, FileText } from 'lucide-react';

type TabCategory = 'design' | 'content';

export default function Settings() {
  const { rtl } = useStore();
  const [activeTab, setActiveTab] = useState<TabCategory>('design');

  const tabs = [
    {
      id: 'design' as TabCategory,
      label: rtl ? 'المظهر والتصميم' : 'Design & Appearance',
      icon: <Palette size={18} />
    },
    {
      id: 'content' as TabCategory,
      label: rtl ? 'المحتوى والصفحات' : 'Content & Pages',
      icon: <FileText size={18} />
    }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <h1 className="text-3xl font-bold mb-8">
        {rtl ? 'الإعدادات' : 'Settings'}
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-white/5 p-2 rounded-2xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-white/10 text-primary-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Design Tab */}
      {activeTab === 'design' && (
        <div className="space-y-8">
          <BrandingPanel />
          <BackgroundStylePanel />
          <CardStylePanel />
          <BundleCardStylePanel />
          <LoadingScreenPanel />
        </div>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-8">
          <MarketingPanel />
          <NotFoundSettingsPanel />
        </div>
      )}
    </div>
  )
}
