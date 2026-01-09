-- Migration: Create khat_form_tokens table
-- This table stores tokens for public khat form links

CREATE TABLE IF NOT EXISTS `khat_form_tokens` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `token` VARCHAR(64) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_by` BIGINT UNSIGNED NULL DEFAULT NULL,
  `zone_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `mehfil_directory_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `used` TINYINT(1) NOT NULL DEFAULT 0,
  `used_at` DATETIME NULL DEFAULT NULL,
  `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_token` (`token`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_zone_id` (`zone_id`),
  KEY `idx_mehfil_directory_id` (`mehfil_directory_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

