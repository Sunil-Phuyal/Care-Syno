// api/auth.api.ts
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
    const response = await api.post<any, ApiResponse<LoginResponse>>(
      '/auth/login',
      credentials
    );
    return response.data;
  },

  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post<any, ApiResponse<User>>(
      '/auth/register',
      data
    );
    return response.data;
  },

  /**
   * Get current user info
   * GET /api/v1/auth/me
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<any, ApiResponse<User>>('/auth/me');
    return response.data;
  },
};