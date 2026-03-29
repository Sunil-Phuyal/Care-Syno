// src/pages/caregivers/CaregiverList.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { caregiverApi } from '../../api/caregiver.api';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { PermissionGate } from '../../components/common/PermissionGate';
import { Spinner } from '../../components/ui/Spinner';
import { cn } from '../../utils/cn';
import type { Caregiver } from '../../types/caregiver.types';

// ── Column widths — defined once, used in both header and rows ────────────────
const COL = {
  member:       'flex-1 min-w-0',
  phone:        'w-40 hidden md:flex shrink-0',
  relationship: 'w-32 hidden lg:flex shrink-0',
  role:         'w-44 hidden sm:flex shrink-0',
  actions:      'w-16 shrink-0',
};



// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');
  return (
    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-semibold text-primary-700 dark:text-primary-300 shrink-0">
      {initials}
    </div>
  );
}

// ── Role badge ────────────────────────────────────────────────────────────────
function RoleBadge({ roleName, displayName }: { roleName: string; displayName: string }) {
  const isPrimary = roleName === 'ROLE_PRIMARY_CAREGIVER';
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
      isPrimary
        ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 ring-1 ring-primary-200 dark:ring-primary-700'
        : 'text-gray-500 dark:text-gray-400 ring-1 ring-gray-200 dark:ring-gray-700',
    )}>
      {isPrimary && <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />}
      {displayName}
    </span>
  );
}

// ── Icon button ───────────────────────────────────────────────────────────────
function IconButton({ onClick, title, variant = 'default', children }: {
  onClick: () => void;
  title: string;
  variant?: 'default' | 'danger';
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'p-1.5 rounded-md transition-colors',
        variant === 'danger'
          ? 'text-gray-400 dark:text-gray-600 hover:text-error-600 dark:hover:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/30'
          : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
      )}
    >
      {children}
    </button>
  );
}

