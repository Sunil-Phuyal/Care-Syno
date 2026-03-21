// src/types/medication.types.ts

export interface Medication {
  medicationId: number;
  name: string;
  dosageForm?: string;
  strength?: string;
  description?: string;
  commonSideEffects?: string;
  warnings?: string;
}

export interface MedicationSchedule {
  scheduleId: number;
  patientId: number;
  medicationId: number;
  dosage: string;
  frequency: string;
  timeOfDay?: string;
  instructions?: string;
  startDate: string;
  endDate?: string;
  prescriptionImageUrl?: string;
  medicationPhotoUrl?: string;
}

export interface CreateScheduleRequest {
  patientId: number;
  medicationId: number;
  dosage: string;
  frequency: string;
  timeOfDay?: string;
  instructions?: string;
  startDate: string;
  endDate?: string;
  prescriptionImageUrl?: string; 
  medicationPhotoUrl?: string;  
}

export interface MedicationAdministration {
  administrationId: number;
  patientId: number;
  medicationId: number;
  scheduleId?: number;
  caregiverUserId: number;
  scheduledTime?: string;
  actualTime: string;
  dosageGiven: string;
  status: 'ADMINISTERED' | 'SKIPPED' | 'MISSED' | 'REFUSED';
  notes?: string;
  sideEffects?: string;
  proofImageUrl?: string;
}

export interface LogMedicationRequest {
  patientId: number;
  medicationId: number;
  scheduleId?: number;
  scheduledTime?: string;
  actualTime: string;
  dosageGiven: string;
  status: 'ADMINISTERED' | 'SKIPPED' | 'MISSED' | 'REFUSED';
  notes?: string;
  sideEffects?: string;
  proofImageUrl?: string;        
}