import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicationApi } from '../../api';
import { usePatient } from '../../context/PatientContext';
import { usePermission } from '../../hooks/usePermission';
import { PermissionGate } from '../../components/common/PermissionGate';
import { formatters } from '../../utils/formatters';
import type { MedicationSchedule } from '../../types/medication.types';

export function MedicationList() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();
  const canCreateSchedule = usePermission('medication.create_schedule');
  const canEditSchedule = usePermission('medication.edit_schedule');
  const canDeleteSchedule = usePermission('medication.delete_schedule');

  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedPatient) {
      loadSchedules();
    }
  }, [selectedPatient]);

  const loadSchedules = async () => {
    if (!selectedPatient) return;

    setIsLoading(true);
    setError('');

    try {
      const data = await medicationApi.getPatientSchedules(selectedPatient.patientId);
      setSchedules(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load medication schedules');
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedPatient) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="card text-center">
          <p className="text-gray-600">Please select a patient to view medications</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading medications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medication Schedules</h1>
          <p className="text-gray-600 mt-1">
            Managing medications for {selectedPatient.fullName}
          </p>
        </div>
        <div className="flex gap-2">
          <PermissionGate permission="medication.administer">
            <button
              onClick={() => navigate('/medications/log')}
              className="btn btn-primary"
            >
              Log Medication
            </button>
          </PermissionGate>
          <PermissionGate permission="medication.create_schedule">
            <button
              onClick={() => navigate('/medications/new')}
              className="btn btn-secondary"
            >
              + Add Schedule
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-error-50 border border-error-200 rounded-lg text-sm text-error-600">
          {error}
        </div>
      )}

      {/* Medication Schedules */}
      {schedules.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No medication schedules</h3>
          <p className="text-gray-600 mb-6">Create a medication schedule to get started</p>
          <PermissionGate permission="medication.create_schedule">
            <button
              onClick={() => navigate('/medications/new')}
              className="btn btn-primary"
            >
              Create Schedule
            </button>
          </PermissionGate>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedules.map((schedule) => (
            <div key={schedule.scheduleId} className="card hover:shadow-md transition-shadow">
              {/* Medication Info */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-900">
                    Medication ID: {schedule.medicationId}
                  </h3>
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                    Active
                  </span>
                </div>
                <p className="text-2xl font-bold text-primary-600">{schedule.dosage}</p>
              </div>

              {/* Schedule Details */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">⏰ Frequency:</span>
                  <span className="font-medium">{schedule.frequency}</span>
                </div>
                {schedule.timeOfDay && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">🕐 Times:</span>
                    <span className="font-medium">{schedule.timeOfDay}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">📅 Started:</span>
                  <span className="font-medium">{formatters.date(schedule.startDate)}</span>
                </div>
                {schedule.endDate && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">🏁 Ends:</span>
                    <span className="font-medium">{formatters.date(schedule.endDate)}</span>
                  </div>
                )}
              </div>

              {/* Instructions */}
              {schedule.instructions && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Instructions:</p>
                  <p className="text-sm text-gray-700">{schedule.instructions}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <PermissionGate permission="medication.administer">
                  <button
                    onClick={() => navigate('/medications/log', { 
                      state: { scheduleId: schedule.scheduleId } 
                    })}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    Log Now
                  </button>
                </PermissionGate>
                
                <PermissionGate permission="medication.edit_schedule">
                  <button className="btn btn-secondary btn-sm">
                    Edit
                  </button>
                </PermissionGate>
                
                <PermissionGate permission="medication.delete_schedule">
                  <button className="btn btn-danger btn-sm">
                    Delete
                  </button>
                </PermissionGate>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-8 flex gap-4">
        <PermissionGate permission="medication.view_history">
          <button
            onClick={() => navigate('/medications/history')}
            className="btn btn-ghost"
          >
            View History →
          </button>
        </PermissionGate>
      </div>
    </div>
  );
}