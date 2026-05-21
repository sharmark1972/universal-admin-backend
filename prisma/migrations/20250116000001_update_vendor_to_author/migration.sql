-- Update existing VENDOR roles to AUTHOR
UPDATE users SET role = 'AUTHOR' WHERE role = 'VENDOR';

-- Add new columns to users table
ALTER TABLE `users` ADD COLUMN `is_banned` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `users` ADD COLUMN `ban_reason` TEXT;
ALTER TABLE `users` ADD COLUMN `is_warned` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `users` ADD COLUMN `warning_message` TEXT;
ALTER TABLE `users` ADD COLUMN `warning_date` DATETIME(3);

-- Add video_url column to conferences table
ALTER TABLE `conferences` ADD COLUMN `video_url` VARCHAR(1000);

-- Update the enum to replace VENDOR with AUTHOR
ALTER TABLE `users` MODIFY COLUMN `role` ENUM('ADMIN', 'STUDENT', 'REVIEWER', 'AUTHOR') NOT NULL;