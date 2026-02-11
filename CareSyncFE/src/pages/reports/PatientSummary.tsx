import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportApi } from '../../api';
import { usePatient } from '../../context/PatientContext';
import { formatters } from '../../utils/formatters';
import type { PatientSummaryReport } from '../../types/report.types';

export function PatientSummary() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();

  const [summary, setSummary] = useState<PatientSummaryReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedPatient) {
      loadSummary();
    }
  }, [selectedPatient]);

  const loadSummary = async () => {
    if (!selectedPatient) return;

    setIsLoading(true);
    setError('');

    try {
      const data = await reportApi.getPatientSummary(selectedPatient.patientId);
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load patient summary');
    } finally {
      setIsLoading(false);
    }
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
          <p className="mt-4 text-gray-600">Generating summary...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="card text-center">
          <p className="text-error-600">{error || 'Failed to load summary'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patient Summary</h1>
        <p className="text-gray-600 mt-1">Comprehensive overview</p>
      </div>

      {/* Patient Info */}
      <div className="card mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-4xl">
            {selectedPatient.gender === 'MALE' ? '👴' : '👵'}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{summary.fullName}</h2>
            <p className="text-gray-600">
              {summary.age} years old • Born {formatters.date(summary.dateOfBirth)}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">{summary.activeMedicationCount}</p>
            <p className="text-sm text-gray-600">Active Medications</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">{summary.totalCaregiversCount}</p>
            <p className="text-sm text-gray-600">Caregivers</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">{summary.overallAdherencePercentage}%</p>
            <p className="text-sm text-gray-600">Adherence</p>
          </div>
        </div>
      </div>

      {/* Care Team */}
      <div className="card mb-6">
        <h3 className="font-semibold text-lg mb-4">Care Team</h3>
        {summary.caregivers && summary.caregivers.length > 0 ? (
          <ul className="space-y-2">
            {summary.caregivers.map((caregiver, index) => (
              <li key={index} className="flex items-center gap-2 text-gray-700">
                <span>👤</span>
                <span>{caregiver}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No caregivers assigned</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-secondary"
        >
          Back to Dashboard
        </button>
        <button
          onClick={() => window.print()}
          className="btn btn-primary"
        >
          Print Summary
        </button>
      </div>
    </div>
  );
}