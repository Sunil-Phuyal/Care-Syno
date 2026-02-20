// src/api/activity.api.ts
//
// Activity log API — new file, your backend needs to implement these endpoints.

import { api } from '../lib/axios';
import type { ApiResponse } from '../types/common.types';

// ── Types ──────────────────────────────────────────────
export interface Activity {
  id: number;
  type: 'medication' | 'appointment' | 'note' | 'alert' | 'vitals';
  description: string;
  patientName?: string;
  performedBy: string;
  createdAt: string;
  status?: 'completed' | 'pending' | 'missed';
}

export interface ActivityFilters {
  type?: Activity['type'];
  patientId?: number;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

// ── API Functions ──────────────────────────────────────

export const activityApi = {

  /**
   * Get activity log with optional filters
   * GET /api/v1/activity
   */
  getActivity: async (filters?: ActivityFilters): Promise<Activity[]> => {
    const response = await api.get<ApiResponse<Activity[]>>('/activity', {
      params: filters,
    });
    return response.data.apiResponseData.responseData;
  },

  /**
   * Get recent activity (last 10) for dashboard
   * GET /api/v1/activity/recent
   */
  getRecentActivity: async (): Promise<Activity[]> => {
    const response = await api.get<ApiResponse<Activity[]>>('/activity/recent');
    return response.data.apiResponseData.responseData;
  },
};