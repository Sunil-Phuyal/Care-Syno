// src/types/medication.types.ts

export interface Medication {
  medicationId: number;
  medicationName: string;
  genericName?: string;
  description?: string;
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  medicationImageUrl?: string;
  addedBy?: string;
  addedAt?: string;
}
export interface AddMedicationRequest {
  medicationName: string;
  genericName?: string;
  description?: string;
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  medicationImageUrl?: string;
}

export interface UpdateMedicationRequest {
  medicationName?: string;
  genericName?: string;
  description?: string;
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  medicationImageUrl?: string;
}

export interface MedicationSchedule {
  scheduleId: number;
  patientId: number;
  medicationId: number;
  medicationName?: string;
  dosage: string;
  frequency: string;
  timeOfDay?: string;
  instructions?: string;
  specialInstructions?: string;
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
  times: string[];
  instructions?: string;
  specialInstructions?: string;
  startDate: string;
  endDate?: string;
  prescriptionImageUrl?: string;
  medicationPhotoUrl?: string;
}

export interface UpdateScheduleRequest {
  dosage?: string;
  frequency?: string;
  timeOfDay?: string;        // "HH:mm" e.g. "08:00"
  instructions?: string;
  startDate?: string;
  endDate?: string;
  prescriptionImageUrl?: string;
  medicationPhotoUrl?: string;
}

export interface MedicationAdministration {
  administrationId: number;
  patientId: number;
  medicationId: number;
  medicationName?: string;
  scheduleId?: number;
  // Backend returns these two field names — keep both for safety
  caregiverUserId?: number;
  administeredBy?: number;
  caregiverName?: string;
  administeredByName?: string;
  scheduledTime?: string;
  actualTime: string;
  administeredAt?: string;
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

export interface TodayScheduleDTO {
  scheduleId: number;
  medicationId: number;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  isAdministered: boolean;
  isPast: boolean;
  instructions?: string;
  administeredBy?: string | null;
  administeredAt?: string | null;
}

export interface UpcomingMedicationDTO {
  scheduleId: number;
  medicationId: number;
  medicationName: string;
  dosage: string;
  instructions?: string;
  scheduledTime: string;      
  minutesUntilDue: number;   
  isOverdue: boolean;
}