import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportApi } from '../../api/report.api';
import { usePatient } from '../../context/PatientContext';
import { PermissionGate } from '../../components/common/PermissionGate';
import { Spinner } from '../../components/ui/Spinner';
import { cn } from '../../utils/cn';
import type { MedicationAdherenceReport } from '../../types/report.types';
import {
  Activity,
  CheckCircle2,
  SkipForward,
  XCircle,
  Printer,
  ArrowLeft,
  ArrowRight,
  UserX,
  ClipboardList,
  AlertTriangle,
  Info,
  Clock,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatGeneratedAt() {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date());
}

type AdherenceTier = {
  label: string;
  sublabel: string;
  interpretation: string;
  ringClass: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  badgeClass: string;
  icon: React.ReactNode;
};

function getAdherenceTier(pct: number): AdherenceTier {
  if (pct >= 90)
    return {
      label: 'Excellent',
      sublabel: 'Patient is on track',
      interpretation:
        'Adherence above 90% indicates the patient is consistently following their medication schedule. Continue the current care plan and monitor at routine intervals.',
      ringClass: 'text-success-500',
      textColor: 'text-success-700 dark:text-success-400',
      bgColor: 'bg-success-50 dark:bg-success-900/10',
      borderColor: 'border-success-200 dark:border-success-800',
      badgeClass: 'badge badge-success',
      icon: <CheckCircle2 className="w-4 h-4" />,
    };
  if (pct >= 75)
    return {
      label: 'Good',
      sublabel: 'Minor gaps detected',
      interpretation:
        'Adherence between 75–89% is generally acceptable but indicates occasional missed or skipped doses. Consider discussing any barriers with the patient at the next scheduled visit.',
      ringClass: 'text-primary-500',
      textColor: 'text-primary-700 dark:text-primary-400',
      bgColor: 'bg-primary-50 dark:bg-primary-900/10',
      borderColor: 'border-primary-200 dark:border-primary-800',
      badgeClass: 'badge badge-primary',
      icon: <Info className="w-4 h-4" />,
    };
  if (pct >= 50)
    return {
      label: 'Needs Attention',
      sublabel: 'Review schedule with patient',
      interpretation:
        'Adherence between 50–74% is below the recommended threshold. Research suggests adherence below 80% is associated with increased risk of adverse outcomes. A structured review of the medication plan is recommended.',
      ringClass: 'text-warning-500',
      textColor: 'text-warning-700 dark:text-warning-400',
      bgColor: 'bg-warning-50 dark:bg-warning-900/10',
      borderColor: 'border-warning-200 dark:border-warning-800',
      badgeClass: 'badge badge-warning',
      icon: <AlertTriangle className="w-4 h-4" />,
    };
  return {
    label: 'Critical',
    sublabel: 'Immediate review required',
    interpretation:
      'Adherence below 50% is critically low. This patient may be at significant risk. An urgent care review, reassessment of the medication schedule, and direct patient outreach are strongly recommended.',
    ringClass: 'text-error-500',
    textColor: 'text-error-700 dark:text-error-400',
    bgColor: 'bg-error-50 dark:bg-error-900/10',
    borderColor: 'border-error-200 dark:border-error-800',
    badgeClass: 'badge badge-error',
    icon: <AlertTriangle className="w-4 h-4" />,
  };
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

// ─── SVG Ring ─────────────────────────────────────────────────────────────────

function AdherenceRing({
  percentage,
  ringClass,
  textColor,
}: {
  percentage: number;
  ringClass: string;
  textColor: string;
}) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="136" height="136" viewBox="0 0 136 136" className="-rotate-90">
        {/* Track */}
        <circle
          cx="68" cy="68" r={radius}
          fill="none" stroke="currentColor" strokeWidth="12"
          className="text-gray-100 dark:text-gray-700"
        />
        {/* Progress — uses currentColor driven by ringClass */}
        <circle
          cx="68" cy="68" r={radius}
          fill="none" stroke="currentColor" strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={ringClass}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-[2rem] font-bold tabular-nums leading-none', textColor)}>
          {percentage}%
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-1">
          Adherence
        </span>
      </div>
    </div>
  );
}

// ─── Stacked Bar ──────────────────────────────────────────────────────────────

