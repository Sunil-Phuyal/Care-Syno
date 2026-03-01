// src/pages/caregivers/InviteCaregiver.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { caregiverApi } from '../../api/caregiver.api';
import { usePatient } from '../../context/PatientContext';
import { useNotification } from '../../context/NotificationContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { cn } from '../../utils/cn';

// ─── Role permission info ─────────────────────────────────────────────────────
const ROLE_INFO: Record<string, { title: string; color: string; permissions: { label: string; granted: boolean }[] }> = {
  '2': {
    title: 'Primary Caregiver',
    color: 'bg-primary-50 dark:bg-primary-900 border-primary-200 dark:border-primary-700',
    permissions: [
      { label: 'View and edit patient information', granted: true },
      { label: 'Create and manage medication schedules', granted: true },
      { label: 'Administer medications', granted: true },
      { label: 'Invite and remove caregivers', granted: true },
      { label: 'Manage permissions for other caregivers', granted: true },
      { label: 'View and export reports', granted: true },
    ],
  },
  '3': {
    title: 'Secondary Caregiver',
    color: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600',
    permissions: [
      { label: 'View patient information', granted: true },
      { label: 'View and administer medications', granted: true },
      { label: 'View care team', granted: true },
      { label: 'View reports', granted: true },
      { label: 'Edit patient or schedules', granted: false },
      { label: 'Invite or remove caregivers', granted: false },
    ],
  },
  '4': {
    title: 'Healthcare Provider',
    color: 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700',
    permissions: [
      { label: 'View patient information', granted: true },
      { label: 'View medications and create schedules', granted: true },
      { label: 'View reports', granted: true },
      { label: 'Administer medications', granted: false },
      { label: 'Manage caregivers', granted: false },
    ],
  },
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export function InviteCaregiver() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();
  const { success, error: showError } = useNotification();

  const [form, setForm] = useState({
    email:        '',
    fullName:     '',
    roleId:       '3',
    relationship: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setError('');
    setIsLoading(true);
    try {
      await caregiverApi.inviteCaregiver({
        patientId:    selectedPatient.patientId,
        email:        form.email,
        fullName:     form.fullName,
        roleId:       Number(form.roleId),
        relationship: form.relationship,
      });
      success('Caregiver invitation sent successfully!');
      navigate('/caregivers');
    } catch (err: any) {
      const msg = err.message || 'Failed to invite caregiver';
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

  const roleInfo = ROLE_INFO[form.roleId];

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/caregivers')}
          className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400
                     hover:text-primary-700 dark:hover:text-primary-300 font-medium mb-3 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Care Team
        </button>
        <h1 className="page-title">Invite Caregiver</h1>
        <p className="page-subtitle">Add a new caregiver to {selectedPatient.fullName}'s care team</p>
      </div>

      {/* Info box */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900
                      border border-blue-200 dark:border-blue-700 rounded-xl">
        <span className="text-lg flex-shrink-0">📧</span>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          An email invitation will be sent to this person. If they don't have an account, one will be
          created for them with a temporary password.
        </p>
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

        {/* Caregiver details */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">Caregiver Details</h3>

          <Input
            name="email"
            label="Email Address"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="caregiver@example.com"
            required
          />

          <Input
            name="fullName"
            label="Full Name"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Krishna Sharma"
            required
          />

          <Select
            name="relationship"
            label="Relationship (optional)"
            value={form.relationship}
            onChange={handleChange}
          >
            <option value="">Select relationship...</option>
            <option value="SON">Son</option>
            <option value="DAUGHTER">Daughter</option>
            <option value="SPOUSE">Spouse</option>
            <option value="SIBLING">Sibling</option>
            <option value="FRIEND">Friend</option>
            <option value="PROFESSIONAL">Professional Caregiver</option>
            <option value="NURSE">Nurse</option>
            <option value="DOCTOR">Doctor</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>

        {/* Role selection */}
        <div className="card space-y-4">
          <div>
            <Select
              name="roleId"
              label="Role"
              value={form.roleId}
              onChange={handleChange}
              required
            >
              <option value="2">Primary Caregiver — Full access</option>
              <option value="3">Secondary Caregiver — Limited access</option>
              <option value="4">Healthcare Provider — Read-only + schedules</option>
            </Select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              You can customize permissions after inviting.
            </p>
          </div>

          {/* Role permissions preview */}
          {roleInfo && (
            <div className={cn('p-4 border rounded-xl', roleInfo.color)}>
              <p className="font-semibold text-gray-900 dark:text-gray-50 mb-3">{roleInfo.title}</p>
              <ul className="space-y-1.5">
                {roleInfo.permissions.map((perm, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <span>{perm.granted ? '✅' : '❌'}</span>
                    <span>{perm.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="button" variant="secondary" fullWidth onClick={() => navigate('/caregivers')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
            Send Invitation
          </Button>
        </div>
      </form>
    </div>
  );
}