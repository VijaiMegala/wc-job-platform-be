-- Migration script to update jobs table structure
-- Run this script to update the jobs table with new fields

-- Step 1: Add new columns
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS work_policy VARCHAR(100),
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS employment_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS salary_range VARCHAR(255),
ADD COLUMN IF NOT EXISTS job_slug VARCHAR(255);

-- Step 2: Rename existing columns
ALTER TABLE jobs 
RENAME COLUMN job_title TO title;

ALTER TABLE jobs 
RENAME COLUMN job_location TO location;

ALTER TABLE jobs 
RENAME COLUMN experience TO experience_level;

-- Step 3: Make job_description nullable (if it's currently NOT NULL)
ALTER TABLE jobs 
ALTER COLUMN job_description DROP NOT NULL;

-- Step 4: Add unique constraint on job_slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_job_slug ON jobs(job_slug) WHERE job_slug IS NOT NULL;

-- Step 5: Migrate existing data (optional - if you want to preserve old data)
-- Note: This assumes you want to copy job_title to title, etc.
-- Since we're renaming columns, the data should be preserved automatically

-- If you need to backfill job_slug from title, you can run:
-- UPDATE jobs 
-- SET job_slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g'))
-- WHERE job_slug IS NULL;

