// src/pages/medications/CreateSchedule.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicationApi } from '../../api/medication.api';
import { usePatient } from '../../context/PatientContext';
import { useNotification } from '../../context/NotificationContext';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import type { Medication } from '../../types/medication.types';

const FREQUENCY_DEFAULTS: Record<string, string[]> = {
  ONCE_DAILY:        ['08:00'],
  TWICE_DAILY:       ['08:00', '20:00'],
  THREE_TIMES_DAILY: ['08:00', '14:00', '20:00'],
  FOUR_TIMES_DAILY:  ['08:00', '12:00', '16:00', '20:00'],
  AS_NEEDED:         [],
  WEEKLY:            ['08:00'],
  CUSTOM:            ['08:00'],
};

const FREQUENCY_LABELS: Record<string, string> = {
  ONCE_DAILY:        'Once daily',
  TWICE_DAILY:       'Twice daily',
  THREE_TIMES_DAILY: 'Three times daily',
  FOUR_TIMES_DAILY:  'Four times daily',
  AS_NEEDED:         'As needed',
  WEEKLY:            'Weekly',
  CUSTOM:            'Custom',
};

export function CreateSchedule() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();
  const { success, error: showError } = useNotification();

  const [medications, setMedications]                   = useState<Medication[]>([]);
  const [prescriptionImageUrl, setPrescriptionImageUrl] = useState<string | null>(null);
  const [medicationPhotoUrl, setMedicationPhotoUrl]     = useState<string | null>(null);
  const [times, setTimes]                               = useState<string[]>(['08:00']);
  const [form, setForm] = useState({
    medicationId: '',
    dosage:       '',
    frequency:    'ONCE_DAILY',
    instructions: '',
    startDate:    new Date().toISOString().split('T')[0],
    endDate:      '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    medicationApi.getAllMedications()
      .then(setMedications)
      .catch(() => showError('Failed to load medications'));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'frequency') setTimes(FREQUENCY_DEFAULTS[value] ?? ['08:00']);
  };

  const handleTimeChange = (index: number, value: string) =>
    setTimes((prev) => prev.map((t, i) => (i === index ? value : t)));

  const addTime    = () => setTimes((prev) => [...prev, '12:00']);
  const removeTime = (index: number) => setTimes((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    if (!form.medicationId) { setError('Please select a medication.'); return; }
    if (times.length === 0 && form.frequency !== 'AS_NEEDED') {
      setError('Please add at least one time.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await medicationApi.createSchedule({
        patientId:            selectedPatient.patientId,
        medicationId:         Number(form.medicationId),
        dosage:               form.dosage,
        frequency:            form.frequency,
        times,
        specialInstructions:  form.instructions || undefined,
        startDate:            form.startDate,
        endDate:              form.endDate || undefined,
        prescriptionImageUrl: prescriptionImageUrl ?? undefined,
        medicationPhotoUrl:   medicationPhotoUrl ?? undefined,
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

  const selectedMed    = medications.find(m => String(m.medicationId) === form.medicationId);
  const selectedMedName = selectedMed?.medicationName ?? 'medication';
  const patientInitials = selectedPatient
    ? selectedPatient.fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : '';

  if (!selectedPatient) {
    return (
      <div className="py-16 text-center">
        <p className="text-3xl mb-3">👤</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Please select a patient first.</p>
        <button onClick={() => navigate('/patients')} className="btn btn-primary text-sm">
          Go to Patients
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <form onSubmit={handleSubmit}>
        {/* Page header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/medications/schedules')}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400
                       hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors"
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
          <div className="flex items-center gap-2.5 px-3 py-2.5 mb-5 rounded-lg
                          bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_256px] gap-8 items-start">

          {/* ── Left: form sections ── */}
          <div className="space-y-4">

            {/* No medications warning */}
            {medications.length === 0 && (
              <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg
                              bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  No medicines in catalog.{' '}
                  <button type="button" onClick={() => navigate('/medications')}
                    className="font-medium underline underline-offset-2">
                    Add medicines first
                  </button>
                </p>
              </div>
            )}

            {/* Section: Medication */}
            <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">
                Medication
              </p>
              <div className="space-y-4">
                <div>
                  <Select name="medicationId" label="Medication" value={form.medicationId}
                    onChange={handleChange} required>
                    <option value="">Select medication...</option>
                    {medications.map((med) => (
                      <option key={med.medicationId} value={med.medicationId}>
                        {med.medicationName}{med.genericName ? ` — ${med.genericName}` : ''}
                      </option>
                    ))}
                  </Select>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Not listed?{' '}
                    <button type="button" onClick={() => navigate('/medications')}
                      className="text-primary-600 dark:text-primary-400 hover:underline underline-offset-2">
                      Add from Medications page
                    </button>
                  </p>
                </div>
                <Input name="dosage" label="Dosage" value={form.dosage} onChange={handleChange}
                  placeholder="e.g. 500mg, 1 tablet, 5ml" required />
              </div>
            </section>

            {/* Section: Schedule */}
            <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">
                Schedule
              </p>
              <div className="space-y-4">
                <Select name="frequency" label="Frequency" value={form.frequency}
                  onChange={handleChange} required>
                  <option value="ONCE_DAILY">Once daily</option>
                  <option value="TWICE_DAILY">Twice daily</option>
                  <option value="THREE_TIMES_DAILY">Three times daily</option>
                  <option value="FOUR_TIMES_DAILY">Four times daily</option>
                  <option value="AS_NEEDED">As needed</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="CUSTOM">Custom</option>
                </Select>

                {form.frequency !== 'AS_NEEDED' && (
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Time(s) of day
                    </label>
                    <div className="space-y-2 mb-2">
                      {times.map((time, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => handleTimeChange(index, e.target.value)}
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700
                                       rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50
                                       focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                          />
                          {times.length > 1 && (
                            <button type="button" onClick={() => removeTime(index)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50
                                         dark:hover:bg-red-950 rounded-md transition-colors">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={addTime}
                      className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400
                                 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Add another time
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input name="startDate" label="Start date" type="date"
                    value={form.startDate} onChange={handleChange} required />
                  <Input name="endDate" label="End date (optional)" type="date"
                    value={form.endDate} onChange={handleChange} />
                </div>
              </div>
            </section>

            {/* Section: Instructions */}
            <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">
                Instructions
              </p>
              <Textarea name="instructions" label="Special instructions (optional)"
                value={form.instructions} onChange={handleChange}
                rows={3} resize="none"
                placeholder="e.g. Take with food, avoid dairy products..." />
            </section>

            {/* Section: Attachments */}
            <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">
                Attachments
              </p>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Prescription image
                    <span className="text-gray-400 dark:text-gray-500 font-normal"> (optional)</span>
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                    Scan or photo of the doctor's prescription.
                  </p>
                  <ImageUploader
                    folder="prescriptions"
                    fileName={`prescription_${selectedPatient.fullName.replace(/\s+/g, '_')}_${selectedMedName.replace(/\s+/g, '_')}`}
                    label="Doctor's Prescription"
                    value={prescriptionImageUrl}
                    onChange={setPrescriptionImageUrl}
                    optional
                    hint="Scan or photograph the prescription document."
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Medication photo
                    <span className="text-gray-400 dark:text-gray-500 font-normal"> (optional)</span>
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                    Photo of the pill or bottle — helps identify it correctly.
                  </p>
                  <ImageUploader
                    folder="medications"
                    fileName={`medication_${selectedMedName.replace(/\s+/g, '_')}_${selectedPatient.fullName.replace(/\s+/g, '_')}`}
                    label="Medicine Photo"
                    value={medicationPhotoUrl}
                    onChange={setMedicationPhotoUrl}
                    optional
                    hint="Photo of the pill, tablet, or medicine bottle."
                  />
                </div>
              </div>
            </section>

            {/* Action bar */}
            <div className="flex gap-3 pb-6">
              <Button type="button" variant="secondary"
                onClick={() => navigate('/medications/schedules')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isLoading}>
                Create schedule
              </Button>
            </div>
          </div>

          {/* ── Right: sticky sidebar ── */}
          <aside className="hidden lg:flex flex-col gap-3 sticky top-6">

            {/* Summary card */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700
                            bg-white dark:bg-gray-900 p-4">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
                Summary
              </p>
              <dl className="space-y-0">
                {[
                  { label: 'Medication', value: selectedMed?.medicationName },
                  { label: 'Dosage',     value: form.dosage },
                  { label: 'Frequency',  value: FREQUENCY_LABELS[form.frequency] },
                  {
                    label: 'Times',
                    value: form.frequency === 'AS_NEEDED'
                      ? 'As needed'
                      : times.join(', ') || '—',
                  },
                  { label: 'Start',      value: form.startDate },
                  { label: 'End',        value: form.endDate || 'Ongoing' },
                ].map(({ label, value }) => (
                  <div key={label}
                    className="flex justify-between items-center py-2
                               border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <dt className="text-xs text-gray-400 dark:text-gray-500">{label}</dt>
                    <dd className={`text-xs text-right font-medium max-w-[60%] truncate ${
                      value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-300 dark:text-gray-600 font-normal italic'
                    }`}>
                      {value || '—'}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Patient card */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700
                            bg-white dark:bg-gray-900 p-4">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
                Patient
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900
                                flex items-center justify-center text-xs font-medium
                                text-primary-700 dark:text-primary-300 flex-shrink-0">
                  {patientInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {selectedPatient.fullName}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    ID #{selectedPatient.patientId}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}