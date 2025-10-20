-- PostgreSQL Schema for HumanDNAVisualizer
-- Stores genomic, phenotypic, environmental data, and security-related tables

-- ============================================
-- SECURITY TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    account_non_expired BOOLEAN DEFAULT true,
    account_non_locked BOOLEAN DEFAULT true,
    credentials_non_expired BOOLEAN DEFAULT true,

    -- MFA fields
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(255),

    -- SSO fields
    sso_provider VARCHAR(50),
    sso_id VARCHAR(255),

    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    lockout_until TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id, role)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    resource_type VARCHAR(50),
    resource_id BIGINT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN NOT NULL,
    error_message TEXT
);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(username);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);

-- ============================================
-- DATA TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS genomic_data (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    file_format VARCHAR(50) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    raw_data TEXT,
    parsed_variants TEXT,
    chromosome VARCHAR(50),
    position BIGINT,
    reference_allele VARCHAR(1000),
    alternate_allele VARCHAR(1000),
    quality DOUBLE PRECISION,
    annotations TEXT,
    CONSTRAINT genomic_data_user_id_idx INDEX (user_id),
    CONSTRAINT genomic_data_chromosome_idx INDEX (chromosome)
);

CREATE TABLE IF NOT EXISTS phenotypic_data (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fhir_json TEXT,
    category VARCHAR(100),
    code VARCHAR(100),
    value VARCHAR(500),
    unit VARCHAR(50),
    notes TEXT,
    CONSTRAINT phenotypic_data_user_id_idx INDEX (user_id),
    CONSTRAINT phenotypic_data_category_idx INDEX (category)
);

CREATE TABLE IF NOT EXISTS environmental_data (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    surveyed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diet VARCHAR(100),
    exercise_frequency VARCHAR(100),
    smoking_status VARCHAR(100),
    alcohol_consumption VARCHAR(100),
    sleep_hours VARCHAR(50),
    stress_level VARCHAR(50),
    occupation VARCHAR(255),
    location VARCHAR(255),
    additional_factors TEXT,
    CONSTRAINT environmental_data_user_id_idx INDEX (user_id)
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    session_data TEXT,
    CONSTRAINT user_sessions_user_id_idx INDEX (user_id),
    CONSTRAINT user_sessions_session_id_idx INDEX (session_id)
);

CREATE TABLE IF NOT EXISTS annotations (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    data_id BIGINT,
    data_type VARCHAR(50) NOT NULL,
    annotation_text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT annotations_user_id_idx INDEX (user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_genomic_user_format ON genomic_data(user_id, file_format);
CREATE INDEX IF NOT EXISTS idx_phenotypic_user_type ON phenotypic_data(user_id, resource_type);
CREATE INDEX IF NOT EXISTS idx_env_user_surveyed ON environmental_data(user_id, surveyed_at);
