import { usePermissions } from '../context/PermissionContext';
import type { PermissionCode } from '../types/permission.types';

/**
 * Simple hook to check a single permission
 * 
 * Usage:
 * const canEdit = usePermission('patient.edit');
 * if (canEdit) { ... }
 */
export function usePermission(code: PermissionCode): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission(code);
}