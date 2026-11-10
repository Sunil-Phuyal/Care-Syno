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
import { Toast } from '../../components/common/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useTheme } from '../../context/ThemeContext';

type SettingsTab = 'profile' | 'preferences' | 'security';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

// ─── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
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
    try {
      await authApi.updateProfile({
        fullName: form.fullName,
        phone: form.phone,
        profileImageUrl: profileImageUrl ?? undefined,
      });
      setToast({ message: 'Profile saved successfully.', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save profile. Please try again.', type: 'error' });
    } finally {
      setIsSaving(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSave}
        title="Save Profile Changes?"
        description="Are you sure you want to update your profile information?"
        confirmLabel="Save Changes"
        confirmVariant="primary"
        isLoading={isSaving}
      />

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
            <p className="text-base font-semibold text-gray-900 dark:text-gray-50">{form.fullName || 'Your Name'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{form.relationship}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{form.email}</p>
          </div>
        </div>
      </div>

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
        <Button variant="primary" onClick={() => setShowConfirm(true)} isLoading={isSaving}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

// ─── Toggle component ──────────────────────────────────────────────────────────
function Toggle({
  enabled,
  onChange,
  disabled = false,
}: {
  enabled: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
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
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition duration-200 ease-in-out',
          enabled ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}

// ─── Preferences & Notifications Tab ──────────────────────────────────────────
function PreferencesTab() {
  const { theme, setTheme } = useTheme(); // adjust to your actual theme hook
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [showRevokeInfo, setShowRevokeInfo] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Theme confirm dialogs
  const [pendingTheme, setPendingTheme] = useState<'light' | 'dark' | 'system' | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      const p = Notification.permission;
      setPermission(p);
      setNotifEnabled(p === 'granted');
    }
  }, []);

  // ── Theme ──
  const handleThemeSelect = (value: 'light' | 'dark' | 'system') => {
    if (value === theme) return;
    setPendingTheme(value); // open confirm dialog
  };

  const handleThemeConfirm = () => {
    if (pendingTheme) {
      setTheme(pendingTheme);
      setToast({ message: `Theme changed to ${pendingTheme} mode.`, type: 'success' });
    }
    setPendingTheme(null);
  };

  // ── Notifications ──
  const handleNotifToggle = async () => {
    if (notifEnabled) {
      setShowRevokeInfo(true);
      return;
    }
    if (permission === 'granted') {
      setNotifEnabled(true);
      setToast({ message: 'Browser notifications enabled.', type: 'success' });
      return;
    }
    const granted = await BrowserNotifications.requestPermission();
    if (granted) {
      setPermission('granted');
      setNotifEnabled(true);
      setToast({ message: 'Browser notifications enabled.', type: 'success' });
    } else {
      setPermission(Notification.permission);
      setNotifEnabled(false);
      setToast({ message: 'Notification permission was denied.', type: 'warning' });
    }
  };

  const handleTest = () => {
    BrowserNotifications.test();
    setToast({ message: 'Test notification sent — check your notifications.', type: 'info' });
  };

  const THEME_OPTIONS: { value: 'light' | 'dark' | 'system'; label: string; icon: React.ReactNode }[] = [
    {
      value: 'light',
      label: 'Light',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ),
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      ),
    },
    {
      value: 'system',
      label: 'System',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Theme confirm */}
      <ConfirmDialog
        open={pendingTheme !== null}
        onClose={() => setPendingTheme(null)}
        onConfirm={handleThemeConfirm}
        title={`Switch to ${pendingTheme} mode?`}
        description={`The app appearance will change to ${pendingTheme} mode immediately.`}
        confirmLabel="Apply Theme"
        confirmVariant="primary"
      />

      {/* ── Appearance ── */}
      <div className="card space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Appearance</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Choose how CareSyno looks for you
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map((opt) => {
            const isActive = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleThemeSelect(opt.value)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150',
                  isActive
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                {opt.icon}
                <span className="text-xs font-semibold">{opt.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Browser Notifications ── */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-50">Browser Notifications</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Popup alerts when a medication is due, right in your browser
            </p>
          </div>
          <Toggle
            enabled={notifEnabled}
            onChange={handleNotifToggle}
            disabled={permission === 'denied'}
          />
        </div>

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

        {notifEnabled && permission === 'granted' && (
          <button
            onClick={handleTest}
            className="w-full py-2 rounded-xl text-sm font-medium border transition-all bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-400 dark:hover:border-primary-500"
          >
            Send a test notification
          </button>
        )}
      </div>

      {/* ── Email Reminders ── */}
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

      {/* Revoke info dialog */}
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
  const [toast, setToast] = useState<ToastState | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (form.newPassword !== form.confirmPassword) {
      setToast({ message: 'New passwords do not match.', type: 'error' });
      setShowConfirm(false);
      return;
    }
    setIsSaving(true);
    try {
      await authApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setToast({ message: 'Password changed successfully.', type: 'success' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      setToast({ message: 'Failed to change password. Check your current password and try again.', type: 'error' });
    } finally {
      setIsSaving(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSave}
        title="Change Password?"
        description="Are you sure you want to update your password? You'll need to use the new password on your next login."
        confirmLabel="Change Password"
        confirmVariant="primary"
        isLoading={isSaving}
      />

      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Change Password</h3>
        <Input
          name="currentPassword"
          label="Current Password"
          type="password"
          showPasswordToggle
          value={form.currentPassword}
          onChange={handleChange}
        />
        <Input
          name="newPassword"
          label="New Password"
          type="password"
          showPasswordToggle
          value={form.newPassword}
          onChange={handleChange}
        />
        <Input
          name="confirmPassword"
          label="Confirm New Password"
          type="password"
          showPasswordToggle
          value={form.confirmPassword}
          onChange={handleChange}
        />
        <div className="flex justify-end">
          <Button variant="primary" onClick={() => setShowConfirm(true)} isLoading={isSaving}>
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
    { key: 'profile',     label: 'Profile' },
    { key: 'preferences', label: 'Preferences & Notifications' },
    { key: 'security',    label: 'Security' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

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

      {activeTab === 'profile'     && <ProfileTab />}
      {activeTab === 'preferences' && <PreferencesTab />}
      {activeTab === 'security'    && <SecurityTab />}
    </div>
  );
}