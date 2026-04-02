import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportApi } from '../../api/report.api';
import { usePatient } from '../../context/PatientContext';
import { PermissionGate } from '../../components/common/PermissionGate';
import { Spinner } from '../../components/ui/Spinner';
import { formatters } from '../../utils/formatters';
import type { PatientSummaryReport } from '../../types/report.types';

function SummaryStat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-primary-500">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </div>
  );
}

export function PatientSummary() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();
  const [summary, setSummary] = useState<PatientSummaryReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedPatient) return;
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await reportApi.getPatientSummary(selectedPatient.patientId);
        setSummary(data);
      } catch {
        setError('Failed to load patient summary.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedPatient]);

  if (!selectedPatient) return (
    <div className="card text-center py-12">
      <p className="text-4xl mb-3">👤</p>
      <p className="text-gray-500 dark:text-gray-400 mb-4">Please select a patient first.</p>
      <button onClick={() => navigate('/patients')} className="btn btn-primary">Go to Patients</button>
    </div>
  );

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Generating summary...</p>
      </div>
    </div>
  );

  if (error || !summary) return (
    <div className="card text-center py-12">
      <p className="text-4xl mb-3">📋</p>
      <p className="text-error-500 dark:text-error-400 mb-4">{error || 'Failed to load summary'}</p>
      <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">Back to Dashboard</button>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title">Patient Summary</h1>
          <p className="page-subtitle">Comprehensive overview for {summary.fullName}</p>
        </div>
        {/* report.export — Admin, Primary CG, Healthcare Provider only */}
        <PermissionGate permission="report.export">
          <button onClick={() => window.print()} className="btn btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Summary
          </button>
        </PermissionGate>
      </div>

      {/* Patient card */}
      <div className="card space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-4xl flex-shrink-0">
            {selectedPatient.gender === 'MALE' ? '👴' : '👵'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{summary.fullName}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {summary.age} years old · Born {formatters.date(summary.dateOfBirth)}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-5 border-t border-gray-100 dark:border-gray-700">
          <SummaryStat value={summary.activeMedicationCount} label="Active Medications" />
          <SummaryStat value={summary.totalCaregiversCount} label="Caregivers" />
          <SummaryStat value={`${summary.overallAdherencePercentage}%`} label="Adherence" />
        </div>
      </div>

      {/* Care team */}
      <div className="card space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-50">Care Team</h3>
        {summary.caregivers && summary.caregivers.length > 0 ? (
          <ul className="space-y-2">
            {summary.caregivers.map((caregiver, i) => (
              <li key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">👤</div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{caregiver}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No caregivers assigned yet.</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">Back to Dashboard</button>
        <button onClick={() => navigate('/reports/adherence')} className="btn btn-ghost">View Adherence Report →</button>
      </div>

    </div>
  );
}