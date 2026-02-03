-- ============================================================
-- CARESYNC - AUTH SEED DATA
-- Purpose: Initialize roles and permissions
-- Author: Sunil Phuyal
-- Version: 1.0
-- ============================================================

SET search_path TO auth;

-- ============================================================
-- STEP 1: SEED ROLES (4 roles)
-- ============================================================

INSERT INTO auth.roles (role_name, display_name, description, created_by, record_status)
VALUES
    ('ROLE_ADMIN',
     'Administrator',
     'System administrator with full access to all features and data',
     'system',
     'Y'),

    ('ROLE_PRIMARY_CAREGIVER',
     'Primary Caregiver',
     'Main family caregiver with full patient management and care coordination rights',
     'system',
     'Y'),

    ('ROLE_SECONDARY_CAREGIVER',
     'Secondary Caregiver',
     'Supporting family caregiver with limited permissions for basic care tasks',
     'system',
     'Y'),

    ('ROLE_HEALTHCARE_PROVIDER',
     'Healthcare Provider',
     'Doctor or medical professional with read access and schedule management rights',
     'system',
     'Y')
    ON CONFLICT (role_name) DO NOTHING;

-- ============================================================
-- STEP 2: SEED PERMISSIONS (18 permissions across 5 categories)
-- ============================================================

-- CATEGORY: PATIENT (3 permissions)
INSERT INTO auth.permissions (permission_code, permission_name, description, category, created_by, record_status)
VALUES
    ('patient.view',
     'View Patient Information',
     'View patient profile, medical history, conditions, and emergency contacts',
     'PATIENT',
     'system',
     'Y'),

    ('patient.edit',
     'Edit Patient Information',
     'Edit patient profile, update emergency contacts, and modify medical conditions',
     'PATIENT',
     'system',
     'Y'),

    ('patient.delete',
     'Delete Patient',
     'Delete or archive patient profile (soft delete recommended)',
     'PATIENT',
     'system',
     'Y')
    ON CONFLICT (permission_code) DO NOTHING;

-- CATEGORY: MEDICATION (8 permissions)
INSERT INTO auth.permissions (permission_code, permission_name, description, category, created_by, record_status)
VALUES
    ('medication.view',
     'View Medications',
     'View medication schedules, details, and dosage information',
     'MEDICATION',
     'system',
     'Y'),

    ('medication.create_schedule',
     'Create Medication Schedule',
     'Add new medication to patient schedule with dosage and timing',
     'MEDICATION',
     'system',
     'Y'),

    ('medication.edit_schedule',
     'Edit Medication Schedule',
     'Modify medication dosage, timing, frequency, or special instructions',
     'MEDICATION',
     'system',
     'Y'),

    ('medication.delete_schedule',
     'Delete Medication Schedule',
     'Remove medication from patient schedule',
     'MEDICATION',
     'system',
     'Y'),

    ('medication.administer',
     'Administer Medication (Oral/Topical)',
     'Log oral or topical medication administration',
     'MEDICATION',
     'system',
     'Y'),

    ('medication.administer_injection',
     'Administer Injection',
     'Log injection administration (requires medical training)',
     'MEDICATION',
     'system',
     'Y'),

    ('medication.skip',
     'Skip Medication',
     'Mark medication as intentionally skipped with reason',
     'MEDICATION',
     'system',
     'Y'),

    ('medication.view_history',
     'View Medication History',
     'View complete medication administration history and adherence records',
     'MEDICATION',
     'system',
     'Y')
    ON CONFLICT (permission_code) DO NOTHING;

-- CATEGORY: CAREGIVER (4 permissions)
INSERT INTO auth.permissions (permission_code, permission_name, description, category, created_by, record_status)
VALUES
    ('caregiver.view',
     'View Caregivers',
     'View list of caregivers on patient care team',
     'CAREGIVER',
     'system',
     'Y'),

    ('caregiver.invite',
     'Invite Caregivers',
     'Invite family members or professionals to join care team',
     'CAREGIVER',
     'system',
     'Y'),

    ('caregiver.remove',
     'Remove Caregivers',
     'Remove caregiver from patient care team',
     'CAREGIVER',
     'system',
     'Y'),

    ('caregiver.edit_permissions',
     'Edit Caregiver Permissions',
     'Grant or revoke specific permissions for other caregivers',
     'CAREGIVER',
     'system',
     'Y')
    ON CONFLICT (permission_code) DO NOTHING;

-- CATEGORY: REPORT (2 permissions)
INSERT INTO auth.permissions (permission_code, permission_name, description, category, created_by, record_status)
VALUES
    ('report.view',
     'View Reports',
     'View care reports, adherence statistics, and medication history summaries',
     'REPORT',
     'system',
     'Y'),

    ('report.export',
     'Export Reports',
     'Export care reports as PDF or CSV for healthcare providers',
     'REPORT',
     'system',
     'Y')
    ON CONFLICT (permission_code) DO NOTHING;

-- CATEGORY: MEDICAL (1 permission)
INSERT INTO auth.permissions (permission_code, permission_name, description, category, created_by, record_status)
VALUES
    ('medical.record_vitals',
     'Record Vital Signs',
     'Record blood pressure, temperature, pulse, and other vital signs (professional caregivers)',
     'MEDICAL',
     'system',
     'Y')
    ON CONFLICT (permission_code) DO NOTHING;

