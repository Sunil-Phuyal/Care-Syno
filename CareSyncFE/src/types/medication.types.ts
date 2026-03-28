// src/types/medication.types.ts

export interface Medication {
  medicationId: number;
  medicationName: string;
  name?: string;              
  genericName?: string;
  medicationClass?: string;
  description?: string;
  commonDosages?: string;
  sideEffects?: string;
  contraindications?: string;
  medicationImageUrl?: string;
  strength?: string;
  dosageForm?: string;
  addedBy?: string;
  addedAt?: string;
}

export interface AddMedicationRequest {
  medicationName: string;
  genericName?: string;
  medicationClass?: string;
  description?: string;
  commonDosages?: string;
  sideEffects?: string;
  contraindications?: string;
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