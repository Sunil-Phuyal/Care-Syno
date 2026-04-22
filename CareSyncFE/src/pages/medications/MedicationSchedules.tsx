// src/pages/medications/MedicationSchedules.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicationApi } from '../../api/medication.api';
import { usePatient } from '../../context/PatientContext';
import { PermissionGate } from '../../components/common/PermissionGate';
import { Spinner } from '../../components/ui/Spinner';
import { cn } from '../../utils/cn';
import type { Medication, MedicationSchedule, TodayScheduleDTO, UpdateScheduleRequest } from '../../types/medication.types';

// ── Today status pill ─────────────────────────────────────────────────────────
function TodayStatus({ record }: { record: TodayScheduleDTO | undefined }) {
  if (!record) {
    return <span className="text-xs text-gray-400 dark:text-gray-600">—</span>;
  }
  if (record.isAdministered) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300">
          Given
        </span>
        {record.administeredBy && (
          <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
            by {record.administeredBy}
          </span>
        )}
      </div>
    );
  }
  if (record.isPast) {
    return (
      <span className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-error-100 dark:bg-error-900 text-error-700 dark:text-error-300">
        Missed
      </span>
    );
  }
  return (
    <span className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-300">
      Pending
    </span>
  );
}

// ── Column layout ─────────────────────────────────────────────────────────────
const COLS = 'grid-cols-[minmax(0,280px)_72px_148px_100px_120px]';

