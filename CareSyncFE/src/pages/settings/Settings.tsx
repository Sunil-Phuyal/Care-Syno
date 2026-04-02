// src/pages/settings/Settings.tsx

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth.api';
import { BrowserNotifications } from '../../utils/browserNotifications';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { cn } from '../../utils/cn';
import { AlertDialog } from '../../components/ui/AlertDialog';

type SettingsTab = 'profile' | 'notifications' | 'security';

// ─── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(
    (user as any)?.profileImageUrl ?? null
  );

  const [form, setForm] = useState({
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
    phone: '',
    dateOfBirth: '',
    relationship: 'Primary Caregiver',
    address: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSaved(false);
    try {
      await authApi.updateProfile({
        fullName: form.fullName,
        phone: form.phone,
        profileImageUrl: profileImageUrl ?? undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Avatar card */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-semibold text-primary-600 dark:text-primary-400">
                {form.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
              </span>
            )}
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-50">
              {form.fullName || 'Your Name'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{form.relationship}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{form.email}</p>
          </div>
        </div>
      </div>

      {/* Feedback banners */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl">
          <svg className="w-4 h-4 text-error-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-error-700 dark:text-error-300">{error}</p>
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-3 p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-700 rounded-xl">
          <svg className="w-4 h-4 text-success-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm text-success-700 dark:text-success-300">Profile saved successfully.</p>
        </div>
      )}

      {/* Profile photo */}
      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Profile Photo</h3>
        <ImageUploader
          folder="users"
          fileName={`user_${user?.userId ?? 'me'}`}
          label="Profile Photo"
          value={profileImageUrl}
          onChange={setProfileImageUrl}
          optional
          hint="This photo will appear in your profile and alongside your name."
        />
      </div>

      {/* Personal info */}
      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input name="fullName" label="Full Name" value={form.fullName} onChange={handleChange} required />
          <Input name="email" label="Email Address" value={form.email} onChange={handleChange} type="email" disabled />
          <Input name="phone" label="Phone Number" value={form.phone} onChange={handleChange} type="tel" placeholder="+977-9801234567" />
          <Input name="dateOfBirth" label="Date of Birth" value={form.dateOfBirth} onChange={handleChange} type="date" />
          <Select name="relationship" label="Role / Relationship" value={form.relationship} onChange={handleChange}>
            <option>Primary Caregiver</option>
            <option>Family Member</option>
            <option>Professional Caregiver</option>
            <option>Healthcare Provider</option>
          </Select>
        </div>
        <Textarea
          name="address"
          label="Address"
          value={form.address}
          onChange={handleChange}
          placeholder="Street, City, State, ZIP"
          rows={2}
          resize="none"
        />
      </div>

      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

// ─── Toggle component ─────────────────────────────────────────────────────────
function Toggle({ enabled, onChange, disabled = false }: { enabled: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
        enabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span className={cn(
        'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition duration-200 ease-in-out',
        enabled ? 'translate-x-5' : 'translate-x-0'
      )} />
    </button>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
function NotificationsTab() {
  const [permission, setPermission]         = useState<NotificationPermission>('default');
  const [enabled, setEnabled]               = useState(false);
  const [testSent, setTestSent]             = useState(false);
  const [showRevokeInfo, setShowRevokeInfo] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      const p = Notification.permission;
      setPermission(p);
      setEnabled(p === 'granted');
    }
  }, []);

  const handleToggle = async () => {
    if (enabled) {
      // Can't turn off via JS — tell the user how to do it in browser settings
      setShowRevokeInfo(true);
      return;
    }

    // Turning on
    if (permission === 'granted') {
      setEnabled(true);
      return;
    }

    // permission === 'default' — ask browser
    const granted = await BrowserNotifications.requestPermission();
    if (granted) {
      setPermission('granted');
      setEnabled(true);
    } else {
      setPermission(Notification.permission);
      setEnabled(false);
    }
  };

  const handleTest = () => {
    BrowserNotifications.test();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="space-y-4">

      {/* Browser notifications */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-50">Browser Notifications</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Popup alerts when a medication is due, right in your browser
            </p>
          </div>
          <Toggle
            enabled={enabled}
            onChange={handleToggle}
            disabled={permission === 'denied'}
          />
        </div>

        {/* Blocked by browser */}
        {permission === 'denied' && (
          <div className="p-3 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-700 rounded-xl">
            <p className="text-sm font-medium text-warning-800 dark:text-warning-200 mb-1">
              Blocked by your browser
            </p>
            <ol className="text-sm text-warning-700 dark:text-warning-300 space-y-0.5 list-decimal list-inside">
              <li>Click the lock icon in the address bar</li>
              <li>Set "Notifications" to "Allow"</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        )}

        {/* Test — only when enabled */}
        {enabled && permission === 'granted' && (
          <button
            onClick={handleTest}
            className={cn(
              'w-full py-2 rounded-xl text-sm font-medium border transition-all',
              testSent
                ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-700 text-success-700 dark:text-success-300'
                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-400 dark:hover:border-primary-500'
            )}
          >
            {testSent ? 'Test sent — check your notifications' : 'Send a test notification'}
          </button>
        )}
      </div>

      {/* Email — informational, backend handles automatically */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-50">Email Reminders</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Sent automatically to your registered email 30 minutes before each scheduled medication
            </p>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 whitespace-nowrap">
            Always on
          </span>
        </div>
      </div>

      {/* Alert: explain how to revoke from browser settings */}
      <AlertDialog
        open={showRevokeInfo}
        onClose={() => setShowRevokeInfo(false)}
        title="To turn off notifications"
        description='Notification permissions are managed by your browser. Click the lock icon in the address bar, find "Notifications", and set it to "Block".'
        variant="warning"
        confirmLabel="Got it"
      />
    </div>
  );
}

// ─── Security Tab ──────────────────────────────────────────────────────────────
function SecurityTab() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      await authApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSaved(true);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to change password. Check your current password and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-3 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl">
          <svg className="w-4 h-4 text-error-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-error-700 dark:text-error-300">{error}</p>
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-3 p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-700 rounded-xl">
          <svg className="w-4 h-4 text-success-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm text-success-700 dark:text-success-300">Password changed successfully.</p>
        </div>
      )}

      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Change Password</h3>
        <Input
          name="currentPassword"
          label="Current Password"
          type="password"
          value={form.currentPassword}
          onChange={handleChange}
        />
        <Input
          name="newPassword"
          label="New Password"
          type="password"
          value={form.newPassword}
          onChange={handleChange}
        />
        <Input
          name="confirmPassword"
          label="Confirm New Password"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
        />
        <div className="flex justify-end">
          <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
            Change Password
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Settings Page ────────────────────────────────────────────────────────
export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const TABS: { key: SettingsTab; label: string }[] = [
    { key: 'profile',       label: 'Profile' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'security',      label: 'Security' },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-6" aria-label="Settings tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'pb-3 px-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap',
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'profile'       && <ProfileTab />}
      {activeTab === 'notifications' && <NotificationsTab />}
      {activeTab === 'security'      && <SecurityTab />}
    </div>
  );
}