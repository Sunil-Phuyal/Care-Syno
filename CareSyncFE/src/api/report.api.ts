import { api } from '../lib/axios';
import type { 
  MedicationAdherenceReport,
  PatientSummaryReport
} from '../types/report.types';
import type { ApiResponse } from '../types/common.types';

export const reportApi = {
  /**
   * Get medication adherence report
   * GET /api/v1/reports/adherence/patient/{patientId}
   */
  getAdherenceReport: async (patientId: number): Promise<MedicationAdherenceReport> => {
    const response = await api.get<any, ApiResponse<MedicationAdherenceReport>>(
      `/reports/adherence/patient/${patientId}`
    );
    return response.data;
  },

  /**
   * Get patient summary report
   * GET /api/v1/reports/summary/patient/{patientId}
   */
  getPatientSummary: async (patientId: number): Promise<PatientSummaryReport> => {
    const response = await api.get<any, ApiResponse<PatientSummaryReport>>(
      `/reports/summary/patient/${patientId}`
    );
    return response.data;
  },
};