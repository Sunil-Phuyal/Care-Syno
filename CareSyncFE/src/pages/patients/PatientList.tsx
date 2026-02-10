import { usePatient } from '../../context/PatientContext';
import { useNavigate } from 'react-router-dom';
import { formatters } from '../../utils/formatters';
import { PermissionGate } from '../../components/common/PermissionGate';

export function PatientList() {
  const { myPatients, isLoading, selectPatient } = usePatient();
  const navigate = useNavigate();

  const handlePatientClick = (patient: any) => {
    selectPatient(patient);
    navigate(`/patients/${patient.patientId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
          <p className="text-gray-600 mt-1">Manage your patients and their care</p>
        </div>
        <PermissionGate permission="patient.view">
          <button
            onClick={() => navigate('/patients/new')}
            className="btn btn-primary"
          >
            + Add Patient
          </button>
        </PermissionGate>
      </div>

      {/* Patient Cards */}
      {myPatients.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👴</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No patients yet</h3>
          <p className="text-gray-600 mb-6">Create your first patient to get started</p>
          <button
            onClick={() => navigate('/patients/new')}
            className="btn btn-primary"
          >
            Create Patient
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myPatients.map((patient) => (
            <div
              key={patient.patientId}
              className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handlePatientClick(patient)}
            >
              {/* Patient Avatar */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
                  {patient.gender === 'MALE' ? '👴' : '👵'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {patient.fullName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {patient.age} years old
                  </p>
                  {patient.dateOfBirth && (
                    <p className="text-xs text-gray-500">
                      Born: {formatters.date(patient.dateOfBirth)}
                    </p>
                  )}
                </div>
              </div>

              {/* Patient Info */}
              <div className="space-y-2 text-sm">
                {patient.phoneNumber && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📞</span>
                    <span>{patient.phoneNumber}</span>
                  </div>
                )}
                {patient.emergencyContactName && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>🚨</span>
                    <span>{patient.emergencyContactName}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePatientClick(patient);
                  }}
                  className="btn btn-primary btn-sm flex-1"
                >
                  View Details
                </button>
                <PermissionGate permission="patient.edit">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/patients/${patient.patientId}/edit`);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Edit
                  </button>
                </PermissionGate>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}