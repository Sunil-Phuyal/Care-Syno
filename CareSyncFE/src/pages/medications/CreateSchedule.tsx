import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { medicationApi } from '../../api/medication.api';
import { usePatient } from '../../context/PatientContext';
import { useNotification } from '../../context/NotificationContext';
import { PermissionGate } from '../../components/common/PermissionGate';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import type { Medication } from '../../types/medication.types';

const FREQUENCY_DEFAULTS: Record<string, string[]> = {
  ONCE_DAILY: ['08:00'],
  TWICE_DAILY: ['08:00', '20:00'],
  THREE_TIMES_DAILY: ['08:00', '14:00', '20:00'],
  FOUR_TIMES_DAILY: ['08:00', '12:00', '16:00', '20:00'],
  AS_NEEDED: [],
  WEEKLY: ['08:00'],
  CUSTOM: ['08:00'],
};

const FREQUENCY_LABELS: Record<string, string> = {
  ONCE_DAILY: 'Once daily',
  TWICE_DAILY: 'Twice daily',
  THREE_TIMES_DAILY: 'Three times daily',
  FOUR_TIMES_DAILY: 'Four times daily',
  AS_NEEDED: 'As needed',
  WEEKLY: 'Weekly',
  CUSTOM: 'Custom',
};

function CreateScheduleForm() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();
  const { success, error: showError } = useNotification();

  const [medications, setMedications] = useState<Medication[]>([]);
  const [prescriptionImageUrl, setPrescriptionImageUrl] = useState<string | null>(null);
  const [medicationPhotoUrl, setMedicationPhotoUrl] = useState<string | null>(null);
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [form, setForm] = useState({
    medicationId: '',
    dosage: '',
    frequency: 'ONCE_DAILY',
    instructions: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    medicationApi
      .getAllMedications()
      .then(setMedications)
      .catch(() => showError('Failed to load medications'));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'frequency') setTimes(FREQUENCY_DEFAULTS[value] ?? ['08:00']);
  };

  const handleTimeChange = (index: number, value: string) =>
    setTimes((prev) => prev.map((t, i) => (i === index ? value : t)));

  const addTime = () => setTimes((prev) => [...prev, '12:00']);

  const removeTime = (index: number) =>
    setTimes((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    if (!form.medicationId) {
      setError('Please select a medication.');
      return;
    }
    if (times.length === 0 && form.frequency !== 'AS_NEEDED') {
      setError('Please add at least one time.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await medicationApi.createSchedule({
        patientId: selectedPatient.patientId,
        medicationId: Number(form.medicationId),
        dosage: form.dosage,
        frequency: form.frequency,
        times,
        specialInstructions: form.instructions || undefined,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        prescriptionImageUrl: prescriptionImageUrl ?? undefined,
        medicationPhotoUrl: medicationPhotoUrl ?? undefined,
      });
      success('Medication schedule created successfully!');
      navigate('/medications/schedules');
    } catch (err: any) {
      const msg = err.message || 'Failed to create schedule';
      showError(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedPatient) {
    return (
      <div className="py-16 text-center">
        <p className="text-3xl mb-3">👤</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Please select a patient first.
        </p>
        <button
          onClick={() => navigate('/patients')}
          className="btn btn-primary text-sm"
        >
          Go to Patients
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/medications/schedules')}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Schedules
          </button>
          <h1 className="text-lg font-medium text-gray-900 dark:text-gray-50">
            Create medication schedule
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Patient:{' '}
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              {selectedPatient.fullName}
            </span>
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 mb-5 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="space-y-5">
          {/* Medication select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Medication <span className="text-red-500">*</span>
            </label>
            <Select
              name="medicationId"
              value={form.medicationId}
              onChange={handleChange}
              required
            >
              <option value="">Select a medication…</option>
              {medications.map((med) => (
                <option key={med.medicationId} value={String(med.medicationId)}>
                  {med.medicationName}
                </option>
              ))}
            </Select>
          </div>

          {/* Dosage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Dosage <span className="text-red-500">*</span>
            </label>
            <Input
              name="dosage"
              value={form.dosage}
              onChange={handleChange}
              placeholder="e.g. 500mg, 1 tablet"
              required
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Frequency <span className="text-red-500">*</span>
            </label>
            <Select name="frequency" value={form.frequency} onChange={handleChange}>
              {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>

          {/* Times */}
          {form.frequency !== 'AS_NEEDED' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Time(s)
              </label>
              <div className="space-y-2">
                {times.map((time, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => handleTimeChange(index, e.target.value)}
                      className="w-36"
                    />
                    {times.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTime(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                {form.frequency === 'CUSTOM' && (
                  <button
                    type="button"
                    onClick={addTime}
                    className="inline-flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:underline mt-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add time
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Start & End date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Start date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                End date <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <Input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                min={form.startDate}
              />
            </div>
          </div>

          {/* Special instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Special instructions <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <Textarea
              name="instructions"
              value={form.instructions}
              onChange={handleChange}
              placeholder="e.g. Take with food, avoid dairy…"
              rows={3}
            />
          </div>

          {/* Images */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Prescription image <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <ImageUploader
                value={prescriptionImageUrl}
                onChange={setPrescriptionImageUrl}
                folder="prescriptions"
                fileName={`prescription-${selectedPatient.patientId}`}
                label="Upload prescription"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Medication photo <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <ImageUploader
                value={medicationPhotoUrl}
                onChange={setMedicationPhotoUrl}
                folder="medications"
                fileName={`medication-${form.medicationId}`}
                label="Upload photo"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-gray-200 dark:border-gray-800">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/medications/schedules')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading} isLoading={isLoading}>
            Create schedule
          </Button>
        </div>
      </form>
    </div>
  );
}

// PermissionGate wraps the whole page —
// Secondary CG and Healthcare Provider are redirected away
export function CreateSchedule() {
  const navigate = useNavigate();

  return (
    <PermissionGate
      permission="medication.create_schedule"
      fallback={<Navigate to="/medications/schedules" replace />}
    >
      <CreateScheduleForm />
    </PermissionGate>
  );
}