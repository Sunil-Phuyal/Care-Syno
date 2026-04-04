// src/api/permission.api.ts

import { api } from '../lib/axios';
import type { ApiResponse } from '../types/common.types';
import type { PermissionResponse } from '../types/permission.types';

export const permissionApi = {

  /**
   * Get all permissions for current user on a specific patient
   * GET /api/v1/permissions/patient/{patientId}
   * Used when a patient is selected
   */
  getPatientPermissions: async (patientId: number): Promise<PermissionResponse> => {
    const response = await api.get<ApiResponse<PermissionResponse>>(
      `/permissions/patient/${patientId}`
    );
    return response.data.apiResponseData.responseData;
  },

  /**
   * Get permissions based on user's role only — no patient required
   * GET /api/v1/permissions/me
   * Used on first login before any patient is created
   */
  getMyRolePermissions: async (): Promise<PermissionResponse> => {
    const response = await api.get<ApiResponse<PermissionResponse>>(
      `/permissions/me`
    );
    return response.data.apiResponseData.responseData;
  },
};