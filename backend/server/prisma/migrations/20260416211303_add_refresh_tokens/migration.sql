-- CreateTable
CREATE TABLE `admins` (
    `id` VARCHAR(100) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NULL,
    `permissions` TEXT NULL,
    `is_super_admin` BOOLEAN NULL DEFAULT false,
    `is_active` BOOLEAN NULL DEFAULT true,
    `last_login` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `username`(`username`),
    INDEX `admins_username_idx`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` VARCHAR(100) NOT NULL,
    `admin_id` VARCHAR(100) NOT NULL,
    `token_hash` VARCHAR(255) NOT NULL,
    `user_agent` VARCHAR(500) NULL,
    `ip_address` VARCHAR(45) NULL,
    `expires_at` TIMESTAMP(0) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `revoked` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `refresh_tokens_token_hash_key`(`token_hash`),
    INDEX `refresh_tokens_admin_id_idx`(`admin_id`),
    INDEX `refresh_tokens_token_hash_idx`(`token_hash`),
    INDEX `refresh_tokens_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `backup_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `action` VARCHAR(100) NOT NULL,
    `admin_username` VARCHAR(100) NOT NULL,
    `details` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` VARCHAR(100) NOT NULL,
    `name_ar` VARCHAR(255) NULL,
    `name_en` VARCHAR(255) NULL,
    `icon` VARCHAR(255) NULL,
    `status` VARCHAR(20) NULL DEFAULT 'active',
    `subtitle_ar` VARCHAR(255) NULL,
    `subtitle_en` VARCHAR(255) NULL,

    INDEX `categories_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coupons` (
    `id` VARCHAR(100) NOT NULL,
    `code` VARCHAR(50) NULL,
    `type` VARCHAR(20) NULL,
    `value` DOUBLE NULL,
    `min_order` DOUBLE NULL,
    `usage_limit` INTEGER NULL,
    `used_count` INTEGER NULL DEFAULT 0,
    `status` VARCHAR(20) NULL DEFAULT 'active',
    `start_date` TIMESTAMP(0) NULL,
    `end_date` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `code`(`code`),
    INDEX `coupons_code_idx`(`code`),
    INDEX `coupons_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hero_slides` (
    `id` VARCHAR(100) NOT NULL,
    `image_url` VARCHAR(255) NULL,
    `title_ar` VARCHAR(255) NULL,
    `title_en` VARCHAR(255) NULL,
    `subtitle_ar` TEXT NULL,
    `subtitle_en` TEXT NULL,
    `btn_text_ar` VARCHAR(100) NULL,
    `btn_text_en` VARCHAR(100) NULL,
    `btn_link` VARCHAR(255) NULL,
    `order_index` INTEGER NULL DEFAULT 0,
    `page_id` VARCHAR(100) NULL,

    INDEX `page_id`(`page_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `target_order_id` VARCHAR(100) NULL,
    `title_ar` VARCHAR(255) NULL,
    `title_en` VARCHAR(255) NULL,
    `message_ar` TEXT NULL,
    `message_en` TEXT NULL,
    `is_read` BOOLEAN NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `target_order_id`(`target_order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` VARCHAR(100) NULL,
    `product_id` VARCHAR(100) NULL,
    `product_name` VARCHAR(255) NULL,
    `price` DOUBLE NULL,
    `quantity` INTEGER NULL,
    `subtotal` DOUBLE NULL,

    INDEX `order_id`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` VARCHAR(100) NOT NULL,
    `customer_name` VARCHAR(255) NULL,
    `phone` VARCHAR(50) NULL,
    `email` VARCHAR(255) NULL,
    `governorate` VARCHAR(100) NULL,
    `city` VARCHAR(100) NULL,
    `address` TEXT NULL,
    `notes` TEXT NULL,
    `total_price` DOUBLE NULL,
    `status` VARCHAR(50) NULL DEFAULT 'pending',
    `payment_method` VARCHAR(20) NULL DEFAULT 'cod',
    `payment_status` VARCHAR(20) NULL DEFAULT 'pending',
    `payment_id` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,
    `discount_amount` DOUBLE NULL DEFAULT 0,
    `coupon_id` VARCHAR(100) NULL,
    `tracking_id` VARCHAR(100) NULL,

    INDEX `orders_phone_idx`(`phone`),
    INDEX `orders_status_idx`(`status`),
    INDEX `orders_created_at_idx`(`created_at`),
    INDEX `orders_status_created_at_idx`(`status`, `created_at`),
    INDEX `orders_payment_status_idx`(`payment_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` VARCHAR(100) NULL,
    `url` VARCHAR(255) NULL,

    INDEX `product_id`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_quantity_prices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` VARCHAR(100) NULL,
    `quantity_label` VARCHAR(100) NOT NULL,
    `price` DOUBLE NOT NULL,
    `old_price` DOUBLE NULL DEFAULT 0,

    INDEX `product_id`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_specs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` VARCHAR(100) NULL,
    `key_ar` VARCHAR(255) NULL,
    `key_en` VARCHAR(255) NULL,
    `val_ar` TEXT NULL,
    `val_en` TEXT NULL,

    INDEX `product_id`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` VARCHAR(100) NOT NULL,
    `name_ar` VARCHAR(255) NULL,
    `name_en` VARCHAR(255) NULL,
    `description_ar` TEXT NULL,
    `description_en` TEXT NULL,
    `price` DOUBLE NULL,
    `old_price` DOUBLE NULL,
    `stock` INTEGER NULL,
    `status` VARCHAR(20) NULL DEFAULT 'active',
    `image_url` VARCHAR(255) NULL,
    `category_id` VARCHAR(100) NULL,
    `is_best_seller` BOOLEAN NULL DEFAULT false,
    `shipping_info_ar` TEXT NULL,
    `shipping_info_en` TEXT NULL,
    `warranty_info_ar` TEXT NULL,
    `warranty_info_en` TEXT NULL,
    `video_url` TEXT NULL,
    `view_count` INTEGER NULL DEFAULT 0,
    `carton_details_ar` TEXT NULL,
    `carton_details_en` TEXT NULL,
    `page_id` VARCHAR(100) NULL,
    `brand_ar` VARCHAR(255) NULL,
    `brand_en` VARCHAR(255) NULL,
    `material_ar` VARCHAR(255) NULL,
    `material_en` VARCHAR(255) NULL,
    `dimensions_ar` VARCHAR(255) NULL,
    `dimensions_en` VARCHAR(255) NULL,
    `usage_notes_ar` TEXT NULL,
    `usage_notes_en` TEXT NULL,
    `template_key` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `category_id`(`category_id`),
    INDEX `page_id`(`page_id`),
    INDEX `products_status_idx`(`status`),
    INDEX `products_is_best_seller_idx`(`is_best_seller`),
    INDEX `products_status_category_id_idx`(`status`, `category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_detail_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` VARCHAR(100) NULL,
    `label_ar` VARCHAR(255) NULL,
    `label_en` VARCHAR(255) NULL,
    `value_ar` TEXT NULL,
    `value_en` TEXT NULL,
    `order_index` INTEGER NULL DEFAULT 0,

    INDEX `product_id`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_variants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` VARCHAR(100) NULL,
    `label_ar` VARCHAR(255) NULL,
    `label_en` VARCHAR(255) NULL,
    `sku` VARCHAR(100) NULL,
    `price` FLOAT NOT NULL,
    `old_price` FLOAT NULL DEFAULT 0,
    `stock` INTEGER NULL DEFAULT 0,
    `is_default` BOOLEAN NULL DEFAULT false,
    `option_group` VARCHAR(100) NULL,
    `color_value` VARCHAR(100) NULL,
    `size_value` VARCHAR(150) NULL,
    `swatch_value` VARCHAR(100) NULL,
    `image_url` VARCHAR(255) NULL,
    `sort_order` INTEGER NULL DEFAULT 0,

    INDEX `product_id`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `key_name` VARCHAR(100) NOT NULL,
    `value` TEXT NULL,

    PRIMARY KEY (`key_name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` VARCHAR(100) NOT NULL,
    `user_name` VARCHAR(100) NOT NULL,
    `rating` TINYINT NOT NULL,
    `comment_ar` TEXT NULL,
    `comment_en` TEXT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `product_reviews_product_id_idx`(`product_id`),
    INDEX `product_reviews_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `store_pages` (
    `id` VARCHAR(100) NOT NULL,
    `name_ar` VARCHAR(255) NULL,
    `name_en` VARCHAR(255) NULL,
    `slug` VARCHAR(255) NULL,
    `is_dynamic` BOOLEAN NULL DEFAULT true,
    `show_in_navbar` BOOLEAN NULL DEFAULT true,
    `order_index` INTEGER NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `meta_desc` TEXT NULL,
    `meta_title` VARCHAR(255) NULL,
    `status` VARCHAR(20) NULL DEFAULT 'active',
    `content_ar` TEXT NULL,
    `content_en` TEXT NULL,
    `hide_empty` BOOLEAN NULL DEFAULT true,
    `icon` VARCHAR(100) NULL,
    `layout_style` VARCHAR(20) NULL DEFAULT 'grid',
    `banner_url` VARCHAR(255) NULL,
    `banner_size` VARCHAR(20) NULL DEFAULT 'medium',
    `views` INTEGER NULL DEFAULT 0,
    `spotlight_product_id` VARCHAR(100) NULL,
    `countdown_end_date` TIMESTAMP(0) NULL,
    `show_search` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `slug`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `hero_slides` ADD CONSTRAINT `hero_slides_ibfk_1` FOREIGN KEY (`page_id`) REFERENCES `store_pages`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`target_order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `product_quantity_prices` ADD CONSTRAINT `product_quantity_prices_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `product_specs` ADD CONSTRAINT `product_specs_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`page_id`) REFERENCES `store_pages`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `product_detail_items` ADD CONSTRAINT `product_detail_items_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `product_reviews` ADD CONSTRAINT `product_reviews_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
