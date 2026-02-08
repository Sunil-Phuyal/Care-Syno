// Report related types

export interface MedicationAdherenceReport {
  patientId: number;
  patientName: string;
  totalScheduledDoses: number;
  administeredDoses: number;
  skippedDoses: number;
  missedDoses: number;
  adherencePercentage: number;
  reportPeriod: string;
}

export interface PatientSummaryReport {
  patientId: number;
  fullName: string;
  age?: number;
  dateOfBirth: string;
  activeMedicationCount: number;
  totalCaregiversCount: number;
  overallAdherencePercentage: number;
  activeMedications?: string[];
  caregivers?: string[];
}