-- ============================================================
-- STEP 3: ROLE-PERMISSION MAPPINGS
-- ============================================================

-- ------------------------------------------------------------
-- ROLE 1: ADMIN - ALL PERMISSIONS (18 permissions)
-- ------------------------------------------------------------
INSERT INTO auth.role_permissions (role_id, permission_id, is_granted, created_by, record_status)
SELECT
    r.role_id,
    p.permission_id,
    TRUE,
    'system',
    'Y'
FROM auth.roles r
         CROSS JOIN auth.permissions p
WHERE r.role_name = 'ROLE_ADMIN'
  AND p.record_status = 'Y'
    ON CONFLICT ON CONSTRAINT uk_role_permission DO NOTHING;

-- ------------------------------------------------------------
-- ROLE 2: PRIMARY_CAREGIVER - 16 permissions
-- (All except: injection, vitals)
-- ------------------------------------------------------------
INSERT INTO auth.role_permissions (role_id, permission_id, is_granted, created_by, record_status)
SELECT
    r.role_id,
    p.permission_id,
    TRUE,
    'system',
    'Y'
FROM auth.roles r
         CROSS JOIN auth.permissions p
WHERE r.role_name = 'ROLE_PRIMARY_CAREGIVER'
  AND p.permission_code IN (
    -- PATIENT (3)
                            'patient.view',
                            'patient.edit',
                            'patient.delete',

    -- MEDICATION (7 - excluding injection)
                            'medication.view',
                            'medication.create_schedule',
                            'medication.edit_schedule',
                            'medication.delete_schedule',
                            'medication.administer',
                            'medication.skip',
                            'medication.view_history',

    -- CAREGIVER (4)
                            'caregiver.view',
                            'caregiver.invite',
                            'caregiver.remove',
                            'caregiver.edit_permissions',

    -- REPORT (2)
                            'report.view',
                            'report.export'
    )
    ON CONFLICT ON CONSTRAINT uk_role_permission DO NOTHING;

-- ------------------------------------------------------------
-- ROLE 3: SECONDARY_CAREGIVER - 7 permissions
-- (View and basic administration only)
-- ------------------------------------------------------------
INSERT INTO auth.role_permissions (role_id, permission_id, is_granted, created_by, record_status)
SELECT
    r.role_id,
    p.permission_id,
    TRUE,
    'system',
    'Y'
FROM auth.roles r
         CROSS JOIN auth.permissions p
WHERE r.role_name = 'ROLE_SECONDARY_CAREGIVER'
  AND p.permission_code IN (
    -- PATIENT (1)
                            'patient.view',

    -- MEDICATION (4)
                            'medication.view',
                            'medication.administer',
                            'medication.skip',
                            'medication.view_history',

    -- CAREGIVER (1)
                            'caregiver.view',

    -- REPORT (1)
                            'report.view'
    )
    ON CONFLICT ON CONSTRAINT uk_role_permission DO NOTHING;

-- ------------------------------------------------------------
-- ROLE 4: HEALTHCARE_PROVIDER - 8 permissions
-- (Read-only + schedule management)
-- ------------------------------------------------------------
INSERT INTO auth.role_permissions (role_id, permission_id, is_granted, created_by, record_status)
SELECT
    r.role_id,
    p.permission_id,
    TRUE,
    'system',
    'Y'
FROM auth.roles r
         CROSS JOIN auth.permissions p
WHERE r.role_name = 'ROLE_HEALTHCARE_PROVIDER'
  AND p.permission_code IN (
    -- PATIENT (1)
                            'patient.view',

    -- MEDICATION (5)
                            'medication.view',
                            'medication.create_schedule',
                            'medication.edit_schedule',
                            'medication.view_history',

    -- CAREGIVER (1)
                            'caregiver.view',

    -- REPORT (2)
                            'report.view',
                            'report.export'
    )
    ON CONFLICT ON CONSTRAINT uk_role_permission DO NOTHING;

-- ============================================================
-- VERIFICATION SECTION (Optional - for debugging)
-- ============================================================

-- Uncomment to verify seed data

/*
-- Check roles inserted
SELECT role_id, role_name, display_name
FROM auth.roles
ORDER BY role_id;

-- Check permissions inserted
SELECT permission_id, permission_code, category
FROM auth.permissions
ORDER BY category, permission_code;

-- Verify permission counts per role
SELECT
    r.role_name,
    COUNT(rp.permission_id) as permission_count
FROM auth.roles r
LEFT JOIN auth.role_permissions rp ON r.role_id = rp.role_id AND rp.record_status = 'Y'
WHERE r.record_status = 'Y'
GROUP BY r.role_name
ORDER BY r.role_id;

-- Expected counts:
-- ADMIN: 18
-- PRIMARY_CAREGIVER: 16
-- SECONDARY_CAREGIVER: 7
-- HEALTHCARE_PROVIDER: 8

-- View all permissions for a specific role
SELECT
    r.role_name,
    p.permission_code,
    p.category
FROM auth.roles r
JOIN auth.role_permissions rp ON r.role_id = rp.role_id
JOIN auth.permissions p ON rp.permission_id = p.permission_id
WHERE r.role_name = 'ROLE_PRIMARY_CAREGIVER'
  AND rp.is_granted = TRUE
  AND rp.record_status = 'Y'
ORDER BY p.category, p.permission_code;
*/

-- ============================================================
-- END OF AUTH SEED DATA
-- ============================================================