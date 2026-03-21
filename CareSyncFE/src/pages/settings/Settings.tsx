// src/pages/settings/Settings.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth.api';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { cn } from '../../utils/cn';

type SettingsTab = 'profile' | 'security';

// ─── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(
    (user as any)?.profileImageUrl ?? null
  );

  const [form, setForm] = useState({
    fullName:     user?.fullName ?? '',
    email:        user?.email ?? '',
    phone:        '',
    dateOfBirth:  '',
    relationship: 'Primary Caregiver',
    address:      '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSaved(false);
    try {
      await authApi.updateProfile({
        fullName:        form.fullName,
        phone:           form.phone,
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
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0
                          bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {form.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
              {form.fullName || 'Your Name'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{form.relationship}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{form.email}</p>
          </div>
        </div>
      </div>

      {/* Error / success */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-xl">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-3 p-4 bg-success-50 dark:bg-success-900 border border-success-200 dark:border-success-700 rounded-xl">
          <svg className="w-5 h-5 text-success-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm text-success-700 dark:text-success-300">Profile saved successfully!</p>
        </div>
      )}

      {/* Profile photo upload */}
      <div className="card space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-50">Profile Photo</h3>
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
        <h3 className="font-semibold text-gray-900 dark:text-gray-50">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input name="fullName" label="Full Name" value={form.fullName} onChange={handleChange} required />
          <Input name="email" label="Email Address" value={form.email} onChange={handleChange} type="email" disabled />
          <Input name="phone" label="Phone Number" value={form.phone} onChange={handleChange} type="tel"
            placeholder="+977-9801234567" />
          <Input name="dateOfBirth" label="Date of Birth" value={form.dateOfBirth} onChange={handleChange} type="date" />
          <Select name="relationship" label="Role / Relationship" value={form.relationship} onChange={handleChange}>
            <option>Primary Caregiver</option>
            <option>Family Member</option>
            <option>Professional Caregiver</option>
            <option>Healthcare Provider</option>
          </Select>
        </div>
        <Textarea name="address" label="Address" value={form.address} onChange={handleChange}
          placeholder="Street, City, State, ZIP" rows={2} resize="none" />
      </div>

      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

// ─── Security Tab ──────────────────────────────────────────────────────────────
function SecurityTab() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError]       = useState('');
  const [saved, setSaved]       = useState(false);

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
        newPassword:     form.newPassword,
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
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-3 p-4 bg-success-50 dark:bg-success-900 border border-success-200 dark:border-success-700 rounded-xl">
          <p className="text-sm text-success-700 dark:text-success-300">Password changed successfully!</p>
        </div>
      )}

      <div className="card space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-50">Change Password</h3>
        <Input name="currentPassword" label="Current Password" type="password"
          value={form.currentPassword} onChange={handleChange} />
        <Input name="newPassword" label="New Password" type="password"
          value={form.newPassword} onChange={handleChange} />
        <Input name="confirmPassword" label="Confirm New Password" type="password"
          value={form.confirmPassword} onChange={handleChange} />
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
  const navigate     = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const TABS: { key: SettingsTab; label: string }[] = [
    { key: 'profile',  label: 'Profile' },
    { key: 'security', label: 'Security' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account and preferences</p>
        </div>
        <button
          onClick={() => navigate('/settings/notifications')}
          className="btn btn-secondary text-sm"
        >
          🔔 Notification Settings
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'pb-3 px-1 border-b-2 text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'profile'  && <ProfileTab />}
      {activeTab === 'security' && <SecurityTab />}
    </div>
  );
}