// src/pages/medications/MedicationSchedules.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicationApi } from '../../api/medication.api';
import { usePatient } from '../../context/PatientContext';
import { PermissionGate } from '../../components/common/PermissionGate';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatters } from '../../utils/formatters';
import { cn } from '../../utils/cn';
import type { Medication, MedicationSchedule, TodayScheduleDTO } from '../../types/medication.types';

// ─────────────────────────────────────────────────────────────
// Today's administration status badge
// ─────────────────────────────────────────────────────────────
function TodayStatusBadge({ todayRecord }: { todayRecord: TodayScheduleDTO | undefined }) {
  if (!todayRecord) return null;

  if (todayRecord.isAdministered) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-success-100 dark:bg-success-900 rounded-full">
        <span className="text-xs">✅</span>
        <span className="text-xs font-semibold text-success-700 dark:text-success-300">Given today</span>
      </div>
    );
  }

  if (todayRecord.isPast) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-error-100 dark:bg-error-900 rounded-full">
        <span className="text-xs">❌</span>
        <span className="text-xs font-semibold text-error-700 dark:text-error-300">Missed</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-warning-100 dark:bg-warning-900 rounded-full">
      <span className="text-xs">⏳</span>
      <span className="text-xs font-semibold text-warning-700 dark:text-warning-300">Pending</span>
    </div>
  );
}

