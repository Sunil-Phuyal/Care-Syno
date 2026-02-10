import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { medicationApi } from '../../api';
import { usePatient } from '../../context/PatientContext';
import type { Medication, MedicationSchedule } from '../../types/medication.types';

export function LogMedication() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedPatient } = usePatient();

  const [medications, setMedications] = useState<Medication[]>([]);
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [formData, setFormData] = useState({
    medicationId: '',
    scheduleId: location.state?.scheduleId?.toString() || '',
    actualTime: new Date().toISOString().slice(0, 16),
    dosageGiven: '',
    status: 'ADMINISTERED' as 'ADMINISTERED' | 'SKIPPED' | 'MISSED' | 'REFUSED',
    notes: '',
    sideEffects: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedPatient]);

  const loadData = async () => {
    if (!selectedPatient) return;

    try {
      const [medsData, schedulesData] = await Promise.all([
        medicationApi.getAllMedications(),
        medicationApi.getPatientSchedules(selectedPatient.patientId),
      ]);

      setMedications(medsData);
      setSchedules(schedulesData);

      // Pre-fill if schedule selected
      if (location.state?.scheduleId) {
        const schedule = schedulesData.find(s => s.scheduleId === location.state.scheduleId);
        if (schedule) {
          setFormData(prev => ({
            ...prev,
            medicationId: schedule.medicationId.toString(),
            dosageGiven: schedule.dosage,
          }));
        }
      }
    } catch (err: any) {
      setError('Failed to load data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setError('');
    setIsLoading(true);

    try {
      await medicationApi.logAdministration({
        patientId: selectedPatient.patientId,
        medicationId: Number(formData.medicationId),
        scheduleId: formData.scheduleId ? Number(formData.scheduleId) : undefined,
        scheduledTime: undefined,
        actualTime: formData.actualTime,
        dosageGiven: formData.dosageGiven,
        status: formData.status,
        notes: formData.notes || undefined,
        sideEffects: formData.sideEffects || undefined,
      });

      navigate('/medications');
    } catch (err: any) {
      setError(err.message || 'Failed to log medication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Auto-fill dosage when medication selected
    if (name === 'medicationId') {
      const schedule = schedules.find(s => s.medicationId === Number(value));
      if (schedule) {
        setFormData(prev => ({
          ...prev,
          dosageGiven: schedule.dosage,
          scheduleId: schedule.scheduleId.toString(),
        }));
      }
    }
  };

  if (!selectedPatient) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="card text-center">
          <p className="text-gray-600">Please select a patient first</p>
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
        <h1 className="text-2xl font-bold text-gray-900">Log Medication</h1>
        <p className="text-gray-600 mt-1">Record medication administration for {selectedPatient.fullName}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-error-50 border border-error-200 rounded-lg text-sm text-error-600">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Medication */}
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
        </div>

        {/* Actual Time */}
        <div>
          <label htmlFor="actualTime" className="label">
            Time Administered <span className="text-error-500">*</span>
          </label>
          <input
            id="actualTime"
            name="actualTime"
            type="datetime-local"
            required
            value={formData.actualTime}
            onChange={handleChange}
            className="input"
          />
          <button
            type="button"
            onClick={() => setFormData(prev => ({
              ...prev,
              actualTime: new Date().toISOString().slice(0, 16)
            }))}
            className="text-xs text-primary-600 hover:text-primary-700 mt-1"
          >
            Set to now
          </button>
        </div>

        {/* Dosage Given */}
        <div>
          <label htmlFor="dosageGiven" className="label">
            Dosage Given <span className="text-error-500">*</span>
          </label>
          <input
            id="dosageGiven"
            name="dosageGiven"
            type="text"
            required
            value={formData.dosageGiven}
            onChange={handleChange}
            className="input"
            placeholder="e.g., 500mg, 1 tablet"
          />
        </div>

        {/* Status */}
        <div>
          <label className="label">
            Status <span className="text-error-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['ADMINISTERED', 'SKIPPED', 'MISSED', 'REFUSED'] as const).map((status) => (
              <label
                key={status}
                className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.status === status
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={formData.status === status}
                  onChange={handleChange}
                  className="text-primary-600"
                />
                <div>
                  <div className="font-medium text-sm">{status}</div>
                  <div className="text-xs text-gray-500">
                    {status === 'ADMINISTERED' && 'Medication taken'}
                    {status === 'SKIPPED' && 'Intentionally skipped'}
                    {status === 'MISSED' && 'Accidentally missed'}
                    {status === 'REFUSED' && 'Patient refused'}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="label">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="input"
            rows={3}
            placeholder="Any additional notes..."
          />
        </div>

        {/* Side Effects */}
        <div>
          <label htmlFor="sideEffects" className="label">
            Side Effects
          </label>
          <textarea
            id="sideEffects"
            name="sideEffects"
            value={formData.sideEffects}
            onChange={handleChange}
            className="input"
            rows={2}
            placeholder="Note any side effects observed..."
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
            {isLoading ? 'Logging...' : 'Log Medication'}
          </button>
        </div>
      </form>
    </div>
  );
}