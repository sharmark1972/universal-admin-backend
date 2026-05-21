-- CreateTable
CREATE TABLE `impact_factors` (
    `id` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `value` DOUBLE NOT NULL,
    `certificate_path` VARCHAR(500) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` VARCHAR(191) NOT NULL,

    INDEX `impact_factors_year_idx`(`year`),
    INDEX `impact_factors_is_active_idx`(`is_active`),
    INDEX `impact_factors_created_by_idx`(`created_by`),
    UNIQUE INDEX `impact_factors_year_key`(`year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `impact_factors` ADD CONSTRAINT `impact_factors_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;