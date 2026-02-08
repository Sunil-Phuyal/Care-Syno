// Patient related types

export interface Patient {
  patientId: number;
  fullName: string;
  dateOfBirth: string;
  age?: number;
  gender?: string;
  phoneNumber?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  profileImageUrl?: string;
}

export interface CreatePatientRequest {
  fullName: string;
  dateOfBirth: string;
  gender?: string;
  phoneNumber?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface UpdatePatientRequest extends CreatePatientRequest {}