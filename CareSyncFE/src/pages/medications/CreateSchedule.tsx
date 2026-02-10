import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicationApi } from '../../api';
import { usePatient } from '../../context/PatientContext';
import type { Medication } from '../../types/medication.types';

export function CreateSchedule() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();

  const [medications, setMedications] = useState<Medication[]>([]);
  const [formData, setFormData] = useState({
    medicationId: '',
    dosage: '',
    frequency: 'ONCE_DAILY',
    timeOfDay: '',
    instructions: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      const data = await medicationApi.getAllMedications();
      setMedications(data);
    } catch (err: any) {
      setError('Failed to load medications');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setError('');
    setIsLoading(true);

    try {
      await medicationApi.createSchedule({
        patientId: selectedPatient.patientId,
        medicationId: Number(formData.medicationId),
        dosage: formData.dosage,
        frequency: formData.frequency,
        timeOfDay: formData.timeOfDay,
        instructions: formData.instructions,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
      });

      navigate('/medications');
    } catch (err: any) {
      setError(err.message || 'Failed to create schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!selectedPatient) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="card text-center">
          <p className="text-gray-600">Please select a patient first</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary mt-4">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/medications')}
          className="text-primary-600 hover:text-primary-700 mb-4 inline-flex items-center gap-2"
        >
          ← Back to Medications
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create Medication Schedule</h1>
        <p className="text-gray-600 mt-1">For {selectedPatient.fullName}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-error-50 border border-error-200 rounded-lg text-sm text-error-600">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Medication Selection */}
        <div>
          <label htmlFor="medicationId" className="label">
            Medication <span className="text-error-500">*</span>
          </label>
          <select
            id="medicationId"
            name="medicationId"
            required
            value={formData.medicationId}
            onChange={handleChange}
            className="input"
          >
            <option value="">Select medication...</option>
            {medications.map((med) => (
              <option key={med.medicationId} value={med.medicationId}>
                {med.name} - {med.strength}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            If medication not listed, contact administrator to add it
          </p>
        </div>

        {/* Dosage */}
        <div>
          <label htmlFor="dosage" className="label">
            Dosage <span className="text-error-500">*</span>
          </label>
          <input
            id="dosage"
            name="dosage"
            type="text"
            required
            value={formData.dosage}
            onChange={handleChange}
            className="input"
            placeholder="e.g., 500mg, 1 tablet, 5ml"
          />
        </div>

        {/* Frequency */}
        <div>
          <label htmlFor="frequency" className="label">
            Frequency <span className="text-error-500">*</span>
          </label>
          <select
            id="frequency"
            name="frequency"
            required
            value={formData.frequency}
            onChange={handleChange}
            className="input"
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

        {/* Time of Day */}
        <div>
          <label htmlFor="timeOfDay" className="label">
            Time(s) of Day
          </label>
          <input
            id="timeOfDay"
            name="timeOfDay"
            type="text"
            value={formData.timeOfDay}
            onChange={handleChange}
            className="input"
            placeholder="e.g., 8:00 AM, 8:00 PM"
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate multiple times with commas
          </p>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="label">
              Start Date <span className="text-error-500">*</span>
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              required
              value={formData.startDate}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="label">
              End Date (Optional)
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>

        {/* Instructions */}
        <div>
          <label htmlFor="instructions" className="label">
            Instructions
          </label>
          <textarea
            id="instructions"
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            className="input"
            rows={3}
            placeholder="e.g., Take with food, Avoid dairy products, etc."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate('/medications')}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary flex-1"
          >
            {isLoading ? 'Creating...' : 'Create Schedule'}
          </button>
        </div>
      </form>
    </div>
  );
}