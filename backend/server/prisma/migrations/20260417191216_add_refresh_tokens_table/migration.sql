/*
  Warnings:

  - The primary key for the `refresh_tokens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `revoked` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `refresh_tokens` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(36)`.
  - You are about to alter the column `token_hash` on the `refresh_tokens` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(64)`.
  - A unique constraint covering the columns `[admin_id,token_hash]` on the table `refresh_tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `refresh_tokens` DROP FOREIGN KEY `refresh_tokens_admin_id_fkey`;

-- DropIndex
DROP INDEX `refresh_tokens_token_hash_idx` ON `refresh_tokens`;

-- DropIndex
DROP INDEX `refresh_tokens_token_hash_key` ON `refresh_tokens`;

-- AlterTable
ALTER TABLE `refresh_tokens` DROP PRIMARY KEY,
    DROP COLUMN `revoked`,
    MODIFY `id` VARCHAR(36) NOT NULL,
    MODIFY `token_hash` VARCHAR(64) NOT NULL,
    ALTER COLUMN `expires_at` DROP DEFAULT,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE UNIQUE INDEX `refresh_tokens_admin_id_token_hash_key` ON `refresh_tokens`(`admin_id`, `token_hash`);

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
