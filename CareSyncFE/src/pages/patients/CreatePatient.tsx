// src/pages/patients/CreatePatient.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi } from '../../api/patient.api';
import { usePatient } from '../../context/PatientContext';
import { useNotification } from '../../context/NotificationContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';

export function CreatePatient() {
  const navigate = useNavigate();
  const { refreshPatients, myPatients } = usePatient();
  const { success, error: showError } = useNotification();

  const [form, setForm] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'MALE',
    phoneNumber: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Backend returns void — create then refresh to get the new patient
      await patientApi.createPatient(form);
      await refreshPatients();
      success('Patient created successfully!');
      // Navigate to patients list — the new patient will be there
      navigate('/patients');
    } catch (err: any) {
      const msg = err.message || 'Failed to create patient';
      showError(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/patients')}
          className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400
                     hover:text-primary-700 dark:hover:text-primary-300 font-medium mb-3 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Patients
        </button>
        <h1 className="page-title">Add New Patient</h1>
        <p className="page-subtitle">Enter patient information below</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-xl">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic info */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">Basic Information</h3>
          <Input name="fullName" label="Full Name" value={form.fullName} onChange={handleChange}
            placeholder="Ram Sharma" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="dateOfBirth" label="Date of Birth" type="date"
              value={form.dateOfBirth} onChange={handleChange} required />
            <Select name="gender" label="Gender" value={form.gender} onChange={handleChange}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <Input name="phoneNumber" label="Phone Number" type="tel"
            value={form.phoneNumber} onChange={handleChange} placeholder="+977-9801234567" />
          <Textarea name="address" label="Address" value={form.address} onChange={handleChange}
            placeholder="Street, City, State, ZIP" rows={3} resize="none" />
        </div>

        {/* Emergency contact */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">Emergency Contact</h3>
          <Input name="emergencyContactName" label="Contact Name"
            value={form.emergencyContactName} onChange={handleChange} placeholder="Sita Sharma" />
          <Input name="emergencyContactPhone" label="Contact Phone" type="tel"
            value={form.emergencyContactPhone} onChange={handleChange} placeholder="+977-9801234567" />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="button" variant="secondary" fullWidth onClick={() => navigate('/patients')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
            Create Patient
          </Button>
        </div>

      </form>
    </div>
  );
}