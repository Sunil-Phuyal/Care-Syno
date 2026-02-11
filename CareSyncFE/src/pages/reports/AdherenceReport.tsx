import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportApi } from '../../api';
import { usePatient } from '../../context/PatientContext';
import type { MedicationAdherenceReport } from '../../types/report.types';

export function AdherenceReport() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();

  const [report, setReport] = useState<MedicationAdherenceReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedPatient) {
      loadReport();
    }
  }, [selectedPatient]);

  const loadReport = async () => {
    if (!selectedPatient) return;

    setIsLoading(true);
    setError('');

    try {
      const data = await reportApi.getAdherenceReport(selectedPatient.patientId);
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load adherence report');
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
          <p className="mt-4 text-gray-600">Generating report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="card text-center">
          <p className="text-error-600">{error || 'Failed to load report'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Medication Adherence Report</h1>
        <p className="text-gray-600 mt-1">
          {report.patientName} - {report.reportPeriod}
        </p>
      </div>

      {/* Overall Adherence */}
      <div className="card mb-6 bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Overall Adherence</p>
          <p className="text-6xl font-bold text-primary-600 mb-2">
            {report.adherencePercentage}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div
              className="bg-primary-600 h-4 rounded-full transition-all"
              style={{ width: `${report.adherencePercentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            {report.adherencePercentage >= 90 && '🎉 Excellent adherence!'}
            {report.adherencePercentage >= 75 && report.adherencePercentage < 90 && '👍 Good adherence'}
            {report.adherencePercentage >= 50 && report.adherencePercentage < 75 && '⚠️ Needs improvement'}
            {report.adherencePercentage < 50 && '❌ Critical - Please review medication schedule'}
          </p>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Doses */}
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">
              📊
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{report.totalScheduledDoses}</p>
            </div>
          </div>
        </div>

        {/* Administered */}
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center text-xl">
              ✅
            </div>
            <div>
              <p className="text-sm text-gray-600">Administered</p>
              <p className="text-2xl font-bold text-success-600">{report.administeredDoses}</p>
            </div>
          </div>
        </div>

        {/* Skipped */}
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center text-xl">
              ⏭️
            </div>
            <div>
              <p className="text-sm text-gray-600">Skipped</p>
              <p className="text-2xl font-bold text-warning-600">{report.skippedDoses}</p>
            </div>
          </div>
        </div>

        {/* Missed */}
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center text-xl">
              ❌
            </div>
            <div>
              <p className="text-sm text-gray-600">Missed</p>
              <p className="text-2xl font-bold text-error-600">{report.missedDoses}</p>
            </div>
          </div>
        </div>
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
          Print Report
        </button>
      </div>
    </div>
  );
}