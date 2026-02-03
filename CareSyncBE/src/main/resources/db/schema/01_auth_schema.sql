-- ============================================================
-- MODULE: AUTHENTICATION & AUTHORIZATION
-- Purpose: Roles and permissions for access control
-- Author: Sunil Phuyal
-- Version: 1.0
-- ============================================================

-- Create schema
CREATE SCHEMA IF NOT EXISTS auth;
SET search_path TO auth;

-- ============================================================
-- TABLE: ROLES
-- Static table - 4 roles only
-- ============================================================
CREATE TABLE IF NOT EXISTS auth.roles (
                                          role_id INT4 GENERATED ALWAYS AS IDENTITY (
                                          INCREMENT BY 1
                                          MINVALUE 11111
                                          MAXVALUE 99999
                                          START 11111
                                          CACHE 1
                                          NO CYCLE
) NOT NULL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Audit fields (from BaseEntity)
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_by VARCHAR(100),
    modified_at TIMESTAMP,
    record_status CHAR(1) DEFAULT 'Y' NOT NULL CHECK (record_status IN ('Y', 'N'))
    );

COMMENT ON TABLE auth.roles IS 'System roles: ADMIN, PRIMARY_CAREGIVER, SECONDARY_CAREGIVER, HEALTHCARE_PROVIDER';
COMMENT ON COLUMN auth.roles.role_name IS 'Unique identifier (e.g., ROLE_PRIMARY_CAREGIVER)';
COMMENT ON COLUMN auth.roles.record_status IS 'Y = Active, N = Inactive';

-- ============================================================
-- TABLE: PERMISSIONS
-- Static table - 18 permissions
-- ============================================================
CREATE TABLE IF NOT EXISTS auth.permissions (
                                                permission_id INT4 GENERATED ALWAYS AS IDENTITY (
                                                INCREMENT BY 1
                                                MINVALUE 11111
                                                MAXVALUE 999999
                                                START 11111
                                                CACHE 1
                                                NO CYCLE
) NOT NULL PRIMARY KEY,
    permission_code VARCHAR(100) NOT NULL UNIQUE,
    permission_name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,

    -- Audit fields
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_by VARCHAR(100),
    modified_at TIMESTAMP,
    record_status CHAR(1) DEFAULT 'Y' NOT NULL CHECK (record_status IN ('Y', 'N'))
    );

COMMENT ON TABLE auth.permissions IS 'Granular permissions for access control';
COMMENT ON COLUMN auth.permissions.permission_code IS 'Unique code (e.g., medication.edit_schedule)';
COMMENT ON COLUMN auth.permissions.category IS 'PATIENT | MEDICATION | CAREGIVER | REPORT | MEDICAL';

-- ============================================================
-- TABLE: ROLE_PERMISSIONS
-- Mapping: Which permissions each role has by default
-- ============================================================
CREATE TABLE IF NOT EXISTS auth.role_permissions (
                                                     role_permission_id INT4 GENERATED ALWAYS AS IDENTITY (
                                                     INCREMENT BY 1
                                                     MINVALUE 11111
                                                     MAXVALUE 999999
                                                     START 11111
                                                     CACHE 1
                                                     NO CYCLE
) NOT NULL PRIMARY KEY,
    role_id INT4 NOT NULL,
    permission_id INT4 NOT NULL,
    is_granted BOOLEAN DEFAULT TRUE NOT NULL,

    -- Audit fields
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_by VARCHAR(100),
    modified_at TIMESTAMP,
    record_status CHAR(1) DEFAULT 'Y' NOT NULL CHECK (record_status IN ('Y', 'N')),

    -- Foreign keys (RESTRICT prevents accidental deletion)
    CONSTRAINT fk_rp_role FOREIGN KEY (role_id)
    REFERENCES auth.roles(role_id) ON DELETE RESTRICT,
    CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id)
    REFERENCES auth.permissions(permission_id) ON DELETE RESTRICT,

    -- Unique constraint (one permission per role)
    CONSTRAINT uk_role_permission UNIQUE (role_id, permission_id)
    );

COMMENT ON TABLE auth.role_permissions IS 'Default permissions for each role';
COMMENT ON COLUMN auth.role_permissions.is_granted IS 'TRUE = granted, FALSE = explicitly denied';

-- ============================================================
-- INDEXES (AUTH MODULE)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_roles_name ON auth.roles(role_name) WHERE record_status = 'Y';
CREATE INDEX IF NOT EXISTS idx_permissions_code ON auth.permissions(permission_code) WHERE record_status = 'Y';
CREATE INDEX IF NOT EXISTS idx_permissions_category ON auth.permissions(category) WHERE record_status = 'Y';
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON auth.role_permissions(role_id) WHERE record_status = 'Y';

-- ============================================================
-- END OF AUTH SCHEMA
-- ============================================================