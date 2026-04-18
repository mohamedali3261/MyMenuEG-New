import { useStore } from '../../../store/store';
import BrandingPanel from './components/BrandingPanel';
import LoadingScreenPanel from './components/LoadingScreenPanel';
import CardStylePanel from './components/CardStylePanel';
import BackgroundStylePanel from './components/BackgroundStylePanel';
import MarketingPanel from './components/MarketingPanel';
import FaqSettingsPanel from './components/FaqSettingsPanel';
import NotFoundSettingsPanel from './components/NotFoundSettingsPanel';

export default function Settings() {
  const { rtl } = useStore();

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="text-3xl font-bold mb-8">
        {rtl ? 'إعدادات المظهر العام' : 'Appearance Settings'}
      </h1>

      {/* Extracted Panels */}
      <BrandingPanel />
      <LoadingScreenPanel />
      <CardStylePanel />
      <BackgroundStylePanel />
      <MarketingPanel />
      <FaqSettingsPanel />
      <NotFoundSettingsPanel />

    </div>
  )
}
