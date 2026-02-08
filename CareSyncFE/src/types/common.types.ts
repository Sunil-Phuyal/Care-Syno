// Common types used across the application

export interface ApiResponse<T = any> {
  responseCode: string;
  responseMessage: string;
  data: T;
}

export interface ApiError {
  errorCode: string;
  message: string;
  timestamp: string;
  responseCode: string;
  responseMessage: string;
}

export interface PaginationParams {
  page: number;
  size: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}