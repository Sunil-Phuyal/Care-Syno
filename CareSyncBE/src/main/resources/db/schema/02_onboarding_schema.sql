-- ============================================================
-- MODULE: ONBOARDING (USER MANAGEMENT)
-- Purpose: User registration, login, account management
-- Author: Sunil Phuyal
-- Version: 1.0
-- ============================================================

SET search_path TO onboarding;

CREATE SCHEMA IF NOT EXISTS onboarding;

-- ============================================================
-- TABLE: USERS
-- All registered users in the system
-- ============================================================
CREATE TABLE IF NOT EXISTS onboarding.users (
                                                user_id INT8 GENERATED ALWAYS AS IDENTITY (
                                                INCREMENT BY 1
                                                MINVALUE 100000000000000
                                                MAXVALUE 999999999999999
                                                START 100000000000000
                                                CACHE 1
                                                NO CYCLE
) NOT NULL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    phone_number VARCHAR(20),
    profile_image_url TEXT,
    is_email_verified BOOLEAN DEFAULT FALSE NOT NULL,

    -- Soft delete fields
    deleted_at TIMESTAMP,
    deleted_by VARCHAR(100),

    -- Audit fields
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_by VARCHAR(100),
    modified_at TIMESTAMP,
    record_status CHAR(1) DEFAULT 'Y' NOT NULL CHECK (record_status IN ('A', 'I', 'P', 'Y'))
    );

COMMENT ON TABLE onboarding.users IS 'All registered users (caregivers, admins, healthcare providers)';
COMMENT ON COLUMN onboarding.users.password_hash IS 'BCrypt hashed password (strength 12)';
COMMENT ON COLUMN onboarding.users.is_email_verified IS 'Email verification status';
COMMENT ON COLUMN onboarding.users.deleted_at IS 'Soft delete timestamp';

-- ============================================================
-- TABLE: USER_ROLES
-- Links users to their default role
-- ============================================================
CREATE TABLE IF NOT EXISTS onboarding.user_roles (
                                                     user_role_id INT8 GENERATED ALWAYS AS IDENTITY (
                                                     INCREMENT BY 1
                                                     MINVALUE 100000000000000
                                                     MAXVALUE 999999999999999
                                                     START 100000000000000
                                                     CACHE 1
                                                     NO CYCLE
) NOT NULL PRIMARY KEY,
    user_id INT8 NOT NULL,
    role_id INT4 NOT NULL,

    -- Audit fields
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_by VARCHAR(100),
    modified_at TIMESTAMP,
    record_status CHAR(1) DEFAULT 'Y' NOT NULL CHECK (record_status IN ('Y', 'N')),

    -- Foreign keys (RESTRICT to force soft-delete)
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id)
    REFERENCES onboarding.users(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id)
    REFERENCES auth.roles(role_id) ON DELETE RESTRICT,

    -- Unique constraint
    CONSTRAINT uk_user_role UNIQUE (user_id, role_id)
    );

COMMENT ON TABLE onboarding.user_roles IS 'User role assignments (default role for new users)';

-- ============================================================
-- TABLE: USER_VERIFICATION_TOKENS (Optional)
-- Email verification tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS onboarding.user_verification_tokens (
                                                                   token_id INT8 GENERATED ALWAYS AS IDENTITY (
                                                                   INCREMENT BY 1
                                                                   MINVALUE 100000000000000
                                                                   MAXVALUE 999999999999999
                                                                   START 100000000000000
                                                                   CACHE 1
                                                                   NO CYCLE
) NOT NULL PRIMARY KEY,
    user_id INT8 NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,

    -- Audit fields
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_by VARCHAR(100),
    modified_at TIMESTAMP,
    record_status CHAR(1) DEFAULT 'Y' NOT NULL CHECK (record_status IN ('Y', 'N')),

    -- Foreign key
    CONSTRAINT fk_vt_user FOREIGN KEY (user_id)
    REFERENCES onboarding.users(user_id) ON DELETE CASCADE
    );

COMMENT ON TABLE onboarding.user_verification_tokens IS 'Email verification tokens (expires in 24 hours)';

-- ============================================================
-- TABLE: PASSWORD_RESET_TOKENS (Optional)
-- Password reset tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS onboarding.password_reset_tokens (
                                                                token_id INT8 GENERATED ALWAYS AS IDENTITY (
                                                                INCREMENT BY 1
                                                                MINVALUE 100000000000000
                                                                MAXVALUE 999999999999999
                                                                START 100000000000000
                                                                CACHE 1
                                                                NO CYCLE
) NOT NULL PRIMARY KEY,
    user_id INT8 NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,

    -- Audit fields
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_by VARCHAR(100),
    modified_at TIMESTAMP,
    record_status CHAR(1) DEFAULT 'Y' NOT NULL CHECK (record_status IN ('Y', 'N')),

    -- Foreign key
    CONSTRAINT fk_prt_user FOREIGN KEY (user_id)
    REFERENCES onboarding.users(user_id) ON DELETE CASCADE
    );

COMMENT ON TABLE onboarding.password_reset_tokens IS 'Password reset tokens (expires in 1 hour)';

-- ============================================================
-- INDEXES (ONBOARDING MODULE)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON onboarding.users(email) WHERE record_status = 'Y';
CREATE INDEX IF NOT EXISTS idx_users_active ON onboarding.users(user_id) WHERE record_status = 'Y';
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON onboarding.user_roles(user_id) WHERE record_status = 'Y';
CREATE INDEX IF NOT EXISTS idx_verification_token ON onboarding.user_verification_tokens(token) WHERE record_status = 'Y';
CREATE INDEX IF NOT EXISTS idx_reset_token ON onboarding.password_reset_tokens(token) WHERE record_status = 'Y';

-- ============================================================
-- END OF ONBOARDING SCHEMA
-- ============================================================