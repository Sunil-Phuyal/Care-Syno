import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientApi } from '../../api';
import { usePatient } from '../../context/PatientContext';
import { useNotification } from '../../context/NotificationContext';
import type { Patient } from '../../types/patient.types';

export function EditPatient() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { refreshPatients } = usePatient();
  const { success, error: showError } = useNotification();

  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'MALE',
    phoneNumber: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatient();
  }, [id]);

  const loadPatient = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const patient = await patientApi.getPatient(Number(id));
      setFormData({
        fullName: patient.fullName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender || 'MALE',
        phoneNumber: patient.phoneNumber || '',
        address: patient.address || '',
        emergencyContactName: patient.emergencyContactName || '',
        emergencyContactPhone: patient.emergencyContactPhone || '',
      });
    } catch (err: any) {
      showError(err.message || 'Failed to load patient');
      setError(err.message || 'Failed to load patient');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setError('');
    setIsSaving(true);

    try {
      await patientApi.updatePatient(Number(id), formData);
      await refreshPatients();
      success('Patient updated successfully!');
      navigate(`/patients/${id}`);
    } catch (err: any) {
      showError(err.message || 'Failed to update patient');
      setError(err.message || 'Failed to update patient');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/patients/${id}`)}
          className="text-primary-600 hover:text-primary-700 mb-4 inline-flex items-center gap-2"
        >
          ← Back to Patient
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Patient</h1>
        <p className="text-gray-600 mt-1">Update patient information</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-error-50 border border-error-200 rounded-lg text-sm text-error-600">
          {error}
        </div>
      )}

      {/* Form - Same as CreatePatient but with Update button */}
      <form onSubmit={handleSubmit} className="card space-y-6">
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
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dateOfBirth" className="label">
              Date of Birth <span className="text-error-500">*</span>
            </label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              required
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="gender" className="label">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="input"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="phoneNumber" className="label">
            Phone Number
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="address" className="label">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="input"
            rows={3}
          />
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Emergency Contact</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="emergencyContactName" className="label">
                Contact Name
              </label>
              <input
                id="emergencyContactName"
                name="emergencyContactName"
                type="text"
                value={formData.emergencyContactName}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="emergencyContactPhone" className="label">
                Contact Phone
              </label>
              <input
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate(`/patients/${id}`)}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary flex-1"
          >
            {isSaving ? 'Updating...' : 'Update Patient'}
          </button>
        </div>
      </form>
    </div>
  );
}