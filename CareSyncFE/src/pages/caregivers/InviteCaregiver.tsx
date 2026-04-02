import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { caregiverApi } from '../../api/caregiver.api';
import { usePatient } from '../../context/PatientContext';
import { useNotification } from '../../context/NotificationContext';
import { PermissionGate } from '../../components/common/PermissionGate';
import { Input } from '../../components/ui/Input';
import { cn } from '../../utils/cn';

const ROLES = [
  {
    id: '11112',
    title: 'Primary Caregiver',
    subtitle: 'Full access to all features',
    permissions: [
      { label: 'View & edit patient information', granted: true },
      { label: 'Create & manage medication schedules', granted: true },
      { label: 'Administer medications', granted: true },
      { label: 'Invite & remove caregivers', granted: true },
      { label: 'Manage caregiver permissions', granted: true },
      { label: 'View & export reports', granted: true },
    ],
  },
  {
    id: '11113',
    title: 'Secondary Caregiver',
    subtitle: 'Limited access for day-to-day care',
    permissions: [
      { label: 'View patient information', granted: true },
      { label: 'Administer medications', granted: true },
      { label: 'View care team', granted: true },
      { label: 'View reports', granted: true },
      { label: 'Edit patient or schedules', granted: false },
      { label: 'Invite or remove caregivers', granted: false },
    ],
  },
  {
    id: '11114',
    title: 'Healthcare Provider',
    subtitle: 'Read-only access with schedule management',
    permissions: [
      { label: 'View patient information', granted: true },
      { label: 'View & create medication schedules', granted: true },
      { label: 'View reports', granted: true },
      { label: 'Administer medications', granted: false },
      { label: 'Manage caregivers', granted: false },
    ],
  },
];

const RELATIONSHIPS = [
  { value: '', label: 'Select relationship…' },
  { value: 'SON', label: 'Son' },
  { value: 'DAUGHTER', label: 'Daughter' },
  { value: 'SPOUSE', label: 'Spouse' },
  { value: 'SIBLING', label: 'Sibling' },
  { value: 'FRIEND', label: 'Friend' },
  { value: 'PROFESSIONAL', label: 'Professional Caregiver' },
  { value: 'NURSE', label: 'Nurse' },
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'OTHER', label: 'Other' },
];

