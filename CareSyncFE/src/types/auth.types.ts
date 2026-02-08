// Authentication related types

export interface User {
  userId: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  roles: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  email: string;
  fullName: string;
  roles: string[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}