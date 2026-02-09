// Centralized API exports

export { authApi } from './auth.api';
export { permissionApi } from './permission.api';
export { patientApi } from './patient.api';
export { medicationApi } from './medication.api';
export { caregiverApi } from './caregiver.api';
export { reportApi } from './report.api';

// Re-export axios instance if needed
export { api } from '../lib/axios';