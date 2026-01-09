-- Migration: Add performance indexes to tarteeb_requests table
-- These indexes will significantly improve query performance

-- Index on status (frequently filtered)
ALTER TABLE `tarteeb_requests` 
  ADD INDEX `idx_status` (`status`);

-- Index on zone_id (frequently filtered)
ALTER TABLE `tarteeb_requests` 
  ADD INDEX `idx_zone_id` (`zone_id`);

-- Index on mehfil_directory_id (frequently filtered)
ALTER TABLE `tarteeb_requests` 
  ADD INDEX `idx_mehfil_directory_id` (`mehfil_directory_id`);

-- Index on created_at (used for sorting)
ALTER TABLE `tarteeb_requests` 
  ADD INDEX `idx_created_at` (`created_at`);

-- Index on email (used for search)
ALTER TABLE `tarteeb_requests` 
  ADD INDEX `idx_email` (`email`);

-- Index on phone_number (used for search)
ALTER TABLE `tarteeb_requests` 
  ADD INDEX `idx_phone_number` (`phone_number`);

-- Composite index for common query pattern (zone + status + created_at)
ALTER TABLE `tarteeb_requests` 
  ADD INDEX `idx_zone_status_created` (`zone_id`, `status`, `created_at`);

-- Note: If indexes already exist, MySQL will show an error but won't break
-- You can safely ignore "Duplicate key name" errors

