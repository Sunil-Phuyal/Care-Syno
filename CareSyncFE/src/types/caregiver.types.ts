// Caregiver related types

export interface Caregiver {
  userId: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  roleName: string;
  roleDisplayName: string;
  relationship?: string;
  isActive: boolean;
}

export interface InviteCaregiverRequest {
  patientId: number;
  email: string;
  fullName: string;
  roleId: number;
  relationship?: string;
}

export interface GrantPermissionRequest {
  patientId: number;
  caregiverUserId: number;
  permissionCode: string;
  isGranted: boolean;
  expiresAt?: string;
  notes?: string;
}