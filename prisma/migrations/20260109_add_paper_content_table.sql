-- CreateTable
CREATE TABLE IF NOT EXISTS `paper_contents` (
  `id` VARCHAR(191) NOT NULL,
  `paper_id` VARCHAR(191) NOT NULL,
  `introduction` LONGTEXT NULL,
  `methodology` LONGTEXT NULL,
  `results` LONGTEXT NULL,
  `discussion` LONGTEXT NULL,
  `conclusion` LONGTEXT NULL,
  `references` LONGTEXT NULL,
  `images` JSON NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,

  UNIQUE INDEX `paper_contents_paper_id_key`(`paper_id`),
  INDEX `paper_contents_paper_id_idx`(`paper_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `paper_contents` ADD CONSTRAINT `paper_contents_paper_id_fkey` FOREIGN KEY (`paper_id`) REFERENCES `papers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
