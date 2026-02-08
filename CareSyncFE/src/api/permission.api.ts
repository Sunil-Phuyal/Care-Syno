// api/permission.api.ts
import { api } from '../lib/axios';
import type { PermissionResponse } from '../types/permission.types';
import type { ApiResponse } from '../types/common.types';

export const permissionApi = {
  /**
   * Get user's permissions for a specific patient
   * GET /api/v1/permissions/patient/{patientId}
   */
  getPatientPermissions: async (patientId: number): Promise<PermissionResponse> => {
    const response = await api.get<any, ApiResponse<PermissionResponse>>(
      `/permissions/patient/${patientId}`
    );
    return response.data;
  },
};