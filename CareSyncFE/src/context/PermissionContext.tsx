import { createContext, useContext, useState, ReactNode } from 'react';
import { permissionApi } from '../api';
import type { PermissionContextType, PermissionMap, PermissionCode } from '../types/permission.types';

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: ReactNode;
}

export function PermissionProvider({ children }: PermissionProviderProps) {
  const [currentPatientId, setCurrentPatientId] = useState<number | null>(null);
  const [currentPatientPermissions, setCurrentPatientPermissions] = useState<PermissionMap | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Load permissions for a specific patient
   */
  const loadPermissions = async (patientId: number) => {
    setIsLoading(true);
    
    try {
      const response = await permissionApi.getPatientPermissions(patientId);
      
      setCurrentPatientId(patientId);
      setCurrentPatientPermissions(response.permissions);
      
      console.log('Permissions loaded for patient:', patientId, response.permissions);
    } catch (error) {
      console.error('Failed to load permissions:', error);
      setCurrentPatientId(null);
      setCurrentPatientPermissions(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if user has a specific permission for current patient
   */
  const hasPermission = (code: PermissionCode): boolean => {
    if (!currentPatientPermissions) {
      return false;
    }
    
    return currentPatientPermissions[code] === true;
  };

  /**
   * Clear all permissions (called on logout or patient deselect)
   */
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

/**
 * Hook to use permission context
 */
export function usePermissions() {
  const context = useContext(PermissionContext);
  
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  
  return context;
}