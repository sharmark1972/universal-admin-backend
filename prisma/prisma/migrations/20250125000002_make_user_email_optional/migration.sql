-- Make email field optional in users table
ALTER TABLE `users` MODIFY COLUMN `email` VARCHAR(191) NULL;