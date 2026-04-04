import { useStore } from '../../../store/store';
import CardStylePanel from './components/CardStylePanel';
import BackgroundStylePanel from './components/BackgroundStylePanel';
import MarketingPanel from './components/MarketingPanel';
import BrandingPanel from './components/BrandingPanel';

export default function Settings() {
  const { rtl } = useStore();

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="text-3xl font-bold mb-8">
        {rtl ? 'إعدادات المظهر العام' : 'Appearance Settings'}
      </h1>

      {/* Extracted Panels */}
      <BrandingPanel />
      <CardStylePanel />
      <BackgroundStylePanel />
      <MarketingPanel />

    </div>
  )
}
