import { api } from '../lib/axios';
import type { 
  Medication,
  MedicationSchedule,
  CreateScheduleRequest,
  MedicationAdministration,
  LogMedicationRequest
} from '../types/medication.types';
import type { ApiResponse } from '../types/common.types';

export const medicationApi = {
  /**
   * Get all medications (master list)
   * GET /api/v1/medications
   */
  getAllMedications: async (): Promise<Medication[]> => {
    const response = await api.get<any, ApiResponse<Medication[]>>('/medications');
    return response.data;
  },

  /**
   * Get medication schedules for a patient
   * GET /api/v1/medications/schedules/patient/{patientId}
   */
  getPatientSchedules: async (patientId: number): Promise<MedicationSchedule[]> => {
    const response = await api.get<any, ApiResponse<MedicationSchedule[]>>(
      `/medications/schedules/patient/${patientId}`
    );
    return response.data;
  },

  /**
   * Create new medication schedule
   * POST /api/v1/medications/schedules
   */
  createSchedule: async (data: CreateScheduleRequest): Promise<MedicationSchedule> => {
    const response = await api.post<any, ApiResponse<MedicationSchedule>>(
      '/medications/schedules',
      data
    );
    return response.data;
  },

  /**
   * Log medication administration
   * POST /api/v1/medications/administrations
   */
  logAdministration: async (data: LogMedicationRequest): Promise<MedicationAdministration> => {
    const response = await api.post<any, ApiResponse<MedicationAdministration>>(
      '/medications/administrations',
      data
    );
    return response.data;
  },

  /**
   * Get medication administration history
   * GET /api/v1/medications/administrations/patient/{patientId}
   */
  getAdministrationHistory: async (patientId: number): Promise<MedicationAdministration[]> => {
    const response = await api.get<any, ApiResponse<MedicationAdministration[]>>(
      `/medications/administrations/patient/${patientId}`
    );
    return response.data;
  },
};