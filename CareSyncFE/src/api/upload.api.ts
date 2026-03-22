// src/api/upload.api.ts

import { api } from '../lib/axios';

interface UploadResponse {
  imageUrl: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

interface ApiResponse<T> {
  apiResponseData: {
    responseCode: string;
    responseMessage: string;
    responseData: T;
  };
}

export const uploadApi = {
  /**
   * Upload an image file to cloud storage
   * POST /api/v1/uploads/image
   */
  uploadImage: async (
    file: File,
    folder: 'users' | 'patients' | 'medications' | 'prescriptions' | 'administration-proof',
    fileName: string
  ): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    formData.append('fileName', fileName);

    const response = await api.post<ApiResponse<UploadResponse>>(
      '/uploads/image',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return response.data.apiResponseData.responseData.imageUrl;
  },
};