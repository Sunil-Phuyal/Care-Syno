// src/api/permission.api.ts

import { api } from '../lib/axios';
import type { ApiResponse } from '../types/common.types';
import type { PermissionResponse } from '../types/permission.types';

export const permissionApi = {

  /**
   * Get all permissions for current user on a patient
   * GET /api/v1/permissions/patient/{patientId}
   */
  getPatientPermissions: async (patientId: number): Promise<PermissionResponse> => {
    const response = await api.get<ApiResponse<PermissionResponse>>(
      `/permissions/patient/${patientId}`
    );
    return response.data.apiResponseData.responseData;
  },
};