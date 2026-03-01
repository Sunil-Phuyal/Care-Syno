// src/pages/patients/EditPatient.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientApi } from '../../api/patient.api';
import { usePatient } from '../../context/PatientContext';
import { useNotification } from '../../context/NotificationContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Spinner } from '../../components/ui/Spinner';

export function EditPatient() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { refreshPatients } = usePatient();
  const { success, error: showError } = useNotification();

  const [form, setForm] = useState({
    fullName:             '',
    dateOfBirth:          '',
    gender:               'MALE',
    phoneNumber:          '',
    address:              '',
    emergencyContactName: '',
    emergencyContactPhone:'',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);
  const [error, setError]         = useState('');

  // Load patient data
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const patient = await patientApi.getPatient(Number(id));
        setForm({
          fullName:             patient.fullName,
          dateOfBirth:          patient.dateOfBirth,
          gender:               patient.gender ?? 'MALE',
          phoneNumber:          patient.phoneNumber ?? '',
          address:              patient.address ?? '',
          emergencyContactName: patient.emergencyContactName ?? '',
          emergencyContactPhone:patient.emergencyContactPhone ?? '',
        });
      } catch {
        setError('Failed to load patient. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError('');
    setIsSaving(true);
    try {
      await patientApi.updatePatient(Number(id), form);
      await refreshPatients();
      success('Patient updated successfully!');
      navigate(`/patients/${id}`);
    } catch (err: any) {
      const msg = err.message || 'Failed to update patient';
      showError(msg);
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading patient...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <button
          onClick={() => navigate(`/patients/${id}`)}
          className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400
                     hover:text-primary-700 dark:hover:text-primary-300 font-medium mb-3 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Patient
        </button>
        <h1 className="page-title">Edit Patient</h1>
        <p className="page-subtitle">Update patient information</p>
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

        {/* Basic info */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">Basic Information</h3>

          <Input
            name="fullName"
            label="Full Name"
            value={form.fullName}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              name="dateOfBirth"
              label="Date of Birth"
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange}
              required
            />
            <Select
              name="gender"
              label="Gender"
              value={form.gender}
              onChange={handleChange}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>

          <Input
            name="phoneNumber"
            label="Phone Number"
            type="tel"
            value={form.phoneNumber}
            onChange={handleChange}
          />

          <Textarea
            name="address"
            label="Address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            resize="none"
          />
        </div>

        {/* Emergency contact */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">Emergency Contact</h3>

          <Input
            name="emergencyContactName"
            label="Contact Name"
            value={form.emergencyContactName}
            onChange={handleChange}
          />

          <Input
            name="emergencyContactPhone"
            label="Contact Phone"
            type="tel"
            value={form.emergencyContactPhone}
            onChange={handleChange}
          />
        </div>

        {/* Form actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => navigate(`/patients/${id}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSaving}
          >
            Update Patient
          </Button>
        </div>
      </form>
    </div>
  );
}