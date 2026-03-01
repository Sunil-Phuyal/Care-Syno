// src/pages/caregivers/ManagePermissions.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { caregiverApi, permissionApi } from '../../api';
import { usePatient } from '../../context/PatientContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { PERMISSION_CODES } from '../../utils/constants';
import { cn } from '../../utils/cn';
import type { PermissionResponse } from '../../types/permission.types';

// ─── Permission group config ──────────────────────────────────────────────────
const PERMISSION_GROUPS: { label: string; icon: string; codes: string[] }[] = [
  {
    label: 'Patient Management',
    icon:  '👤',
    codes: [
      PERMISSION_CODES.PATIENT_VIEW,
      PERMISSION_CODES.PATIENT_EDIT,
      PERMISSION_CODES.PATIENT_DELETE,
    ],
  },
  {
    label: 'Medication Management',
    icon:  '💊',
    codes: [
      PERMISSION_CODES.MEDICATION_VIEW,
      PERMISSION_CODES.MEDICATION_CREATE_SCHEDULE,
      PERMISSION_CODES.MEDICATION_EDIT_SCHEDULE,
      PERMISSION_CODES.MEDICATION_DELETE_SCHEDULE,
      PERMISSION_CODES.MEDICATION_ADMINISTER,
      PERMISSION_CODES.MEDICATION_ADMINISTER_INJECTION,
      PERMISSION_CODES.MEDICATION_SKIP,
      PERMISSION_CODES.MEDICATION_VIEW_HISTORY,
    ],
  },
  {
    label: 'Caregiver Management',
    icon:  '👥',
    codes: [
      PERMISSION_CODES.CAREGIVER_VIEW,
      PERMISSION_CODES.CAREGIVER_INVITE,
      PERMISSION_CODES.CAREGIVER_REMOVE,
      PERMISSION_CODES.CAREGIVER_EDIT_PERMISSIONS,
    ],
  },
  {
    label: 'Reports & Medical',
    icon:  '📊',
    codes: [
      PERMISSION_CODES.REPORT_VIEW,
      PERMISSION_CODES.REPORT_EXPORT,
      PERMISSION_CODES.MEDICAL_RECORD_VITALS,
    ],
  },
];

// ─── Format a permission code into readable label ─────────────────────────────
function formatPermissionLabel(code: string): string {
  return code
    .split('.')
    .pop()
    ?.replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase()) ?? code;
}

// ─── Permission Row ───────────────────────────────────────────────────────────
function PermissionRow({ code, checked, onChange }: {
  code: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className={cn(
      'flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors',
      'hover:bg-gray-50 dark:hover:bg-gray-700',
      checked && 'bg-primary-50 dark:bg-primary-900'
    )}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 rounded accent-primary-500 cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
          {formatPermissionLabel(code)}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">{code}</p>
      </div>
    </label>
  );
}

// ─── Permission Group ─────────────────────────────────────────────────────────
function PermissionGroup({ group, selected, onToggle }: {
  group: typeof PERMISSION_GROUPS[0];
  selected: Set<string>;
  onToggle: (code: string) => void;
}) {
  const allChecked  = group.codes.every((c) => selected.has(c));
  const someChecked = group.codes.some((c) => selected.has(c));

  const toggleAll = () => {
    group.codes.forEach((code) => {
      const shouldGrant = !allChecked;
      const has = selected.has(code);
      if (shouldGrant && !has) onToggle(code);
      if (!shouldGrant && has) onToggle(code);
    });
  };

  return (
    <div className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-5 last:pb-0">
      {/* Group header with toggle all */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{group.icon}</span>
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">{group.label}</h3>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            ({group.codes.filter((c) => selected.has(c)).length}/{group.codes.length})
          </span>
        </div>
        <button
          type="button"
          onClick={toggleAll}
          className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
        >
          {allChecked ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      {/* Permission rows */}
      <div className="space-y-1">
        {group.codes.map((code) => (
          <PermissionRow
            key={code}
            code={code}
            checked={selected.has(code)}
            onChange={() => onToggle(code)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function ManagePermissions() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const { selectedPatient } = usePatient();
  const { success, error: showError } = useNotification();

  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (!selectedPatient || !id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const data: PermissionResponse = await permissionApi.getPatientPermissions(selectedPatient.patientId);
        const granted = new Set(
          Object.entries(data.permissions)
            .filter(([, value]) => value)
            .map(([key]) => key)
        );
        setSelectedPermissions(granted);
      } catch {
        setError('Failed to load permissions.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedPatient, id]);

  const handleToggle = (code: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedPatient || !id) return;
    setIsSaving(true);
    setError('');
    try {
      for (const permissionCode of Object.values(PERMISSION_CODES)) {
        await caregiverApi.grantPermission({
          patientId:        selectedPatient.patientId,
          caregiverUserId:  Number(id),
          permissionCode,
          granted:          selectedPermissions.has(permissionCode),
        });
      }
      success('Permissions updated successfully!');
      navigate('/caregivers');
    } catch {
      const msg = 'Failed to update permissions';
      showError(msg);
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // No patient selected
  if (!selectedPatient) {
    return (
      <div className="card text-center py-12">
        <p className="text-4xl mb-3">👤</p>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Please select a patient first.</p>
        <button onClick={() => navigate('/patients')} className="btn btn-primary">Go to Patients</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading permissions...</p>
        </div>
      </div>
    );
  }

  const totalGranted = [...selectedPermissions].length;
  const totalAll     = Object.values(PERMISSION_CODES).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/caregivers')}
          className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400
                     hover:text-primary-700 dark:hover:text-primary-300 font-medium mb-3 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Care Team
        </button>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="page-title">Manage Permissions</h1>
            <p className="page-subtitle">Customize permissions for this caregiver on {selectedPatient.fullName}</p>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {totalGranted} / {totalAll} granted
          </span>
        </div>
      </div>

      {/* Info box */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900
                      border border-blue-200 dark:border-blue-700 rounded-xl">
        <span className="text-lg flex-shrink-0">ℹ️</span>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Checked permissions will override the default role permissions. Unchecked permissions
          will be denied, even if the role normally grants them.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900
                        border border-red-200 dark:border-red-800 rounded-xl">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Permission groups */}
      <div className="card space-y-5">
        {PERMISSION_GROUPS.map((group) => (
          <PermissionGroup
            key={group.label}
            group={group}
            selected={selectedPermissions}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="button" variant="secondary" fullWidth onClick={() => navigate('/caregivers')}>
          Cancel
        </Button>
        <Button type="button" variant="primary" fullWidth isLoading={isSaving} onClick={handleSave}>
          Save Permissions
        </Button>
      </div>
    </div>
  );
}