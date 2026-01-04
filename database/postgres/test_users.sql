-- Test Users for HumanDNAVisualizer
-- Creates test users with different roles: ADMIN, MODERATOR, and USER
-- NOTE: All passwords are set to 'password123' (hashed with BCrypt, strength 10)
-- In production, users should change these immediately!

-- ============================================
-- INSERT TEST USERS
-- ============================================

-- Password: 'password123' (BCrypt hash)
-- Generated using: BCrypt.hashpw("password123", BCrypt.gensalt(10))
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

-- 1. ADMIN USER
INSERT INTO users (
    username,
    email,
    password,
    first_name,
    last_name,
    enabled,
    account_non_expired,
    account_non_locked,
    credentials_non_expired,
    mfa_enabled,
    created_at,
    updated_at
) VALUES (
    'admin',
    'admin@humandna.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Admin',
    'User',
    true,
    true,
    true,
    true,
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (username) DO NOTHING;

-- 2. MODERATOR USER
INSERT INTO users (
    username,
    email,
    password,
    first_name,
    last_name,
    enabled,
    account_non_expired,
    account_non_locked,
    credentials_non_expired,
    mfa_enabled,
    created_at,
    updated_at
) VALUES (
    'moderator',
    'moderator@humandna.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Moderator',
    'User',
    true,
    true,
    true,
    true,
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (username) DO NOTHING;

-- 3. REGULAR USER
INSERT INTO users (
    username,
    email,
    password,
    first_name,
    last_name,
    enabled,
    account_non_expired,
    account_non_locked,
    credentials_non_expired,
    mfa_enabled,
    created_at,
    updated_at
) VALUES (
    'testuser',
    'testuser@humandna.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Test',
    'User',
    true,
    true,
    true,
    true,
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (username) DO NOTHING;

-- ============================================
-- ASSIGN ROLES TO TEST USERS
-- ============================================

-- Admin gets all roles (ADMIN, MODERATOR, USER)
INSERT INTO user_roles (user_id, role)
SELECT id, 'ROLE_ADMIN' FROM users WHERE username = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'ROLE_MODERATOR' FROM users WHERE username = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'ROLE_USER' FROM users WHERE username = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- Moderator gets MODERATOR and USER roles
INSERT INTO user_roles (user_id, role)
SELECT id, 'ROLE_MODERATOR' FROM users WHERE username = 'moderator'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'ROLE_USER' FROM users WHERE username = 'moderator'
ON CONFLICT (user_id, role) DO NOTHING;

-- Regular user only gets USER role
INSERT INTO user_roles (user_id, role)
SELECT id, 'ROLE_USER' FROM users WHERE username = 'testuser'
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Uncomment to verify test users were created correctly:
-- SELECT u.id, u.username, u.email, u.first_name, u.last_name, ur.role
-- FROM users u
-- LEFT JOIN user_roles ur ON u.id = ur.user_id
-- WHERE u.username IN ('admin', 'moderator', 'testuser')
-- ORDER BY u.username, ur.role;

-- ============================================
-- TEST USER CREDENTIALS SUMMARY
-- ============================================

-- Username: admin
-- Password: password123
-- Email: admin@humandna.com
-- Roles: ROLE_ADMIN, ROLE_MODERATOR, ROLE_USER

-- Username: moderator
-- Password: password123
-- Email: moderator@humandna.com
-- Roles: ROLE_MODERATOR, ROLE_USER

-- Username: testuser
-- Password: password123
-- Email: testuser@humandna.com
-- Roles: ROLE_USER
