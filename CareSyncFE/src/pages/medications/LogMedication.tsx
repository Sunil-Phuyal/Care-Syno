// src/pages/medications/LogMedication.tsx

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { medicationApi } from '../../api/medication.api';
import { usePatient } from '../../context/PatientContext';
import { useNotification } from '../../context/NotificationContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Spinner } from '../../components/ui/Spinner';
import { cn } from '../../utils/cn';
import type { Medication, MedicationSchedule } from '../../types/medication.types';

// ─── Status option config ─────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'ADMINISTERED', label: 'Administered', desc: 'Medication taken',       color: 'border-success-500 bg-success-50 dark:bg-success-900' },
  { value: 'SKIPPED',      label: 'Skipped',      desc: 'Intentionally skipped',  color: 'border-warning-500 bg-warning-50 dark:bg-warning-900' },
  { value: 'MISSED',       label: 'Missed',       desc: 'Accidentally missed',     color: 'border-error-500 bg-error-50 dark:bg-error-900' },
  { value: 'REFUSED',      label: 'Refused',      desc: 'Patient refused',         color: 'border-gray-400 bg-gray-50 dark:bg-gray-800' },
] as const;

export function LogMedication() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { selectedPatient } = usePatient();
  const { success, error: showError } = useNotification();

  const [medications, setMedications] = useState<Medication[]>([]);
  const [schedules, setSchedules]     = useState<MedicationSchedule[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    medicationId: '',
    scheduleId:   location.state?.scheduleId?.toString() ?? '',
    actualTime:   new Date().toISOString().slice(0, 16),
    dosageGiven:  '',
    status:       'ADMINISTERED' as 'ADMINISTERED' | 'SKIPPED' | 'MISSED' | 'REFUSED',
    notes:        '',
    sideEffects:  '',
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

        // Pre-fill if coming from a schedule
        if (location.state?.scheduleId) {
          const schedule = schedulesData.find((s) => s.scheduleId === location.state.scheduleId);
          if (schedule) {
            setForm((prev) => ({
              ...prev,
              medicationId: schedule.medicationId.toString(),
              dosageGiven:  schedule.dosage,
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
    setForm((prev) => ({ ...prev, [name]: value }));

    // Auto-fill dosage when medication selected
    if (name === 'medicationId') {
      const schedule = schedules.find((s) => s.medicationId === Number(value));
      if (schedule) {
        setForm((prev) => ({
          ...prev,
          medicationId: value,
          dosageGiven:  schedule.dosage,
          scheduleId:   schedule.scheduleId.toString(),
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setError('');
    setIsSubmitting(true);
    try {
      await medicationApi.logAdministration({
        patientId:    selectedPatient.patientId,
        medicationId: Number(form.medicationId),
        scheduleId:   form.scheduleId ? Number(form.scheduleId) : undefined,
        actualTime:   form.actualTime,
        dosageGiven:  form.dosageGiven,
        status:       form.status,
        notes:        form.notes || undefined,
        sideEffects:  form.sideEffects || undefined,
      });
      success('Medication logged successfully!');
      navigate('/medications');
    } catch (err: any) {
      const msg = err.message || 'Failed to log medication';
      showError(msg);
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // No patient selected
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/medications')}
          className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400
                     hover:text-primary-700 dark:hover:text-primary-300 font-medium mb-3 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Medications
        </button>
        <h1 className="page-title">Log Medication</h1>
        <p className="page-subtitle">Record medication administration for {selectedPatient.fullName}</p>
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

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Medication + Time */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">Medication Details</h3>

          <Select
            name="medicationId"
            label="Medication"
            value={form.medicationId}
            onChange={handleChange}
            required
          >
            <option value="">Select medication...</option>
            {medications.map((med) => (
              <option key={med.medicationId} value={med.medicationId}>
                {med.name}{med.strength ? ` — ${med.strength}` : ''}
              </option>
            ))}
          </Select>

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

        {/* Status */}
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
                    ? option.color + ' border-opacity-100'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                <input
                  type="radio"
                  name="status"
                  value={option.value}
                  checked={form.status === option.value}
                  onChange={handleChange}
                  className="text-primary-500 accent-primary-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{option.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Notes + Side effects */}
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

        {/* Actions */}
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