function ScheduleCard({
  schedule,
  medicationName,
  todayRecord,
  onLog,
  onDelete,
}: {
  schedule: MedicationSchedule;
  medicationName: string;
  todayRecord: TodayScheduleDTO | undefined;
  onLog: () => void;
  onDelete: () => void;
}) {
  const isActive = !schedule.endDate || new Date(schedule.endDate) >= new Date();

  return (
    <div className={cn(
      'card flex flex-col gap-4',
      // Highlight cards that were already given today
      todayRecord?.isAdministered && 'border border-success-200 dark:border-success-800'
    )}>
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50 truncate">{medicationName}</h3>
          <p className="text-2xl font-bold text-primary-500 mt-1">{schedule.dosage}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {/* Active/Ended badge */}
          <span className={cn(
            'text-xs px-2.5 py-1 rounded-full font-medium',
            isActive
              ? 'bg-success-100 dark:bg-success-800 text-success-700 dark:text-success-100'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
          )}>
            {isActive ? 'Active' : 'Ended'}
          </span>
          {/* Today's status badge */}
          <TodayStatusBadge todayRecord={todayRecord} />
        </div>
      </div>

      {/* Who gave it today */}
      {todayRecord?.isAdministered && todayRecord.administeredBy && (
        <div className="flex items-center gap-2 p-2.5 bg-success-50 dark:bg-success-900/40 rounded-lg">
          <span className="text-sm">👤</span>
          <div>
            <p className="text-xs text-success-700 dark:text-success-300 font-medium">
              Given by {todayRecord.administeredBy}
            </p>
            {todayRecord.administeredAt && (
              <p className="text-xs text-success-600 dark:text-success-400">
                at {new Date(todayRecord.administeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">⏰</span>
          <span className="text-gray-500 dark:text-gray-400">Frequency:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {schedule.frequency.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
        </div>
        {schedule.timeOfDay && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">🕐</span>
            <span className="text-gray-500 dark:text-gray-400">Time:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {typeof schedule.timeOfDay === 'string' ? schedule.timeOfDay : String(schedule.timeOfDay)}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-gray-400">📅</span>
          <span className="text-gray-500 dark:text-gray-400">Started:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {formatters.date(schedule.startDate)}
          </span>
        </div>
        {schedule.endDate && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">🏁</span>
            <span className="text-gray-500 dark:text-gray-400">Ends:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatters.date(schedule.endDate)}
            </span>
          </div>
        )}
      </div>

      {(schedule.specialInstructions || schedule.instructions) && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Instructions</p>
          <p className="text-sm text-gray-700 dark:text-gray-200">
            {schedule.specialInstructions ?? schedule.instructions}
          </p>
        </div>
      )}

      {(schedule.prescriptionImageUrl || schedule.medicationPhotoUrl) && (
        <div className="flex gap-3">
          {schedule.prescriptionImageUrl && (
            <a href={schedule.prescriptionImageUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline">
              📋 Prescription
            </a>
          )}
          {schedule.medicationPhotoUrl && (
            <a href={schedule.medicationPhotoUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline">
              💊 Photo
            </a>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700 mt-auto">
        <PermissionGate permission="medication.administer">
          {/* If already given today, show "Log Again" with a warning style */}
          <button
            onClick={onLog}
            className={cn(
              'btn btn-sm flex-1',
              todayRecord?.isAdministered ? 'btn-secondary' : 'btn-primary'
            )}
          >
            {todayRecord?.isAdministered ? '📝 Log Again' : 'Log Now'}
          </button>
        </PermissionGate>
        <PermissionGate permission="medication.delete_schedule">
          <button onClick={onDelete} className="btn btn-danger btn-sm">Delete</button>
        </PermissionGate>
      </div>
    </div>
  );
}

export function MedicationSchedules() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todaySchedules, setTodaySchedules] = useState<TodayScheduleDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedPatient) return;
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [schedulesData, medsData, todayData] = await Promise.all([
          medicationApi.getPatientSchedules(selectedPatient.patientId),
          medicationApi.getAllMedications(),
          // getTodaysSchedule gives us who gave what and when
          medicationApi.getTodaysSchedule(selectedPatient.patientId),
        ]);
        setSchedules(schedulesData);
        setMedications(medsData);
        setTodaySchedules(todayData);
      } catch {
        setError('Failed to load schedules.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedPatient]);

  const getMedicationName = (medicationId: number) =>
    medications.find((m) => m.medicationId === medicationId)?.medicationName ?? `Medication #${medicationId}`;

  // Match each schedule to today's record (by scheduleId)
  const getTodayRecord = (scheduleId: number): TodayScheduleDTO | undefined =>
    todaySchedules.find((t) => t.scheduleId === scheduleId);

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
        <p className="text-gray-500 dark:text-gray-400">Please select a patient to view schedules.</p>
        <button onClick={() => navigate('/patients')} className="btn btn-primary mt-4">Go to Patients</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading schedules...</p>
        </div>
      </div>
    );
  }

  // Today's summary counts
  const givenCount   = todaySchedules.filter((t) => t.isAdministered).length;
  const pendingCount = todaySchedules.filter((t) => !t.isAdministered && !t.isPast).length;
  const missedCount  = todaySchedules.filter((t) => !t.isAdministered && t.isPast).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title">Medication Schedules</h1>
          {/* Patient name prominently in subtitle */}
          <p className="page-subtitle">
            Managing schedules for{' '}
            <span className="font-semibold text-primary-600 dark:text-primary-400">
              {selectedPatient.fullName}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <PermissionGate permission="medication.administer">
            <button onClick={() => navigate('/medications/log')} className="btn btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
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

      {/* ── Today's summary strip ── */}
      {todaySchedules.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 bg-success-50 dark:bg-success-900 rounded-full">
            <span>✅</span>
            <span className="text-sm font-medium text-success-700 dark:text-success-300">
              {givenCount} given today
            </span>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-warning-50 dark:bg-warning-900 rounded-full">
              <span>⏳</span>
              <span className="text-sm font-medium text-warning-700 dark:text-warning-300">
                {pendingCount} pending
              </span>
            </div>
          )}
          {missedCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-error-50 dark:bg-error-900 rounded-full">
              <span>❌</span>
              <span className="text-sm font-medium text-error-700 dark:text-error-300">
                {missedCount} missed
              </span>
            </div>
          )}
        </div>
      )}

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
              todayRecord={getTodayRecord(schedule.scheduleId)}
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