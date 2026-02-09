import { api } from '../lib/axios';
import type { 
  Caregiver,
  InviteCaregiverRequest,
  GrantPermissionRequest
} from '../types/caregiver.types';
import type { ApiResponse } from '../types/common.types';

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
   * Invite new caregiver
   * POST /api/v1/caregivers/invite
   */
  inviteCaregiver: async (data: InviteCaregiverRequest): Promise<Caregiver> => {
    const response = await api.post<ApiResponse<Caregiver>>(
      '/caregivers/invite',
      data
    );
    return response.data.apiResponseData.responseData;
  },

  /**
   * Remove caregiver from patient
   * DELETE /api/v1/caregivers/patient/{patientId}/caregiver/{caregiverUserId}
   */
  removeCaregiver: async (patientId: number, caregiverUserId: number): Promise<void> => {
    await api.delete(`/caregivers/patient/${patientId}/caregiver/${caregiverUserId}`);
  },

  /**
   * Grant or revoke permission for caregiver
   * POST /api/v1/caregivers/permissions
   */
  grantPermission: async (data: GrantPermissionRequest): Promise<void> => {
    await api.post('/caregivers/permissions', data);
  },
};