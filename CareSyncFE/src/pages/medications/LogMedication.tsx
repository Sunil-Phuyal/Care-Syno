// src/pages/medications/LogMedication.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { medicationApi } from '../../api/medication.api';
import { usePatient } from '../../context/PatientContext';
import { useNotification } from '../../context/NotificationContext';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Spinner } from '../../components/ui/Spinner';
import { cn } from '../../utils/cn';
import type { Medication, MedicationSchedule, MedicationAdministration } from '../../types/medication.types';

const STATUS_OPTIONS = [
  { value: 'ADMINISTERED', label: 'Administered', desc: 'Medication taken',     color: 'border-success-500 bg-success-50 dark:bg-success-900' },
  { value: 'SKIPPED',      label: 'Skipped',      desc: 'Intentionally skipped', color: 'border-warning-500 bg-warning-50 dark:bg-warning-900' },
  { value: 'MISSED',       label: 'Missed',        desc: 'Accidentally missed',   color: 'border-error-500 bg-error-50 dark:bg-error-900' },
  { value: 'REFUSED',      label: 'Refused',       desc: 'Patient refused',       color: 'border-gray-400 bg-gray-50 dark:bg-gray-800' },
] as const;

function PatientBanner({ fullName }: { fullName: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-primary-50 dark:bg-primary-900/40 border-2 border-primary-200 dark:border-primary-700 rounded-xl">
      <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold text-lg">{fullName.charAt(0).toUpperCase()}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider">
          Logging medication for
        </p>
        <p className="text-base font-bold text-primary-800 dark:text-primary-200">{fullName}</p>
      </div>
    </div>
  );
}

