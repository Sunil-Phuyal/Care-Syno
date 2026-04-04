// src/context/PermissionContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { permissionApi } from '../api';
import { _registerPermissionLoader } from './PatientContext';
import { useAuth } from './AuthContext';
import type { PermissionContextType, PermissionMap, PermissionCode } from '../types/permission.types';

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
// Role → permission map (mirrors your DB exactly)
// Used as fallback when user has no patients yet
// ─────────────────────────────────────────────────────────────────────────────
const ROLE_PERMISSION_DEFAULTS: Record<string, PermissionMap> = {
  ROLE_ADMIN: {
    'patient.view':                   true,
    'patient.edit':                   true,
    'patient.delete':                 true,
    'medication.view':                true,
    'medication.create_schedule':     true,
    'medication.edit_schedule':       true,
    'medication.delete_schedule':     true,
    'medication.administer':          true,
    'medication.administer_injection':true,
    'medication.skip':                true,
    'medication.view_history':        true,
    'caregiver.view':                 true,
    'caregiver.invite':               true,
    'caregiver.remove':               true,
    'caregiver.edit_permissions':     true,
    'report.view':                    true,
    'report.export':                  true,
    'medical.record_vitals':          true,
  },
  ROLE_PRIMARY_CAREGIVER: {
    'patient.view':                   true,
    'patient.edit':                   true,
    'patient.delete':                 true,
    'medication.view':                true,
    'medication.create_schedule':     true,
    'medication.edit_schedule':       true,
    'medication.delete_schedule':     true,
    'medication.administer':          true,
    'medication.administer_injection':false,
    'medication.skip':                true,
    'medication.view_history':        true,
    'caregiver.view':                 true,
    'caregiver.invite':               true,
    'caregiver.remove':               true,
    'caregiver.edit_permissions':     true,
    'report.view':                    true,
    'report.export':                  true,
    'medical.record_vitals':          false,
  },
  ROLE_SECONDARY_CAREGIVER: {
    'patient.view':                   true,
    'patient.edit':                   false,
    'patient.delete':                 false,
    'medication.view':                true,
    'medication.create_schedule':     false,
    'medication.edit_schedule':       false,
    'medication.delete_schedule':     false,
    'medication.administer':          true,
    'medication.administer_injection':false,
    'medication.skip':                true,
    'medication.view_history':        true,
    'caregiver.view':                 true,
    'caregiver.invite':               false,
    'caregiver.remove':               false,
    'caregiver.edit_permissions':     false,
    'report.view':                    true,
    'report.export':                  false,
    'medical.record_vitals':          false,
  },
  ROLE_HEALTHCARE_PROVIDER: {
    'patient.view':                   true,
    'patient.edit':                   false,
    'patient.delete':                 false,
    'medication.view':                true,
    'medication.create_schedule':     true,
    'medication.edit_schedule':       true,
    'medication.delete_schedule':     false,
    'medication.administer':          false,
    'medication.administer_injection':false,
    'medication.skip':                false,
    'medication.view_history':        true,
    'caregiver.view':                 true,
    'caregiver.invite':               false,
    'caregiver.remove':               false,
    'caregiver.edit_permissions':     false,
    'report.view':                    true,
    'report.export':                  true,
    'medical.record_vitals':          false,
  },
};

// Get the default permission map for a user based on their roles
// If user has multiple roles, merge them (most permissive wins)
function getDefaultPermissionsForRoles(roles: string[]): PermissionMap {
  const merged: PermissionMap = {};
  for (const role of roles) {
    const rolePerms = ROLE_PERMISSION_DEFAULTS[role];
    if (!rolePerms) continue;
    for (const [key, value] of Object.entries(rolePerms)) {
      // Most permissive wins — if any role grants it, it's granted
      merged[key] = merged[key] || value;
    }
  }
  return merged;
}

interface PermissionProviderProps {
  children: ReactNode;
}

export function PermissionProvider({ children }: PermissionProviderProps) {
  const { user } = useAuth();

  const [currentPatientId, setCurrentPatientId]                   = useState<number | null>(null);
  const [currentPatientPermissions, setCurrentPatientPermissions] = useState<PermissionMap | null>(null);
  const [isLoading, setIsLoading]                                 = useState(false);

  // Register loadPermissions with PatientContext so it gets called
  // automatically when a patient is selected or auto-selected
  useEffect(() => {
    _registerPermissionLoader(loadPermissions);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // KEY FIX: When user has no patient yet (new user), fall back to
  // role-based permissions derived from their roles in AuthContext.
  // This means new Primary Caregivers still see Add Patient, Invite
  // Caregiver etc. before they have created their first patient.
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (currentPatientPermissions === null && user?.roles && user.roles.length > 0) {
      const fallback = getDefaultPermissionsForRoles(user.roles);
      setCurrentPatientPermissions(fallback);
      console.log('ℹ️ No patient selected — using role-based permission fallback for:', user.roles);
    }
  }, [user, currentPatientPermissions]);

  const loadPermissions = async (patientId: number) => {
    setIsLoading(true);
    try {
      const response = await permissionApi.getPatientPermissions(patientId);
      setCurrentPatientId(patientId);
      // Real patient permissions override the role-based fallback
      setCurrentPatientPermissions(response.permissions);
      console.log('✅ Permissions loaded for patient:', patientId, response.permissions);
    } catch (error) {
      console.error('Failed to load permissions:', error);
      // On failure, keep role-based fallback rather than going null
      if (user?.roles && user.roles.length > 0) {
        setCurrentPatientPermissions(getDefaultPermissionsForRoles(user.roles));
      } else {
        setCurrentPatientId(null);
        setCurrentPatientPermissions(null);
      }
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
    // On clear, fall back to role defaults rather than null
    // so UI doesn't go blank on logout/patient switch
    if (user?.roles && user.roles.length > 0) {
      setCurrentPatientPermissions(getDefaultPermissionsForRoles(user.roles));
    } else {
      setCurrentPatientPermissions(null);
    }
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