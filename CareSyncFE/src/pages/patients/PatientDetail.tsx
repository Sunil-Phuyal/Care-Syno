import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientApi } from '../../api';
import { usePermission } from '../../hooks/usePermission';
import { formatters } from '../../utils/formatters';
import { PermissionGate } from '../../components/common/PermissionGate';
import type { Patient } from '../../types/patient.types';

export function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canEdit = usePermission('patient.edit');
  const canDelete = usePermission('patient.delete');

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'medications' | 'team' | 'reports'>('overview');

  useEffect(() => {
    loadPatient();
  }, [id]);

  const loadPatient = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const data = await patientApi.getPatient(Number(id));
      setPatient(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load patient');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this patient?')) return;

    try {
      await patientApi.deletePatient(Number(id));
      navigate('/patients');
    } catch (err: any) {
      alert(err.message || 'Failed to delete patient');
    }
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

  if (error || !patient) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="card text-center">
          <p className="text-error-600">{error || 'Patient not found'}</p>
          <button onClick={() => navigate('/patients')} className="btn btn-primary mt-4">
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/patients')}
          className="text-primary-600 hover:text-primary-700 mb-4 inline-flex items-center gap-2"
        >
          ← Back to Patients
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-4xl">
              {patient.gender === 'MALE' ? '👴' : '👵'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{patient.fullName}</h1>
              <p className="text-gray-600 mt-1">
                {patient.age} years old • {patient.gender}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <PermissionGate permission="patient.edit">
              <button
                onClick={() => navigate(`/patients/${id}/edit`)}
                className="btn btn-secondary"
              >
                Edit Patient
              </button>
            </PermissionGate>
            
            <PermissionGate permission="patient.delete">
              <button
                onClick={handleDelete}
                className="btn btn-danger"
              >
                Delete
              </button>
            </PermissionGate>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {(['overview', 'medications', 'team', 'reports'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="card">
              <h3 className="font-semibold text-lg mb-4">Personal Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Date of Birth</p>
                  <p className="font-medium">{formatters.date(patient.dateOfBirth)}</p>
                </div>
                {patient.phoneNumber && (
                  <div>
                    <p className="text-gray-500">Phone Number</p>
                    <p className="font-medium">{patient.phoneNumber}</p>
                  </div>
                )}
                {patient.address && (
                  <div>
                    <p className="text-gray-500">Address</p>
                    <p className="font-medium">{patient.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            {(patient.emergencyContactName || patient.emergencyContactPhone) && (
              <div className="card">
                <h3 className="font-semibold text-lg mb-4">Emergency Contact</h3>
                <div className="space-y-3 text-sm">
                  {patient.emergencyContactName && (
                    <div>
                      <p className="text-gray-500">Name</p>
                      <p className="font-medium">{patient.emergencyContactName}</p>
                    </div>
                  )}
                  {patient.emergencyContactPhone && (
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-medium">{patient.emergencyContactPhone}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'medications' && (
          <div className="card">
            <p className="text-gray-600">Medications tab - Coming soon in next steps</p>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="card">
            <p className="text-gray-600">Care team tab - Coming soon in next steps</p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="card">
            <p className="text-gray-600">Reports tab - Coming soon in next steps</p>
          </div>
        )}
      </div>
    </div>
  );
}