// src/api/medication.api.ts

import { api } from '../lib/axios';
import type {
  Medication,
  MedicationSchedule,
  CreateScheduleRequest,
   UpdateMedicationRequest,
  AddMedicationRequest,
  MedicationAdministration,
  LogMedicationRequest,
  TodayScheduleDTO,
} from '../types/medication.types';
import type { ApiResponse } from '../types/common.types';

export const medicationApi = {

  /**
   * Get all medications (master catalog)
   * GET /api/v1/medications
   */
  getAllMedications: async (): Promise<Medication[]> => {
    const response = await api.get<ApiResponse<Medication[]>>('/medications');
    return response.data.apiResponseData.responseData;
  },

  /**
   * Search medications by name
   * GET /api/v1/medications/search/{query}
   */
  searchMedications: async (query: string): Promise<Medication[]> => {
    const response = await api.get<ApiResponse<Medication[]>>(
      `/medications/search/${query}`
    );
    return response.data.apiResponseData.responseData;
  },

  /**
   * Add a new medication to the catalog (PRIMARY only)
   * POST /api/v1/medications
   */
  addMedication: async (data: AddMedicationRequest): Promise<Medication> => {
    const response = await api.post<ApiResponse<Medication>>('/medications', data);
    return response.data.apiResponseData.responseData;
  },

  /**
   * Update an existing medication in the catalog
   * PUT /api/v1/medications/{id}
   */
  updateMedication: async (id: number, data: UpdateMedicationRequest): Promise<Medication> => {
    const response = await api.put<ApiResponse<Medication>>(
      `/medications/${id}`,
      data
    );
    return response.data.apiResponseData.responseData;
  },

  /**
   * Soft-delete a medication from the catalog
   * DELETE /api/v1/medications/{id}
   */
  deleteMedication: async (id: number): Promise<void> => {
    await api.delete(`/medications/${id}`);
  },

  /**
   * Get today's medication schedules for a patient
   * GET /api/v1/medications/schedules/today?patientId={patientId}
   */
  getTodaysSchedule: async (patientId: number): Promise<TodayScheduleDTO[]> => {
    const response = await api.get<ApiResponse<TodayScheduleDTO[]>>(
      '/medications/schedules/today',
      { params: { patientId } }
    );
    return response.data.apiResponseData.responseData;
  },

  /**
   * Get medication schedules for a specific patient
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
  createSchedule: async (data: CreateScheduleRequest): Promise<void> => {
    await api.post('/medications/schedules', data);
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