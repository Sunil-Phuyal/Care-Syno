import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportApi } from '../../api/report.api';
import { usePatient } from '../../context/PatientContext';
import { PermissionGate } from '../../components/common/PermissionGate';
import { Spinner } from '../../components/ui/Spinner';
import { formatters } from '../../utils/formatters';
import { cn } from '../../utils/cn';
import type { PatientSummaryReport } from '../../types/report.types';
import {
  UserCircle2,
  Pill,
  Users,
  TrendingUp,
  Printer,
  ArrowLeft,
  ArrowRight,
  UserX,
  ClipboardList,
  Calendar,
  Hash,
  Clock,
  User,
  Activity,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatGeneratedAt() {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date());
}

// ─── Section Divider ──────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

// ─── Detail Row ───────────────────────────────────────────────────────────────

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-gray-700/60 last:border-0">
      <div className="w-7 h-7 rounded-md bg-gray-50 dark:bg-gray-700/60 flex items-center justify-center flex-shrink-0">
        <span className="text-gray-400 dark:text-gray-500">{icon}</span>
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 w-28 flex-shrink-0">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1">
        {value ?? <span className="text-gray-400 dark:text-gray-600 italic">—</span>}
      </p>
    </div>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  valueColor,
  iconBg,
  note,
  delay = '0ms',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  valueColor?: string;
  iconBg: string;
  note?: string;
  delay?: string;
}) {
  return (
    <div
      className="card flex flex-col gap-3 animate-fade-in"
      style={{ animationDelay: delay, animationFillMode: 'both' }}
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
        {icon}
      </div>
      <div>
        <p className={cn('text-2xl font-bold tabular-nums', valueColor ?? 'text-gray-800 dark:text-gray-100')}>
          {value}
        </p>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-0.5">
          {label}
        </p>
        {note && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">{note}</p>
        )}
      </div>
    </div>
  );
}

// ─── Caregiver Row ────────────────────────────────────────────────────────────

