// Caregiver related types

export interface Caregiver {
  caregiverUserId: number;
  patientId: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  roleId: number;
  roleName: string;
  roleDisplayName: string;
  invitedAt: string;
  acceptedAt?: string;
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
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
  granted: boolean;
}