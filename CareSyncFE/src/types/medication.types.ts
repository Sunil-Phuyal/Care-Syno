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
  medicationName?: string;
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
  times: string[];               // ← array e.g. ["08:00", "20:00"]
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
  medicationName?: string;
  scheduleId?: number;
  caregiverUserId: number;
  caregiverName?: string;
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