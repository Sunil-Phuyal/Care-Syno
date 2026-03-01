// src/pages/medications/CreateSchedule.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicationApi } from '../../api/medication.api';
import { usePatient } from '../../context/PatientContext';
import { useNotification } from '../../context/NotificationContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import type { Medication } from '../../types/medication.types';

export function CreateSchedule() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();
  const { success, error: showError } = useNotification();

  const [medications, setMedications] = useState<Medication[]>([]);
  const [form, setForm] = useState({
    medicationId: '',
    dosage:       '',
    frequency:    'ONCE_DAILY',
    timeOfDay:    '',
    instructions: '',
    startDate:    new Date().toISOString().split('T')[0],
    endDate:      '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await medicationApi.getAllMedications();
        setMedications(data);
      } catch {
        showError('Failed to load medications');
      }
    };
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setError('');
    setIsLoading(true);
    try {
      await medicationApi.createSchedule({
        patientId:    selectedPatient.patientId,
        medicationId: Number(form.medicationId),
        dosage:       form.dosage,
        frequency:    form.frequency,
        timeOfDay:    form.timeOfDay || undefined,
        instructions: form.instructions || undefined,
        startDate:    form.startDate,
        endDate:      form.endDate || undefined,
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

  // No patient selected
  if (!selectedPatient) {
    return (
      <div className="card text-center py-12">
        <p className="text-4xl mb-3">👤</p>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Please select a patient first.</p>
        <button onClick={() => navigate('/patients')} className="btn btn-primary">
          Go to Patients
        </button>
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
        <h1 className="page-title">Create Medication Schedule</h1>
        <p className="page-subtitle">For {selectedPatient.fullName}</p>
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

        {/* Medication + Dosage */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">Medication Details</h3>

          <div>
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
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              If medication not listed, contact administrator to add it.
            </p>
          </div>

          <Input
            name="dosage"
            label="Dosage"
            value={form.dosage}
            onChange={handleChange}
            placeholder="e.g. 500mg, 1 tablet, 5ml"
            required
          />
        </div>

        {/* Schedule */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">Schedule</h3>

          <Select
            name="frequency"
            label="Frequency"
            value={form.frequency}
            onChange={handleChange}
            required
          >
            <option value="ONCE_DAILY">Once daily</option>
            <option value="TWICE_DAILY">Twice daily</option>
            <option value="THREE_TIMES_DAILY">Three times daily</option>
            <option value="FOUR_TIMES_DAILY">Four times daily</option>
            <option value="AS_NEEDED">As needed</option>
            <option value="WEEKLY">Weekly</option>
            <option value="CUSTOM">Custom</option>
          </Select>

          <div>
            <Input
              name="timeOfDay"
              label="Time(s) of Day"
              value={form.timeOfDay}
              onChange={handleChange}
              placeholder="e.g. 8:00 AM, 8:00 PM"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Separate multiple times with commas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              name="startDate"
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              required
            />
            <Input
              name="endDate"
              label="End Date (optional)"
              type="date"
              value={form.endDate}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="card">
          <Textarea
            name="instructions"
            label="Instructions (optional)"
            value={form.instructions}
            onChange={handleChange}
            rows={3}
            resize="none"
            placeholder="e.g. Take with food, avoid dairy products..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="button" variant="secondary" fullWidth onClick={() => navigate('/medications')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
            Create Schedule
          </Button>
        </div>
      </form>
    </div>
  );
}