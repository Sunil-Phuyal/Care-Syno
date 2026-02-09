import { api } from '../lib/axios';
import type { 
  Patient, 
  CreatePatientRequest, 
  UpdatePatientRequest
} from '../types/patient.types';
import type { ApiResponse } from '../types/common.types';

export const patientApi = {
  /**
   * Get all patients for current user
   * GET /api/v1/patients
   */
  getMyPatients: async (): Promise<Patient[]> => {
    const response = await api.get<ApiResponse<Patient[]>>('/patients');
    return response.data.apiResponseData.responseData;
  },

  /**
   * Get single patient by ID
   * GET /api/v1/patients/{id}
   */
  getPatient: async (id: number): Promise<Patient> => {
    const response = await api.get<ApiResponse<Patient>>(`/patients/${id}`);
    return response.data.apiResponseData.responseData;
  },

  /**
   * Create new patient
   * POST /api/v1/patients
   */
  createPatient: async (data: CreatePatientRequest): Promise<Patient> => {
    const response = await api.post<ApiResponse<Patient>>('/patients', data);
    return response.data.apiResponseData.responseData;
  },

  /**
   * Update existing patient
   * PUT /api/v1/patients/{id}
   */
  updatePatient: async (id: number, data: UpdatePatientRequest): Promise<Patient> => {
    const response = await api.put<ApiResponse<Patient>>(`/patients/${id}`, data);
    return response.data.apiResponseData.responseData;
  },

  /**
   * Delete patient (soft delete)
   * DELETE /api/v1/patients/{id}
   */
  deletePatient: async (id: number): Promise<void> => {
    await api.delete(`/patients/${id}`);
  },
};