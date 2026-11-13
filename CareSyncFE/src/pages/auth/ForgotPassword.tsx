import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Toast } from '../../components/common/Toast';
import careSyncLogo from '../../assets/careSyncLogo.svg?url';
import { GlowBlobs } from '../../components/ui/GlowBlobs';

function LeftPanel() {
  return (
    <div className="relative isolate overflow-clip hidden lg:flex flex-col justify-between bg-primary-50 dark:bg-gray-800 p-10 xl:p-14">
      <GlowBlobs />
      <div className="flex items-center gap-3">
        <img src={careSyncLogo} alt="CareSyno" className="w-10 h-10" />
        <span className="text-lg font-bold text-gray-900 dark:text-gray-50">CareSyno</span>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-3">Forgot your password?</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-8">
          No worries! Enter your email address and we'll send you a secure link to reset your password.
        </p>
        <ul className="space-y-4">
          {[
            'Reset link sent to your email',
            'Link expires in 24 hours for your safety',
            'One-time use link — cannot be reused',
            'Your account stays protected throughout',
          ].map((f, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-4 h-4 rounded-full border-4 border-primary-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{f}</span>
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
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">Private & Secure</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Only the people you invite can see your family's health information</p>
        </div>
      </div>
    </div>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setToast({ message: err.message || 'Something went wrong. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative isolate overflow-clip min-h-screen bg-white dark:bg-gray-900 grid lg:grid-cols-2">
      <GlowBlobs />
      <LeftPanel />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">

          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-50">CareSyno</span>
          </div>

          {sent ? (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Check your inbox</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                  If <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span> is
                  registered, you'll receive a password reset link shortly.
                </p>
              </div>
              <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-xl text-left">
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                  The link expires in 24 hours and can only be used once. Check your spam folder if you don't see it.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Reset your password</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Enter your email and we'll send you a secure reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
                  Send Reset Link
                </Button>
              </form>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                Remember your password?{' '}
                <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
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