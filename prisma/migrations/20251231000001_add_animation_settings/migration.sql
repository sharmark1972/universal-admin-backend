-- Create animation_settings table
CREATE TABLE `animation_settings` (
    `id` VARCHAR(191) NOT NULL,
    `animation_type` VARCHAR(50) NOT NULL,
    `is_enabled` BOOLEAN NOT NULL DEFAULT false,
    `start_date` DATETIME(3) NULL,
    `end_date` DATETIME(3) NULL,
    `custom_message` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `animation_settings_animation_type_key`(`animation_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add indexes
CREATE INDEX `animation_settings_is_enabled_index` ON `animation_settings`(`is_enabled`);
CREATE INDEX `animation_settings_animation_type_index` ON `animation_settings`(`animation_type`);
