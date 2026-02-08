// Permission related types

export type PermissionCode = 
  // Patient permissions
  | 'patient.view'
  | 'patient.edit'
  | 'patient.delete'
  // Medication permissions
  | 'medication.view'
  | 'medication.create_schedule'
  | 'medication.edit_schedule'
  | 'medication.delete_schedule'
  | 'medication.administer'
  | 'medication.administer_injection'
  | 'medication.skip'
  | 'medication.view_history'
  // Caregiver permissions
  | 'caregiver.view'
  | 'caregiver.invite'
  | 'caregiver.remove'
  | 'caregiver.edit_permissions'
  // Report permissions
  | 'report.view'
  | 'report.export'
  // Medical permissions
  | 'medical.record_vitals';

export interface PermissionMap {
  [key: string]: boolean;
}

export interface PermissionResponse {
  userId: number;
  patientId: number;
  patientName: string;
  roleId: number;
  roleName: string;
  roleDisplayName: string;
  permissions: PermissionMap;
}

export interface PermissionContextType {
  currentPatientId: number | null;
  currentPatientPermissions: PermissionMap | null;
  isLoading: boolean;
  loadPermissions: (patientId: number) => Promise<void>;
  hasPermission: (code: PermissionCode) => boolean;
  clearPermissions: () => void;
}