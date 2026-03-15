// src/context/PermissionContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { permissionApi } from '../api';
import { _registerPermissionLoader } from './PatientContext';
import type { PermissionContextType, PermissionMap, PermissionCode } from '../types/permission.types';

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: ReactNode;
}

export function PermissionProvider({ children }: PermissionProviderProps) {
  const [currentPatientId, setCurrentPatientId]               = useState<number | null>(null);
  const [currentPatientPermissions, setCurrentPatientPermissions] = useState<PermissionMap | null>(null);
  const [isLoading, setIsLoading]                             = useState(false);

  // Register loadPermissions with PatientContext so it gets called
  // automatically when a patient is selected or auto-selected
  useEffect(() => {
    _registerPermissionLoader(loadPermissions);
  }, []);

  const loadPermissions = async (patientId: number) => {
    setIsLoading(true);
    try {
      const response = await permissionApi.getPatientPermissions(patientId);
      setCurrentPatientId(patientId);
      setCurrentPatientPermissions(response.permissions);
      console.log('✅ Permissions loaded for patient:', patientId, response.permissions);
    } catch (error) {
      console.error('Failed to load permissions:', error);
      setCurrentPatientId(null);
      setCurrentPatientPermissions(null);
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (code: PermissionCode): boolean => {
    if (!currentPatientPermissions) return false;
    return currentPatientPermissions[code] === true;
  };

  const clearPermissions = () => {
    setCurrentPatientId(null);
    setCurrentPatientPermissions(null);
  };

  const value: PermissionContextType = {
    currentPatientId,
    currentPatientPermissions,
    isLoading,
    loadPermissions,
    hasPermission,
    clearPermissions,
  };

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}