function CaregiverRow({ name, index }: { name: string; index: number }) {
  const palettes = [
    'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
    'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300',
    'bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300',
    'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  ];
  const color = palettes[index % palettes.length];
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <li className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors duration-100">
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold', color)}>
        {initials}
      </div>
      <span className="text-sm text-gray-700 dark:text-gray-300">{name}</span>
    </li>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function PatientSummary() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();
  const [summary, setSummary] = useState<PatientSummaryReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatedAt] = useState(formatGeneratedAt());

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

  // ── No patient ───────────────────────────────────────────────────────────────
  if (!selectedPatient) {
    return (
      <div className="card text-center py-16 animate-fade-in">
        <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UserX className="w-7 h-7 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          No patient selected. Please choose a patient to view their summary.
        </p>
        <button onClick={() => navigate('/patients')} className="btn btn-primary btn-sm mx-auto">
          Go to Patients
        </button>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">Generating summary…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error || !summary) {
    return (
      <div className="card text-center py-16 animate-fade-in">
        <div className="w-14 h-14 bg-error-50 dark:bg-error-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ClipboardList className="w-7 h-7 text-error-400" />
        </div>
        <p className="text-sm text-error-500 dark:text-error-400 mb-5">
          {error || 'Failed to load summary'}
        </p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary btn-sm mx-auto">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-500 mb-1.5">
            Patient Report
          </p>
          <h1 className="page-title">Patient Summary</h1>
          <p className="page-subtitle mt-1">Comprehensive overview for {summary.fullName}</p>
        </div>
        <PermissionGate permission="report.export">
          <button onClick={() => window.print()} className="btn btn-secondary btn-sm print:hidden">
            <Printer className="w-4 h-4" />
            Print
          </button>
        </PermissionGate>
      </div>

      {/* ── Metadata Bar ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
        {[
          { label: 'Patient ID', value: `#${selectedPatient.patientId}` },
          { label: 'Name', value: summary.fullName },
          { label: 'Generated', value: generatedAt },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {label}
            </span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{value}</span>
          </div>
        ))}
      </div>

      {/* ── Section: Patient Information ─────────────────────────────────────── */}
      <SectionDivider label="Patient Information" />

      <div className="card animate-fade-in" style={{ animationDelay: '60ms', animationFillMode: 'both' }}>

        {/* Identity row */}
        <div className="flex items-center gap-4 pb-4 mb-1 border-b border-gray-100 dark:border-gray-700/60">
          <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
            <UserCircle2 className="w-8 h-8 text-primary-500 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">{summary.fullName}</h2>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-0.5 uppercase tracking-wide">
              Patient ID · #{selectedPatient.patientId}
            </p>
          </div>
        </div>

        {/* Detail rows */}
        <DetailRow
          icon={<Hash className="w-3.5 h-3.5" />}
          label="Patient ID"
          value={`#${selectedPatient.patientId}`}
        />
        <DetailRow
          icon={<User className="w-3.5 h-3.5" />}
          label="Full Name"
          value={summary.fullName}
        />
        <DetailRow
          icon={<Calendar className="w-3.5 h-3.5" />}
          label="Date of Birth"
          value={formatters.date(summary.dateOfBirth)}
        />
        <DetailRow
          icon={<Activity className="w-3.5 h-3.5" />}
          label="Age"
          value={`${summary.age} years old`}
        />
        <DetailRow
          icon={<User className="w-3.5 h-3.5" />}
          label="Gender"
          value={
            selectedPatient.gender
              ? selectedPatient.gender.charAt(0) + selectedPatient.gender.slice(1).toLowerCase()
              : undefined
          }
        />
      </div>

      {/* ── Section: Clinical Overview ───────────────────────────────────────── */}
      <SectionDivider label="Clinical Overview" />

      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in"
        style={{ animationDelay: '100ms', animationFillMode: 'both' }}
      >
        <MetricCard
          icon={<Pill className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
          label="Active Medications"
          value={summary.activeMedicationCount}
          valueColor="text-primary-600 dark:text-primary-400"
          iconBg="bg-primary-50 dark:bg-primary-900/30"
          note="Currently scheduled medication plans"
          delay="80ms"
        />
        <MetricCard
          icon={<Users className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
          label="Caregivers"
          value={summary.totalCaregiversCount}
          iconBg="bg-gray-100 dark:bg-gray-700"
          note="Active caregivers assigned to patient"
          delay="120ms"
        />
        <MetricCard
          icon={<TrendingUp className="w-5 h-5 text-success-600 dark:text-success-400" />}
          label="Overall Adherence"
          value={`${summary.overallAdherencePercentage}%`}
          valueColor="text-success-600 dark:text-success-400"
          iconBg="bg-success-50 dark:bg-success-900/20"
          note={`Based on ${summary.activeMedicationCount > 0 ? 'all recorded' : 'no'} dose events`}
          delay="160ms"
        />
      </div>

      {/* ── Section: Care Team ───────────────────────────────────────────────── */}
      <SectionDivider label="Care Team" />

      <div
        className="card animate-fade-in"
        style={{ animationDelay: '200ms', animationFillMode: 'both' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Assigned Caregivers
            </h3>
          </div>
          {summary.caregivers && summary.caregivers.length > 0 && (
            <span className="badge badge-gray">{summary.caregivers.length}</span>
          )}
        </div>

        {summary.caregivers && summary.caregivers.length > 0 ? (
          <ul className="-mx-1 space-y-0.5">
            {summary.caregivers.map((name, i) => (
              <CaregiverRow key={i} name={name} index={i} />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">No caregivers assigned yet.</p>
          </div>
        )}
      </div>

      {/* ── Report Footer ────────────────────────────────────────────────────── */}
      <div className="print-footer flex items-center gap-2 py-1 text-xs text-gray-400 dark:text-gray-600 border-t border-gray-100 dark:border-gray-800 pt-4">
        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
        <span>
          Report generated on{' '}
          <span className="font-medium text-gray-500 dark:text-gray-500">{generatedAt}</span>
          {' · '}MediCare System
        </span>
      </div>

      {/* ── Actions ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 print:hidden">
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary btn-sm">
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>
        <button onClick={() => navigate('/reports/adherence')} className="btn btn-ghost btn-sm">
          Adherence Report
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}