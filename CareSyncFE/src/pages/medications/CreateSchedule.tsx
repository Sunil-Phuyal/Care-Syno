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
    if (name === 'frequency') {
      setTimes(FREQUENCY_DEFAULTS[value] ?? ['08:00']);
    }
  };

  const handleTimeChange = (index: number, value: string) =>
    setTimes((prev) => prev.map((t, i) => (i === index ? value : t)));

  const addTime    = () => setTimes((prev) => [...prev, '12:00']);
  const removeTime = (index: number) => setTimes((prev) => prev.filter((_, i) => i !== index));

  const selectedMedName = medications.find(m => String(m.medicationId) === form.medicationId)?.name ?? 'medication';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
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
        instructions:         form.instructions || undefined,
        startDate:            form.startDate,
        endDate:              form.endDate || undefined,
        prescriptionImageUrl: prescriptionImageUrl ?? undefined,
        medicationPhotoUrl:   medicationPhotoUrl ?? undefined,
      });
      success('Medication schedule created successfully!');
      navigate('/medications');
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
      <div className="card text-center py-12">
        <p className="text-4xl mb-3">👤</p>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Please select a patient first.</p>
        <button onClick={() => navigate('/patients')} className="btn btn-primary">Go to Patients</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      <div>
        <button onClick={() => navigate('/medications')}
          className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400
                     hover:text-primary-700 dark:hover:text-primary-300 font-medium mb-3 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Medications
        </button>
        <h1 className="page-title">Create Medication Schedule</h1>
        <p className="page-subtitle">For {selectedPatient.fullName}</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-xl">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Medication details */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">Medication Details</h3>
          <div>
            <Select name="medicationId" label="Medication" value={form.medicationId} onChange={handleChange} required>
              <option value="">Select medication...</option>
              {medications.map((med) => (
                <option key={med.medicationId} value={med.medicationId}>
                  {med.name}{med.strength ? ` — ${med.strength}` : ''}
                </option>
              ))}
            </Select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              If medication not listed, contact administrator to add it.
            </p>
          </div>
          <Input name="dosage" label="Dosage" value={form.dosage} onChange={handleChange}
            placeholder="e.g. 500mg, 1 tablet, 5ml" required />
        </div>

        {/* Schedule */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">Schedule</h3>

          <Select name="frequency" label="Frequency" value={form.frequency} onChange={handleChange} required>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time(s) of Day
              </label>
              <div className="space-y-2">
                {times.map((time, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => handleTimeChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600
                                 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50
                                 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {times.length > 1 && (
                      <button type="button" onClick={() => removeTime(index)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addTime}
                className="mt-2 text-sm text-primary-600 dark:text-primary-400 font-medium
                           hover:underline flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add another time
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="startDate" label="Start Date" type="date"
              value={form.startDate} onChange={handleChange} required />
            <Input name="endDate" label="End Date (optional)" type="date"
              value={form.endDate} onChange={handleChange} />
          </div>
        </div>

        {/* Instructions */}
        <div className="card">
          <Textarea name="instructions" label="Instructions (optional)" value={form.instructions}
            onChange={handleChange} rows={3} resize="none"
            placeholder="e.g. Take with food, avoid dairy products..." />
        </div>

        {/* Images */}
        <div className="card space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-1">Prescription Image</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Upload the doctor's prescription for this medication.
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
          <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-1">Medication Photo</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Photo of the actual pill or bottle — helps identify it correctly.
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

        <div className="flex gap-3">
          <Button type="button" variant="secondary" fullWidth onClick={() => navigate('/medications')}>Cancel</Button>
          <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>Create Schedule</Button>
        </div>
      </form>
    </div>
  );
}