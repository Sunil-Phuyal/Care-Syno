// src/pages/medications/MedicationHistory.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicationApi } from '../../api/medication.api';
import { usePatient } from '../../context/PatientContext';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatters } from '../../utils/formatters';
import { cn } from '../../utils/cn';
import type { MedicationAdministration } from '../../types/medication.types';

const STATUS_CONFIG: Record<string, { label: string; icon: string; style: string }> = {
  ADMINISTERED: { label: 'Administered', icon: '✅', style: 'bg-success-100 text-success-700 dark:bg-success-800 dark:text-success-100' },
  SKIPPED:      { label: 'Skipped',      icon: '⏭️', style: 'bg-warning-100 text-warning-700 dark:bg-warning-800 dark:text-warning-100' },
  MISSED:       { label: 'Missed',       icon: '❌', style: 'bg-error-100 text-error-700 dark:bg-error-800 dark:text-error-100' },
  REFUSED:      { label: 'Refused',      icon: '🚫', style: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
};

function HistoryRow({ record }: { record: MedicationAdministration }) {
  const [showPhoto, setShowPhoto] = useState(false);
  const config = STATUS_CONFIG[record.status] ?? STATUS_CONFIG.ADMINISTERED;
  const time = record.administeredAt ?? record.actualTime;

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-xl flex-shrink-0 mt-0.5">{config.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                {record.medicationName ?? `Medication #${record.medicationId}`}
              </h3>
              <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', config.style)}>
                {config.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {record.dosageGiven} ·{' '}
              <span className="text-gray-600 dark:text-gray-300">
                by {record.caregiverName ?? `Caregiver #${record.caregiverUserId}`}
              </span>
            </p>
            {record.notes && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">
                "{record.notes}"
              </p>
            )}
            {record.sideEffects && (
              <p className="text-sm text-warning-700 dark:text-warning-300 mt-1">
                ⚠️ Side effects: {record.sideEffects}
              </p>
            )}
            {record.proofImageUrl && (
              <button onClick={() => setShowPhoto(!showPhoto)}
                className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline mt-1">
                {showPhoto ? 'Hide proof photo' : '📷 View proof photo'}
              </button>
            )}
            {showPhoto && record.proofImageUrl && (
              <img src={record.proofImageUrl} alt="Proof"
                className="mt-2 rounded-xl max-w-[200px] border border-gray-200 dark:border-gray-600" />
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 text-right">
          {formatters.datetime(time)}
        </p>
      </div>
    </div>
  );
}

// Group records by date
function groupByDate(records: MedicationAdministration[]) {
  const groups: Record<string, MedicationAdministration[]> = {};
  records.forEach((r) => {
    const date = new Date(r.administeredAt ?? r.actualTime).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(r);
  });
  return groups;
}

export function MedicationHistory() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();
  const [history, setHistory]   = useState<MedicationAdministration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState('');
  const [filter, setFilter]     = useState<string>('ALL');

  useEffect(() => {
    if (!selectedPatient) return;
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await medicationApi.getAdministrationHistory(selectedPatient.patientId);
        setHistory(data);
      } catch {
        setError('Failed to load medication history.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedPatient]);

  if (!selectedPatient) {
    return (
      <div className="card text-center py-12">
        <p className="text-4xl mb-3">👤</p>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Please select a patient first.</p>
        <button onClick={() => navigate('/patients')} className="btn btn-primary">Go to Patients</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading history...</p>
        </div>
      </div>
    );
  }

  const filtered = filter === 'ALL' ? history : history.filter((r) => r.status === filter);
  const grouped  = groupByDate(filtered);

  return (
    <div className="space-y-6">

      <div>
        <button onClick={() => navigate('/medications')}
          className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400
                     hover:text-primary-700 dark:hover:text-primary-300 font-medium mb-3 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Medications
        </button>
        <h1 className="page-title">Medication History</h1>
        <p className="page-subtitle">Administration history for {selectedPatient.fullName}</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Filter tabs */}
      {history.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'ADMINISTERED', 'SKIPPED', 'MISSED', 'REFUSED'].map((status) => (
            <button key={status} onClick={() => setFilter(status)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                filter === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}>
              {status === 'ALL' ? 'All' : STATUS_CONFIG[status]?.label}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title="No records found"
          description={filter === 'ALL' ? 'No medications have been logged yet.' : `No ${filter.toLowerCase()} records.`}
          action={filter === 'ALL' ? { label: 'Log First Medication', onClick: () => navigate('/medications/log') } : undefined}
        />
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, records]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                📅 {date}
              </p>
              <div className="card divide-y divide-gray-100 dark:divide-gray-700">
                {records.map((record) => (
                  <HistoryRow key={record.administrationId} record={record} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}