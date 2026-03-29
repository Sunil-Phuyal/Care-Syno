// src/pages/patients/CreatePatient.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi } from '../../api/patient.api';
import { usePatient } from '../../context/PatientContext';
import { useNotification } from '../../context/NotificationContext';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';

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

export function CreatePatient() {
  const navigate = useNavigate();
  const { refreshPatients } = usePatient();
  const { success, error: showError } = useNotification();

  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName:              '',
    dateOfBirth:           '',
    gender:                'MALE',
    phoneNumber:           '',
    address:               '',
    emergencyContactName:  '',
    emergencyContactPhone: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await patientApi.createPatient({ ...form, profileImageUrl: profileImageUrl ?? undefined });
      await refreshPatients();
      success('Patient created successfully!');
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
    <div className="space-y-5">

      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/patients')}
          className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mb-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to patients
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
          Add new patient
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
          Fill in the patient's details below
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-error-50 dark:bg-error-900/20 border border-error-100 dark:border-error-800 text-sm text-error-600 dark:text-error-400">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── Basic information ─────────────────────────────────── */}
        <Section title="Basic information">

          <Input
            name="fullName"
            label="Full name"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Ram Sharma"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              name="dateOfBirth"
              label="Date of birth"
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
            label="Phone number"
            type="tel"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="+977-9801234567"
          />

          <Textarea
            name="address"
            label="Address"
            value={form.address}
            onChange={handleChange}
            placeholder="Street, City, State, ZIP"
            rows={3}
            resize="none"
          />
        </Section>

        {/* ── Emergency contact ─────────────────────────────────── */}
        <Section title="Emergency contact">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              name="emergencyContactName"
              label="Contact name"
              value={form.emergencyContactName}
              onChange={handleChange}
              placeholder="Sita Sharma"
            />
            <Input
              name="emergencyContactPhone"
              label="Contact phone"
              type="tel"
              value={form.emergencyContactPhone}
              onChange={handleChange}
              placeholder="+977-9801234567"
            />
          </div>
        </Section>

        {/* ── Profile photo ─────────────────────────────────────── */}
        <Section title="Profile photo">
          <p className="text-xs text-gray-400 dark:text-gray-500 -mt-1">
            Optional · helps caregivers visually identify the patient.
          </p>
          <ImageUploader
            folder="patients"
            fileName={`patient_${form.fullName.replace(/\s+/g, '_') || 'new'}`}
            label="Profile photo"
            value={profileImageUrl}
            onChange={setProfileImageUrl}
            optional
            hint="JPG, PNG, GIF, WEBP · Max 15 MB"
          />
        </Section>

        {/* ── Actions ───────────────────────────────────────────── */}
        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={() => navigate('/patients')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Create patient
          </Button>
        </div>

      </form>
    </div>
  );
}