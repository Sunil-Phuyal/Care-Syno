// src/pages/caregivers/CaregiverList.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { caregiverApi } from '../../api/caregiver.api';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { PermissionGate } from '../../components/common/PermissionGate';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { cn } from '../../utils/cn';
import type { Caregiver } from '../../types/caregiver.types';

// ─── Caregiver Card ───────────────────────────────────────────────────────────
function CaregiverCard({ caregiver, isCurrentUser, onRemove, onManage }: {
  caregiver: Caregiver;
  isCurrentUser: boolean;
  onRemove: () => void;
  onManage: () => void;
}) {
  const isPrimary = caregiver.roleName === 'ROLE_PRIMARY_CAREGIVER';
  const isPending = caregiver.status === 'PENDING';

  return (
    <div className="card flex flex-col gap-4">

      {/* Avatar + name */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full
                        flex items-center justify-center text-xl flex-shrink-0">
          👤
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 dark:text-gray-50 truncate">
              {caregiver.fullName}
            </h3>
            {isCurrentUser && (
              <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                (You)
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{caregiver.email}</p>
        </div>
      </div>

      {/* Role + status badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn(
          'px-2.5 py-1 rounded-full text-xs font-medium',
          isPrimary
            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        )}>
          {caregiver.roleDisplayName}
        </span>
        {isPending && (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium
                           bg-warning-100 dark:bg-warning-800 text-warning-700 dark:text-warning-200">
            ⏳ Pending
          </span>
        )}
      </div>

      {/* Contact info */}
      <div className="space-y-1.5 text-sm">
        {caregiver.phoneNumber && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <span>📞</span>
            <span>{caregiver.phoneNumber}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <span>📅</span>
          <span>Invited: {new Date(caregiver.invitedAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex gap-2 mt-auto">
        <PermissionGate permission="caregiver.edit_permissions">
          <button onClick={onManage} className="btn btn-secondary btn-sm flex-1">
            Manage Permissions
          </button>
        </PermissionGate>
        {!isCurrentUser && (
          <PermissionGate permission="caregiver.remove">
            <button onClick={onRemove} className="btn btn-danger btn-sm">
              Remove
            </button>
          </PermissionGate>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function CaregiverList() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();
  const { user } = useAuth();

  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState('');

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

  const handleRemove = async (caregiverUserId: number) => {
    if (!selectedPatient) return;
    if (!confirm('Are you sure you want to remove this caregiver?')) return;
    try {
      await caregiverApi.removeCaregiver(selectedPatient.patientId, caregiverUserId);
      await loadCaregivers();
    } catch {
      alert('Failed to remove caregiver. Please try again.');
    }
  };

  // No patient selected
  if (!selectedPatient) {
    return (
      <div className="card text-center py-12">
        <p className="text-4xl mb-3">👤</p>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Please select a patient first.</p>
        <button onClick={() => navigate('/patients')} className="btn btn-primary">
          Go to Patients
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading care team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title">Care Team</h1>
          <p className="page-subtitle">Managing care team for {selectedPatient.fullName}</p>
        </div>
        <PermissionGate permission="caregiver.invite">
          <button
            onClick={() => navigate('/caregivers/invite')}
            className="btn btn-primary"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Invite Caregiver
          </button>
        </PermissionGate>
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

      {/* Empty state */}
      {caregivers.length === 0 ? (
        <EmptyState
          title="No caregivers yet"
          description="Invite someone to join this patient's care team."
          action={{ label: 'Invite Caregiver', onClick: () => navigate('/caregivers/invite') }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {caregivers.map((caregiver) => (
            <CaregiverCard
              key={caregiver.caregiverUserId}
              caregiver={caregiver}
              isCurrentUser={caregiver.caregiverUserId === user?.userId}
              onRemove={() => handleRemove(caregiver.caregiverUserId)}
              onManage={() => navigate(`/caregivers/${caregiver.caregiverUserId}/permissions`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}