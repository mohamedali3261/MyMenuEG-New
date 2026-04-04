import Database from 'better-sqlite3';
import pool from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqliteDb = new Database(path.join(__dirname, 'database.sqlite'));

const migrate = async () => {
  console.log('🚀 Starting data migration from SQLite to PostgreSQL...');

  try {
    // 1. Migrate Categories
    const categories = sqliteDb.prepare('SELECT * FROM categories').all();
    for (const cat of categories) {
      await pool.query(
        'INSERT INTO categories (id, name_ar, name_en, icon, status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [cat.id, cat.name_ar, cat.name_en, cat.icon, cat.status]
      );
    }
    console.log(`✅ Migrated ${categories.length} categories`);

    // 2. Migrate Products
    const products = sqliteDb.prepare('SELECT * FROM products').all();
    for (const p of products) {
      await pool.query(
        `INSERT INTO products 
        (id, name_ar, name_en, description_ar, description_en, price, stock, status, image_url, category_id, is_best_seller, shipping_info_ar, shipping_info_en, warranty_info_ar, warranty_info_en, video_url, view_count, carton_details_ar, carton_details_en)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) ON CONFLICT (id) DO NOTHING`,
        [
          p.id, p.name_ar, p.name_en, p.description_ar, p.description_en, 
          p.price, p.stock, p.status, p.image_url, p.category_id, 
          p.is_best_seller ? true : false, p.shipping_info_ar, p.shipping_info_en, 
          p.warranty_info_ar, p.warranty_info_en, p.video_url, p.view_count, 
          p.carton_details_ar, p.carton_details_en
        ]
      );
    }
    console.log(`✅ Migrated ${products.length} products`);

    // 3. Migrate Specs
    const specs = sqliteDb.prepare('SELECT * FROM product_specs').all();
    for (const s of specs) {
      await pool.query(
        'INSERT INTO product_specs (product_id, key_ar, key_en, val_ar, val_en) VALUES ($1, $2, $3, $4, $5)',
        [s.product_id, s.key_ar, s.key_en, s.val_ar, s.val_en]
      );
    }
    console.log(`✅ Migrated ${specs.length} product specs`);

    // 4. Migrate Images
    const images = sqliteDb.prepare('SELECT * FROM product_images').all();
    for (const img of images) {
      await pool.query(
        'INSERT INTO product_images (product_id, url) VALUES ($1, $2)',
        [img.product_id, img.url]
      );
    }
    console.log(`✅ Migrated ${images.length} product images`);

    // 5. Migrate Settings
    const settings = sqliteDb.prepare('SELECT * FROM settings').all();
    for (const s of settings) {
      await pool.query(
        'INSERT INTO settings (key_name, value) VALUES ($1, $2) ON CONFLICT (key_name) DO UPDATE SET value = EXCLUDED.value',
        [s.key_name, s.value]
      );
    }
    console.log(`✅ Migrated ${settings.length} settings`);

    // 6. Migrate Orders
    const orders = sqliteDb.prepare('SELECT * FROM orders').all();
    for (const o of orders) {
      await pool.query(
        'INSERT INTO orders (id, customer_name, phone, address, notes, total_price, status, created_at, discount_amount, coupon_id, tracking_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (id) DO NOTHING',
        [o.id, o.customer_name, o.phone, o.address, o.notes, o.total_price, o.status, o.created_at, o.discount_amount, o.coupon_id, o.tracking_id]
      );
    }
    console.log(`✅ Migrated ${orders.length} orders`);

    // 7. Migrate Order Items
    const items = sqliteDb.prepare('SELECT * FROM order_items').all();
    for (const item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal) VALUES ($1, $2, $3, $4, $5, $6)',
        [item.order_id, item.product_id, item.product_name, item.price, item.quantity, item.subtotal]
      );
    }
    console.log(`✅ Migrated ${items.length} order items`);

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
};

migrate();
