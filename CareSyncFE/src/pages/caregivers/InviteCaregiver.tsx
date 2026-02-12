import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { caregiverApi } from '../../api';
import { usePatient } from '../../context/PatientContext';
import { useNotification } from '../../context/NotificationContext';
import { ROLES } from '../../utils/constants';

export function InviteCaregiver() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();
  const { success, error: showError } = useNotification();

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    roleId: '3', // Default to SECONDARY_CAREGIVER
    relationship: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setError('');
    setIsLoading(true);

    try {
      await caregiverApi.inviteCaregiver({
        patientId: selectedPatient.patientId,
        email: formData.email,
        fullName: formData.fullName,
        roleId: Number(formData.roleId),
        relationship: formData.relationship,
      });

      success('Caregiver invitation sent successfully!');
      navigate('/caregivers');
    } catch (err: any) {
      showError(err.message || 'Failed to invite caregiver');
      setError(err.message || 'Failed to invite caregiver');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/caregivers')}
          className="text-primary-600 hover:text-primary-700 mb-4 inline-flex items-center gap-2"
        >
          ← Back to Care Team
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Invite Caregiver</h1>
        <p className="text-gray-600 mt-1">
          Add a new caregiver to {selectedPatient.fullName}'s care team
        </p>
      </div>

      {/* Info Box */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>📧 Note:</strong> An email invitation will be sent to this person. 
          If they don't have an account, one will be created for them with a temporary password.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-error-50 border border-error-200 rounded-lg text-sm text-error-600">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Email */}
        <div>
          <label htmlFor="email" className="label">
            Email Address <span className="text-error-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="input"
            placeholder="caregiver@example.com"
          />
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="label">
            Full Name <span className="text-error-500">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            value={formData.fullName}
            onChange={handleChange}
            className="input"
            placeholder="Krishna Sharma"
          />
        </div>

        {/* Role */}
        <div>
          <label htmlFor="roleId" className="label">
            Role <span className="text-error-500">*</span>
          </label>
          <select
            id="roleId"
            name="roleId"
            required
            value={formData.roleId}
            onChange={handleChange}
            className="input"
          >
            <option value="2">Primary Caregiver (Full access)</option>
            <option value="3">Secondary Caregiver (Limited access)</option>
            <option value="4">Healthcare Provider (Read-only + schedules)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            You can customize permissions after inviting
          </p>
        </div>

        {/* Relationship */}
        <div>
          <label htmlFor="relationship" className="label">
            Relationship
          </label>
          <select
            id="relationship"
            name="relationship"
            value={formData.relationship}
            onChange={handleChange}
            className="input"
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
          </select>
        </div>

        {/* Role Info */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Role Permissions:</h3>
          <div className="space-y-2 text-sm">
            {formData.roleId === '2' && (
              <div className="p-3 bg-primary-50 rounded-lg">
                <p className="font-medium text-primary-900 mb-2">Primary Caregiver</p>
                <ul className="text-primary-800 space-y-1 text-xs">
                  <li>✅ View and edit patient information</li>
                  <li>✅ Create and manage medication schedules</li>
                  <li>✅ Administer medications</li>
                  <li>✅ Invite and remove caregivers</li>
                  <li>✅ Manage permissions for other caregivers</li>
                  <li>✅ View and export reports</li>
                </ul>
              </div>
            )}
            {formData.roleId === '3' && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900 mb-2">Secondary Caregiver</p>
                <ul className="text-gray-800 space-y-1 text-xs">
                  <li>✅ View patient information</li>
                  <li>✅ View medications</li>
                  <li>✅ Administer medications</li>
                  <li>✅ View care team</li>
                  <li>✅ View reports</li>
                  <li>❌ Cannot edit patient or schedules</li>
                  <li>❌ Cannot invite or remove caregivers</li>
                </ul>
              </div>
            )}
            {formData.roleId === '4' && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900 mb-2">Healthcare Provider</p>
                <ul className="text-blue-800 space-y-1 text-xs">
                  <li>✅ View patient information</li>
                  <li>✅ View medications</li>
                  <li>✅ Create and edit schedules</li>
                  <li>✅ View reports</li>
                  <li>❌ Cannot administer medications</li>
                  <li>❌ Cannot manage caregivers</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate('/caregivers')}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary flex-1"
          >
            {isLoading ? 'Sending Invitation...' : 'Send Invitation'}
          </button>
        </div>
      </form>
    </div>
  );
}