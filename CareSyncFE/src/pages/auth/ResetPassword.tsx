import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // searchParams.get() auto-decodes the token — re-encode before sending to backend
  const rawToken = searchParams.get('token') ?? '';
  const token = encodeURIComponent(rawToken);

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
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
      setError('Invalid or missing reset token. Please request a new link.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({
        token,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Password reset!</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Your password has been changed successfully. You can now sign in.
              </p>
            </div>
            <Button variant="primary" fullWidth onClick={() => navigate('/login')}>
              Go to Sign In
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Set new password</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Choose a strong password for your CareSync account.
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                id="password"
                name="password"
                type="password"
                label="New Password"
                placeholder="Enter your new password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm New Password"
                placeholder="Confirm your new password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
                Reset Password
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                Back to Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}