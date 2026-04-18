import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create super admin
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.admins.upsert({
    where: { id: 'admin-1' },
    update: {},
    create: {
      id: 'admin-1',
      username: 'admin',
      password: hashedPassword,
      email: 'admin@mymenueg.com',
      is_super_admin: true,
      is_active: true,
      permissions: JSON.stringify(['all']),
    },
  });
  console.log('✅ Created super admin:', admin.username);

  // Create categories
  const categories = [
    { id: 'cat-1', name_ar: 'أكواب', name_en: 'Cups', status: 'active' },
    { id: 'cat-2', name_ar: 'صحون', name_en: 'Plates', status: 'active' },
    { id: 'cat-3', name_ar: 'أواني', name_en: 'Cookware', status: 'active' },
    { id: 'cat-4', name_ar: 'أدوات المائدة', name_en: 'Tableware', status: 'active' },
  ];

  for (const cat of categories) {
    await prisma.categories.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Created', categories.length, 'categories');

  // Create store pages
  const pages = [
    { id: 'page-1', name_ar: 'الرئيسية', name_en: 'Home', slug: 'home', show_in_navbar: true, is_dynamic: false, status: 'active', order_index: 0 },
    { id: 'page-2', name_ar: 'أكواب', name_en: 'Cups', slug: 'cups', show_in_navbar: true, is_dynamic: true, status: 'active', order_index: 1 },
    { id: 'page-3', name_ar: 'عروض', name_en: 'Offers', slug: 'offers', show_in_navbar: true, is_dynamic: true, status: 'active', order_index: 2 },
  ];

  for (const page of pages) {
    await prisma.store_pages.upsert({
      where: { id: page.id },
      update: {},
      create: page,
    });
  }
  console.log('✅ Created', pages.length, 'store pages');

  // Create sample products
  const products = [
    {
      id: 'prod-1',
      name_ar: 'كوب سيراميك فاخر',
      name_en: 'Premium Ceramic Cup',
      description_ar: 'كوب سيراميك عالي الجودة مقاوم للحرارة',
      description_en: 'High quality heat-resistant ceramic cup',
      price: 150,
      old_price: 200,
      stock: 50,
      status: 'active',
      category_id: 'cat-1',
      is_best_seller: true,
    },
    {
      id: 'prod-2',
      name_ar: 'طبق تقديم دائري',
      name_en: 'Round Serving Plate',
      description_ar: 'طبق تقديم أنيق مناسب لجميع المناسبات',
      description_en: 'Elegant serving plate suitable for all occasions',
      price: 250,
      old_price: 300,
      stock: 30,
      status: 'active',
      category_id: 'cat-2',
      is_best_seller: false,
    },
    {
      id: 'prod-3',
      name_ar: 'طقم أواني مطبخ',
      name_en: 'Kitchen Cookware Set',
      description_ar: 'طقم أواني مطبخ شامل من الستانلس ستيل',
      description_en: 'Complete stainless steel kitchen cookware set',
      price: 1500,
      old_price: 2000,
      stock: 15,
      status: 'active',
      category_id: 'cat-3',
      is_best_seller: true,
    },
  ];

  for (const prod of products) {
    await prisma.products.upsert({
      where: { id: prod.id },
      update: {},
      create: prod,
    });
  }
  console.log('✅ Created', products.length, 'products');

  // Create hero slides
  const slides = [
    {
      id: 'slide-1',
      title_ar: 'عروض الصيف',
      title_en: 'Summer Offers',
      subtitle_ar: 'خصومات تصل إلى 50%',
      subtitle_en: 'Discounts up to 50%',
      btn_text_ar: 'تسوق الآن',
      btn_text_en: 'Shop Now',
      btn_link: '/offers',
      order_index: 0,
    },
  ];

  for (const slide of slides) {
    await prisma.hero_slides.upsert({
      where: { id: slide.id },
      update: {},
      create: slide,
    });
  }
  console.log('✅ Created', slides.length, 'hero slides');

  // Create settings
  const settings = [
    { key_name: 'site_name_ar', value: 'مينيو مصر' },
    { key_name: 'site_name_en', value: 'MyMenuEG' },
    { key_name: 'currency', value: 'EGP' },
    { key_name: 'whatsapp_number', value: '+201234567890' },
    { key_name: 'sliderInterval', value: '5000' },
  ];

  for (const setting of settings) {
    await prisma.settings.upsert({
      where: { key_name: setting.key_name },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log('✅ Created', settings.length, 'settings');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📝 Admin credentials:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
