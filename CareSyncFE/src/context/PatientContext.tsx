import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { patientApi } from '../api';
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

interface PatientProviderProps {
  children: ReactNode;
}

export function PatientProvider({ children }: PatientProviderProps) {
  const { isAuthenticated } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [myPatients, setMyPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Load user's patients when authenticated
   */
  useEffect(() => {
    if (isAuthenticated) {
      loadMyPatients();
    } else {
      setMyPatients([]);
      setSelectedPatient(null);
    }
  }, [isAuthenticated]);

  /**
   * Load all patients for current user
   */
  const loadMyPatients = async () => {
    setIsLoading(true);
    
    try {
      const patients = await patientApi.getMyPatients();
      setMyPatients(patients);
      
      // Auto-select first patient if available
      if (patients.length > 0 && !selectedPatient) {
        setSelectedPatient(patients[0]);
      }
    } catch (error) {
      console.error('Failed to load patients:', error);
      setMyPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Select a patient
   */
  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  /**
   * Refresh patient list (after creating new patient)
   */
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

/**
 * Hook to use patient context
 */
export function usePatient() {
  const context = useContext(PatientContext);
  
  if (context === undefined) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  
  return context;
}