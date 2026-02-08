// Application constants

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9878/api/v1';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'CareSync';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  
  PATIENTS: '/patients',
  PATIENT_DETAIL: '/patients/:id',
  PATIENT_CREATE: '/patients/new',
  PATIENT_EDIT: '/patients/:id/edit',
  
  MEDICATIONS: '/medications',
  MEDICATION_CREATE: '/medications/new',
  MEDICATION_LOG: '/medications/log',
  MEDICATION_HISTORY: '/medications/history',
  
  CAREGIVERS: '/caregivers',
  CAREGIVER_INVITE: '/caregivers/invite',
  CAREGIVER_PERMISSIONS: '/caregivers/:id/permissions',
  
  REPORTS_ADHERENCE: '/reports/adherence',
  REPORTS_SUMMARY: '/reports/summary',
  
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_PASSWORD: '/settings/password',
} as const;

export const PERMISSION_CODES = {
  // Patient
  PATIENT_VIEW: 'patient.view',
  PATIENT_EDIT: 'patient.edit',
  PATIENT_DELETE: 'patient.delete',
  
  // Medication
  MEDICATION_VIEW: 'medication.view',
  MEDICATION_CREATE_SCHEDULE: 'medication.create_schedule',
  MEDICATION_EDIT_SCHEDULE: 'medication.edit_schedule',
  MEDICATION_DELETE_SCHEDULE: 'medication.delete_schedule',
  MEDICATION_ADMINISTER: 'medication.administer',
  MEDICATION_ADMINISTER_INJECTION: 'medication.administer_injection',
  MEDICATION_SKIP: 'medication.skip',
  MEDICATION_VIEW_HISTORY: 'medication.view_history',
  
  // Caregiver
  CAREGIVER_VIEW: 'caregiver.view',
  CAREGIVER_INVITE: 'caregiver.invite',
  CAREGIVER_REMOVE: 'caregiver.remove',
  CAREGIVER_EDIT_PERMISSIONS: 'caregiver.edit_permissions',
  
  // Report
  REPORT_VIEW: 'report.view',
  REPORT_EXPORT: 'report.export',
  
  // Medical
  MEDICAL_RECORD_VITALS: 'medical.record_vitals',
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'caresync_token',
  USER: 'caresync_user',
} as const;

export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  PRIMARY_CAREGIVER: 'ROLE_PRIMARY_CAREGIVER',
  SECONDARY_CAREGIVER: 'ROLE_SECONDARY_CAREGIVER',
  HEALTHCARE_PROVIDER: 'ROLE_HEALTHCARE_PROVIDER',
} as const;