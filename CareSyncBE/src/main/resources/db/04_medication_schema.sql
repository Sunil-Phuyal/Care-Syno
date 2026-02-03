-- ============================================================
-- MODULE: MEDICATION MANAGEMENT
-- Purpose: Medication schedules and administration tracking
-- Author: Sunil Phuyal
-- Version: 1.0
-- ============================================================

SET search_path TO medication;

-- ============================================================
-- TABLE: MEDICATIONS
-- Master medication catalog
-- ============================================================
CREATE TABLE IF NOT EXISTS medication.medications (
                                                      medication_id INT8 GENERATED ALWAYS AS IDENTITY (
                                                      INCREMENT BY 1
                                                      MINVALUE 100000000000000
                                                      MAXVALUE 999999999999999
                                                      START 100000000000000
                                                      CACHE 1
                                                      NO CYCLE
) NOT NULL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    dosage_form VARCHAR(50),
    strength VARCHAR(50),
    description TEXT,
    common_side_effects TEXT,
    warnings TEXT,

    -- Audit fields
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_by VARCHAR(100),
    modified_at TIMESTAMP,
    record_status CHAR(1) DEFAULT 'Y' NOT NULL CHECK (record_status IN ('Y', 'N'))
    );

COMMENT ON TABLE medication.medications IS 'Master medication list';
COMMENT ON COLUMN medication.medications.dosage_form IS 'TABLET, LIQUID, INJECTION, CAPSULE, TOPICAL';

-- ============================================================
-- TABLE: MEDICATION_SCHEDULES
-- When and how medications should be taken
-- ============================================================
CREATE TABLE IF NOT EXISTS medication.medication_schedules (
                                                               schedule_id INT8 GENERATED ALWAYS AS IDENTITY (
                                                               INCREMENT BY 1
                                                               MINVALUE 100000000000000
                                                               MAXVALUE 999999999999999
                                                               START 100000000000000
                                                               CACHE 1
                                                               NO CYCLE
) NOT NULL PRIMARY KEY,
    patient_id INT8 NOT NULL,
    medication_id INT8 NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    time_of_day VARCHAR(200),
    instructions TEXT,
    start_date DATE NOT NULL,
    end_date DATE,

    -- Audit fields
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_by VARCHAR(100),
    modified_at TIMESTAMP,
    record_status CHAR(1) DEFAULT 'Y' NOT NULL CHECK (record_status IN ('Y', 'N')),

    -- Foreign keys
    CONSTRAINT fk_ms_patient FOREIGN KEY (patient_id)
    REFERENCES patient.patients(patient_id) ON DELETE RESTRICT,
    CONSTRAINT fk_ms_medication FOREIGN KEY (medication_id)
    REFERENCES medication.medications(medication_id) ON DELETE RESTRICT
    );

COMMENT ON TABLE medication.medication_schedules IS 'Medication schedules per patient';
COMMENT ON COLUMN medication.medication_schedules.frequency IS 'DAILY, TWICE_DAILY, THREE_TIMES_DAILY, WEEKLY, AS_NEEDED';

-- ============================================================
-- TABLE: MEDICATION_ADMINISTRATIONS
-- Log of each medication given
-- ============================================================
CREATE TABLE IF NOT EXISTS medication.medication_administrations (
                                                                     administration_id INT8 GENERATED ALWAYS AS IDENTITY (
                                                                     INCREMENT BY 1
                                                                     MINVALUE 100000000000000
                                                                     MAXVALUE 999999999999999
                                                                     START 100000000000000
                                                                     CACHE 1
                                                                     NO CYCLE
) NOT NULL PRIMARY KEY,
    patient_id INT8 NOT NULL,
    medication_id INT8 NOT NULL,
    schedule_id INT8,
    caregiver_user_id INT8,
    scheduled_time TIMESTAMP,
    actual_time TIMESTAMP NOT NULL,
    dosage_given VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    side_effects TEXT,

    -- Audit fields
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_by VARCHAR(100),
    modified_at TIMESTAMP,
    record_status CHAR(1) DEFAULT 'Y' NOT NULL CHECK (record_status IN ('Y', 'N')),

    -- Foreign keys
    CONSTRAINT fk_ma_patient FOREIGN KEY (patient_id)
    REFERENCES patient.patients(patient_id) ON DELETE RESTRICT,
    CONSTRAINT fk_ma_medication FOREIGN KEY (medication_id)
    REFERENCES medication.medications(medication_id) ON DELETE RESTRICT,
    CONSTRAINT fk_ma_schedule FOREIGN KEY (schedule_id)
    REFERENCES medication.medication_schedules(schedule_id) ON DELETE SET NULL,
    CONSTRAINT fk_ma_caregiver FOREIGN KEY (caregiver_user_id)
    REFERENCES onboarding.users(user_id) ON DELETE SET NULL
    );

COMMENT ON TABLE medication.medication_administrations IS 'Complete medication administration log';
COMMENT ON COLUMN medication.medication_administrations.status IS 'ADMINISTERED, SKIPPED, MISSED, REFUSED';
COMMENT ON COLUMN medication.medication_administrations.caregiver_user_id IS 'SET NULL on delete to preserve history';

-- ============================================================
-- INDEXES (MEDICATION MODULE)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_ms_patient ON medication.medication_schedules(patient_id) WHERE record_status = 'Y';
CREATE INDEX IF NOT EXISTS idx_ma_patient ON medication.medication_administrations(patient_id, actual_time);
CREATE INDEX IF NOT EXISTS idx_ma_duplicate_check ON medication.medication_administrations(patient_id, medication_id, actual_time);

-- ============================================================
-- END OF MEDICATION SCHEMA
-- ============================================================