// src/api/patient.api.ts

import { api } from '../lib/axios';
import type { ApiResponse } from '../types/common.types';
import type {
  Patient,
  CreatePatientRequest,
  UpdatePatientRequest,
} from '../types/patient.types';

export const patientApi = {

  /**
   * Get all patients for the logged-in caregiver
   * GET /api/v1/patients
   */
  getMyPatients: async (): Promise<Patient[]> => {
    const response = await api.get<ApiResponse<Patient[]>>('/patients');
    return response.data.apiResponseData.responseData;
  },

  /**
   * Get a single patient by ID
   * GET /api/v1/patients/{patientId}
   */
  getPatient: async (patientId: number): Promise<Patient> => {
    const response = await api.get<ApiResponse<Patient>>(`/patients/${patientId}`);
    return response.data.apiResponseData.responseData;
  },

  /**
   * Create a new patient — backend returns void (no patient data)
   * POST /api/v1/patients
   */
  createPatient: async (data: CreatePatientRequest): Promise<void> => {
    await api.post('/patients', data);
  },

  /**
   * Update an existing patient
   * PUT /api/v1/patients/{patientId}
   */
  updatePatient: async (patientId: number, data: UpdatePatientRequest): Promise<Patient> => {
    const response = await api.put<ApiResponse<Patient>>(`/patients/${patientId}`, data);
    return response.data.apiResponseData.responseData;
  },

  /**
   * Delete a patient (soft delete on backend)
   * DELETE /api/v1/patients/{patientId}
   */
  deletePatient: async (patientId: number): Promise<void> => {
    await api.delete(`/patients/${patientId}`);
  },
};