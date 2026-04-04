import express from 'express';
import cors from 'cors';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import { uploadToCloudinary } from './cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Set up public dir to serve uploads
const PUBLIC_DIR = path.join(__dirname, '../public');
app.use('/uploads', express.static(path.join(PUBLIC_DIR, 'uploads')));

// Multer in-memory storage for processing via sharp
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper to remove physical file
const removeFile = (relativeUrl) => {
  if (!relativeUrl || !relativeUrl.startsWith('/uploads/')) {
    console.log(`⚠️ Skip remove: invalid URL format - ${relativeUrl}`);
    return;
  }
  
  // Cross-platform safe path joining
  const normalizedUrl = relativeUrl.replace(/\//g, path.sep);
  const filePath = path.join(PUBLIC_DIR, normalizedUrl);
  
  console.log(`🔍 Attempting to delete: ${filePath}`);
  
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`🗑️ SUCCESS: Deleted file: ${filePath}`);
    } catch (err) {
      console.error(`❌ ERROR: Failed to delete file: ${filePath}`, err);
    }
  } else {
    console.log(`❓ File not found on disk: ${filePath}`);
  }
};

// === UPLOAD API (Cloudinary + Dynamic Folders) ===
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Pass folder to Cloudinary (e.g. "home", "admin", "products")
    const pageFolder = req.body.page || 'general';
    
    // Upload to Cloudinary instead of local disk
    const result = await uploadToCloudinary(req.file.buffer, pageFolder);

    console.log(`🚀 Uploaded to Cloudinary: ${result.url}`);
    res.json({ success: true, url: result.url });
  } catch (err) {
    console.error('Image upload failed:', err);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

// === SETTINGS API ===
app.get('/api/settings', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM settings');
    const settings = {};
    result.rows.forEach(r => settings[r.key_name] = r.value);
    
    // Defaults
    if (!settings.cardStyle) settings.cardStyle = 'floating';
    if (!settings.backgroundStyle) settings.backgroundStyle = 'blobs';
    if (!settings.sliderInterval) settings.sliderInterval = '3';
    if (!settings.promo_enabled) settings.promo_enabled = 'false';
    if (!settings.whatsapp_enabled) settings.whatsapp_enabled = 'false';
    if (!settings.primary_color) settings.primary_color = '#eb5e28'; // Default Orange
    if (!settings.store_name) settings.store_name = 'MyMenuEG';
    if (!settings.logo_url) settings.logo_url = '';

    res.json(settings);
  } catch (err) {
    console.error('Settings fetch failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const settings = req.body;
    const upsertSql = `
      INSERT INTO settings (key_name, value) 
      VALUES ($1, $2) 
      ON CONFLICT (key_name) DO UPDATE SET value = EXCLUDED.value
    `;

    for (const key in settings) {
      if (settings[key] !== undefined) {
        await db.query(upsertSql, [key, settings[key].toString()]);
      }
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Settings save failed:', err);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// === PRODUCTS API ===
app.get('/api/products', async (req, res) => {
  try {
    const { page = 1, limit = 10, category_id, q } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let queryStr = `
      SELECT p.*, c.name_ar as cat_name_ar, c.name_en as cat_name_en 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    let countQueryStr = `SELECT COUNT(*) as total FROM products p WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (category_id && category_id !== 'all') {
      queryStr += ` AND p.category_id = $${paramIndex}`;
      countQueryStr += ` AND p.category_id = $${paramIndex}`;
      params.push(category_id);
      paramIndex++;
    }

    if (q) {
      const searchParam = `%${q}%`;
      queryStr += ` AND (p.name_ar ILIKE $${paramIndex} OR p.name_en ILIKE $${paramIndex} OR p.description_ar ILIKE $${paramIndex})`;
      countQueryStr += ` AND (p.name_ar ILIKE $${paramIndex} OR p.name_en ILIKE $${paramIndex} OR p.description_ar ILIKE $${paramIndex})`;
      params.push(searchParam);
      paramIndex++;
    }

    // Get total count
    const totalRes = await db.query(countQueryStr, params);
    const total = parseInt(totalRes.rows[0].total);

    // Add ordering and pagination
    queryStr += ` ORDER BY p.id DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const productsRes = await db.query(queryStr, [...params, Number(limit), offset]);
    const products = productsRes.rows;

    // Expand specs and images
    const fullProducts = await Promise.all(products.map(async (p) => {
      const specsRes = await db.query('SELECT * FROM product_specs WHERE product_id = $1', [p.id]);
      const imagesRes = await db.query('SELECT url FROM product_images WHERE product_id = $1', [p.id]);
      return {
        ...p,
        specs: specsRes.rows,
        images: imagesRes.rows.map(img => img.url)
      };
    }));

    res.json({
      products: fullProducts,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page)
    });
  } catch (err) {
    console.error('Products fetch failed:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const productRes = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    const product = productRes.rows[0];
    if (!product) return res.status(404).json({ error: 'Not found' });
    
    const specsRes = await db.query('SELECT * FROM product_specs WHERE product_id = $1', [product.id]);
    const imagesRes = await db.query('SELECT url FROM product_images WHERE product_id = $1', [product.id]);
    
    product.specs = specsRes.rows;
    product.images = imagesRes.rows.map(img => img.url);
    res.json(product);
  } catch (err) {
    console.error('Product detail fetch failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { 
      id, name_ar, name_en, description_ar, description_en, 
      price, old_price, stock, category_id, status, is_best_seller, 
      shipping_info_ar, shipping_info_en, warranty_info_ar, warranty_info_en, 
      carton_details_ar, carton_details_en, video_url, specs, images 
    } = req.body;

    const productId = id || Date.now().toString();
    const primaryImage = images && images.length > 0 ? images[0] : '';

    const upsertProdSql = `
      INSERT INTO products 
      (id, name_ar, name_en, description_ar, description_en, price, old_price, stock, category_id, status, is_best_seller, image_url, shipping_info_ar, shipping_info_en, warranty_info_ar, warranty_info_en, carton_details_ar, carton_details_en, video_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      ON CONFLICT (id) DO UPDATE SET
        name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en, 
        description_ar = EXCLUDED.description_ar, description_en = EXCLUDED.description_en,
        price = EXCLUDED.price, old_price = EXCLUDED.old_price, stock = EXCLUDED.stock, category_id = EXCLUDED.category_id,
        status = EXCLUDED.status, is_best_seller = EXCLUDED.is_best_seller, image_url = EXCLUDED.image_url,
        shipping_info_ar = EXCLUDED.shipping_info_ar, shipping_info_en = EXCLUDED.shipping_info_en,
        warranty_info_ar = EXCLUDED.warranty_info_ar, warranty_info_en = EXCLUDED.warranty_info_en,
        carton_details_ar = EXCLUDED.carton_details_ar, carton_details_en = EXCLUDED.carton_details_en,
        video_url = EXCLUDED.video_url
    `;
    
    await db.query(upsertProdSql, [
      productId, name_ar, name_en, description_ar, description_en, 
      price, old_price || null, stock, category_id || null, status || 'active', is_best_seller ? true : false, 
      primaryImage, shipping_info_ar || '', shipping_info_en || '', 
      warranty_info_ar || '', warranty_info_en || '', 
      carton_details_ar || '', carton_details_en || '', video_url || ''
    ]);

    // Clear mappings
    await db.query('DELETE FROM product_specs WHERE product_id = $1', [productId]);
    await db.query('DELETE FROM product_images WHERE product_id = $1', [productId]);

    // Save Specs
    if (specs && Array.isArray(specs)) {
      for (const spec of specs) {
        await db.query('INSERT INTO product_specs (product_id, key_ar, key_en, val_ar, val_en) VALUES ($1, $2, $3, $4, $5)', 
          [productId, spec.key_ar, spec.key_en, spec.val_ar, spec.val_en]);
      }
    }

    // Save Images
    if (images && Array.isArray(images)) {
      for (const url of images) {
        await db.query('INSERT INTO product_images (product_id, url) VALUES ($1, $2)', [productId, url]);
      }
    }

    res.json({ success: true, id: productId });
  } catch (err) {
    console.error('Product save failed:', err);
    res.status(500).json({ error: 'Failed to save product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get images before deleting record
    const prodRes = await db.query('SELECT image_url FROM products WHERE id = $1', [id]);
    const galleryRes = await db.query('SELECT url FROM product_images WHERE product_id = $1', [id]);

    // 2. Delete from DB
    await db.query('DELETE FROM products WHERE id = $1', [id]);

    // 3. Delete files from disk
    if (prodRes.rows[0]?.image_url) {
      removeFile(prodRes.rows[0].image_url);
    }
    galleryRes.rows.forEach(img => {
      removeFile(img.url);
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Product deletion failed:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// === ORDERS API ===
app.post('/api/orders', async (req, res) => {
  const { customer, items, total_price, coupon_id, discount_amount } = req.body;
  const orderId = 'ORD-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random()*1000).toString(36).toUpperCase();

  try {
    await db.query(`
      INSERT INTO orders (id, customer_name, phone, address, notes, total_price, status, coupon_id, discount_amount)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8)
    `, [orderId, customer.name, customer.phone, customer.address, customer.notes || '', total_price, coupon_id || null, discount_amount || 0]);

    // Update coupon usage
    if (coupon_id) {
      await db.query('UPDATE coupons SET used_count = used_count + 1 WHERE id = $1', [coupon_id]);
    }

    for (const item of items) {
      await db.query(`
        INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [orderId, item.id, item.name, item.price, item.quantity, item.price * item.quantity]);
    }
    
    res.json({ success: true, orderId });
  } catch (err) {
    console.error('Order creation failed:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const ordersRes = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    const orders = ordersRes.rows;
    const fullOrders = await Promise.all(orders.map(async (o) => {
      const itemsRes = await db.query('SELECT * FROM order_items WHERE order_id = $1', [o.id]);
      return { ...o, items: itemsRes.rows };
    }));
    res.json(fullOrders);
  } catch (err) {
    console.error('Orders fetch failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE orders SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Order status update failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM orders WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Order deletion failed:', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// === CATEGORIES API ===
app.get('/api/categories', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories');
    res.json(result.rows);
  } catch (err) {
    console.error('Categories fetch failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { id, name_ar, name_en, icon, status } = req.body;
    const catId = id || 'CAT-' + Date.now();
    const upsertSql = `
      INSERT INTO categories (id, name_ar, name_en, icon, status) 
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET
        name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en, 
        icon = EXCLUDED.icon, status = EXCLUDED.status
    `;
    await db.query(upsertSql, [catId, name_ar, name_en, icon || 'Package', status || 'active']);
    res.json({ success: true, id: catId });
  } catch (err) {
    console.error('Category save failed:', err);
    res.status(500).json({ error: 'Failed to save category' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Get icon/image before delete
    const catRes = await db.query('SELECT icon FROM categories WHERE id = $1', [id]);
    
    // 2. Delete from DB
    await db.query('DELETE FROM categories WHERE id = $1', [id]);

    // 3. Delete file if it's an upload
    if (catRes.rows[0]?.icon) {
      removeFile(catRes.rows[0].icon);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Category deletion failed:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// === SLIDES API ===
app.get('/api/slides', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM hero_slides ORDER BY order_index ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Slides fetch failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/slides', async (req, res) => {
  try {
    const { id, image_url, title_ar, title_en, subtitle_ar, subtitle_en, btn_text_ar, btn_text_en, btn_link, order_index } = req.body;
    const slideId = id || 'SLD-' + Date.now();
    const upsertSql = `
      INSERT INTO hero_slides 
      (id, image_url, title_ar, title_en, subtitle_ar, subtitle_en, btn_text_ar, btn_text_en, btn_link, order_index)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        image_url = EXCLUDED.image_url, title_ar = EXCLUDED.title_ar, title_en = EXCLUDED.title_en,
        subtitle_ar = EXCLUDED.subtitle_ar, subtitle_en = EXCLUDED.subtitle_en,
        btn_text_ar = EXCLUDED.btn_text_ar, btn_text_en = EXCLUDED.btn_text_en,
        btn_link = EXCLUDED.btn_link, order_index = EXCLUDED.order_index
    `;
    await db.query(upsertSql, [slideId, image_url, title_ar, title_en, subtitle_ar, subtitle_en, btn_text_ar, btn_text_en, btn_link, order_index || 0]);
    res.json({ success: true, id: slideId });
  } catch (err) {
    console.error('Slide save failed:', err);
    res.status(500).json({ error: 'Failed to save slide' });
  }
});

app.delete('/api/slides/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get image before delete
    const slideRes = await db.query('SELECT image_url FROM hero_slides WHERE id = $1', [id]);

    // 2. Delete from DB
    await db.query('DELETE FROM hero_slides WHERE id = $1', [id]);

    // 3. Delete file
    if (slideRes.rows[0]?.image_url) {
      removeFile(slideRes.rows[0].image_url);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Slide deletion failed:', err);
    res.status(500).json({ error: 'Failed to delete slide' });
  }
});

// === COUPONS API ===
app.get('/api/coupons', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Coupons fetch failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/coupons', async (req, res) => {
  try {
    const { id, code, type, value, min_order, usage_limit, status } = req.body;
    const upsertSql = `
      INSERT INTO coupons (id, code, type, value, min_order, usage_limit, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        code = EXCLUDED.code, type = EXCLUDED.type, value = EXCLUDED.value,
        min_order = EXCLUDED.min_order, usage_limit = EXCLUDED.usage_limit, status = EXCLUDED.status
    `;
    await db.query(upsertSql, [id || 'CPN-' + Date.now(), code, type, value, min_order, usage_limit, status || 'active']);
    res.json({ success: true });
  } catch (err) {
    console.error('Coupon save failed:', err);
    res.status(500).json({ error: 'Failed to save coupon' });
  }
});

app.post('/api/coupons/validate', async (req, res) => {
  try {
    const { code, total } = req.body;
    const result = await db.query('SELECT * FROM coupons WHERE code = $1 AND status = \'active\'', [code]);
    const coupon = result.rows[0];
    
    if (!coupon) return res.status(404).json({ message: 'Invalid code' });
    if (coupon.used_count >= coupon.usage_limit) return res.status(400).json({ message: 'Coupon usage limit reached' });
    if (total < coupon.min_order) return res.status(400).json({ message: `Min order EGP ${coupon.min_order} required` });

    res.json(coupon);
  } catch (err) {
    console.error('Coupon validation failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/coupons/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM coupons WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Coupon deletion failed:', err);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

// === TRACKING API ===
app.get('/api/orders/track/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT id, status, total_price, created_at, discount_amount FROM orders WHERE id = $1', [req.params.id]);
    const order = result.rows[0];
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('Order tracking fetch failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// === STATS API (Enhanced for Charts) ===
app.get('/api/stats', async (req, res) => {
  try {
    const totalSalesRes = await db.query("SELECT SUM(total_price) as total FROM orders WHERE status = 'delivered'");
    const totalOrdersRes = await db.query("SELECT COUNT(*) as count FROM orders");
    const totalProductsRes = await db.query("SELECT COUNT(*) as count FROM products");
    const totalCustomersRes = await db.query("SELECT COUNT(DISTINCT phone) as count FROM orders");

    // Chart Data: Last 7 Days Sales
    const salesChart = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySalesRes = await db.query(`
        SELECT SUM(total_price) as total 
        FROM orders 
        WHERE status = 'delivered' AND date(created_at) = date($1)
      `, [dateStr]);
      
      const dayOrderCountRes = await db.query(`SELECT COUNT(*) as count FROM orders WHERE date(created_at) = date($1)`, [dateStr]);
      
      salesChart.push({
        name: date.toLocaleDateString('ar-EG', { weekday: 'short' }),
        sales: parseFloat(daySalesRes.rows[0]?.total || 0),
        orders: parseInt(dayOrderCountRes.rows[0]?.count || 0)
      });
    }

    res.json({
      totalSales: parseFloat(totalSalesRes.rows[0]?.total || 0),
      totalOrders: parseInt(totalOrdersRes.rows[0]?.count || 0),
      totalProducts: parseInt(totalProductsRes.rows[0]?.count || 0),
      totalCustomers: parseInt(totalCustomersRes.rows[0]?.count || 0),
      salesChart
    });
  } catch (err) {
    console.error('Stats fetch failed', err);
    res.status(500).json({ error: 'Failed to calc stats' });
  }
});

// === NEW ORDERS NOTIFICATION POLLING ===
app.get('/api/orders/new-check', async (req, res) => {
  try {
    const { lastCheck } = req.query; // Timestamp 'YYYY-MM-DD HH:MM:SS'
    const result = await db.query(`
      SELECT COUNT(*) as count FROM orders WHERE created_at > $1
    `, [lastCheck || '1970-01-01 00:00:00']);
    res.json({ count: parseInt(result.rows[0]?.count || 0) });
  } catch (err) {
    console.error('New check polling failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// === SERVER UP ===
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Unified API Backend running on port ${PORT}`);
  });
}

export default app;
