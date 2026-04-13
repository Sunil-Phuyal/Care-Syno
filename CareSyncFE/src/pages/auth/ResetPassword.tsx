import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import careSyncLogo from '../../assets/careSyncLogo.svg?url';

function LeftPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-primary-50 dark:bg-gray-800 p-10 xl:p-14">
      <div className="flex items-center gap-3">
        <img src={careSyncLogo} alt="CareSync" className="w-10 h-10" />
        <span className="text-lg font-bold text-gray-900 dark:text-gray-50">CareSync</span>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-3">Reset Your Password</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-8">
          Choose a strong new password to keep your CareSync account and your family's healthcare data safe and secure.
        </p>
        <ul className="space-y-4">
          {[
            'Use at least 6 characters for a stronger password',
            'Mix letters, numbers, and symbols for best security',
            'Avoid using personal info like birthdays or names',
            'Consider a passphrase — long but easy to remember',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-4 h-4 rounded-full border-4 border-primary-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-700 rounded-xl border border-primary-100 dark:border-gray-600">
        <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">HIPAA Compliant & Secure</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Enterprise-grade security for your family's healthcare data</p>
        </div>
      </div>
    </div>
  );
}

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (!rawToken) { setError('Invalid or missing reset token. Please request a new link.'); return; }
    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, password: form.password, confirmPassword: form.confirmPassword });
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 grid lg:grid-cols-2">
      <LeftPanel />
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
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
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                  Your password has been changed successfully. You can now sign in with your new password.
                </p>
              </div>
              <Button variant="primary" fullWidth onClick={() => navigate('/login')}>Go to Sign In</Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Set new password</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Choose a strong password for your CareSync account
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
                  showPasswordToggle
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
                  showPasswordToggle
                  required
                />
                <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
                  Reset Password
                </Button>
              </form>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                Remember your password?{' '}
                <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                  Sign in here
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}