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
import { AlertDialog } from '../../components/ui/AlertDialog';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { cn } from '../../utils/cn';
import type { Medication, MedicationSchedule, MedicationAdministration } from '../../types/medication.types';

const STATUS_OPTIONS = [
  { value: 'ADMINISTERED', label: 'Administered', desc: 'Medication was taken',    border: 'border-success-400 dark:border-success-600', bg: 'bg-success-50 dark:bg-success-900/30' },
  { value: 'SKIPPED',      label: 'Skipped',      desc: 'Intentionally skipped',   border: 'border-warning-400 dark:border-warning-600', bg: 'bg-warning-50 dark:bg-warning-900/30' },
  { value: 'MISSED',       label: 'Missed',        desc: 'Accidentally missed',     border: 'border-error-400 dark:border-error-600',   bg: 'bg-error-50 dark:bg-error-900/30' },
  { value: 'REFUSED',      label: 'Refused',       desc: 'Patient refused',         border: 'border-gray-300 dark:border-gray-600',     bg: 'bg-gray-50 dark:bg-gray-800/50' },
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h3>
      </div>
      <div className="px-5 py-4 space-y-4">
        {children}
      </div>
    </div>
  );
}

function LastGivenInfo({ scheduleId, patientId }: { scheduleId: number | null; patientId: number }) {
  const [lastRecord, setLastRecord] = useState<MedicationAdministration | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!scheduleId) { setLastRecord(null); return; }
    setIsLoading(true);
    medicationApi.getAdministrationHistory(patientId)
      .then((history) => {
        const sorted = history
          .filter((r) => r.scheduleId === scheduleId)
          .sort((a, b) => new Date(b.administeredAt ?? b.actualTime).getTime() - new Date(a.administeredAt ?? a.actualTime).getTime());
        setLastRecord(sorted[0] ?? null);
      })
      .catch(() => setLastRecord(null))
      .finally(() => setIsLoading(false));
  }, [scheduleId, patientId]);

  if (!scheduleId) return null;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800">
        <div className="w-3 h-3 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin shrink-0" />
        <span className="text-xs text-gray-400">Checking last administration…</span>
      </div>
    );
  }

  if (!lastRecord) {
    return (
      <p className="text-xs text-gray-400 dark:text-gray-500 px-1">
        No previous administration recorded for this schedule.
      </p>
    );
  }

  const time = lastRecord.administeredAt ?? lastRecord.actualTime;
  const timeAgo = time ? getTimeAgo(new Date(time)) : '—';
  const statusColor: Record<string, string> = {
    ADMINISTERED: 'text-success-600 dark:text-success-400',
    SKIPPED:      'text-warning-600 dark:text-warning-400',
    MISSED:       'text-error-600 dark:text-error-400',
    REFUSED:      'text-gray-500 dark:text-gray-400',
  };

  return (
    <div className="flex items-start gap-3 px-3 py-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
      <div className="mt-0.5 shrink-0">
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Last administration</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className={cn('font-medium', statusColor[lastRecord.status] ?? '')}>
            {lastRecord.status.charAt(0) + lastRecord.status.slice(1).toLowerCase()}
          </span>
          {' '}by{' '}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {lastRecord.caregiverName ?? `Caregiver #${lastRecord.caregiverUserId}`}
          </span>
          <span className="text-gray-400 dark:text-gray-500"> · {timeAgo}</span>
        </p>
        {lastRecord.notes && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">"{lastRecord.notes}"</p>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1)  return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
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

  const statusPill: Record<string, string> = {
    ADMINISTERED: 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300',
    SKIPPED:      'bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-300',
    MISSED:       'bg-error-100 dark:bg-error-900 text-error-700 dark:text-error-300',
    REFUSED:      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-success-50 dark:bg-success-900/30 border border-success-100 dark:border-success-800">
        <div className="w-8 h-8 rounded-full bg-success-100 dark:bg-success-900 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-success-800 dark:text-success-200">Medication logged successfully</p>
          <p className="text-xs text-success-600 dark:text-success-400 mt-0.5">The administration has been recorded.</p>
        </div>
      </div>

      <div className="border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Summary</h3>
          <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full', statusPill[status] ?? '')}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </span>
        </div>
        <div className="px-5 py-4 space-y-3">
          {[
            { label: 'Patient',    value: patientName },
            { label: 'Medication', value: medicationName },
            { label: 'Dosage',     value: dosage },
            { label: 'Logged by',  value: administeredByName },
            { label: 'Time',       value: new Date(administeredAt).toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-gray-400 dark:text-gray-500">{label}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" fullWidth onClick={() => navigate('/medications/history')}>
          View history
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

  const [medications, setMedications]     = useState<Medication[]>([]);
  const [schedules, setSchedules]         = useState<MedicationSchedule[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [error, setError]                 = useState('');
  const [isDuplicate, setIsDuplicate]     = useState(false);
  const [proofImageUrl, setProofImageUrl] = useState<string | null>(null);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [showAlert, setShowAlert]         = useState(false);
  const [alertMessage, setAlertMessage]   = useState('');

  const [confirmed, setConfirmed] = useState<{
    patientName: string;
    medicationName: string;
    dosage: string;
    status: string;
    administeredAt: string;
    administeredByName: string;
  } | null>(null);

  const [form, setForm] = useState({
    medicationId:  '',
    scheduleId:    location.state?.scheduleId?.toString() ?? '',
    actualTime:    new Date().toISOString().slice(0, 16),
    dosageGiven:   '',
    status:        'ADMINISTERED' as 'ADMINISTERED' | 'SKIPPED' | 'MISSED' | 'REFUSED',
    notes:         '',
    sideEffects:   '',
  });

  useEffect(() => {
    if (!selectedPatient) return;
    const load = async () => {
      setIsLoadingData(true);
      try {
        const [medsData, schedulesData] = await Promise.all([
          medicationApi.getAllMedications(),
          medicationApi.getPatientSchedules(selectedPatient.patientId),
        ]);
        setMedications(medsData);
        setSchedules(schedulesData);

        if (location.state?.scheduleId) {
          const s = schedulesData.find((s) => s.scheduleId === location.state.scheduleId);
          if (s) {
            setForm((prev) => ({
              ...prev,
              scheduleId:   s.scheduleId.toString(),
              medicationId: s.medicationId.toString(),
              dosageGiven:  s.dosage,
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
      const s = schedules.find((s) => s.scheduleId === Number(value));
      setForm((prev) => ({
        ...prev,
        scheduleId:   value,
        medicationId: s ? s.medicationId.toString() : prev.medicationId,
        dosageGiven:  s ? s.dosage : prev.dosageGiven,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const getMedicationName = (medicationId: string) =>
    medications.find((m) => String(m.medicationId) === medicationId)?.medicationName ?? 'Unknown';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const selectedSchedule = schedules.find(s => s.scheduleId === Number(form.scheduleId));
    if (selectedSchedule?.timeOfDay) {
      const [hours, minutes] = String(selectedSchedule.timeOfDay).slice(0, 5).split(':').map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);
      const earliestAllowed = new Date(scheduledTime.getTime() - 5 * 60 * 1000);
      const latestAllowed   = new Date(scheduledTime.getTime() + 10 * 60 * 1000);
      const now = new Date();
      const formatted = scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (now < earliestAllowed) {
        setAlertMessage(`Cannot log medication more than 5 minutes before the scheduled time of ${formatted}`);
        setShowAlert(true);
        return;
      }

      if (now > latestAllowed) {
        setAlertMessage(`Cannot log medication more than 10 minutes after the scheduled time of ${formatted}`);
        setShowAlert(true);
        return;
      }
    }

    setShowConfirm(true);
  };

  const handleConfirmedSubmit = async () => {
    if (!selectedPatient) return;
    setShowConfirm(false);
    setError('');
    setIsDuplicate(false);
    setIsSubmitting(true);

    try {
      const result = await medicationApi.logAdministration({
        patientId:     selectedPatient.patientId,
        medicationId:  Number(form.medicationId),
        scheduleId:    form.scheduleId ? Number(form.scheduleId) : undefined,
        actualTime:    form.actualTime,
        dosageGiven:   form.dosageGiven,
        status:        form.status,
        notes:         form.notes || undefined,
        sideEffects:   form.sideEffects || undefined,
        proofImageUrl: proofImageUrl ?? undefined,
      });
      success('Medication logged successfully!');
      setConfirmed({
        patientName:        selectedPatient.fullName,
        medicationName:     getMedicationName(form.medicationId),
        dosage:             form.dosageGiven,
        status:             form.status,
        administeredAt:     form.actualTime,
        administeredByName: result?.caregiverName ?? 'You',
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
      <div className="text-center py-16">
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Select a patient to continue.</p>
        <button onClick={() => navigate('/patients')} className="btn btn-primary">Go to patients</button>
      </div>
    );
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  if (confirmed) {
    return <ConfirmationScreen {...confirmed} onDone={() => navigate('/medications')} />;
  }

  const selectedScheduleId = form.scheduleId ? Number(form.scheduleId) : null;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <button
            onClick={() => navigate('/medications')}
            className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mb-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to schedules
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
            Log medication
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            Recording for{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {selectedPatient.fullName}
            </span>
          </p>
        </div>
      </div>

      {/* Duplicate warning */}
      {isDuplicate && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
          <svg className="w-4 h-4 text-warning-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-warning-800 dark:text-warning-200">Duplicate dose detected</p>
            <p className="text-xs text-warning-600 dark:text-warning-400 mt-0.5">{error}. All caregivers have been notified.</p>
          </div>
        </div>
      )}

      {/* Generic error */}
      {error && !isDuplicate && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-error-50 dark:bg-error-900/20 border border-error-100 dark:border-error-800 text-sm text-error-600 dark:text-error-400">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

          {/* Left col */}
          <div className="space-y-4">
            <Section title="Medication details">
              <div>
                <Select
                  name="scheduleId"
                  label="Schedule"
                  value={form.scheduleId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a scheduled medication…</option>
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
                  <p className="text-xs text-warning-600 dark:text-warning-400 mt-1.5">
                    No active schedules found. Create a schedule first.
                  </p>
                )}
              </div>

              {selectedScheduleId && (
                <LastGivenInfo scheduleId={selectedScheduleId} patientId={selectedPatient.patientId} />
              )}

              <Input
                name="dosageGiven"
                label="Dosage given"
                value={form.dosageGiven}
                onChange={handleChange}
                placeholder="e.g. 500mg, 1 tablet"
                required
              />

              <div>
                <Input
                  name="actualTime"
                  label="Time administered"
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
            </Section>

            <Section title="Notes">
              <Textarea
                name="notes"
                label="Notes (optional)"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                resize="none"
                placeholder="Any additional notes…"
              />
              <Textarea
                name="sideEffects"
                label="Side effects (optional)"
                value={form.sideEffects}
                onChange={handleChange}
                rows={2}
                resize="none"
                placeholder="Note any side effects observed…"
              />
            </Section>
          </div>

          {/* Right col */}
          <div className="space-y-4">
            <Section title="Status">
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      'flex items-start gap-2.5 p-3 border rounded-lg cursor-pointer transition-all',
                      form.status === option.value
                        ? `${option.border} ${option.bg}`
                        : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                    )}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={form.status === option.value}
                      onChange={handleChange}
                      className="accent-primary-500 mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-none mb-0.5">
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </Section>

            {form.status === 'ADMINISTERED' && (
              <Section title="Proof of administration">
                <p className="text-xs text-gray-400 dark:text-gray-500 -mt-1">
                  Optional photo proof that the medication was taken.
                </p>
                <ImageUploader
                  folder="administration-proof"
                  fileName={`proof_schedule_${form.scheduleId || 'unknown'}_${Date.now()}`}
                  label="Proof photo"
                  value={proofImageUrl}
                  onChange={setProofImageUrl}
                  optional
                  hint="Take a photo of the medication being administered."
                />
              </Section>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={() => navigate('/medications')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Log medication
          </Button>
        </div>
      </form>

      {/* Time validation alert */}
      <AlertDialog
        open={showAlert}
        onClose={() => setShowAlert(false)}
        title="Cannot log medication"
        description={alertMessage}
        variant="warning"
        confirmLabel="OK"
      />

      {/* Pre-submit confirmation */}
      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmedSubmit}
        title="Confirm medication log"
        description={`Log ${getMedicationName(form.medicationId)} as ${form.status.charAt(0) + form.status.slice(1).toLowerCase()} for ${selectedPatient?.fullName}?`}
        confirmLabel="Yes, log it"
        cancelLabel="Cancel"
        confirmVariant="primary"
        isLoading={isSubmitting}
        icon={
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        }
      />
    </div>
  );
}