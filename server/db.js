import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Helper function for async queries
export const query = (text, params) => {
  console.log(`🔍 Executing query: ${text.substring(0, 100)}...`);
  return pool.query(text, params);
};

// Initialize Tables
const initDB = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        key_name TEXT PRIMARY KEY,
        value TEXT
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name_ar TEXT,
        name_en TEXT,
        icon TEXT,
        status TEXT
      );

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name_ar TEXT,
        name_en TEXT,
        description_ar TEXT,
        description_en TEXT,
        price DOUBLE PRECISION,
        old_price DOUBLE PRECISION,
        stock INTEGER,
        status TEXT,
        image_url TEXT,
        category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
        is_best_seller BOOLEAN DEFAULT FALSE,
        shipping_info_ar TEXT,
        shipping_info_en TEXT,
        warranty_info_ar TEXT,
        warranty_info_en TEXT,
        video_url TEXT,
        view_count INTEGER DEFAULT 0,
        carton_details_ar TEXT,
        carton_details_en TEXT
      );

      CREATE TABLE IF NOT EXISTS product_specs (
        id SERIAL PRIMARY KEY,
        product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
        key_ar TEXT,
        key_en TEXT,
        val_ar TEXT,
        val_en TEXT
      );

      CREATE TABLE IF NOT EXISTS product_images (
        id SERIAL PRIMARY KEY,
        product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
        url TEXT
      );

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_name TEXT,
        phone TEXT,
        address TEXT,
        notes TEXT,
        total_price DOUBLE PRECISION,
        status TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        discount_amount DOUBLE PRECISION DEFAULT 0,
        coupon_id TEXT,
        tracking_id TEXT
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
        product_id TEXT,
        product_name TEXT,
        price DOUBLE PRECISION,
        quantity INTEGER,
        subtotal DOUBLE PRECISION
      );

      CREATE TABLE IF NOT EXISTS hero_slides (
        id TEXT PRIMARY KEY,
        image_url TEXT,
        title_ar TEXT,
        title_en TEXT,
        subtitle_ar TEXT,
        subtitle_en TEXT,
        btn_text_ar TEXT,
        btn_text_en TEXT,
        btn_link TEXT,
        order_index INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS coupons (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE,
        type TEXT, -- 'percent' or 'fixed'
        value DOUBLE PRECISION,
        min_order DOUBLE PRECISION,
        usage_limit INTEGER,
        used_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ PostgreSQL Tables initialized successfully');
  } catch (err) {
    console.error('❌ Error initializing PostgreSQL tables:', err);
    console.error('❌ Database Connection Error Details:', {
      message: err.message,
      code: err.code,
      stack: err.stack
    });
  }
};

initDB();

export default pool;

