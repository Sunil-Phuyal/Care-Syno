// src/api/permission.api.ts

import { api } from '../lib/axios';
import type { ApiResponse } from '../types/common.types';
import type { PermissionResponse } from '../types/permission.types';

export const permissionApi = {

  /**
   * Get all permissions for a caregiver on a patient
   * GET /api/v1/caregivers/patient/{patientId}/permissions
   */
  getPatientPermissions: async (patientId: number): Promise<PermissionResponse> => {
    const response = await api.get<ApiResponse<PermissionResponse>>(
      `/caregivers/patient/${patientId}/permissions`
    );
    return response.data.apiResponseData.responseData;
  },
};