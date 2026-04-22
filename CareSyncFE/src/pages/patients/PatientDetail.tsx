import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientApi } from '../../api/patient.api';
import { usePermission } from '../../hooks/usePermission';
import { PermissionGate } from '../../components/common/PermissionGate';
import { Spinner } from '../../components/ui/Spinner';
import { DeleteConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Toast } from '../../components/common/Toast';
import { formatters } from '../../utils/formatters';
import { cn } from '../../utils/cn';
import type { Patient } from '../../types/patient.types';

type Tab = 'overview' | 'medications' | 'team' | 'reports';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const TABS = [
  { key: 'overview',     label: 'Overview' },
  { key: 'medications',  label: 'Medications' },
  { key: 'team',         label: 'Care team' },
  { key: 'reports',      label: 'Reports' },
];

function Avatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className={cn(
      'rounded-full bg-primary-100 dark:bg-primary-900/60 flex items-center justify-center shrink-0',
      size === 'lg' ? 'w-12 h-12' : 'w-9 h-9'
    )}>
      <span className={cn('font-medium text-primary-700 dark:text-primary-300', size === 'lg' ? 'text-base' : 'text-xs')}>
        {initials}
      </span>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | number }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <span className="text-sm text-gray-400 dark:text-gray-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h3>
      </div>
      <div className="px-5">{children}</div>
    </div>
  );
}

function TabEmpty({ message, action, onAction }: { message: string; action: string; onAction: () => void }) {
  return (
    <div className="text-center py-16 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900">
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">{message}</p>
      <button onClick={onAction} className="btn btn-primary text-sm">{action}</button>
    </div>
  );
}

export function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canDelete = usePermission('patient.delete');

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await patientApi.getPatient(Number(id));
        setPatient(data);
      } catch {
        setError('Failed to load patient.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await patientApi.deletePatient(Number(id));
      navigate('/patients');
    } catch {
      setToast({ message: 'Failed to delete patient. Please try again.', type: 'error' });
      setIsDeleting(false);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">Loading patient…</p>
      </div>
    </div>
  );

  if (error || !patient) return (
    <div className="text-center py-16">
      <p className="text-sm text-error-600 dark:text-error-400 mb-4">{error || 'Patient not found'}</p>
      <button onClick={() => navigate('/patients')} className="btn btn-primary text-sm">Back to patients</button>
    </div>
  );

  return (
    <div className="space-y-5">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <DeleteConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        itemName={patient.fullName}
        isLoading={isDeleting}
      />

      <button
        onClick={() => navigate('/patients')}
        className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to patients
      </button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Avatar name={patient.fullName} size="lg" />
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">{patient.fullName}</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
              {[
                patient.age ? `${patient.age} yrs` : null,
                patient.gender ? patient.gender.charAt(0) + patient.gender.slice(1).toLowerCase() : null,
                patient.phoneNumber,
              ].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <PermissionGate permission="patient.edit">
            <button onClick={() => navigate(`/patients/${id}/edit`)} className="btn btn-secondary text-sm">
              Edit patient
            </button>
          </PermissionGate>
          <PermissionGate permission="patient.delete">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="text-sm font-medium px-3 py-1.5 rounded-lg border border-error-200 dark:border-error-800 text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </button>
          </PermissionGate>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-100 dark:border-gray-800">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as Tab)}
            className={cn(
              'px-3 pb-2.5 pt-0.5 text-sm transition-colors border-b-2 -mb-px',
              activeTab === tab.key
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-medium'
                : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Section title="Personal information">
            <Field label="Date of birth" value={patient.dateOfBirth ? formatters.date(patient.dateOfBirth) : undefined} />
            <Field label="Age" value={patient.age ? `${patient.age} years old` : undefined} />
            <Field label="Gender" value={patient.gender ? patient.gender.charAt(0) + patient.gender.slice(1).toLowerCase() : undefined} />
            <Field label="Phone" value={patient.phoneNumber} />
            <Field label="Address" value={patient.address} />
          </Section>
          {(patient.emergencyContactName || patient.emergencyContactPhone) && (
            <Section title="Emergency contact">
              <Field label="Name" value={patient.emergencyContactName} />
              <Field label="Phone" value={patient.emergencyContactPhone} />
            </Section>
          )}
        </div>
      )}
      {activeTab === 'medications' && (
        <TabEmpty message="Medications for this patient will appear here." action="View all medications" onAction={() => navigate('/medications')} />
      )}
      {activeTab === 'team' && (
        <TabEmpty message="Care team members for this patient will appear here." action="Manage caregivers" onAction={() => navigate('/caregivers')} />
      )}
      {activeTab === 'reports' && (
        <TabEmpty message="Reports for this patient will appear here." action="View reports" onAction={() => navigate('/reports/adherence')} />
      )}
    </div>
  );
}