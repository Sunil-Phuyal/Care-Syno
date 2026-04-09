// src/api/activity.api.ts

import { api } from '../lib/axios';
import type { ApiResponse } from '../types/common.types';

export interface ActivityDTO {
  activityId:        number;
  activityType:      string;   
  description:       string;
  performedByName:   string;
  performedByEmail:  string;
  patientName:       string;
  patientId:         number;
  timestamp:         string;   
  icon:              string;
  color:             'success' | 'warning' | 'error' | 'info';
}

export const activityApi = {

  /**
   * Get recent activity across all patients this caregiver manages.
   * GET /api/v1/activity/recent?limit={limit}
   */
  getRecentActivity: async (limit = 20): Promise<ActivityDTO[]> => {
    const response = await api.get<ApiResponse<ActivityDTO[]>>('/activity/recent', {
      params: { limit },
    });
    return response.data.apiResponseData.responseData;
  },

  /**
   * Get activity for a specific patient.
   * GET /api/v1/activity?patientId={patientId}&limit={limit}
   */
  getPatientActivity: async (patientId: number, limit = 50): Promise<ActivityDTO[]> => {
    const response = await api.get<ApiResponse<ActivityDTO[]>>('/activity', {
      params: { patientId, limit },
    });
    return response.data.apiResponseData.responseData;
  },
};