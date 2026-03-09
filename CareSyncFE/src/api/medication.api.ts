// src/api/medication.api.ts

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
    const response = await api.get<ApiResponse<Medication[]>>('/medications');
    return response.data.apiResponseData.responseData;
  },

  /**
   * Get today's medication schedules (all patients)
   * GET /api/v1/medications/schedules/today
   */
  getTodaysSchedule: async (): Promise<MedicationSchedule[]> => {
    const response = await api.get<ApiResponse<MedicationSchedule[]>>(
      '/medications/schedules/today'
    );
    return response.data.apiResponseData.responseData;
  },

  /**
   * Get all medication schedules (all patients)
   * GET /api/v1/medications/schedules
   */
  getAllSchedules: async (): Promise<MedicationSchedule[]> => {
    const response = await api.get<ApiResponse<MedicationSchedule[]>>(
      '/medications/schedules'
    );
    return response.data.apiResponseData.responseData;
  },

  /**
   * Get medication schedules for a patient
   * GET /api/v1/medications/schedules/patient/{patientId}
   */
  getPatientSchedules: async (patientId: number): Promise<MedicationSchedule[]> => {
    const response = await api.get<ApiResponse<MedicationSchedule[]>>(
      `/medications/schedules/patient/${patientId}`
    );
    return response.data.apiResponseData.responseData;
  },

  /**
   * Create new medication schedule
   * POST /api/v1/medications/schedules
   */
  createSchedule: async (data: CreateScheduleRequest): Promise<MedicationSchedule> => {
    const response = await api.post<ApiResponse<MedicationSchedule>>(
      '/medications/schedules',
      data
    );
    return response.data.apiResponseData.responseData;
  },

  /**
   * Update a medication schedule
   * PUT /api/v1/medications/schedules/{id}
   */
  updateSchedule: async (id: number, data: Partial<CreateScheduleRequest>): Promise<MedicationSchedule> => {
    const response = await api.put<ApiResponse<MedicationSchedule>>(
      `/medications/schedules/${id}`,
      data
    );
    return response.data.apiResponseData.responseData;
  },

  /**
   * Delete a medication schedule
   * DELETE /api/v1/medications/schedules/{id}
   */
  deleteSchedule: async (id: number): Promise<void> => {
    await api.delete(`/medications/schedules/${id}`);
  },

  /**
   * Log medication administration
   * POST /api/v1/medications/administrations
   */
  logAdministration: async (data: LogMedicationRequest): Promise<MedicationAdministration> => {
    const response = await api.post<ApiResponse<MedicationAdministration>>(
      '/medications/administrations',
      data
    );
    return response.data.apiResponseData.responseData;
  },

  /**
   * Get medication administration history for a patient
   * GET /api/v1/medications/administrations/patient/{patientId}
   */
  getAdministrationHistory: async (patientId: number): Promise<MedicationAdministration[]> => {
    const response = await api.get<ApiResponse<MedicationAdministration[]>>(
      `/medications/administrations/patient/${patientId}`
    );
    return response.data.apiResponseData.responseData;
  },


  /**
   * Get all administration history (all patients)
   * GET /api/v1/medications/administrations
   */
  getAllHistory: async (): Promise<MedicationAdministration[]> => {
    const response = await api.get<ApiResponse<MedicationAdministration[]>>(
      '/medications/administrations'
    );
    return response.data.apiResponseData.responseData;
  },
   /**
   * Get upcoming medications for notification scheduling
   * GET /api/v1/medications/upcoming/{patientId}
   */
  getUpcomingMedications: async (patientId: number): Promise<any[]> => {
    const response = await api.get<ApiResponse<any[]>>(
      `/medications/upcoming/${patientId}`
    );
    return response.data.apiResponseData.responseData;
  },
};