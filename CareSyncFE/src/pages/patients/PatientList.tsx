  // src/pages/patients/PatientList.tsx

  import { useNavigate } from 'react-router-dom';
  import { usePatient } from '../../context/PatientContext';
  import { PermissionGate } from '../../components/common/PermissionGate';
  import { Spinner } from '../../components/ui/Spinner';
  import { EmptyState } from '../../components/ui/EmptyState';
  import { formatters } from '../../utils/formatters';
  import type { Patient } from '../../types/patient.types';

  // ─── Patient Card ─────────────────────────────────────────────────────────────
  function PatientCard({ patient, onClick, onEdit }: {
    patient: Patient;
    onClick: () => void;
    onEdit: (e: React.MouseEvent) => void;
  }) {
    return (
      <div
        onClick={onClick}
        className="card hover:shadow-md hover:border-primary-200 dark:hover:border-primary-700
                  transition-all cursor-pointer group"
      >
        {/* Avatar + name */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900 rounded-full
                          flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">{patient.gender === 'MALE' ? '👴' : '👵'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-50 truncate">
              {patient.fullName}
            </h3>
            {patient.age && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{patient.age} years old</p>
            )}
            {patient.dateOfBirth && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Born: {formatters.date(patient.dateOfBirth)}
              </p>
            )}
          </div>
        </div>

        {/* Contact info */}
        <div className="space-y-1.5 text-sm mb-4">
          {patient.phoneNumber && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <span>📞</span>
              <span>{patient.phoneNumber}</span>
            </div>
          )}
          {patient.emergencyContactName && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <span>🚨</span>
              <span>{patient.emergencyContactName}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="btn btn-primary btn-sm flex-1"
          >
            View Details
          </button>
          <PermissionGate permission="patient.edit">
            <button
              onClick={onEdit}
              className="btn btn-secondary btn-sm"
            >
              Edit
            </button>
          </PermissionGate>
        </div>
      </div>
    );
  }

  // ─── Main Page ────────────────────────────────────────────────────────────────
  export function PatientList() {
    const navigate = useNavigate();
    const { myPatients, isLoading, selectPatient } = usePatient();

    const handlePatientClick = (patient: Patient) => {
      selectPatient(patient);
      navigate(`/patients/${patient.patientId}`);
    };

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading patients...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="page-title">My Patients</h1>
            <p className="page-subtitle">Manage your patients and their care</p>
          </div>
          <PermissionGate permission="patient.view">
            <button
              onClick={() => navigate('/patients/new')}
              className="btn btn-primary"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Patient
            </button>
          </PermissionGate>
        </div>

        {/* Empty state */}
        {myPatients.length === 0 ? (
          <EmptyState
            title="No patients yet"
            description="Add your first patient to start coordinating their care."
            action={{ label: 'Add Patient', onClick: () => navigate('/patients/new') }}
          />
        ) : (
          // Patient grid — 1 col mobile, 2 col tablet, 3 col desktop
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myPatients.map((patient) => (
              <PatientCard
                key={patient.patientId}
                patient={patient}
                onClick={() => handlePatientClick(patient)}
                onEdit={(e) => { e.stopPropagation(); navigate(`/patients/${patient.patientId}/edit`); }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }