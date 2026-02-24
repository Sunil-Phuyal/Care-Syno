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

// ─── Status badge config ──────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  ADMINISTERED: 'bg-success-100 text-success-700 dark:bg-success-800 dark:text-success-100',
  SKIPPED:      'bg-warning-100 text-warning-700 dark:bg-warning-800 dark:text-warning-100',
  MISSED:       'bg-error-100 text-error-700 dark:bg-error-800 dark:text-error-100',
  REFUSED:      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', STATUS_STYLES[status] ?? STATUS_STYLES.ADMINISTERED)}>
      {status}
    </span>
  );
}

// ─── History Record Row ───────────────────────────────────────────────────────
function HistoryRow({ record }: { record: MedicationAdministration }) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-gray-900 dark:text-gray-50">
              Medication #{record.medicationId}
            </h3>
            <StatusBadge status={record.status} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Dosage: <span className="font-medium text-gray-700 dark:text-gray-300">{record.dosageGiven}</span>
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
            {formatters.datetime(record.actualTime)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Caregiver #{record.caregiverUserId}
          </p>
        </div>
      </div>

      {/* Notes */}
      {record.notes && (
        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</p>
          <p className="text-sm text-gray-700 dark:text-gray-200">{record.notes}</p>
        </div>
      )}

      {/* Side effects */}
      {record.sideEffects && (
        <div className="mt-2 p-3 bg-warning-50 dark:bg-warning-900 rounded-lg">
          <p className="text-xs text-warning-700 dark:text-warning-300 mb-1">⚠️ Side Effects</p>
          <p className="text-sm text-warning-800 dark:text-warning-200">{record.sideEffects}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function MedicationHistory() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();

  const [history, setHistory]     = useState<MedicationAdministration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');

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

  // No patient selected
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

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/medications')}
          className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400
                     hover:text-primary-700 dark:hover:text-primary-300 font-medium mb-3 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Medications
        </button>
        <h1 className="page-title">Medication History</h1>
        <p className="page-subtitle">Administration history for {selectedPatient.fullName}</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900
                        border border-red-200 dark:border-red-800 rounded-xl">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* History list */}
      {history.length === 0 ? (
        <EmptyState
          title="No medication history"
          description="No medications have been logged yet."
          action={{ label: 'Log First Medication', onClick: () => navigate('/medications/log') }}
        />
      ) : (
        <div className="card divide-y divide-gray-100 dark:divide-gray-700">
          {history.map((record) => (
            <HistoryRow key={record.administrationId} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}