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
  const [currentPatientId, setCurrentPatientId]                   = useState<number | null>(null);
  const [currentPatientPermissions, setCurrentPatientPermissions] = useState<PermissionMap | null>(null);
  const [isLoading, setIsLoading]                                 = useState(false);

  // Register loadPermissions with PatientContext so it gets called
  // automatically when a patient is selected or auto-selected
  useEffect(() => {
    _registerPermissionLoader(loadPermissions);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // On mount: load role-based permissions from /permissions/me
  // This covers new users who have no patients yet.
  // When a patient is selected, loadPermissions() overrides this with
  // real patient-specific permissions from /permissions/patient/{id}
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadRoleFallback = async () => {
      setIsLoading(true);
      try {
        const response = await permissionApi.getMyRolePermissions();
        // Only set if no patient permissions are loaded yet
        // (avoids race condition if patient auto-selects fast)
        setCurrentPatientPermissions((prev) => {
          if (prev === null) {
            console.log(' No patient selected — loaded role-based permissions');
            return response.permissions;
          }
          return prev;
        });
      } catch (error) {
        console.error('Failed to load role permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoleFallback();
  }, []);

  const loadPermissions = async (patientId: number) => {
    setIsLoading(true);
    try {
      const response = await permissionApi.getPatientPermissions(patientId);
      setCurrentPatientId(patientId);
      // Patient-specific permissions override the role fallback
      setCurrentPatientPermissions(response.permissions);
      console.log('✅ Permissions loaded for patient:', patientId, response.permissions);
    } catch (error) {
      console.error('Failed to load patient permissions:', error);
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