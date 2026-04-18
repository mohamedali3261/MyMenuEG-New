export interface SliderTemplate {
  key: string;
  nameAr: string;
  nameEn: string;
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
  btn_text_ar: string;
  btn_text_en: string;
  btn_link: string;
}

export const SLIDER_TEMPLATES: SliderTemplate[] = [
  {
    key: 'new-arrivals',
    nameAr: 'قالب المنتجات الجديدة',
    nameEn: 'New Arrivals',
    title_ar: 'تشكيلة جديدة وصلت الآن',
    title_en: 'New Collection Just Arrived',
    subtitle_ar: 'اكتشف أحدث منتجات التغليف بتصميمات عصرية وجودة عالية.',
    subtitle_en: 'Discover the latest packaging products with modern design and premium quality.',
    btn_text_ar: 'تسوق الآن',
    btn_text_en: 'Shop Now',
    btn_link: '/products'
  },
  {
    key: 'hot-offer',
    nameAr: 'قالب عرض خاص',
    nameEn: 'Special Offer',
    title_ar: 'عروض حصرية لفترة محدودة',
    title_en: 'Exclusive Limited-Time Offers',
    subtitle_ar: 'استفد من أفضل الأسعار على منتجات مختارة قبل انتهاء العرض.',
    subtitle_en: 'Enjoy the best prices on selected products before the offer ends.',
    btn_text_ar: 'شاهد العروض',
    btn_text_en: 'View Offers',
    btn_link: '/products'
  },
  {
    key: 'custom-branding',
    nameAr: 'قالب الهوية البصرية',
    nameEn: 'Custom Branding',
    title_ar: 'حوّل منتجك إلى هوية مميزة',
    title_en: 'Turn Your Product Into a Brand',
    subtitle_ar: 'حلول طباعة وتغليف مخصصة تساعدك على التميز في السوق.',
    subtitle_en: 'Custom printing and packaging solutions that help your brand stand out.',
    btn_text_ar: 'اطلب تصميمك',
    btn_text_en: 'Request Your Design',
    btn_link: '/contact'
  }
];

