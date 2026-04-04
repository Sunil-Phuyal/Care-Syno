// src/api/caregiver.api.ts

import { api } from '../lib/axios';
import type { ApiResponse } from '../types/common.types';
import type {
  Caregiver,
  InviteCaregiverRequest,
  GrantPermissionRequest,
} from '../types/caregiver.types';

export const caregiverApi = {

  /**
   * Get all caregivers for a patient
   * GET /api/v1/caregivers/patient/{patientId}
   */
  getPatientCaregivers: async (patientId: number): Promise<Caregiver[]> => {
    const response = await api.get<ApiResponse<Caregiver[]>>(
      `/caregivers/patient/${patientId}`
    );
    return response.data.apiResponseData.responseData;
  },

  /**
   * Invite a new caregiver to a patient's care team
   * POST /api/v1/caregivers/invite
   */
  inviteCaregiver: async (data: InviteCaregiverRequest): Promise<void> => {
    await api.post('/caregivers/invite', data);
  },

  /**
   * Remove a caregiver from a patient's care team
   * DELETE /api/v1/caregivers/patient/{patientId}/caregiver/{caregiverId}
   */
  removeCaregiver: async (patientId: number, caregiverUserId: number): Promise<void> => {
    await api.delete(`/caregivers/patient/${patientId}/caregiver/${caregiverUserId}`);
  },

  /**
   * Grant or revoke a specific permission for a caregiver
   * POST /api/v1/caregivers/permissions
   */
  grantPermission: async (data: GrantPermissionRequest): Promise<void> => {
    await api.post('/caregivers/permissions', {
      patientId:        data.patientId,
      caregiverUserId:  data.caregiverUserId,
      permissionCode:   data.permissionCode,
      isGranted:        data.granted,
    });
  },

  /**
   * Accept a caregiver invite using a token
   * POST /api/v1/caregivers/accept-invite
   */
  acceptInvite: async (data: {
    token: string;
    password: string;
    confirmPassword: string;
    phoneNumber?: string;
  }): Promise<void> => {
    await api.post('/caregivers/accept-invite', data);
  },
};