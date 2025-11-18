import { type FormEvent, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthCard from '../components/AuthCard';

type ResetFormState = {
  password: string;
  confirmPassword: string;
};

const initialState: ResetFormState = {
  password: '',
  confirmPassword: '',
};

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const emailFromLink = searchParams.get('email');

  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (event: FormEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill out both password fields.');
      setStatus(null);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      setStatus(null);
      return;
    }

    if (!/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      setError('Include at least one uppercase letter and one number.');
      setStatus(null);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setStatus(null);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setStatus(null);

    await new Promise((resolve) => setTimeout(resolve, 900));

    setIsSubmitting(false);
    setStatus('Password updated! You can now sign in with your new credentials.');
    setFormData(initialState);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#fafafa] via-white to-[#fafafa] px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-8 top-16 h-56 rounded-full bg-gradient-to-br from-[#FF7A18]/15 via-[#FF2D55]/25 to-[#7B2FFF]/25 blur-3xl" aria-hidden />
      <AuthCard title="Create a new password" subtitle="Use a strong password that you haven’t used before on LoopU.">
        <form className="space-y-5" noValidate onSubmit={handleSubmit}>
          {emailFromLink && (
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Resetting password for <span className="font-semibold text-slate-900">{emailFromLink}</span>
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}
          {status && !error && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {status}
            </div>
          )}

          <div>
            <label htmlFor="newPassword" className="text-sm font-medium text-slate-700">
              New password
            </label>
            <input
              id="newPassword"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a strong password"
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
              value={formData.password}
              onChange={handleInputChange}
            />
            <p className="mt-1 text-xs text-slate-500">At least 8 characters, with one number and one uppercase letter.</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter the password"
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A18] via-[#FF2D55] to-[#7B2FFF] px-4 py-3 text-sm font-semibold text-white shadow-brand transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating password…' : 'Update password'}
          </button>

          <p className="text-center text-sm text-slate-600">
            Remembered it?{' '}
            <Link to="/login" className="font-semibold text-[#FF2D55] underline-offset-4 transition hover:underline">
              Return to login
            </Link>
          </p>
        </form>
      </AuthCard>
    </div>
  );
}
