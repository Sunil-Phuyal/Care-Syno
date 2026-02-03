-- ============================================================
-- MODULE: PATIENT MANAGEMENT
-- Purpose: Patient profiles and caregiver relationships
-- Author: Sunil Phuyal
-- Version: 1.0
-- ============================================================

SET search_path TO patient;
CREATE SCHEMA IF NOT EXISTS patient;

-- ============================================================
-- TABLE: PATIENTS
-- Elderly patients receiving care
-- ============================================================
CREATE TABLE IF NOT EXISTS patient.patients (
                                                patient_id INT8 GENERATED ALWAYS AS IDENTITY (
                                                INCREMENT BY 1
                                                MINVALUE 100000000000000
                                                MAXVALUE 999999999999999
                                                START 100000000000000
                                                CACHE 1
                                                NO CYCLE
) NOT NULL PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    phone_number VARCHAR(20),
    address TEXT,
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    profile_image_url TEXT,

    -- Soft delete fields
    deleted_at TIMESTAMP,
    deleted_by VARCHAR(100),

    -- Audit fields
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_by VARCHAR(100),
    modified_at TIMESTAMP,
    record_status CHAR(1) DEFAULT 'Y' NOT NULL CHECK (record_status IN ('Y', 'N'))
    );

COMMENT ON TABLE patient.patients IS 'Elderly patients being cared for';
COMMENT ON COLUMN patient.patients.date_of_birth IS 'For age calculation and medication dosing';

-- ============================================================
-- TABLE: PATIENT_CAREGIVERS
-- Links caregivers to patients with role PER PATIENT
-- ============================================================
CREATE TABLE IF NOT EXISTS patient.patient_caregivers (
                                                          patient_caregiver_id INT8 GENERATED ALWAYS AS IDENTITY (
                                                          INCREMENT BY 1
                                                          MINVALUE 100000000000000
                                                          MAXVALUE 999999999999999
                                                          START 100000000000000
                                                          CACHE 1
                                                          NO CYCLE
) NOT NULL PRIMARY KEY,
    patient_id INT8 NOT NULL,
    caregiver_user_id INT8 NOT NULL,
    role_id INT4 NOT NULL,
    relationship VARCHAR(50),

    -- Audit fields
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_by VARCHAR(100),
    modified_at TIMESTAMP,
    record_status CHAR(1) DEFAULT 'Y' NOT NULL CHECK (record_status IN ('Y', 'N')),

    -- Foreign keys (RESTRICT for data integrity)
    CONSTRAINT fk_pc_patient FOREIGN KEY (patient_id)
    REFERENCES patient.patients(patient_id) ON DELETE RESTRICT,
    CONSTRAINT fk_pc_user FOREIGN KEY (caregiver_user_id)
    REFERENCES onboarding.users(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_pc_role FOREIGN KEY (role_id)
    REFERENCES auth.roles(role_id) ON DELETE RESTRICT,

    -- Unique constraint (one caregiver-patient link)
    CONSTRAINT uk_patient_caregiver UNIQUE (patient_id, caregiver_user_id)
    );

COMMENT ON TABLE patient.patient_caregivers IS 'Caregiver-patient relationships with role per patient';
COMMENT ON COLUMN patient.patient_caregivers.role_id IS 'Role for THIS patient (can differ per patient)';
COMMENT ON COLUMN patient.patient_caregivers.relationship IS 'SON, DAUGHTER, SPOUSE, PROFESSIONAL, etc.';

-- ============================================================
-- TABLE: PATIENT_CAREGIVER_PERMISSIONS
-- Permission overrides per patient-caregiver pair
-- ============================================================
CREATE TABLE IF NOT EXISTS patient.patient_caregiver_permissions (
                                                                     pcp_id INT8 GENERATED ALWAYS AS IDENTITY (
                                                                     INCREMENT BY 1
                                                                     MINVALUE 100000000000000
                                                                     MAXVALUE 999999999999999
                                                                     START 100000000000000
                                                                     CACHE 1
                                                                     NO CYCLE
) NOT NULL PRIMARY KEY,
    patient_id INT8 NOT NULL,
    caregiver_user_id INT8 NOT NULL,
    permission_id INT4 NOT NULL,
    is_granted BOOLEAN NOT NULL,
    granted_by_user_id INT8,
    expires_at TIMESTAMP,
    notes TEXT,

    -- Audit fields
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_by VARCHAR(100),
    modified_at TIMESTAMP,
    record_status CHAR(1) DEFAULT 'Y' NOT NULL CHECK (record_status IN ('Y', 'N')),

    -- Foreign keys
    CONSTRAINT fk_pcp_patient FOREIGN KEY (patient_id)
    REFERENCES patient.patients(patient_id) ON DELETE RESTRICT,
    CONSTRAINT fk_pcp_user FOREIGN KEY (caregiver_user_id)
    REFERENCES onboarding.users(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_pcp_permission FOREIGN KEY (permission_id)
    REFERENCES auth.permissions(permission_id) ON DELETE RESTRICT,
    CONSTRAINT fk_pcp_granted_by FOREIGN KEY (granted_by_user_id)
    REFERENCES onboarding.users(user_id) ON DELETE SET NULL,

    -- Unique constraint
    CONSTRAINT uk_patient_caregiver_permission UNIQUE (patient_id, caregiver_user_id, permission_id)
    );

COMMENT ON TABLE patient.patient_caregiver_permissions IS 'Custom permission overrides per caregiver';
COMMENT ON COLUMN patient.patient_caregiver_permissions.is_granted IS 'TRUE = grant, FALSE = deny';
COMMENT ON COLUMN patient.patient_caregiver_permissions.expires_at IS 'NULL = permanent, else temporary';

-- ============================================================
-- INDEXES (PATIENT MODULE)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_patients_active ON patient.patients(patient_id) WHERE record_status = 'Y';
CREATE INDEX IF NOT EXISTS idx_pc_lookup ON patient.patient_caregivers(patient_id, caregiver_user_id, record_status);
CREATE INDEX IF NOT EXISTS idx_pc_caregiver ON patient.patient_caregivers(caregiver_user_id) WHERE record_status = 'Y';
CREATE INDEX IF NOT EXISTS idx_pcp_lookup ON patient.patient_caregiver_permissions(patient_id, caregiver_user_id, permission_id);
CREATE INDEX IF NOT EXISTS idx_pcp_active ON patient.patient_caregiver_permissions(patient_id, caregiver_user_id, expires_at)
    WHERE record_status = 'Y';

-- ============================================================
-- END OF PATIENT SCHEMA
-- ============================================================