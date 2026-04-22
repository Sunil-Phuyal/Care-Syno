// src/pages/caregivers/ManagePermissions.tsx

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { caregiverApi, permissionApi } from '../../api';
import { usePatient } from '../../context/PatientContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { PERMISSION_CODES } from '../../utils/constants';
import { cn } from '../../utils/cn';
import type { PermissionResponse } from '../../types/permission.types';

const PERMISSION_GROUPS: {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  permissions: { code: string; label: string; description: string }[];
}[] = [
  {
    id: 'patient',
    label: 'Patient',
    description: 'Control who can view, edit, or delete patient profiles and personal data.',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    permissions: [
      { code: PERMISSION_CODES.PATIENT_VIEW,   label: 'View patient',   description: 'See patient profile, demographics, and contact information.' },
      { code: PERMISSION_CODES.PATIENT_EDIT,   label: 'Edit patient',   description: 'Update patient details, address, and medical information.' },
      { code: PERMISSION_CODES.PATIENT_DELETE, label: 'Delete patient', description: 'Permanently remove a patient record from the system.' },
    ],
  },
  {
    id: 'medication',
    label: 'Medications',
    description: 'Manage what actions this caregiver can perform around medication schedules and administration.',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    permissions: [
      { code: PERMISSION_CODES.MEDICATION_VIEW,                 label: 'View medications',      description: 'See current medication list and active schedules.' },
      { code: PERMISSION_CODES.MEDICATION_CREATE_SCHEDULE,      label: 'Create schedule',       description: 'Set up new medication schedules and dosing times.' },
      { code: PERMISSION_CODES.MEDICATION_EDIT_SCHEDULE,        label: 'Edit schedule',         description: 'Modify existing schedules, dosages, or frequencies.' },
      { code: PERMISSION_CODES.MEDICATION_DELETE_SCHEDULE,      label: 'Delete schedule',       description: 'Remove a medication schedule entirely.' },
      { code: PERMISSION_CODES.MEDICATION_ADMINISTER,           label: 'Administer medication', description: 'Mark oral medications as given for a scheduled dose.' },
      { code: PERMISSION_CODES.MEDICATION_ADMINISTER_INJECTION, label: 'Give injections',       description: 'Record and administer injectable medications.' },
      { code: PERMISSION_CODES.MEDICATION_SKIP,                 label: 'Skip dose',             description: 'Log a dose as skipped with a reason.' },
      { code: PERMISSION_CODES.MEDICATION_VIEW_HISTORY,         label: 'View history',          description: 'Access the full administration history and logs.' },
    ],
  },
  {
    id: 'caregiver',
    label: 'Care Team',
    description: 'Define whether this caregiver can manage other members of the care team.',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    permissions: [
      { code: PERMISSION_CODES.CAREGIVER_VIEW,             label: 'View care team',    description: "See who else is on the patient's care team." },
      { code: PERMISSION_CODES.CAREGIVER_INVITE,           label: 'Invite caregivers', description: 'Send invitations to new caregivers.' },
      { code: PERMISSION_CODES.CAREGIVER_REMOVE,           label: 'Remove caregivers', description: "Remove a caregiver from the patient's team." },
      { code: PERMISSION_CODES.CAREGIVER_EDIT_PERMISSIONS, label: 'Edit permissions',  description: 'Change what other caregivers are allowed to do.' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    description: 'Control access to clinical reports, exports, and recorded vitals.',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    permissions: [
      { code: PERMISSION_CODES.REPORT_VIEW,           label: 'View reports',  description: 'Access generated reports and summaries.' },
      { code: PERMISSION_CODES.REPORT_EXPORT,         label: 'Export reports', description: 'Download or share reports as PDF or CSV.' },
      { code: PERMISSION_CODES.MEDICAL_RECORD_VITALS, label: 'Record vitals', description: 'Log blood pressure, heart rate, weight, and other vitals.' },
    ],
  },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        checked ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
      )}
    >
      <span className={cn(
        'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out',
        checked ? 'translate-x-4' : 'translate-x-0'
      )} />
    </button>
  );
}

function PermissionRow({ permission, checked, onChange }: {
  permission: { code: string; label: string; description: string };
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className={cn(
      'flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl transition-colors duration-150',
      checked
        ? 'bg-primary-50 dark:bg-primary-900/15'
        : 'bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800/70'
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={cn(
            'text-sm font-semibold leading-tight',
            checked ? 'text-primary-700 dark:text-primary-300' : 'text-gray-800 dark:text-gray-200'
          )}>
            {permission.label}
          </p>
          <span className={cn(
            'inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase',
            checked
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400'
              : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-500'
          )}>
            {checked ? 'Granted' : 'Denied'}
          </span>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
          {permission.description}
        </p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function GroupSection({ group, selected, onToggle }: {
  group: (typeof PERMISSION_GROUPS)[0];
  selected: Set<string>;
  onToggle: (code: string) => void;
}) {
  const grantedCount = group.permissions.filter((p) => selected.has(p.code)).length;
  const allGranted   = grantedCount === group.permissions.length;
  const noneGranted  = grantedCount === 0;

  const toggleAll = () => {
    group.permissions.forEach(({ code }) => {
      const has = selected.has(code);
      if (!allGranted && !has) onToggle(code);
      if (allGranted && has)   onToggle(code);
    });
  };

  return (
    <div id={`section-${group.id}`} className="scroll-mt-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{group.label}</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed max-w-lg">
            {group.description}
          </p>
        </div>
        <button
          type="button"
          onClick={toggleAll}
          className={cn(
            'shrink-0 text-xs font-semibold transition-colors whitespace-nowrap mt-0.5',
            allGranted
              ? 'text-error-500 dark:text-error-400 hover:text-error-600'
              : 'text-primary-600 dark:text-primary-400 hover:text-primary-700'
          )}
        >
          {allGranted ? 'Revoke all' : noneGranted ? 'Grant all' : 'Grant all'}
        </button>
      </div>
      <div className="space-y-1.5">
        {group.permissions.map((perm) => (
          <PermissionRow
            key={perm.code}
            permission={perm}
            checked={selected.has(perm.code)}
            onChange={() => onToggle(perm.code)}
          />
        ))}
      </div>
    </div>
  );
}

export function ManagePermissions() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const { selectedPatient } = usePatient();
  const { success, error: showError } = useNotification();

  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [activeGroup, setActiveGroup] = useState(PERMISSION_GROUPS[0].id);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedPatient || !id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const data: PermissionResponse = await permissionApi.getPatientPermissions(
          selectedPatient.patientId
        );
        const granted = new Set(
          Object.entries(data.permissions)
            .filter(([, v]) => v)
            .map(([k]) => k)
        );
        setSelectedPermissions(granted);
      } catch {
        showError('Failed to load permissions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedPatient, id]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const handler = () => {
      for (const group of [...PERMISSION_GROUPS].reverse()) {
        const section = document.getElementById(`section-${group.id}`);
        if (section && section.getBoundingClientRect().top <= 120) {
          setActiveGroup(group.id);
          return;
        }
      }
      setActiveGroup(PERMISSION_GROUPS[0].id);
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  const handleToggle = (code: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveGroup(id);
  };

  const handleSave = async () => {
    if (!selectedPatient || !id) return;
    setIsSaving(true);
    try {
      for (const permissionCode of Object.values(PERMISSION_CODES)) {
        await caregiverApi.grantPermission({
          patientId:       selectedPatient.patientId,
          caregiverUserId: Number(id),
          permissionCode,
           isGranted:       selectedPermissions.has(permissionCode),
        });
      }
      success('Permissions updated successfully!');
      navigate('/caregivers');
    } catch {
      showError('Failed to update permissions. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedPatient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 text-center py-16">
        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No patient selected</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">Please select a patient first.</p>
        <Button variant="primary" onClick={() => navigate('/patients')}>Go to Patients</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">Loading permissions…</p>
        </div>
      </div>
    );
  }

  const totalAll     = Object.values(PERMISSION_CODES).length;
  const totalGranted = selectedPermissions.size;
  const totalDenied  = totalAll - totalGranted;

  return (
    <div className="flex flex-col h-full">

      <div className="flex items-center justify-between gap-4 pb-5 flex-wrap">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/caregivers')}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="page-title leading-tight">Manage Permissions</h1>
            <p className="page-subtitle mt-0.5">
              Access control for{' '}
              <span className="font-semibold text-gray-900 dark:text-gray-100">{selectedPatient.fullName}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800/50">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 tabular-nums">
              {totalGranted} granted
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500" />
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tabular-nums">
              {totalDenied} denied
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">

        <div className="w-48 shrink-0">
          <div className="sticky top-0 space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600 px-3 mb-2">
              Sections
            </p>
            {PERMISSION_GROUPS.map((group) => {
              const granted  = group.permissions.filter((p) => selectedPermissions.has(p.code)).length;
              const total    = group.permissions.length;
              const isActive = activeGroup === group.id;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => scrollTo(group.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all duration-150',
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/25 text-primary-700 dark:text-primary-300'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                  )}
                >
                  <span className={cn(
                    'shrink-0 transition-colors',
                    isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'
                  )}>
                    {group.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold leading-tight">{group.label}</p>
                  </div>
                  <span className={cn(
                    'text-[10px] font-bold tabular-nums',
                    granted === total
                      ? 'text-primary-500 dark:text-primary-400'
                      : granted === 0
                      ? 'text-gray-300 dark:text-gray-700'
                      : 'text-gray-400 dark:text-gray-500'
                  )}>
                    {granted}/{total}
                  </span>
                </button>
              );
            })}
            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[11px] text-gray-400 dark:text-gray-600 px-3 leading-relaxed">
                Toggled permissions override the caregiver's default role.
              </p>
            </div>
          </div>
        </div>

        <div
          ref={contentRef}
          className="flex-1 min-w-0 overflow-y-auto space-y-8 pr-1 pb-6"
          style={{ maxHeight: 'calc(100vh - 220px)' }}
        >
          {PERMISSION_GROUPS.map((group) => (
            <GroupSection
              key={group.id}
              group={group}
              selected={selectedPermissions}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
          Changes take effect immediately after saving.
        </p>
        <div className="flex gap-2.5 ml-auto">
          <Button type="button" variant="secondary" onClick={() => navigate('/caregivers')}>
            Cancel
          </Button>
          <Button type="button" variant="primary" isLoading={isSaving} onClick={handleSave}>
            Save Permissions
          </Button>
        </div>
      </div>

    </div>
  );
}