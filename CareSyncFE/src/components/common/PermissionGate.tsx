import { ReactNode } from 'react';
import { usePermission } from '../../hooks/usePermission';
import type { PermissionCode } from '../../types/permission.types';

interface PermissionGateProps {
  permission: PermissionCode;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Conditionally render children based on permission
 * 
 * Usage:
 * <PermissionGate permission="patient.edit">
 *   <EditButton />
 * </PermissionGate>
 */
export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const hasPermission = usePermission(permission);
  
  if (!hasPermission) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}