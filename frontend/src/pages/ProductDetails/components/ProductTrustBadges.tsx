import { Truck, ShieldCheck, RefreshCw, Headset } from 'lucide-react';
import { useStore } from '../../../store/store';

export default function ProductTrustBadges() {
  const { rtl } = useStore();

  const badges = [
    { 
      icon: <Truck className="text-primary-500" />, 
      title_ar: 'شحن سريع', 
      title_en: 'Fast Shipping',
      desc_ar: 'توصيل لباب المنزل',
      desc_en: 'Doorstep delivery'
    },
    { 
      icon: <ShieldCheck className="text-green-500" />, 
      title_ar: 'دفع آمن', 
      title_en: 'Secure Payment',
      desc_ar: 'تشفير كامل للبيانات',
      desc_en: '100% secure checkout'
    },
    { 
      icon: <RefreshCw className="text-blue-500" />, 
      title_ar: 'استرجاع مرن', 
      title_en: 'Easy Returns',
      desc_ar: 'سياسة استبدال سهلة',
      desc_en: '14-day return policy'
    },
    { 
      icon: <Headset className="text-purple-500" />, 
      title_ar: 'دعم 24/7', 
      title_en: '24/7 Support',
      desc_ar: 'متواجدون دائماً',
      desc_en: 'Always here to help'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
      {badges.map((badge, i) => (
        <div key={i} className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
          <div className="mb-2">
            {badge.icon}
          </div>
          <span className="text-[10px] md:text-xs font-bold block mb-1">
            {rtl ? badge.title_ar : badge.title_en}
          </span>
          <span className="text-[8px] md:text-[10px] opacity-50">
            {rtl ? badge.desc_ar : badge.desc_en}
          </span>
        </div>
      ))}
    </div>
  );
}
