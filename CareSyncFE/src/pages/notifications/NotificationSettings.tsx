// src/pages/notifications/NotificationSettings.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserNotifications } from '../../utils/browserNotifications';
import { cn } from '../../utils/cn';

export function NotificationSettings() {
  const navigate = useNavigate();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if ('Notification' in window) setPermissionStatus(Notification.permission);
  }, []);

  const handleRequestPermission = async () => {
    const granted = await BrowserNotifications.requestPermission();
    setPermissionStatus(granted ? 'granted' : Notification.permission);
  };

  const handleTest = () => {
    BrowserNotifications.test();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/settings')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400
                     hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-4"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Settings
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
          Notifications
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Control how and when CareSync alerts you about medications.
        </p>
      </div>

      {/* Email section */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Email
          </span>
          <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700" />
          <span className="text-xs font-medium px-2 py-0.5 rounded-full
                           bg-success-100 dark:bg-success-900
                           text-success-700 dark:text-success-300">
            Active
          </span>
        </div>

        <div className="card">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-900
                            flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-50">Email Reminders</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sent to all caregivers with medication permission
              </p>
            </div>
          </div>

          <div className="space-y-2.5 mb-5">
            {[
              { icon: '⏱️', text: 'Sent 30 minutes before each scheduled medication' },
              { icon: '🔒', text: 'Only caregivers with "administer" permission receive these' },
              { icon: '✅', text: 'Skipped automatically if medication was already logged' },
              { icon: '🔄', text: 'System checks every 5 minutes for upcoming doses' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                <p className="text-sm text-gray-600 dark:text-gray-300">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap pt-4 border-t border-gray-100 dark:border-gray-700">
            {['30 min before', 'Checks every 5 min'].map((chip) => (
              <div key={chip} className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                                         bg-gray-50 dark:bg-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">{chip}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browser section */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Browser
          </span>
          <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700" />
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            permissionStatus === 'granted'
              ? 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300'
              : permissionStatus === 'denied'
              ? 'bg-error-100 dark:bg-error-900 text-error-700 dark:text-error-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          )}>
            {permissionStatus === 'granted' ? 'Enabled' : permissionStatus === 'denied' ? 'Blocked' : 'Not set'}
          </span>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-primary-100 dark:bg-primary-900
                            flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-gray-50">Desktop Notifications</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Popup alerts when medication is due</p>
            </div>
            {permissionStatus !== 'granted' && (
              <button onClick={handleRequestPermission} className="btn btn-primary btn-sm">
                Enable
              </button>
            )}
          </div>

          {permissionStatus === 'denied' && (
            <div className="p-4 bg-warning-50 dark:bg-warning-900 border border-warning-200
                            dark:border-warning-700 rounded-xl">
              <p className="text-sm font-semibold text-warning-800 dark:text-warning-200 mb-2">
                Notifications are blocked by your browser
              </p>
              <ol className="text-sm text-warning-700 dark:text-warning-300 space-y-1 list-decimal list-inside">
                <li>Click the lock icon in the address bar</li>
                <li>Find "Notifications" and set it to "Allow"</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}

          {permissionStatus === 'granted' && (
            <button
              onClick={handleTest}
              className={cn(
                'w-full py-2.5 rounded-xl text-sm font-medium border transition-all',
                testSent
                  ? 'bg-success-50 dark:bg-success-900 border-success-200 dark:border-success-700 text-success-700 dark:text-success-300'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-400 dark:hover:border-primary-500'
              )}
            >
              {testSent ? '✅ Test sent! Check your notifications' : '🧪 Send test notification'}
            </button>
          )}
        </div>
      </section>

      {/* Comparison table */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Comparison
          </span>
          <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700" />
        </div>

        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500
                               dark:text-gray-400 uppercase tracking-wider w-1/2">
                  Feature
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-900
                               dark:text-gray-50 uppercase tracking-wider">
                  📧 Email
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-900
                               dark:text-gray-50 uppercase tracking-wider">
                  🔔 Browser
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {[
                { feature: 'Always works',            email: '✅',            browser: '⚠️ Needs permission' },
                { feature: 'Works when app closed',   email: '✅',            browser: '❌' },
                { feature: 'Click to log medication', email: '⚠️ Opens link', browser: '✅ Direct' },
                { feature: 'Reminder timing',         email: '30 min before', browser: '15 min before' },
                { feature: 'Setup required',          email: 'None',          browser: 'One-time permission' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-5 py-3 text-gray-700 dark:text-gray-300 font-medium">{row.feature}</td>
                  <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{row.email}</td>
                  <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{row.browser}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}