// src/api/auth.api.ts

import { api } from '../lib/axios';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User
} from '../types/auth.types';
import type { ApiResponse } from '../types/common.types';

export const authApi = {

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      credentials
    );
    return response.data.apiResponseData.responseData;
  },

  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post<ApiResponse<User>>(
      '/auth/register',
      data
    );
    return response.data.apiResponseData.responseData;
  },

  /**
   * Get current user info
   * GET /api/v1/auth/me
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.apiResponseData.responseData;
  },

  /**
   * Update profile (name, phone, etc.)
   * PUT /api/v1/auth/profile
   */
  updateProfile: async (data: { fullName?: string; phone?: string }): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/auth/profile', data);
    return response.data.apiResponseData.responseData;
  },

  /**
   * Change password
   * PUT /api/v1/auth/password
   */
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.put('/auth/password', data);
  },
};