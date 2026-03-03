// src/api/report.api.ts

import { api } from '../lib/axios';
import type { ApiResponse } from '../types/common.types';
import type {
  MedicationAdherenceReport,
  PatientSummaryReport,
} from '../types/report.types';

export const reportApi = {

  /**
   * Get medication adherence report for a patient (last 30 days)
   * GET /api/v1/reports/adherence/patient/{patientId}
   */
  getAdherenceReport: async (patientId: number): Promise<MedicationAdherenceReport> => {
    const response = await api.get<ApiResponse<MedicationAdherenceReport>>(
      `/reports/adherence/patient/${patientId}`
    );
    return response.data.apiResponseData.responseData;
  },

  /**
   * Get full patient summary report
   * GET /api/v1/reports/summary/patient/{patientId}
   */
  getPatientSummary: async (patientId: number): Promise<PatientSummaryReport> => {
    const response = await api.get<ApiResponse<PatientSummaryReport>>(
      `/reports/summary/patient/${patientId}`
    );
    return response.data.apiResponseData.responseData;
  },
};