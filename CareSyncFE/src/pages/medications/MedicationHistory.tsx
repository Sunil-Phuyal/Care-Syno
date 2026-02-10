import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicationApi } from '../../api';
import { usePatient } from '../../context/PatientContext';
import { formatters } from '../../utils/formatters';
import type { MedicationAdministration } from '../../types/medication.types';

export function MedicationHistory() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();

  const [history, setHistory] = useState<MedicationAdministration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedPatient) {
      loadHistory();
    }
  }, [selectedPatient]);

  const loadHistory = async () => {
    if (!selectedPatient) return;

    setIsLoading(true);
    setError('');

    try {
      const data = await medicationApi.getAdministrationHistory(selectedPatient.patientId);
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load medication history');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ADMINISTERED: 'bg-success-100 text-success-700',
      SKIPPED: 'bg-warning-100 text-warning-700',
      MISSED: 'bg-error-100 text-error-700',
      REFUSED: 'bg-gray-100 text-gray-700',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.ADMINISTERED}`}>
        {status}
      </span>
    );
  };

  if (!selectedPatient) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="card text-center">
          <p className="text-gray-600">Please select a patient first</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/medications')}
          className="text-primary-600 hover:text-primary-700 mb-4 inline-flex items-center gap-2"
        >
          ← Back to Medications
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Medication History</h1>
        <p className="text-gray-600 mt-1">
          Administration history for {selectedPatient.fullName}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-error-50 border border-error-200 rounded-lg text-sm text-error-600">
          {error}
        </div>
      )}

      {/* History List */}
      {history.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No medication history</h3>
          <p className="text-gray-600 mb-6">No medications have been logged yet</p>
          <button
            onClick={() => navigate('/medications/log')}
            className="btn btn-primary"
          >
            Log First Medication
          </button>
        </div>
      ) : (
        <div className="card">
          <div className="divide-y">
            {history.map((record) => (
              <div key={record.administrationId} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        Medication ID: {record.medicationId}
                      </h3>
                      {getStatusBadge(record.status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Dosage: {record.dosageGiven}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-900 font-medium">
                      {formatters.datetime(record.actualTime)}
                    </p>
                    <p className="text-gray-500 text-xs">
                      Caregiver ID: {record.caregiverUserId}
                    </p>
                  </div>
                </div>

                {record.notes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <p className="text-xs text-gray-500 mb-1">Notes:</p>
                    <p className="text-gray-700">{record.notes}</p>
                  </div>
                )}

                {record.sideEffects && (
                  <div className="mt-2 p-2 bg-warning-50 rounded text-sm">
                    <p className="text-xs text-warning-700 mb-1">⚠️ Side Effects:</p>
                    <p className="text-warning-800">{record.sideEffects}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}