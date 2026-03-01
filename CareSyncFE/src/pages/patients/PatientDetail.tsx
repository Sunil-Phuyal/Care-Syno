// src/pages/patients/PatientDetail.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientApi } from '../../api/patient.api';
import { usePermission } from '../../hooks/usePermission';
import { PermissionGate } from '../../components/common/PermissionGate';
import { Spinner } from '../../components/ui/Spinner';
import { formatters } from '../../utils/formatters';
import { cn } from '../../utils/cn';
import type { Patient } from '../../types/patient.types';

// ─── Detail Row — label + value ───────────────────────────────────────────────
function DetailRow({ label, value }: { label: string; value?: string | number }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{value}</p>
    </div>
  );
}

// ─── Tab types ────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'medications' | 'team' | 'reports';

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview',    label: 'Overview' },
  { key: 'medications', label: 'Medications' },
  { key: 'team',        label: 'Care Team' },
  { key: 'reports',     label: 'Reports' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canDelete = usePermission('patient.delete');

  const [patient, setPatient]   = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await patientApi.getPatient(Number(id));
        setPatient(data);
      } catch {
        setError('Failed to load patient. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this patient? This cannot be undone.')) return;
    setIsDeleting(true);
    try {
      await patientApi.deletePatient(Number(id));
      navigate('/patients');
    } catch {
      alert('Failed to delete patient. Please try again.');
      setIsDeleting(false);
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

  if (error || !patient) {
    return (
      <div className="card text-center py-12">
        <p className="text-error-600 dark:text-error-400 mb-4">{error || 'Patient not found'}</p>
        <button onClick={() => navigate('/patients')} className="btn btn-primary">
          Back to Patients
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Back button */}
      <button
        onClick={() => navigate('/patients')}
        className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400
                   hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Patients
      </button>

      {/* Patient header */}
      <div className="card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full
                            flex items-center justify-center text-4xl flex-shrink-0">
              <span>{patient.gender === 'MALE' ? '👴' : '👵'}</span>
            </div>
            {/* Name + info */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                {patient.fullName}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {patient.age && `${patient.age} years old`}
                {patient.age && patient.gender && ' · '}
                {patient.gender && patient.gender.charAt(0) + patient.gender.slice(1).toLowerCase()}
              </p>
              {patient.phoneNumber && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  📞 {patient.phoneNumber}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
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
                disabled={isDeleting}
                className="btn btn-danger"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </PermissionGate>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'pb-3 px-1 border-b-2 text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Personal info */}
          <div className="card space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-50">Personal Information</h3>
            <DetailRow label="Date of Birth"  value={patient.dateOfBirth ? formatters.date(patient.dateOfBirth) : undefined} />
            <DetailRow label="Age"            value={patient.age ? `${patient.age} years old` : undefined} />
            <DetailRow label="Gender"         value={patient.gender} />
            <DetailRow label="Phone Number"   value={patient.phoneNumber} />
            <DetailRow label="Address"        value={patient.address} />
          </div>

          {/* Emergency contact */}
          {(patient.emergencyContactName || patient.emergencyContactPhone) && (
            <div className="card space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-50">Emergency Contact</h3>
              <DetailRow label="Name"  value={patient.emergencyContactName} />
              <DetailRow label="Phone" value={patient.emergencyContactPhone} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'medications' && (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">💊</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Medications for this patient will appear here.
          </p>
          <button
            onClick={() => navigate('/medications')}
            className="btn btn-primary mt-4"
          >
            View All Medications
          </button>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Care team members for this patient will appear here.
          </p>
          <button
            onClick={() => navigate('/caregivers')}
            className="btn btn-primary mt-4"
          >
            Manage Caregivers
          </button>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Reports for this patient will appear here.
          </p>
          <button
            onClick={() => navigate('/reports/adherence')}
            className="btn btn-primary mt-4"
          >
            View Reports
          </button>
        </div>
      )}
    </div>
  );
}