import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportApi } from '../../api/report.api';
import { usePatient } from '../../context/PatientContext';
import { PermissionGate } from '../../components/common/PermissionGate';
import { Spinner } from '../../components/ui/Spinner';
import { cn } from '../../utils/cn';
import type { MedicationAdherenceReport } from '../../types/report.types';

function getAdherenceInfo(pct: number) {
  if (pct >= 90) return { label: 'Excellent adherence!', emoji: '🎉', color: 'text-success-500' };
  if (pct >= 75) return { label: 'Good adherence', emoji: '👍', color: 'text-primary-500' };
  if (pct >= 50) return { label: 'Needs improvement', emoji: '⚠️', color: 'text-warning-500' };
  return { label: 'Critical — please review medication schedule', emoji: '❌', color: 'text-error-500' };
}

function StatCard({ icon, label, value, valueColor }: {
  icon: string;
  label: string;
  value: number;
  valueColor: string;
}) {
  return (
    <div className="card flex items-center gap-4">
      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className={cn('text-3xl font-bold', valueColor)}>{value}</p>
      </div>
    </div>
  );
}

export function AdherenceReport() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();
  const [report, setReport] = useState<MedicationAdherenceReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedPatient) return;
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await reportApi.getAdherenceReport(selectedPatient.patientId);
        setReport(data);
      } catch {
        setError('Failed to load adherence report.');
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
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Generating report...</p>
      </div>
    </div>
  );

  if (error || !report) return (
    <div className="card text-center py-12">
      <p className="text-4xl mb-3">📊</p>
      <p className="text-error-500 dark:text-error-400 mb-4">{error || 'Failed to load report'}</p>
      <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">Back to Dashboard</button>
    </div>
  );

  const adherenceInfo = getAdherenceInfo(report.adherencePercentage);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title">Medication Adherence Report</h1>
          <p className="page-subtitle">{report.patientName} — {report.reportPeriod}</p>
        </div>
        {/* report.export — Admin, Primary CG, Healthcare Provider only */}
        <PermissionGate permission="report.export">
          <button onClick={() => window.print()} className="btn btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Report
          </button>
        </PermissionGate>
      </div>

      {/* Adherence score */}
      <div className="card bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 text-center py-8">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Overall Adherence</p>
        <p className={cn('text-7xl font-bold mb-3', adherenceInfo.color)}>{report.adherencePercentage}%</p>
        <div className="w-full max-w-md mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
          <div
            className={cn(
              'h-3 rounded-full transition-all duration-700',
              report.adherencePercentage >= 90 ? 'bg-success-500' :
              report.adherencePercentage >= 75 ? 'bg-primary-500' :
              report.adherencePercentage >= 50 ? 'bg-warning-500' : 'bg-error-500'
            )}
            style={{ width: `${report.adherencePercentage}%` }}
          />
        </div>
        <p className={cn('text-sm font-medium', adherenceInfo.color)}>
          {adherenceInfo.emoji} {adherenceInfo.label}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📊" label="Total Scheduled" value={report.totalScheduledDoses} valueColor="text-gray-900 dark:text-gray-50" />
        <StatCard icon="✅" label="Administered" value={report.administeredDoses} valueColor="text-success-500" />
        <StatCard icon="⏭️" label="Skipped" value={report.skippedDoses} valueColor="text-warning-500" />
        <StatCard icon="❌" label="Missed" value={report.missedDoses} valueColor="text-error-500" />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">Back to Dashboard</button>
        <button onClick={() => navigate('/reports/summary')} className="btn btn-ghost">View Patient Summary →</button>
      </div>

    </div>
  );
}