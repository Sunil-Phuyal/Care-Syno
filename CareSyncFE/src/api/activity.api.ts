// src/api/activity.api.ts

import { api } from '../lib/axios';
import type { ApiResponse } from '../types/common.types';

// ─────────────────────────────────────────────────────────────
// ActivityDTO — matches backend ActivityService.toActivityDTO()
// Field names must match exactly what the backend builder sets.
//
// Backend fields:
//   activityId, activityType, description, performedByName,
//   performedByEmail, patientName, patientId, timestamp,
//   icon, color
// ─────────────────────────────────────────────────────────────
export interface ActivityDTO {
  activityId:        number;
  activityType:      string;   // e.g. "MEDICATION_ADMINISTERED", "MEDICATION_MISSED"
  description:       string;
  performedByName:   string;
  performedByEmail:  string;
  patientName:       string;
  patientId:         number;
  timestamp:         string;   // ISO string from LocalDateTime
  icon:              string;
  color:             'success' | 'warning' | 'error' | 'info';
}

// ─────────────────────────────────────────────────────────────
// API functions — params match backend controller exactly
//
// Backend endpoints:
//   GET /api/v1/activity/recent?limit=20
//   GET /api/v1/activity?patientId=X&limit=50
// ─────────────────────────────────────────────────────────────
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