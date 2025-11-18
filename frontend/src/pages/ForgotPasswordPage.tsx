import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCard from '../components/AuthCard';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setError('Please enter the email you use for LoopU.');
      setStatus(null);
      return;
    }

    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      setStatus(null);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setStatus(null);

    await new Promise((resolve) => setTimeout(resolve, 900));

    setIsSubmitting(false);
    setStatus(`If an account exists for ${email.trim()}, a reset link is on the way.`);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#fafafa] via-white to-[#fafafa] px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-8 top-16 h-56 rounded-full bg-gradient-to-br from-[#FF7A18]/15 via-[#FF2D55]/25 to-[#7B2FFF]/25 blur-3xl" aria-hidden />
      <AuthCard title="Forgot your password?" subtitle="Enter your campus email and well send you a secure reset link.">
        <form className="space-y-5" noValidate onSubmit={handleSubmit}>
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
            <label htmlFor="forgotEmail" className="text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              id="forgotEmail"
              type="email"
              autoComplete="email"
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
              placeholder="you@university.edu"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A18] via-[#FF2D55] to-[#7B2FFF] px-4 py-3 text-sm font-semibold text-white shadow-brand transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending link…' : 'Send reset link'}
          </button>

          <p className="text-center text-sm text-slate-600">
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold text-[#FF2D55] underline-offset-4 transition hover:underline">
              Back to login
            </Link>
          </p>
        </form>
      </AuthCard>
    </div>
  );
}