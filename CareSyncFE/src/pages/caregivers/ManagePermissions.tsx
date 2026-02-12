import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { caregiverApi, permissionApi } from '../../api';
import { usePatient } from '../../context/PatientContext';
import { useNotification } from '../../context/NotificationContext';
import { PERMISSION_CODES } from '../../utils/constants';
import type { PermissionResponse } from '../../types/permission.types';

export function ManagePermissions() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();
  const { success, error: showError } = useNotification();

  const [caregiverPermissions, setCaregiverPermissions] = useState<PermissionResponse | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedPatient && id) {
      loadPermissions();
    }
  }, [selectedPatient, id]);

  const loadPermissions = async () => {
    if (!selectedPatient || !id) return;

    setIsLoading(true);
    try {
      // In a real app, you'd have an API to get permissions for a specific user
      // For now, we'll get the current permissions
      const data = await permissionApi.getPatientPermissions(selectedPatient.patientId);
      setCaregiverPermissions(data);

      // Set initially granted permissions
      const granted = new Set(
        Object.entries(data.permissions)
          .filter(([_, value]) => value)
          .map(([key]) => key)
      );
      setSelectedPermissions(granted);
    } catch (err: any) {
      showError(err.message || 'Failed to load permissions');
      setError(err.message || 'Failed to load permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePermission = (permissionCode: string) => {
    const newSet = new Set(selectedPermissions);
    if (newSet.has(permissionCode)) {
      newSet.delete(permissionCode);
    } else {
      newSet.add(permissionCode);
    }
    setSelectedPermissions(newSet);
  };

  const handleSave = async () => {
    if (!selectedPatient || !id) return;

    setIsSaving(true);
    setError('');

    try {
      // Grant each permission
      for (const permissionCode of Object.values(PERMISSION_CODES)) {
        const isGranted = selectedPermissions.has(permissionCode);
        
        await caregiverApi.grantPermission({
          patientId: selectedPatient.patientId,
          caregiverUserId: Number(id),
          permissionCode,
          granted: isGranted,
        });
      }

      success('Permissions updated successfully!');
      navigate('/caregivers');
    } catch (err: any) {
      showError(err.message || 'Failed to update permissions');
      setError(err.message || 'Failed to update permissions');
    } finally {
      setIsSaving(false);
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
          <p className="mt-4 text-gray-600">Loading permissions...</p>
        </div>
      </div>
    );
  }

  const permissionGroups = {
    'Patient Management': [
      PERMISSION_CODES.PATIENT_VIEW,
      PERMISSION_CODES.PATIENT_EDIT,
      PERMISSION_CODES.PATIENT_DELETE,
    ],
    'Medication Management': [
      PERMISSION_CODES.MEDICATION_VIEW,
      PERMISSION_CODES.MEDICATION_CREATE_SCHEDULE,
      PERMISSION_CODES.MEDICATION_EDIT_SCHEDULE,
      PERMISSION_CODES.MEDICATION_DELETE_SCHEDULE,
      PERMISSION_CODES.MEDICATION_ADMINISTER,
      PERMISSION_CODES.MEDICATION_ADMINISTER_INJECTION,
      PERMISSION_CODES.MEDICATION_SKIP,
      PERMISSION_CODES.MEDICATION_VIEW_HISTORY,
    ],
    'Caregiver Management': [
      PERMISSION_CODES.CAREGIVER_VIEW,
      PERMISSION_CODES.CAREGIVER_INVITE,
      PERMISSION_CODES.CAREGIVER_REMOVE,
      PERMISSION_CODES.CAREGIVER_EDIT_PERMISSIONS,
    ],
    'Reports & Medical': [
      PERMISSION_CODES.REPORT_VIEW,
      PERMISSION_CODES.REPORT_EXPORT,
      PERMISSION_CODES.MEDICAL_RECORD_VITALS,
    ],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/caregivers')}
          className="text-primary-600 hover:text-primary-700 mb-4 inline-flex items-center gap-2"
        >
          ← Back to Care Team
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Manage Permissions</h1>
        <p className="text-gray-600 mt-1">
          Customize permissions for this caregiver on {selectedPatient.fullName}
        </p>
      </div>

      {/* Info Box */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>ℹ️ Note:</strong> Checked permissions will override the default role permissions.
          Unchecked permissions will be denied, even if the role normally grants them.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-error-50 border border-error-200 rounded-lg text-sm text-error-600">
          {error}
        </div>
      )}

      {/* Permissions Form */}
      <div className="card space-y-6">
        {Object.entries(permissionGroups).map(([groupName, permissions]) => (
          <div key={groupName} className="border-b last:border-b-0 pb-6 last:pb-0">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">{groupName}</h3>
            <div className="space-y-3">
              {permissions.map((permissionCode) => (
                <label
                  key={permissionCode}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.has(permissionCode)}
                    onChange={() => handleTogglePermission(permissionCode)}
                    className="mt-1 h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {permissionCode.split('.').pop()?.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {permissionCode}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => navigate('/caregivers')}
          className="btn btn-secondary flex-1"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-primary flex-1"
        >
          {isSaving ? 'Saving...' : 'Save Permissions'}
        </button>
      </div>
    </div>
  );
}