-- Add literature_review column to paper_contents table
ALTER TABLE `paper_contents` 
ADD COLUMN `literature_review` LONGTEXT NULL AFTER `introduction`;
