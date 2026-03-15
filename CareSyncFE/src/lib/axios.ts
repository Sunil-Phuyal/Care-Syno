// src/lib/axios.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { storage } from '../utils/storage';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Add JWT token to every request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    // ── Check inner responseCode for all responses ──────────────────────
    // Backend always returns HTTP 200, even for errors.
    // The real status lives in apiResponseData.responseCode.
    const apiData = response.data?.apiResponseData;

    if (apiData && apiData.responseCode !== '200') {
      // Throw a real Error so every catch block in every API file gets it
      return Promise.reject(
        new Error(apiData.responseMessage || 'Request failed')
      );
    }

    return response;
  },
  (error: AxiosError) => {
    // Handle real HTTP errors (network, timeouts, etc.)
    if (error.response?.status === 401) {
      storage.clear();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    if (error.response?.status === 403) {
      console.error('Permission denied:', error.response.data);
    }

    return Promise.reject(error.response?.data || error.message);
  }
);