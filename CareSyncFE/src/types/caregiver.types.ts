// src/types/caregiver.types.ts

export interface Caregiver {
  userId: number;       
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
  relationship?: string; 
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
}