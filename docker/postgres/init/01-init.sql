-- IMS - Inventory Management System
-- PostgreSQL Initialization Script
-- Author: DevOps Team
-- Version: 2.0.0

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance (example)
-- These will be created by Prisma migrations, but we can add additional ones here

-- Grant permissions (if needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ims;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ims;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'IMS Database initialized successfully';
END $$;
