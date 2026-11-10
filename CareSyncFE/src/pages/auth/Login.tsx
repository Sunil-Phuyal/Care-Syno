import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Toast } from '../../components/common/Toast';
import careSyncLogo from '../../assets/careSyncLogo.svg?url';

const FEATURES = [
  'Schedule and coordinate care tasks seamlessly across your family network',
  'Share real-time updates and communicate with all family members',
  'Track medications, appointments, and health records securely',
  'Emergency contact management with instant notifications',
];

function LeftPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-primary-50 dark:bg-gray-800 p-10 xl:p-14">
      <div className="flex flex-col items-start">
        <img src={careSyncLogo} alt="CareSyno" className="w-48 h-48 drop-shadow-md" />
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-3">CareSyno</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-8">
          Connect, coordinate, and care for your loved ones together with our
          comprehensive family caregiving platform designed for modern healthcare needs.
        </p>
        <ul className="space-y-4">
          {FEATURES.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-4 h-4 rounded-full border-4 border-primary-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
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

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);
    setIsLoading(true);
    try {
      await login(form.email, form.password);
      setToast({ message: 'Signed in successfully. Welcome back!', type: 'success' });
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err: any) {
      setToast({ message: err.message || 'Invalid email or password. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 grid lg:grid-cols-2">
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

          <div className="flex mb-8 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <span className="flex-1 py-2 px-4 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 font-medium text-sm text-center shadow-sm">
              Sign In
            </span>
            <Link to="/register" className="flex-1 py-2 px-4 rounded-lg text-gray-500 dark:text-gray-400 font-medium text-sm text-center hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              Sign Up
            </Link>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Welcome back</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Sign in to your caregiver account and continue caring for your loved ones
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="Enter your email address"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              showPasswordToggle
              required
            />

            <div className="flex items-center justify-between">
              <Checkbox id="rememberMe" name="rememberMe" label="Remember me" checked={form.rememberMe} onChange={handleChange} />
              <Link to="/forgot-password" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
              Sign In to Your Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
              Sign up here
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}