function LastGivenInfo({ scheduleId, patientId }: { scheduleId: number | null; patientId: number }) {
  const [lastRecord, setLastRecord] = useState<MedicationAdministration | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!scheduleId) {
      setLastRecord(null);
      return;
    }
    setIsLoading(true);
    medicationApi.getAdministrationHistory(patientId)
      .then((history) => {
        const forThisSchedule = history
          .filter((r) => r.scheduleId === scheduleId)
          .sort((a, b) => new Date(b.administeredAt ?? b.actualTime).getTime() - new Date(a.administeredAt ?? a.actualTime).getTime());
        setLastRecord(forThisSchedule[0] ?? null);
      })
      .catch(() => setLastRecord(null))
      .finally(() => setIsLoading(false));
  }, [scheduleId, patientId]);

  if (!scheduleId) return null;
  if (isLoading) return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="w-3 h-3 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin" />
      <span className="text-xs text-gray-400">Checking last administration...</span>
    </div>
  );
  if (!lastRecord) return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <span className="text-lg">📋</span>
      <span className="text-sm text-gray-500 dark:text-gray-400">No previous administration recorded for this schedule.</span>
    </div>
  );

  const time = lastRecord.administeredAt ?? lastRecord.actualTime;
  const timeAgo = time ? getTimeAgo(new Date(time)) : '—';
  const statusColors: Record<string, string> = {
    ADMINISTERED: 'text-success-600 dark:text-success-400',
    SKIPPED:      'text-warning-600 dark:text-warning-400',
    MISSED:       'text-error-600 dark:text-error-400',
    REFUSED:      'text-gray-500 dark:text-gray-400',
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
      <span className="text-lg flex-shrink-0">🕐</span>
      <div>
        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-0.5">Last Administration</p>
        <p className="text-sm text-gray-700 dark:text-gray-200">
          <span className={cn('font-semibold', statusColors[lastRecord.status] ?? '')}>
            {lastRecord.status}
          </span>
          {' '}by{' '}
          <span className="font-semibold">
            {lastRecord.caregiverName ?? `Caregiver #${lastRecord.caregiverUserId}`}
          </span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {timeAgo} — {time ? new Date(time).toLocaleString() : '—'}
        </p>
        {lastRecord.notes && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
            Note: "{lastRecord.notes}"
          </p>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1)  return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function ConfirmationScreen({
  patientName,
  medicationName,
  dosage,
  status,
  administeredAt,
  administeredByName,
  onDone,
}: {
  patientName: string;
  medicationName: string;
  dosage: string;
  status: string;
  administeredAt: string;
  administeredByName: string;
  onDone: () => void;
}) {
  const navigate = useNavigate();
  const statusIcons: Record<string, string> = {
    ADMINISTERED: '✅', SKIPPED: '⏭️', MISSED: '❌', REFUSED: '🚫',
  };
  const statusColors: Record<string, string> = {
    ADMINISTERED: 'text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-900',
    SKIPPED:      'text-warning-600 dark:text-warning-400 bg-warning-50 dark:bg-warning-900',
    MISSED:       'text-error-600 dark:text-error-400 bg-error-50 dark:bg-error-900',
    REFUSED:      'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800',
  };

  return (
    <div className="max-w-md mx-auto text-center space-y-6 py-8">
      <div className="text-6xl">{statusIcons[status] ?? '✅'}</div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">
          Medication Logged!
        </h2>
        <p className="text-gray-500 dark:text-gray-400">The administration has been recorded successfully.</p>
      </div>

      <div className="card text-left space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Summary</p>
          <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', statusColors[status] ?? '')}>
            {status}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Patient</span>
            <span className="font-semibold text-gray-900 dark:text-gray-50">{patientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Medication</span>
            <span className="font-semibold text-gray-900 dark:text-gray-50">{medicationName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Dosage</span>
            <span className="font-semibold text-gray-900 dark:text-gray-50">{dosage}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Logged by</span>
            <span className="font-semibold text-gray-900 dark:text-gray-50">{administeredByName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Time</span>
            <span className="font-semibold text-gray-900 dark:text-gray-50">
              {new Date(administeredAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" fullWidth onClick={() => navigate('/medications/history')}>
          View History
        </Button>
        <Button variant="primary" fullWidth onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}

export function LogMedication() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedPatient } = usePatient();
  const { success, error: showError } = useNotification();

  const [medications, setMedications] = useState<Medication[]>([]);
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [proofImageUrl, setProofImageUrl] = useState<string | null>(null);

  const [confirmed, setConfirmed] = useState<{
    patientName: string;
    medicationName: string;
    dosage: string;
    status: string;
    administeredAt: string;
    administeredByName: string;
  } | null>(null);

  const [form, setForm] = useState({
    medicationId: '',
    scheduleId: location.state?.scheduleId?.toString() ?? '',
    actualTime: new Date().toISOString().slice(0, 16),
    dosageGiven: '',
    status: 'ADMINISTERED' as 'ADMINISTERED' | 'SKIPPED' | 'MISSED' | 'REFUSED',
    notes: '',
    sideEffects: '',
  });

  useEffect(() => {
    if (!selectedPatient) return;

    const load = async () => {
      setIsLoadingData(true);
      try {
        const [medsData, todaySchedules] = await Promise.all([
          medicationApi.getAllMedications(),
          medicationApi.getPatientSchedules(selectedPatient.patientId),
        ]);

        setMedications(medsData);
        setSchedules(todaySchedules);

        if (location.state?.scheduleId) {
          const schedule = todaySchedules.find((s) => s.scheduleId === location.state.scheduleId);
          if (schedule) {
            setForm((prev) => ({
              ...prev,
              scheduleId: schedule.scheduleId.toString(),
              medicationId: schedule.medicationId.toString(),
              dosageGiven: schedule.dosage,
            }));
          }
        }
      } catch {
        showError('Failed to load data');
        setError('Failed to load data');
      } finally {
        setIsLoadingData(false);
      }
    };
    load();
  }, [selectedPatient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'scheduleId') {
      const schedule = schedules.find((s) => s.scheduleId === Number(value));
      setForm((prev) => ({
        ...prev,
        scheduleId: value,
        medicationId: schedule ? schedule.medicationId.toString() : prev.medicationId,
        dosageGiven: schedule ? schedule.dosage : prev.dosageGiven,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const getMedicationName = (medicationId: string) =>
    medications.find((m) => String(m.medicationId) === medicationId)?.medicationName ?? 'Unknown';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setError('');
    setIsDuplicate(false);
    setIsSubmitting(true);

    try {
      const result = await medicationApi.logAdministration({
        patientId: selectedPatient.patientId,
        medicationId: Number(form.medicationId),
        scheduleId: form.scheduleId ? Number(form.scheduleId) : undefined,
        actualTime: form.actualTime,
        dosageGiven: form.dosageGiven,
        status: form.status,
        notes: form.notes || undefined,
        sideEffects: form.sideEffects || undefined,
        proofImageUrl: proofImageUrl ?? undefined,
      });

      success('Medication logged successfully!');

      setConfirmed({
        patientName: selectedPatient.fullName,
        medicationName: getMedicationName(form.medicationId),
        dosage: form.dosageGiven,
        status: form.status,
        administeredAt: form.actualTime,
        administeredByName: result?.caregiverName ?? 'You', // ← fixed
      });

    } catch (err: any) {
      const msg = err.message || 'Failed to log medication';
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('duplicate')) {
        setIsDuplicate(true);
      }
      showError(msg);
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedPatient) {
    return (
      <div className="card text-center py-12">
        <p className="text-4xl mb-3">👤</p>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Please select a patient first.</p>
        <button onClick={() => navigate('/patients')} className="btn btn-primary">Go to Patients</button>
      </div>
    );
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <ConfirmationScreen
        {...confirmed}
        onDone={() => navigate('/medications')}
      />
    );
  }

  const selectedScheduleId = form.scheduleId ? Number(form.scheduleId) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => navigate('/medications')}
          className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium mb-3 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Medications
        </button>
        <h1 className="page-title">Log Medication</h1>
      </div>

      <PatientBanner fullName={selectedPatient.fullName} />

      {isDuplicate && (
        <div className="flex items-start gap-3 p-4 bg-warning-50 dark:bg-warning-900 border border-warning-200 dark:border-warning-700 rounded-xl">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div>
            <p className="font-semibold text-warning-800 dark:text-warning-200">Duplicate dose detected</p>
            <p className="text-sm text-warning-700 dark:text-warning-300 mt-0.5">
              {error}. All caregivers have been notified.
            </p>
          </div>
        </div>
      )}

      {error && !isDuplicate && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-xl">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">Medication Details</h3>

          <div>
            <Select
              name="scheduleId"
              label="Select Schedule"
              value={form.scheduleId}
              onChange={handleChange}
              required
            >
              <option value="">Select a scheduled medication...</option>
              {schedules.map((s) => {
                const medName = medications.find((m) => m.medicationId === s.medicationId)?.medicationName ?? `Medication #${s.medicationId}`;
                const timeStr = s.timeOfDay ? String(s.timeOfDay).slice(0, 5) : '';
                return (
                  <option key={s.scheduleId} value={s.scheduleId}>
                    {medName} — {s.dosage}{timeStr ? ` @ ${timeStr}` : ''}
                  </option>
                );
              })}
            </Select>
            {schedules.length === 0 && (
              <p className="text-xs text-warning-600 dark:text-warning-400 mt-1">
                ⚠️ No active schedules for {selectedPatient.fullName}. Create a schedule first.
              </p>
            )}
          </div>

          {selectedScheduleId && (
            <LastGivenInfo
              scheduleId={selectedScheduleId}
              patientId={selectedPatient.patientId}
            />
          )}

          <div>
            <Input
              name="actualTime"
              label="Time Administered"
              type="datetime-local"
              value={form.actualTime}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, actualTime: new Date().toISOString().slice(0, 16) }))}
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1"
            >
              Set to now
            </button>
          </div>

          <Input
            name="dosageGiven"
            label="Dosage Given"
            value={form.dosageGiven}
            onChange={handleChange}
            placeholder="e.g. 500mg, 1 tablet"
            required
          />
        </div>

        <div className="card space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">
            Status <span className="text-error-500">*</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {STATUS_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all',
                  form.status === option.value
                    ? option.color
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                <input
                  type="radio"
                  name="status"
                  value={option.value}
                  checked={form.status === option.value}
                  onChange={handleChange}
                  className="accent-primary-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{option.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {form.status === 'ADMINISTERED' && (
          <div className="card space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-1">Proof of Administration</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Optional photo proof that the medication was taken.
            </p>
            <ImageUploader
              folder="administration-proof"
              fileName={`proof_schedule_${form.scheduleId || 'unknown'}_${Date.now()}`}
              label="Proof Photo"
              value={proofImageUrl}
              onChange={setProofImageUrl}
              optional
              hint="Take a photo of the medication being administered."
            />
          </div>
        )}

        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">Additional Notes</h3>
          <Textarea
            name="notes"
            label="Notes (optional)"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            resize="none"
            placeholder="Any additional notes..."
          />
          <Textarea
            name="sideEffects"
            label="Side Effects (optional)"
            value={form.sideEffects}
            onChange={handleChange}
            rows={2}
            resize="none"
            placeholder="Note any side effects observed..."
          />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" fullWidth onClick={() => navigate('/medications')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
            Log Medication
          </Button>
        </div>
      </form>
    </div>
  );
}