-- Database initialization script
-- Run this script to create all tables manually if needed
-- Note: TypeORM will handle table creation automatically in development mode with synchronize: true

-- Create database (run this manually if needed)
-- CREATE DATABASE job_platform;

-- Create enum type for application status
CREATE TYPE application_status_enum AS ENUM ('pending', 'reviewing', 'accepted', 'rejected');

-- Create organization table
CREATE TABLE IF NOT EXISTS organization (
    org_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    role_name VARCHAR(255) NOT NULL,
    role_access TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_roles_organization FOREIGN KEY (org_id) REFERENCES organization(org_id) ON DELETE CASCADE
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    user_password VARCHAR(255) NOT NULL,
    role_id UUID NOT NULL,
    org_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT,
    CONSTRAINT fk_users_organization FOREIGN KEY (org_id) REFERENCES organization(org_id) ON DELETE CASCADE
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    work_policy VARCHAR(100),
    location VARCHAR(255),
    department VARCHAR(100),
    employment_type VARCHAR(100),
    experience_level VARCHAR(255),
    job_type VARCHAR(100),
    salary_range VARCHAR(255),
    job_slug VARCHAR(255),
    job_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    CONSTRAINT fk_jobs_organization FOREIGN KEY (org_id) REFERENCES organization(org_id) ON DELETE CASCADE
);

-- Create application table
CREATE TABLE IF NOT EXISTS application (
    application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    org_id UUID NOT NULL,
    job_id UUID NOT NULL,
    status application_status_enum NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_application_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_application_organization FOREIGN KEY (org_id) REFERENCES organization(org_id) ON DELETE CASCADE,
    CONSTRAINT fk_application_job FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
    CONSTRAINT unique_user_job_application UNIQUE (user_id, job_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(org_id);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(user_email);
CREATE INDEX IF NOT EXISTS idx_roles_org_id ON roles(org_id);
CREATE INDEX IF NOT EXISTS idx_jobs_org_id ON jobs(org_id);
CREATE INDEX IF NOT EXISTS idx_application_user_id ON application(user_id);
CREATE INDEX IF NOT EXISTS idx_application_org_id ON application(org_id);
CREATE INDEX IF NOT EXISTS idx_application_job_id ON application(job_id);
CREATE INDEX IF NOT EXISTS idx_application_status ON application(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_job_slug ON jobs(job_slug) WHERE job_slug IS NOT NULL;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_organization_updated_at BEFORE UPDATE ON organization
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
