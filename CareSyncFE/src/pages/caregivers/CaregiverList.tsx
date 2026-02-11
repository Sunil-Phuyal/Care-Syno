import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { caregiverApi } from '../../api';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { usePermission } from '../../hooks/usePermission';
import { PermissionGate } from '../../components/common/PermissionGate';
import type { Caregiver } from '../../types/caregiver.types';

export function CaregiverList() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();
  const { user } = useAuth();
  const canInvite = usePermission('caregiver.invite');
  const canRemove = usePermission('caregiver.remove');
  const canEditPermissions = usePermission('caregiver.edit_permissions');

  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedPatient) {
      loadCaregivers();
    }
  }, [selectedPatient]);

  const loadCaregivers = async () => {
    if (!selectedPatient) return;

    setIsLoading(true);
    setError('');

    try {
      const data = await caregiverApi.getPatientCaregivers(selectedPatient.patientId);
      setCaregivers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load caregivers');
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
    } catch (err: any) {
      alert(err.message || 'Failed to remove caregiver');
    }
  };

  if (!selectedPatient) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="card text-center">
          <p className="text-gray-600">Please select a patient first</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading care team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Care Team</h1>
          <p className="text-gray-600 mt-1">
            Managing care team for {selectedPatient.fullName}
          </p>
        </div>
        <PermissionGate permission="caregiver.invite">
          <button
            onClick={() => navigate('/caregivers/invite')}
            className="btn btn-primary"
          >
            + Invite Caregiver
          </button>
        </PermissionGate>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-error-50 border border-error-200 rounded-lg text-sm text-error-600">
          {error}
        </div>
      )}

      {/* Caregivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {caregivers.map((caregiver) => {
          const isCurrentUser = caregiver.caregiverUserId === user?.userId;
          const isPrimary = caregiver.roleName === 'ROLE_PRIMARY_CAREGIVER';

          return (
            <div key={caregiver.caregiverUserId} className="card">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-xl">
                    👤
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {caregiver.fullName}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-primary-600">(You)</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">{caregiver.email}</p>
                  </div>
                </div>
              </div>

              {/* Role Badge */}
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isPrimary 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {caregiver.roleDisplayName}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm mb-4">
                {caregiver.phoneNumber && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📞</span>
                    <span>{caregiver.phoneNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <span>📅</span>
                  <span>Invited: {new Date(caregiver.invitedAt).toLocaleDateString()}</span>
                </div>
                {caregiver.status === 'PENDING' && (
                  <div className="flex items-center gap-2 text-warning-600">
                    <span>⏳</span>
                    <span>Pending acceptance</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t flex gap-2">
                <PermissionGate permission="caregiver.edit_permissions">
                  <button
                    onClick={() => navigate(`/caregivers/${caregiver.caregiverUserId}/permissions`)}
                    className="btn btn-secondary btn-sm flex-1"
                  >
                    Manage Permissions
                  </button>
                </PermissionGate>

                {!isCurrentUser && (
                  <PermissionGate permission="caregiver.remove">
                    <button
                      onClick={() => handleRemove(caregiver.caregiverUserId)}
                      className="btn btn-danger btn-sm"
                    >
                      Remove
                    </button>
                  </PermissionGate>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}