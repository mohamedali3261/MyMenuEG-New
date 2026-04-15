export interface AdminTabItem {
  id: string;
  labelAr: string;
  labelEn: string;
  path: string;
  superAdminOnly?: boolean;
}

export const ADMIN_TABS: AdminTabItem[] = [
  { id: 'overview', labelAr: 'نظرة عامة', labelEn: 'Overview', path: '/admin' },
  { id: 'products', labelAr: 'المنتجات', labelEn: 'Products', path: '/admin/products' },
  { id: 'slides', labelAr: 'السلايدر الرئيسي', labelEn: 'Home Slider', path: '/admin/slider' },
  { id: 'categories', labelAr: 'التصنيفات', labelEn: 'Categories', path: '/admin/categories' },
  { id: 'coupons', labelAr: 'كوبونات الخصم', labelEn: 'Coupons', path: '/admin/coupons' },
  { id: 'orders', labelAr: 'الطلبات', labelEn: 'Orders', path: '/admin/orders' },
  { id: 'customers', labelAr: 'العملاء', labelEn: 'Customers', path: '/admin/customers' },
  { id: 'users', labelAr: 'إدارة المستخدمين', labelEn: 'User Management', path: '/admin/users', superAdminOnly: true },
  { id: 'database', labelAr: 'النسخ الاحتياطي', labelEn: 'Database Backups', path: '/admin/database', superAdminOnly: true },
  { id: 'pages', labelAr: 'التحكم في الصفحات', labelEn: 'Pages Control', path: '/admin/pages' },
  { id: 'offers', labelAr: 'الإعلانات', labelEn: 'Advertisements', path: '/admin/offers' },
  { id: 'contact', labelAr: 'إعدادات التواصل', labelEn: 'Contact Settings', path: '/admin/contact' },
  { id: 'payment', labelAr: 'إعدادات الدفع', labelEn: 'Payment Settings', path: '/admin/payment' },
  { id: 'settings', labelAr: 'الإعدادات', labelEn: 'Settings', path: '/admin/settings' }
];
