// src/pages/auth/Register.tsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Toast } from '../../components/common/Toast';
import careSyncLogo from '../../assets/careSyncLogo.svg?url';
import { GlowBlobs } from '../../components/ui/GlowBlobs';

const FEATURES = [
  'Schedule and coordinate care tasks seamlessly across your family network',
  'Share real-time updates and communicate with all family members',
  'Track medications, appointments, and health records securely',
  'Emergency contact management with instant notifications',
];

function LeftPanel() {
  return (
    <div className="relative isolate overflow-clip hidden lg:flex flex-col justify-between bg-primary-50 dark:bg-gray-800 p-10 xl:p-14">
      <GlowBlobs />
      <div className="flex flex-col items-start gap-5">
        <img src={careSyncLogo} alt="CareSyno" className="w-20 h-20" />
        <span className="text-lg font-bold text-gray-900 dark:text-gray-50">CareSyno</span>
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
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">Private & Secure</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Only the people you invite can see your family's health information</p>
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    if (form.password !== form.confirmPassword) {
      setToast({ message: 'Passwords do not match.', type: 'warning' });
      return;
    }
    if (form.password.length < 6) {
      setToast({ message: 'Password must be at least 6 characters.', type: 'warning' });
      return;
    }
    if (!form.agreeToTerms) {
      setToast({ message: 'Please agree to the Terms of Service and Privacy Policy.', type: 'warning' });
      return;
    }

    setIsLoading(true);
    try {
      await register({ fullName: form.fullName, email: form.email, password: form.password });
      setToast({ message: 'Account created successfully. Welcome to CareSyno!', type: 'success' });
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err: any) {
      setToast({ message: err.message || 'Registration failed. Please try again.', type: 'error' });
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
            <Link to="/login" className="flex-1 py-2 px-4 rounded-lg text-gray-500 dark:text-gray-400 font-medium text-sm text-center hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              Sign In
            </Link>
            <span className="flex-1 py-2 px-4 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 font-medium text-sm text-center shadow-sm">
              Sign Up
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Create Your Account</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Join thousands of families coordinating care together
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="fullName"
              name="fullName"
              type="text"
              label="Full Name"
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={handleChange}
              required
            />
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
              placeholder="Create a secure password"
              value={form.password}
              onChange={handleChange}
              showPasswordToggle
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
              showPasswordToggle
              required
            />

            <Checkbox
              id="agreeToTerms"
              name="agreeToTerms"
              checked={form.agreeToTerms}
              onChange={handleChange}
              label={
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  I agree to the{' '}
                  <a href="/terms" target="_blank" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="/privacy" target="_blank" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                    Privacy Policy
                  </a>
                </span>
              }
            />

            <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
              Create Caregiver Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
              Sign in here
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}