function DoseBreakdownBar({
  administered, skipped, missed, total,
}: {
  administered: number; skipped: number; missed: number; total: number;
}) {
  if (total === 0) return null;
  const pct = (n: number) => `${((n / total) * 100).toFixed(1)}%`;

  return (
    <div className="space-y-2.5">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700/60">
        {administered > 0 && (
          <div className="h-full bg-success-500 transition-all duration-700" style={{ width: pct(administered) }} />
        )}
        {skipped > 0 && (
          <div className="h-full bg-warning-400 transition-all duration-700" style={{ width: pct(skipped) }} />
        )}
        {missed > 0 && (
          <div className="h-full bg-error-400 transition-all duration-700" style={{ width: pct(missed) }} />
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {[
          { color: 'bg-success-500', label: 'Administered', value: administered },
          { color: 'bg-warning-400', label: 'Skipped', value: skipped },
          { color: 'bg-error-400', label: 'Missed', value: missed },
        ].map(({ color, label, value }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={cn('w-2 h-2 rounded-sm flex-shrink-0', color)} />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {label}
              <span className="ml-1 font-semibold text-gray-700 dark:text-gray-300">{value}</span>
              <span className="ml-1 text-gray-400 dark:text-gray-500">({pct(value)})</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stat Row ─────────────────────────────────────────────────────────────────

function StatRow({
  icon, label, value, valueColor, iconBg, note,
}: {
  icon: React.ReactNode; label: string; value: number | string;
  valueColor: string; iconBg: string; note?: string;
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700/60 last:border-0">
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
        {note && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{note}</p>}
      </div>
      <p className={cn('text-xl font-bold tabular-nums flex-shrink-0', valueColor)}>{value}</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function AdherenceReport() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();
  const [report, setReport] = useState<MedicationAdherenceReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatedAt] = useState(formatGeneratedAt());

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

  if (!selectedPatient) {
    return (
      <div className="card text-center py-16 animate-fade-in">
        <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UserX className="w-7 h-7 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          No patient selected. Please choose a patient to view their adherence report.
        </p>
        <button onClick={() => navigate('/patients')} className="btn btn-primary btn-sm mx-auto">
          Go to Patients
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">Generating report…</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="card text-center py-16 animate-fade-in">
        <div className="w-14 h-14 bg-error-50 dark:bg-error-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ClipboardList className="w-7 h-7 text-error-400" />
        </div>
        <p className="text-sm text-error-500 dark:text-error-400 mb-5">
          {error || 'Failed to load report'}
        </p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary btn-sm mx-auto">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const tier = getAdherenceTier(report.adherencePercentage);

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-500 mb-1.5">
            Medication Report
          </p>
          <h1 className="page-title">Adherence Report</h1>
          <p className="page-subtitle mt-1">
            {report.patientName}
            <span className="mx-2 text-gray-300 dark:text-gray-600">·</span>
            {report.reportPeriod}
          </p>
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
          { label: 'Patient', value: report.patientName },
          { label: 'Period', value: report.reportPeriod },
          { label: 'Total doses', value: String(report.totalScheduledDoses) },
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

      {/* ── Section: Score ──────────────────────────────────────────────────── */}
      <SectionDivider label="Adherence Score" />

      <div
        className={cn('card border', tier.bgColor, tier.borderColor)}
        style={{ animationDelay: '80ms', animationFillMode: 'both' }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <AdherenceRing
              percentage={report.adherencePercentage}
              ringClass={tier.ringClass}
              textColor={tier.textColor}
            />
          </div>

          <div className="flex-1 space-y-3 text-center sm:text-left w-full">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className={cn(tier.badgeClass, 'flex items-center gap-1')}>
                {tier.icon}
                {tier.label}
              </span>
            </div>

            <p className={cn('text-lg font-semibold', tier.textColor)}>
              {tier.sublabel}
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                {report.administeredDoses}
              </span>
              {' of '}
              <span className="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                {report.totalScheduledDoses}
              </span>
              {' scheduled doses administered'}
            </p>

            <DoseBreakdownBar
              administered={report.administeredDoses}
              skipped={report.skippedDoses}
              missed={report.missedDoses}
              total={report.totalScheduledDoses}
            />
          </div>
        </div>
      </div>

      {/* ── Section: Breakdown ──────────────────────────────────────────────── */}
      <SectionDivider label="Dose Breakdown" />

      <div className="card">
        <StatRow
          icon={<Activity className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
          label="Total Scheduled Doses"
          value={report.totalScheduledDoses}
          valueColor="text-gray-800 dark:text-gray-100"
          iconBg="bg-gray-100 dark:bg-gray-700"
          note="All recorded medication events for this patient"
        />
        <StatRow
          icon={<CheckCircle2 className="w-4 h-4 text-success-600 dark:text-success-400" />}
          label="Administered"
          value={report.administeredDoses}
          valueColor="text-success-600 dark:text-success-400"
          iconBg="bg-success-50 dark:bg-success-900/20"
          note="Medication confirmed as taken on schedule"
        />
        <StatRow
          icon={<SkipForward className="w-4 h-4 text-warning-600 dark:text-warning-400" />}
          label="Skipped"
          value={report.skippedDoses}
          valueColor="text-warning-600 dark:text-warning-400"
          iconBg="bg-warning-50 dark:bg-warning-900/20"
          note="Intentionally skipped by patient or caregiver"
        />
        <StatRow
          icon={<XCircle className="w-4 h-4 text-error-500 dark:text-error-400" />}
          label="Missed"
          value={report.missedDoses}
          valueColor="text-error-500 dark:text-error-400"
          iconBg="bg-error-50 dark:bg-error-900/20"
          note="No record of administration at scheduled time"
        />
      </div>

      {/* ── Section: Interpretation ──────────────────────────────────────────── */}
      <SectionDivider label="Clinical Interpretation" />

      <div className={cn('rounded-xl border p-4 flex gap-3', tier.bgColor, tier.borderColor)}>
        <div className={cn('mt-0.5 flex-shrink-0', tier.textColor)}>
          {tier.icon}
        </div>
        <div>
          <p className={cn('text-sm font-semibold mb-1', tier.textColor)}>
            {tier.label} — {tier.sublabel}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {tier.interpretation}
          </p>
        </div>
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
        <button onClick={() => navigate('/reports/summary')} className="btn btn-ghost btn-sm">
          Patient Summary
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}