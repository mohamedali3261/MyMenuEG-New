import db from './db.js';

const migrate = async () => {
  try {
    console.log('🚀 Running migration: Adding old_price to products...');
    await db.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS old_price DOUBLE PRECISION');
    console.log('✅ Migration successful!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
};

migrate();
