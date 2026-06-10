-- CreateTable
CREATE TABLE `chief_patrons` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `title` VARCHAR(300) NOT NULL,
    `institution` VARCHAR(300) NULL,
    `image_url` VARCHAR(500) NULL,
    `bio` TEXT NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `chief_patrons_display_order_idx`(`display_order`),
    INDEX `chief_patrons_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;