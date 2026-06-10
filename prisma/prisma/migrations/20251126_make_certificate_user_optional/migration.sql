-- Make Certificate.userId optional
ALTER TABLE `certificates` MODIFY COLUMN `user_id` VARCHAR(191) NULL;
