-- PostgreSQL Database Initialization Script
-- This script creates the necessary tables for the User Management System

-- Create users_auth table for authentication data
CREATE TABLE IF NOT EXISTS users_auth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Create audit_logs table for tracking user actions
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users_auth(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth_email ON users_auth(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_role ON users_auth(role);
CREATE INDEX IF NOT EXISTS idx_users_auth_created_at ON users_auth(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users_auth table
DROP TRIGGER IF EXISTS update_users_auth_updated_at ON users_auth;
CREATE TRIGGER update_users_auth_updated_at
    BEFORE UPDATE ON users_auth
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert a default admin user for development (password: admin123)
-- Password hash for 'admin123' with bcrypt rounds=12
INSERT INTO users_auth (email, password_hash, role, is_active, email_verified)
VALUES (
    'admin@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO8G',
    'admin',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert a default regular user for development (password: user123)
-- Password hash for 'user123' with bcrypt rounds=12
INSERT INTO users_auth (email, password_hash, role, is_active, email_verified)
VALUES (
    'user@example.com',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'user',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Log the initialization
INSERT INTO audit_logs (action, resource, details)
VALUES (
    'DATABASE_INIT',
    'SYSTEM',
    '{"message": "Database initialized with default users", "admin_email": "admin@example.com", "user_email": "user@example.com"}'
);

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'PostgreSQL database initialized successfully!';
    RAISE NOTICE 'Default admin user: admin@example.com (password: admin123)';
    RAISE NOTICE 'Default regular user: user@example.com (password: user123)';
END $$;