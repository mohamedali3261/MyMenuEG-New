ALTER TABLE products
  ADD COLUMN IF NOT EXISTS brand_ar VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS brand_en VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS material_ar VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS material_en VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS dimensions_ar VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS dimensions_en VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS usage_notes_ar TEXT NULL,
  ADD COLUMN IF NOT EXISTS usage_notes_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS template_key VARCHAR(100) NULL;

CREATE TABLE IF NOT EXISTS product_detail_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(100) NULL,
  label_ar VARCHAR(255) NULL,
  label_en VARCHAR(255) NULL,
  value_ar TEXT NULL,
  value_en TEXT NULL,
  order_index INT DEFAULT 0,
  INDEX product_id (product_id),
  CONSTRAINT product_detail_items_ibfk_1
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(100) NULL,
  label_ar VARCHAR(255) NULL,
  label_en VARCHAR(255) NULL,
  sku VARCHAR(100) NULL,
  price FLOAT NOT NULL,
  old_price FLOAT DEFAULT 0,
  stock INT DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  INDEX product_id (product_id),
  CONSTRAINT product_variants_ibfk_1
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
);
