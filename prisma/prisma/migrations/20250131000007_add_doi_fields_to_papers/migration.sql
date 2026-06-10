-- Add DOI fields to papers table
-- Migration: 20250131000007_add_doi_fields_to_papers

ALTER TABLE papers 
ADD COLUMN doi VARCHAR(200) AFTER issue_id,
ADD COLUMN doi_status ENUM('PENDING', 'REGISTERED', 'FAILED', 'SUBMITTED') DEFAULT 'PENDING' AFTER doi,
ADD COLUMN doi_registered_at DATETIME(3) NULL AFTER doi_status,
ADD COLUMN crossref_metadata JSON NULL AFTER doi_registered_at;

-- Add indexes for DOI fields
CREATE INDEX idx_papers_doi ON papers(doi);
CREATE INDEX idx_papers_doi_status ON papers(doi_status);

-- Update existing published papers to have PENDING DOI status
UPDATE papers 
SET doi_status = 'PENDING' 
WHERE status = 'PUBLISHED' AND doi IS NULL;