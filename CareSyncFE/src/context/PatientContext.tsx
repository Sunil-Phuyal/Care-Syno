// src/context/PatientContext.tsx

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { patientApi } from '../api';
import { permissionApi } from '../api';
import { useAuth } from './AuthContext';
import type { Patient } from '../types/patient.types';

interface PatientContextType {
  selectedPatient: Patient | null;
  myPatients: Patient[];
  isLoading: boolean;
  selectPatient: (patient: Patient) => void;
  loadMyPatients: () => Promise<void>;
  refreshPatients: () => Promise<void>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

// Separate permission loader — lives outside context to avoid circular deps
let _permissionLoader: ((patientId: number) => Promise<void>) | null = null;
export function _registerPermissionLoader(fn: (patientId: number) => Promise<void>) {
  _permissionLoader = fn;
}

interface PatientProviderProps {
  children: ReactNode;
}

export function PatientProvider({ children }: PatientProviderProps) {
  const { isAuthenticated } = useAuth();
  const [selectedPatient, setSelectedPatient]   = useState<Patient | null>(null);
  const [myPatients, setMyPatients]             = useState<Patient[]>([]);
  const [isLoading, setIsLoading]               = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadMyPatients();
    } else {
      setMyPatients([]);
      setSelectedPatient(null);
    }
  }, [isAuthenticated]);

  const loadMyPatients = async () => {
    setIsLoading(true);
    try {
      const patients = await patientApi.getMyPatients();
      setMyPatients(patients);

      if (patients.length > 0 && !selectedPatient) {
        const first = patients[0];
        setSelectedPatient(first);
        // Load permissions for auto-selected patient
        loadPermissionsFor(first.patientId);
      }
    } catch (error) {
      console.error('Failed to load patients:', error);
      setMyPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPermissionsFor = async (patientId: number) => {
    try {
      // Use registered loader if available (PermissionContext)
      if (_permissionLoader) {
        await _permissionLoader(patientId);
      }
    } catch {
      // Silently fail — permissions will just be empty
    }
  };

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    loadPermissionsFor(patient.patientId);
  };

  const refreshPatients = async () => {
    await loadMyPatients();
  };

  const value: PatientContextType = {
    selectedPatient,
    myPatients,
    isLoading,
    selectPatient,
    loadMyPatients,
    refreshPatients,
  };

  return <PatientContext.Provider value={value}>{children}</PatientContext.Provider>;
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
}