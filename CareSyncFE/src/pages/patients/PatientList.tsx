import { useNavigate } from 'react-router-dom';
import { usePatient } from '../../context/PatientContext';
import { PermissionGate } from '../../components/common/PermissionGate';
import { Spinner } from '../../components/ui/Spinner';
import { formatters } from '../../utils/formatters';
import { cn } from '../../utils/cn';
import type { Patient } from '../../types/patient.types';

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/60 flex items-center justify-center shrink-0">
      <span className="text-xs font-medium text-primary-700 dark:text-primary-300">{initials}</span>
    </div>
  );
}

function PatientRow({ patient, onClick, onEdit }: { patient: Patient; onClick: () => void; onEdit: (e: React.MouseEvent) => void }) {
  return (
    <div
      onClick={onClick}
      className="grid grid-cols-[2fr_1fr_1fr_120px] items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0 cursor-pointer"
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={patient.fullName} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{patient.fullName}</p>
          {patient.dateOfBirth && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Born {formatters.date(patient.dateOfBirth)}</p>
          )}
        </div>
      </div>
      <div>
        {patient.age ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {patient.age} yrs
            <span className="text-gray-300 dark:text-gray-600 mx-1.5">·</span>
            <span className="capitalize">{patient.gender?.toLowerCase() ?? '—'}</span>
          </p>
        ) : (
          <span className="text-gray-300 dark:text-gray-600 text-sm">—</span>
        )}
      </div>
      <div>
        {patient.phoneNumber ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{patient.phoneNumber}</p>
        ) : (
          <span className="text-gray-300 dark:text-gray-600 text-sm">—</span>
        )}
      </div>
      <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClick}
          className="text-xs font-medium px-2.5 py-1 rounded-md border border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors whitespace-nowrap"
        >
          View
        </button>
        <PermissionGate permission="patient.edit">
          <button
            onClick={onEdit}
            className="text-xs font-medium px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Edit
          </button>
        </PermissionGate>
      </div>
    </div>
  );
}

export function PatientList() {
  const navigate = useNavigate();
  const { myPatients, isLoading, selectPatient } = usePatient();

  const handlePatientClick = (patient: Patient) => {
    selectPatient(patient);
    navigate(`/patients/${patient.patientId}`);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">Loading patients…</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Patients</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            {myPatients.length > 0
              ? `${myPatients.length} patient${myPatients.length !== 1 ? 's' : ''} under your care`
              : 'Manage your patients and their care'}
          </p>
        </div>
        {/* patient.edit — only Admin and Primary CG can add patients */}
        <PermissionGate permission="patient.edit">
          <button onClick={() => navigate('/patients/new')} className="btn btn-primary text-sm">
            + Add patient
          </button>
        </PermissionGate>
      </div>

      {myPatients.length === 0 ? (
        <div className="text-center py-16 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No patients yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">Add your first patient to start coordinating their care.</p>
          <PermissionGate permission="patient.edit">
            <button onClick={() => navigate('/patients/new')} className="btn btn-primary text-sm">
              + Add patient
            </button>
          </PermissionGate>
        </div>
      ) : (
        <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
          <div className="grid grid-cols-[2fr_1fr_1fr_120px] px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            {['Patient', 'Age', 'Phone', ''].map(h => (
              <span key={h} className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">{h}</span>
            ))}
          </div>
          <div>
            {myPatients.map(patient => (
              <PatientRow
                key={patient.patientId}
                patient={patient}
                onClick={() => handlePatientClick(patient)}
                onEdit={e => { e.stopPropagation(); navigate(`/patients/${patient.patientId}/edit`); }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}