// ── Caregiver row ─────────────────────────────────────────────────────────────
function CaregiverRow({ caregiver, isCurrentUser, onRemove, onManage }: {
  caregiver: Caregiver;
  isCurrentUser: boolean;
  onRemove: () => void;
  onManage: () => void;
}) {
  const isPrimary = caregiver.roleName === 'ROLE_PRIMARY_CAREGIVER';
  const isPending = caregiver.status === 'PENDING';

  const relationship = caregiver.relationship
    ? caregiver.relationship.charAt(0).toUpperCase() + caregiver.relationship.slice(1).toLowerCase()
    : '—';

  return (
    <div className="flex items-stretch hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">

      {/* Member */}
      <div className={cn(COL.member, 'flex items-center gap-3 px-5 py-3')}>
        <Avatar name={caregiver.fullName} />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {caregiver.fullName}
            </p>
            {isCurrentUser && (
              <span className="text-xs text-primary-600 dark:text-primary-400">(You)</span>
            )}
            {isPending && (
              <span className="text-xs font-medium text-warning-700 dark:text-warning-400 bg-warning-50 dark:bg-warning-900/30 px-1.5 py-0.5 rounded">
                Pending
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
            {caregiver.email}
          </p>
        </div>
      </div>

      {/* Phone */}
      <div className={cn(COL.phone, 'items-center px-5 py-3')}>
        <p className="text-sm text-gray-500 dark:text-gray-400 tabular-nums">
          {caregiver.phoneNumber ?? '—'}
        </p>
      </div>

      {/* Relationship */}
      <div className={cn(COL.relationship, 'items-center px-5 py-3')}>
        <p className="text-sm text-gray-500 dark:text-gray-400">{relationship}</p>
      </div>

      {/* Role */}
      <div className={cn(COL.role, 'items-center px-5 py-3')}>
        <RoleBadge roleName={caregiver.roleName} displayName={caregiver.roleDisplayName} />
      </div>

      {/* Actions */}
      <div className={cn(COL.actions, 'flex items-center gap-0.5 justify-end px-3 py-3')}>
        <PermissionGate permission="caregiver.edit_permissions">
          <IconButton onClick={onManage} title="Manage permissions">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </IconButton>
        </PermissionGate>

        {!isCurrentUser && !isPrimary && (
          <PermissionGate permission="caregiver.remove">
            <IconButton onClick={onRemove} title="Remove caregiver" variant="danger">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </IconButton>
          </PermissionGate>
        )}
      </div>
    </div>
  );
}

// ── Confirm remove modal ──────────────────────────────────────────────────────
function ConfirmModal({ name, onConfirm, onCancel, isLoading }: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-sm">
        <div className="w-10 h-10 rounded-full bg-error-100 dark:bg-error-900/40 flex items-center justify-center mb-4">
          <svg className="w-5 h-5 text-error-600 dark:text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">Remove caregiver</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Are you sure you want to remove{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">{name}</span> from the care team? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm} disabled={isLoading} className="btn btn-danger flex-1 disabled:opacity-60">
            {isLoading
              ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function CaregiverList() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();
  const { user } = useAuth();

  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState('');
  const [removeTarget, setRemoveTarget] = useState<Caregiver | null>(null);
  const [isRemoving, setIsRemoving]     = useState(false);

  useEffect(() => {
    if (!selectedPatient) return;
    loadCaregivers();
  }, [selectedPatient]);

  const loadCaregivers = async () => {
    if (!selectedPatient) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await caregiverApi.getPatientCaregivers(selectedPatient.patientId);
      setCaregivers(data);
    } catch {
      setError('Failed to load care team.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!selectedPatient || !removeTarget) return;
    setIsRemoving(true);
    try {
      await caregiverApi.removeCaregiver(selectedPatient.patientId, removeTarget.caregiverUserId);
      setRemoveTarget(null);
      await loadCaregivers();
    } catch {
      alert('Failed to remove caregiver. Please try again.');
    } finally {
      setIsRemoving(false);
    }
  };

  if (!selectedPatient) {
    return (
      <div className="card text-center py-16">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Please select a patient first.</p>
        <button onClick={() => navigate('/patients')} className="btn btn-primary">Go to Patients</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading care team...</p>
        </div>
      </div>
    );
  }

  const primaryCaregiver = caregivers.find((c) => c.roleName === 'ROLE_PRIMARY_CAREGIVER');
  const others           = caregivers.filter((c) => c.roleName !== 'ROLE_PRIMARY_CAREGIVER');
  const sorted           = [...(primaryCaregiver ? [primaryCaregiver] : []), ...others];

  return (
    <>
      {removeTarget && (
        <ConfirmModal
          name={removeTarget.fullName}
          onConfirm={handleConfirmRemove}
          onCancel={() => setRemoveTarget(null)}
          isLoading={isRemoving}
        />
      )}

      <div className="space-y-5">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="page-title">Care Team</h1>
            <p className="page-subtitle">
              Managing care team for{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedPatient.fullName}</span>
            </p>
          </div>
          <PermissionGate permission="caregiver.invite">
            <button onClick={() => navigate('/caregivers/invite')} className="btn btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Invite Caregiver
            </button>
          </PermissionGate>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-error-50 dark:bg-error-900/30 border border-error-200 dark:border-error-800 rounded-xl text-sm text-error-700 dark:text-error-400">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* ── Stats strip ── */}
        <div className="card p-0 overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700">

            <div className="px-6 py-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Total members</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight">{caregivers.length}</p>
              </div>
            </div>

            <div className="px-6 py-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 dark:text-gray-500">Primary caregiver</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight truncate">
                  {primaryCaregiver?.fullName ?? '—'}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Supporting members</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight">{others.length}</p>
              </div>
            </div>

          </div>
        </div>

        {/* ── Table ── */}
        {caregivers.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">No caregivers yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Invite someone to join this patient's care team.
            </p>
            <PermissionGate permission="caregiver.invite">
              <button onClick={() => navigate('/caregivers/invite')} className="btn btn-primary">
                Invite Caregiver
              </button>
            </PermissionGate>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">

            {/* ── Table header ── */}
            <div className="flex items-stretch border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <p className={cn(COL.member,       'flex items-center px-5 py-2.5 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider')}>Member</p>
              <p className={cn(COL.phone,        'items-center px-5 py-2.5 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden md:flex')}>Phone</p>
              <p className={cn(COL.relationship, 'items-center px-5 py-2.5 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden lg:flex')}>Relationship</p>
              <p className={cn(COL.role,         'items-center px-5 py-2.5 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden sm:flex')}>Role</p>
              <div className={COL.actions} />
            </div>

            {/* ── Rows ── */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {sorted.map((caregiver) => (
                <CaregiverRow
                  key={caregiver.caregiverUserId}
                  caregiver={caregiver}
                  isCurrentUser={caregiver.caregiverUserId === user?.userId}
                  onRemove={() => setRemoveTarget(caregiver)}
                  onManage={() => navigate(`/caregivers/${caregiver.caregiverUserId}/permissions`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}