// ── Edit schedule modal ───────────────────────────────────────────────────────
function EditScheduleModal({
  schedule,
  medicationName,
  onClose,
  onSaved,
}: {
  schedule: MedicationSchedule;
  medicationName: string;
  onClose: () => void;
  onSaved: (updated: MedicationSchedule) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    dosage:       schedule.dosage ?? '',
    frequency:    schedule.frequency ?? 'ONCE_DAILY',
    timeOfDay:    typeof schedule.timeOfDay === 'string'
                    ? schedule.timeOfDay.slice(0, 5)
                    : '',
    instructions: schedule.specialInstructions ?? schedule.instructions ?? '',
    startDate:    schedule.startDate ?? '',
    endDate:      schedule.endDate ?? '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setError('');
    setIsSaving(true);
    try {
      const payload: UpdateScheduleRequest = {
        dosage:       form.dosage       || undefined,
        frequency:    form.frequency    || undefined,
        timeOfDay:    form.timeOfDay    || undefined,
        instructions: form.instructions || undefined,
        startDate:    form.startDate    || undefined,
        endDate:      form.endDate      || undefined,
      };
      const updated = await medicationApi.updateSchedule(schedule.scheduleId, payload);
      onSaved(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg w-full max-w-sm mx-4 p-5">

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Edit schedule</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{medicationName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-500 dark:text-red-400 mb-3">{error}</p>
        )}

        <div className="space-y-3">
          {/* Dosage */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Dosage</label>
            <input
              name="dosage"
              value={form.dosage}
              onChange={handleChange}
              placeholder="e.g. 500mg, 1 tablet"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Frequency + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Frequency</label>
              <select
                name="frequency"
                value={form.frequency}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ONCE_DAILY">Once daily</option>
                <option value="TWICE_DAILY">Twice daily</option>
                <option value="THREE_TIMES_DAILY">Three times daily</option>
                <option value="FOUR_TIMES_DAILY">Four times daily</option>
                <option value="AS_NEEDED">As needed</option>
                <option value="WEEKLY">Weekly</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Time</label>
              <input
                type="time"
                name="timeOfDay"
                value={form.timeOfDay}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Start / End date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Start date</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">End date</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Instructions <span className="font-normal">(optional)</span>
            </label>
            <textarea
              name="instructions"
              value={form.instructions}
              onChange={handleChange}
              rows={2}
              placeholder="e.g. Take after meals"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-2 text-sm rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Single row ────────────────────────────────────────────────────────────────
function ScheduleRow({
  schedule,
  medicationName,
  todayRecord,
  onLog,
  onEdit,
  onDelete,
}: {
  schedule: MedicationSchedule;
  medicationName: string;
  todayRecord: TodayScheduleDTO | undefined;
  onLog: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const prescriptionUrl = schedule.prescriptionImageUrl ?? schedule.medicationPhotoUrl;

  return (
    <div className={cn('grid', COLS, 'items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0')}>

      {/* Medication */}
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {medicationName}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
          {schedule.dosage}
        </p>
        {(schedule.specialInstructions || schedule.instructions) && (
          <p className="text-xs text-gray-300 dark:text-gray-600 truncate mt-0.5">
            {schedule.specialInstructions ?? schedule.instructions}
          </p>
        )}
      </div>

      {/* Time */}
      <div>
        <span className="text-sm tabular-nums font-medium text-gray-600 dark:text-gray-400">
          {schedule.timeOfDay
            ? (typeof schedule.timeOfDay === 'string'
                ? schedule.timeOfDay.slice(0, 5)
                : String(schedule.timeOfDay))
            : <span className="text-gray-300 dark:text-gray-700">—</span>
          }
        </span>
      </div>

      {/* Frequency */}
      <div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {schedule.frequency
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, c => c.toUpperCase())}
        </span>
      </div>

      {/* Today status */}
      <div>
        <TodayStatus record={todayRecord} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1">

        {/* Prescription link */}
        {prescriptionUrl && (
          <a
            href={prescriptionUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="View prescription"
            className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </a>
        )}

        <PermissionGate permission="medication.administer">
          <button
            onClick={onLog}
            className={cn(
              'text-xs font-medium px-2.5 py-1 rounded-md border transition-colors whitespace-nowrap',
              todayRecord?.isAdministered
                ? 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                : 'border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30'
            )}
          >
            {todayRecord?.isAdministered ? 'Log again' : 'Log now'}
          </button>
        </PermissionGate>

        <PermissionGate permission="medication.edit_schedule">
          <button
            onClick={onEdit}
            title="Edit schedule"
            className="p-1.5 rounded-lg text-gray-300 dark:text-gray-700 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </PermissionGate>

        <PermissionGate permission="medication.delete_schedule">
          <button
            onClick={onDelete}
            title="Delete schedule"
            className="p-1.5 rounded-lg text-gray-300 dark:text-gray-700 hover:text-error-500 dark:hover:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </PermissionGate>
      </div>
    </div>
  );
}

// ── Stats strip ───────────────────────────────────────────────────────────────
function StatsStrip({ total, given, pending, missed }: {
  total: number;
  given: number;
  pending: number;
  missed: number;
}) {
  return (
    <div className="grid grid-cols-4 divide-x divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
      {[
        { label: 'Total schedules', value: total,   color: '' },
        { label: 'Given today',     value: given,   color: given   > 0 ? 'text-success-600 dark:text-success-400' : '' },
        { label: 'Pending',         value: pending, color: pending > 0 ? 'text-warning-600 dark:text-warning-400' : '' },
        { label: 'Missed today',    value: missed,  color: missed  > 0 ? 'text-error-600 dark:text-error-400'   : '' },
      ].map(({ label, value, color }) => (
        <div key={label} className="px-5 py-4">
          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">{label}</p>
          <p className={cn(
            'text-2xl font-semibold tabular-nums leading-none',
            color || (value === 0 ? 'text-gray-200 dark:text-gray-700' : 'text-gray-900 dark:text-gray-100')
          )}>
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function MedicationSchedules() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();

  const [schedules, setSchedules]           = useState<MedicationSchedule[]>([]);
  const [medications, setMedications]       = useState<Medication[]>([]);
  const [todaySchedules, setTodaySchedules] = useState<TodayScheduleDTO[]>([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [error, setError]                   = useState('');
  const [editingSchedule, setEditingSchedule] = useState<MedicationSchedule | null>(null);

  useEffect(() => {
    if (!selectedPatient) return;
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [schedulesData, medsData, todayData] = await Promise.all([
          medicationApi.getPatientSchedules(selectedPatient.patientId),
          medicationApi.getAllMedications(),
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
    medications.find((m) => m.medicationId === medicationId)?.medicationName
    ?? `Medication #${medicationId}`;

  const getTodayRecord = (scheduleId: number): TodayScheduleDTO | undefined =>
    todaySchedules.find((t) => t.scheduleId === scheduleId);

  const handleDelete = async (scheduleId: number) => {
    if (!confirm('Delete this schedule?')) return;
    try {
      await medicationApi.deleteSchedule(scheduleId);
      setSchedules((prev) => prev.filter((s) => s.scheduleId !== scheduleId));
      setTodaySchedules((prev) => prev.filter((t) => t.scheduleId !== scheduleId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete schedule.');
    }
  };

  if (!selectedPatient) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Select a patient to continue.</p>
        <button onClick={() => navigate('/patients')} className="btn btn-primary">Go to patients</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">Loading schedules…</p>
        </div>
      </div>
    );
  }

  const givenCount   = todaySchedules.filter((t) => t.isAdministered).length;
  const pendingCount = todaySchedules.filter((t) => !t.isAdministered && !t.isPast).length;
  const missedCount  = todaySchedules.filter((t) => !t.isAdministered && t.isPast).length;

  return (
    <div className="space-y-4">

      {/* Edit modal */}
      {editingSchedule && (
        <EditScheduleModal
          schedule={editingSchedule}
          medicationName={getMedicationName(editingSchedule.medicationId)}
          onClose={() => setEditingSchedule(null)}
          onSaved={(updated) => {
            setSchedules((prev) =>
              prev.map((s) => s.scheduleId === updated.scheduleId ? updated : s)
            );
            setEditingSchedule(null);
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
            Medication schedules
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            Managing schedules for{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {selectedPatient.fullName}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <PermissionGate permission="medication.administer">
            <button
              onClick={() => navigate('/medications/log')}
              className="btn btn-secondary text-sm"
            >
              Log medication
            </button>
          </PermissionGate>
          <PermissionGate permission="medication.create_schedule">
            <button
              onClick={() => navigate('/medications/new')}
              className="btn btn-primary text-sm"
            >
              + Add schedule
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-error-50 dark:bg-error-900/20 border border-error-100 dark:border-error-800 text-sm text-error-600 dark:text-error-400">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Stats */}
      <StatsStrip
        total={schedules.length}
        given={givenCount}
        pending={pendingCount}
        missed={missedCount}
      />

      {/* Table or empty */}
      {schedules.length === 0 ? (
        <div className="text-center py-16 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No schedules yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">
            Create a schedule to start tracking medications for {selectedPatient.fullName}.
          </p>
          <PermissionGate permission="medication.create_schedule">
            <button onClick={() => navigate('/medications/new')} className="btn btn-primary text-sm">
              Create schedule
            </button>
          </PermissionGate>
        </div>
      ) : (
        <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900">

          {/* Column headers */}
          <div className={cn('grid', COLS, 'px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50')}>
            {['Medication', 'Time', 'Frequency', 'Today', ''].map((h) => (
              <span key={h} className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          <div>
            {schedules.map((schedule) => (
              <ScheduleRow
                key={schedule.scheduleId}
                schedule={schedule}
                medicationName={getMedicationName(schedule.medicationId)}
                todayRecord={getTodayRecord(schedule.scheduleId)}
                onLog={() => navigate('/medications/log', { state: { scheduleId: schedule.scheduleId } })}
                onEdit={() => setEditingSchedule(schedule)}
                onDelete={() => handleDelete(schedule.scheduleId)}
              />
            ))}
          </div>

        </div>
      )}

      {/* Footer */}
      <PermissionGate permission="medication.view_history">
        <button
          onClick={() => navigate('/medications/history')}
          className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          View administration history →
        </button>
      </PermissionGate>

    </div>
  );
}