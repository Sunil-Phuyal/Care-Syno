import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi } from '../../api';
import { usePatient } from '../../context/PatientContext';

export function CreatePatient() {
  const navigate = useNavigate();
  const { refreshPatients } = usePatient();

  const [formData, setFormData] = useState({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const patient = await patientApi.createPatient(formData);
      await refreshPatients();
      navigate(`/patients/${patient.patientId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create patient');
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/patients')}
          className="text-primary-600 hover:text-primary-700 mb-4 inline-flex items-center gap-2"
        >
          ← Back to Patients
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Patient</h1>
        <p className="text-gray-600 mt-1">Enter patient information below</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-error-50 border border-error-200 rounded-lg text-sm text-error-600">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-6">
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
            placeholder="Ram Sharma"
          />
        </div>

        {/* Date of Birth & Gender */}
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

        {/* Phone Number */}
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
            placeholder="+977-9801234567"
          />
        </div>

        {/* Address */}
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
            placeholder="Full address"
          />
        </div>

        {/* Emergency Contact */}
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
                placeholder="Sita Sharma"
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
                placeholder="+977-9801234567"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate('/patients')}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary flex-1"
          >
            {isLoading ? 'Creating...' : 'Create Patient'}
          </button>
        </div>
      </form>
    </div>
  );
}