function StepBar({ current }: { current: number }) {
  const steps = ['Details', 'Role', 'Review'];
  return (
    <div className="flex items-center">
      {steps.map((label, i) => {
        const step = i + 1;
        const done = current > step;
        const active = current === step;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200',
                done && 'bg-primary-500 text-white',
                active && 'bg-primary-500 text-white ring-4 ring-primary-100 dark:ring-primary-900/50',
                !done && !active && 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
              )}>
                {done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : step}
              </div>
              <span className={cn(
                'text-xs font-medium',
                active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'
              )}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                'flex-1 h-px mx-3 mb-5 transition-colors duration-300',
                done ? 'bg-primary-400 dark:bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function RoleOption({
  role,
  selected,
  onSelect,
}: {
  role: typeof ROLES[0];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full text-left rounded-xl border p-4 transition-all duration-150',
        selected
          ? 'border-primary-400 dark:border-primary-600 bg-primary-50 dark:bg-primary-950/30 ring-1 ring-primary-300 dark:ring-primary-700'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
          selected ? 'border-primary-500' : 'border-gray-300 dark:border-gray-600'
        )}>
          {selected && <div className="w-2 h-2 rounded-full bg-primary-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className={cn(
              'text-sm font-semibold',
              selected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-gray-50'
            )}>
              {role.title}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-normal flex-shrink-0">
              {role.subtitle}
            </span>
          </div>
          {selected && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {role.permissions.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  {p.granted ? (
                    <svg className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={cn(!p.granted && 'text-gray-400 dark:text-gray-600')}>{p.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function InviteCaregiverForm() {
  const navigate = useNavigate();
  const { selectedPatient } = usePatient();
  const { success, error: showError } = useNotification();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: '',
    fullName: '',
    roleId: '11113',
    relationship: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const selectedRole = ROLES.find((r) => r.id === form.roleId)!;
  const canProceed = form.email.trim() !== '' && form.fullName.trim() !== '';

  const handleSubmit = async () => {
    if (!selectedPatient) return;
    setError('');
    setIsLoading(true);
    try {
      await caregiverApi.inviteCaregiver({
        patientId: selectedPatient.patientId,
        email: form.email,
        fullName: form.fullName,
        roleId: Number(form.roleId),
        relationship: form.relationship,
      });
      success('Invitation sent successfully!');
      navigate('/caregivers');
    } catch (err: any) {
      const msg = err.message || 'Failed to send invitation';
      showError(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedPatient) {
    return (
      <div className="card text-center py-16">
        <p className="text-gray-500 dark:text-gray-400 mb-6">Please select a patient first.</p>
        <button onClick={() => navigate('/patients')} className="btn btn-primary">
          Go to Patients
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/caregivers')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium mb-3 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Care Team
        </button>
        <h1 className="page-title">Invite Caregiver</h1>
        <p className="page-subtitle">
          Adding to{' '}
          <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedPatient.fullName}</span>'s care team
        </p>
      </div>

      <div className="card py-5">
        <StepBar current={step} />
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="card space-y-5">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-50">Caregiver details</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Enter the contact information of the person you want to invite.
            </p>
          </div>
          <div className="flex gap-3 p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-xl">
            <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              If this person does not have an account yet, one will be created and they will receive login credentials by email.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="fullName" label="Full name" value={form.fullName} onChange={handleChange} placeholder="e.g. Krishna Sharma" required />
            <Input name="email" label="Email address" type="email" value={form.email} onChange={handleChange} placeholder="name@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Relationship <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <select
                name="relationship"
                value={form.relationship}
                onChange={handleChange}
                className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 focus:border-transparent pr-10 transition-all"
              >
                {RELATIONSHIPS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              disabled={!canProceed}
              onClick={() => setStep(2)}
              className="btn btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
              <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card space-y-5">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-50">Choose a role</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              This determines what{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">{form.fullName}</span>{' '}
              can see and do. You can update this later.
            </p>
          </div>
          <div className="space-y-3">
            {ROLES.map((role) => (
              <RoleOption
                key={role.id}
                role={role}
                selected={form.roleId === role.id}
                onSelect={() => setForm({ ...form, roleId: role.id })}
              />
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">Back</button>
            <button type="button" onClick={() => setStep(3)} className="btn btn-primary">
              Continue
              <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card space-y-5">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-50">Review & send</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Confirm the details before sending the invitation.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-semibold text-primary-700 dark:text-primary-300 flex-shrink-0">
                {form.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-50 truncate">{form.fullName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{form.email}</p>
                {form.relationship && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 capitalize mt-0.5">
                    {form.relationship.charAt(0) + form.relationship.slice(1).toLowerCase()}
                  </p>
                )}
              </div>
              <button type="button" onClick={() => setStep(1)} className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium flex-shrink-0">
                Edit
              </button>
            </div>
            <div className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Role</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{selectedRole.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{selectedRole.subtitle}</p>
              </div>
              <button type="button" onClick={() => setStep(2)} className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
                Change
              </button>
            </div>
            <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800/50">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Care team for{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300">{selectedPatient.fullName}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              An invitation email will be sent to{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">{form.email}</span>. They can join the care team immediately after logging in.
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={() => setStep(2)} className="btn btn-secondary">Back</button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="btn btn-primary disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  Send Invitation
                  <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// PermissionGate wraps the whole page —
// Secondary CG and Healthcare Provider are redirected away
export function InviteCaregiver() {
  return (
    <PermissionGate
      permission="caregiver.invite"
      fallback={<Navigate to="/caregivers" replace />}
    >
      <InviteCaregiverForm />
    </PermissionGate>
  );
}