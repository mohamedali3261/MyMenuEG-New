import db from './db.js';

const seed = async () => {
  console.log('--- Technical Detail Enhancement (Phase 1: Plastic Cans & Cups) ---');

  try {
    // Clear existing products and categories
    await db.query('DELETE FROM product_specs');
    await db.query('DELETE FROM product_images');
    await db.query('DELETE FROM products');
    await db.query('DELETE FROM categories');

    const categories = [
      { id: 'cat-can-plastic', name_ar: 'Can بلاستيك', name_en: 'Plastic Cans' },
      { id: 'cat-can-plastic-cups', name_ar: 'اكواب Can بلاستيك', name_en: 'Plastic Can Cups' },
      { id: 'cat-general-cups', name_ar: 'اكواب جينرال', name_en: 'General Cups' },
      { id: 'cat-single-cups-1c', name_ar: 'اكواب سنجل طباعه 1 لون', name_en: 'Single Wall 1-Color Cups' },
      { id: 'cat-single-cups-2c', name_ar: 'اكواب سنجل طباعه 2 لون', name_en: 'Single Wall 2-Color Cups' },
      { id: 'cat-fabric-bags', name_ar: 'شنط قماش', name_en: 'Fabric Bags' },
      { id: 'cat-kraft-bags', name_ar: 'شنط كرافت', name_en: 'Kraft Bags' },
      { id: 'cat-pizza-boxes', name_ar: 'علب بيتزا', name_en: 'Pizza Boxes' },
      { id: 'cat-paper-boxes', name_ar: 'علب ورقيه', name_en: 'Paper Boxes' },
      { id: 'cat-paper-box-item', name_ar: 'علبه ورق', name_en: 'Specialized Paper Box' },
      { id: 'cat-lids', name_ar: 'غطيان', name_en: 'Lids & Caps' },
      { id: 'cat-cup-holders', name_ar: 'كب هولدر', name_en: 'Cup Holders' },
      { id: 'cat-sandwich-covers', name_ar: 'كڤر سندوتشات', name_en: 'Sandwich Covers' },
      { id: 'cat-plastic-cups-1c', name_ar: 'كوب بلاستيك 1 لون', name_en: 'Plastic Cup 1-Color' },
      { id: 'cat-plastic-cups-2c', name_ar: 'كوب بلاستيك 2 لون', name_en: 'Plastic Cup 2-Color' },
      { id: 'cat-double-paper-cups', name_ar: 'كوب ورقي دبل', name_en: 'Double Wall Paper Cups' },
      { id: 'cat-cutlery-covers', name_ar: 'كوڤيرات', name_en: 'Cutlery/Tray Covers' },
      { id: 'cat-consumables', name_ar: 'مستهلكات', name_en: 'General Consumables' }
    ];

    for (const cat of categories) {
      await db.query('INSERT INTO categories (id, name_ar, name_en, icon, status) VALUES ($1, $2, $3, $4, $5)', 
        [cat.id, cat.name_ar, cat.name_en, '', 'active']);
    }

    const insertProdSql = `
      INSERT INTO products 
      (id, category_id, name_ar, name_en, description_ar, description_en, price, stock, status, image_url, is_best_seller, shipping_info_ar, shipping_info_en, warranty_info_ar, warranty_info_en)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `;

    for (const cat of categories) {
      for (let i = 1; i <= 5; i++) {
        const pId = `p-${cat.id}-${i}`;
        let name_ar, name_en, desc_ar, desc_en, specs = [];
        let price = 100 + (i * 50);

        if (cat.id === 'cat-can-plastic') {
          const capacities = [250, 330, 500, 100, 750];
          const cap = capacities[i-1];
          name_ar = `عبوة كان بلاستيك PET سعة ${cap} مل`;
          name_en = `${cap}ml PET Plastic Can (Clear)`;
          desc_ar = `عبوة كان بلاستيك شفافة عالية الجودة مصنوعة من مادة الـ PET الآمنة غذائياً. تأتي مع غطاء فضي سهل الفتح (Easy Open) لضمان حفظ المشروبات والعصائر طويلاً. مثالية للمقاهي والمطاعم التي تقدم المشروبات الباردة.`;
          desc_en = `High-quality transparent PET plastic can, food-safe and durable. Comes with a silver easy-open tab lid ensuring long-term freshness for juices and beverages. Perfect for cafes and restaurants serving cold drinks.`;
          specs = [
            { k_ar: 'السعة', k_en: 'Capacity', v_ar: `${cap} مل`, v_en: `${cap}ml` },
            { k_ar: 'القطر', k_en: 'Diameter', v_ar: '65 ملم', v_en: '65mm' },
            { k_ar: 'الارتفاع', k_en: 'Height', v_ar: `${cap === 330 ? 115 : 145} ملم`, v_en: `${cap === 330 ? 115 : 145}mm` },
            { k_ar: 'نوع الغطاء', k_en: 'Lid Type', v_ar: 'ألومنيوم سهل الفتح', v_en: 'Aluminium Easy Open' },
            { k_ar: 'درجة حرارة التحمل', k_en: 'Heat Tolerance', v_ar: 'حتى 40 درجة مئوية', v_en: 'Up to 40°C' },
            { k_ar: 'الكمية في الكرتونة', k_en: 'Units Per Case', v_ar: '100 قطعة', v_en: '100 Units' }
          ];
        } else if (cat.id === 'cat-can-plastic-cups') {
          const sizes = [12, 14, 16, 20, 24];
          const size = sizes[i-1];
          name_ar = `كوب كان بلاستيك PET مقاس ${size} أونص`;
          name_en = `${size}oz PET Plastic Can Cup`;
          desc_ar = `كوب بلاستيك بتصميم "الكان" العصري، يتميز بمتانة عالية وشفافية فائقة تظهر جمال المشروبات. الحواف ملساء ومريحة للشرب، والقاعدة مزودة بتصميم مضاد للانزلاق.`;
          desc_en = `Modern "Can Style" plastic cup, characterized by high durability and crystal clarity. Features smooth rims for comfortable drinking and an anti-slip base design.`;
          specs = [
            { k_ar: 'المقاس', k_en: 'Size', v_ar: `${size} أونص`, v_en: `${size}oz` },
            { k_ar: 'القطر العلوي', k_en: 'Top Diameter', v_ar: '95 ملم', v_en: '95mm' },
            { k_ar: 'الارتفاع', k_en: 'Height', v_ar: '150 ملم', v_en: '150mm' },
            { k_ar: 'مادة الصنع', k_en: 'Material', v_ar: 'PET نقي بلاستيك', v_en: 'Pure PET Plastic' },
            { k_ar: 'درجة الشفافية', k_en: 'Transparency', v_ar: '99% كريستالية', v_en: '99% Crystal Clear' },
            { k_ar: 'الكرتونة', k_en: 'Carton Pack', v_ar: '500 كوب', v_en: '500 Cups' }
          ];
        } else {
          name_ar = `${cat.name_ar} - منتج فاخر ${i}`;
          name_en = `${cat.name_en} - Premium Product ${i}`;
          desc_ar = `وصف منتج ${cat.name_ar} الفاخر. يتميز بجودة التصنيع والالتزام بالمعايير الصحية العالمية.`;
          desc_en = `Professional product for ${cat.name_en}. High quality manufacturing meeting international health standards.`;
          specs = [
            { k_ar: 'الخامة', k_en: 'Material', v_ar: 'خامة ورقية/بلاستيكية ممتازة', v_en: 'Premium Paper/Poly' },
            { k_ar: 'تعبئة الكرتونة', k_en: 'Packaging', v_ar: '1000 قطعة', v_en: '1000 Units' },
            { k_ar: 'المنشأ', k_en: 'Origin', v_ar: 'صناعة محلية بمواصفات عالمية', v_en: 'Local with Global Standards' }
          ];
        }

        await db.query(insertProdSql, [
          pId, cat.id, name_ar, name_en, desc_ar, desc_en, 
          price, 1000, 'active', '', i === 1 ? true : false, 
          'شحن سريع لكافة المحافظات', 'Express shipping to all regions', 
          'ضمان جودة الاستبدال', 'Replacement quality guarantee'
        ]);

        for (const s of specs) {
          await db.query('INSERT INTO product_specs (product_id, key_ar, key_en, val_ar, val_en) VALUES ($1, $2, $3, $4, $5)', 
            [pId, s.k_ar, s.k_en, s.v_ar, s.v_en]);
        }
      }
    }

    console.log('+ 90 Detailed Products Inserted (Phase 1 Deep Specs Applied).');
    console.log('--- Catalog Enhancement Completed ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seed();

