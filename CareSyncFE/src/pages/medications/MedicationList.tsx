// src/pages/medications/MedicationList.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicationApi } from '../../api/medication.api';
import { usePatient } from '../../context/PatientContext';
import { PermissionGate } from '../../components/common/PermissionGate';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatters } from '../../utils/formatters';
import { cn } from '../../utils/cn';
import type { Medication, MedicationSchedule } from '../../types/medication.types';

function ScheduleCard({
  schedule,
  medicationName,
  onLog,
  onDelete,
}: {
  schedule: MedicationSchedule;
  medicationName: string;
  onLog: () => void;
  onDelete: () => void;
}) {
  const isActive = !schedule.endDate || new Date(schedule.endDate) >= new Date();

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50 truncate">{medicationName}</h3>
          <p className="text-2xl font-bold text-primary-500 mt-1">{schedule.dosage}</p>
        </div>
        <span className={cn(
          'text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0',
          isActive
            ? 'bg-success-100 dark:bg-success-800 text-success-700 dark:text-success-100'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        )}>
          {isActive ? 'Active' : 'Ended'}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">⏰</span>
          <span className="text-gray-500 dark:text-gray-400">Frequency:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {schedule.frequency.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
          </span>
        </div>
        {schedule.timeOfDay && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">🕐</span>
            <span className="text-gray-500 dark:text-gray-400">Time:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{schedule.timeOfDay}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-gray-400">📅</span>
          <span className="text-gray-500 dark:text-gray-400">Started:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{formatters.date(schedule.startDate)}</span>
        </div>
        {schedule.endDate && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">🏁</span>
            <span className="text-gray-500 dark:text-gray-400">Ends:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{formatters.date(schedule.endDate)}</span>
          </div>
        )}
      </div>

      {schedule.instructions && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Instructions</p>
          <p className="text-sm text-gray-700 dark:text-gray-200">{schedule.instructions}</p>
        </div>
      )}

      {/* Image indicators */}
      {(schedule.prescriptionImageUrl || schedule.medicationPhotoUrl) && (
        <div className="flex gap-2">
          {schedule.prescriptionImageUrl && (
            <a href={schedule.prescriptionImageUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline">
              📋 View Prescription
            </a>
          )}
          {schedule.medicationPhotoUrl && (
            <a href={schedule.medicationPhotoUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline">
              💊 View Photo
            </a>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700 mt-auto">
        <PermissionGate permission="medication.administer">
          <button onClick={onLog} className="btn btn-primary btn-sm flex-1">Log Now</button>
        </PermissionGate>
        <PermissionGate permission="medication.delete_schedule">
          <button onClick={onDelete} className="btn btn-danger btn-sm">Delete</button>
        </PermissionGate>
      </div>
    </div>
  );
}

export function MedicationList() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();
  const [schedules, setSchedules]     = useState<MedicationSchedule[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState('');

  useEffect(() => {
    if (!selectedPatient) return;
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [schedulesData, medsData] = await Promise.all([
          medicationApi.getPatientSchedules(selectedPatient.patientId),
          medicationApi.getAllMedications(),
        ]);
        setSchedules(schedulesData);
        setMedications(medsData);
      } catch {
        setError('Failed to load medication schedules.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedPatient]);

  const getMedicationName = (medicationId: number) =>
    medications.find(m => m.medicationId === medicationId)?.name ?? `Medication #${medicationId}`;

  const handleDelete = async (scheduleId: number) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await medicationApi.deleteSchedule(scheduleId);
      setSchedules((prev) => prev.filter((s) => s.scheduleId !== scheduleId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete schedule.');
    }
  };

  if (!selectedPatient) {
    return (
      <div className="card text-center py-12">
        <p className="text-4xl mb-3">👤</p>
        <p className="text-gray-500 dark:text-gray-400">Please select a patient to view medications.</p>
        <button onClick={() => navigate('/patients')} className="btn btn-primary mt-4">Go to Patients</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading medications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title">Medication Schedules</h1>
          <p className="page-subtitle">Managing medications for {selectedPatient.fullName}</p>
        </div>
        <div className="flex gap-2">
          <PermissionGate permission="medication.administer">
            <button onClick={() => navigate('/medications/log')} className="btn btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Log Medication
            </button>
          </PermissionGate>
          <PermissionGate permission="medication.create_schedule">
            <button onClick={() => navigate('/medications/new')} className="btn btn-secondary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Schedule
            </button>
          </PermissionGate>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {schedules.length === 0 ? (
        <EmptyState
          title="No medication schedules"
          description="Create a medication schedule to get started."
          action={{ label: 'Create Schedule', onClick: () => navigate('/medications/new') }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {schedules.map((schedule) => (
            <ScheduleCard
              key={schedule.scheduleId}
              schedule={schedule}
              medicationName={getMedicationName(schedule.medicationId)}
              onLog={() => navigate('/medications/log', { state: { scheduleId: schedule.scheduleId } })}
              onDelete={() => handleDelete(schedule.scheduleId)}
            />
          ))}
        </div>
      )}

      <PermissionGate permission="medication.view_history">
        <button onClick={() => navigate('/medications/history')} className="btn btn-ghost">
          View Administration History →
        </button>
      </PermissionGate>
    </div>
  );
}