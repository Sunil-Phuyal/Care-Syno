import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { caregiverApi } from '../../api/caregiver.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function AcceptInvite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // searchParams.get() auto-decodes the token — re-encode before sending to backend
  const rawToken = searchParams.get('token') ?? '';
  const token = encodeURIComponent(rawToken);

  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!rawToken) {
      setError('Invalid or missing invite token. Please ask to be re-invited.');
      return;
    }

    setIsLoading(true);
    try {
      await caregiverApi.acceptInvite({
        token,
        password: form.password,
        confirmPassword: form.confirmPassword,
        phoneNumber: form.phoneNumber || undefined,
      });
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Failed to activate account. The invite link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-gray-50">CareSync</span>
        </div>

        {done ? (
          <div className="text-center space-y-5">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Account activated!</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Your CareSync account is ready. You can now sign in and start caring.
              </p>
            </div>
            <Button variant="primary" fullWidth onClick={() => navigate('/login')}>
              Go to Sign In
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Accept Invitation</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Set your password to activate your CareSync account.
              </p>
            </div>

            <div className="flex gap-3 p-3.5 mb-5 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-xl">
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                You've been invited to join a care team on CareSync. Set your password below to activate your account.
              </p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="password"
                name="password"
                type="password"
                label="Set Password"
                placeholder="Create a secure password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="e.g. +977 98XXXXXXXX"
                value={form.phoneNumber}
                onChange={handleChange}
              />
              <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
                Activate My Account
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}