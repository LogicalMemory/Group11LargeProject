import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import { buildPath } from '../components/Path';
import { storeToken } from '../tokenStorage';

type LoginForm = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const initialLoginState: LoginForm = {
  email: '',
  password: '',
  rememberMe: false,
};

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginForm>(initialLoginState);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (event: FormEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.currentTarget;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      setFormError('Please enter your email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const payload = {
        login: formData.email.trim(),
        password: formData.password,
      };

      const response = await fetch(buildPath('api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data?.error || 'Unable to log in.';
        throw new Error(message);
      }

      storeToken(data);
      localStorage.setItem(
        'user_data',
        JSON.stringify({ firstName: data.firstName, lastName: data.lastName, id: data.id }),
      );
      navigate('/auth/success', {
        state: { from: 'login', firstName: data.firstName },
        replace: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#fafafa] via-white to-[#fafafa] px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-8 top-16 h-56 rounded-full bg-gradient-to-br from-[#FF7A18]/15 via-[#FF2D55]/25 to-[#7B2FFF]/25 blur-3xl" aria-hidden />
      <AuthCard title="Welcome back to LoopU" subtitle="Log in to see tonight’s events, RSVP, and keep the loop alive.">
        <form className="space-y-5" noValidate onSubmit={handleLoginSubmit}>
          {formError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {formError}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              {/* Placeholder for future server-side errors */}
              Enter your campus email to continue.
            </div>
          )}

          <div>
            <label htmlFor="loginEmail" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="loginEmail"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@university.edu"
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="loginPassword" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs font-semibold text-[#FF2D55] underline-offset-4 transition hover:underline">
                Forgot your password?
              </Link>
            </div>
            <input
              id="loginPassword"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Your password"
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="rememberMe" className="flex items-center gap-2 text-sm text-slate-600">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-[#FF2D55] focus:ring-[#FF2D55]"
                checked={formData.rememberMe}
                onChange={handleInputChange}
              />
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A18] via-[#FF2D55] to-[#7B2FFF] px-4 py-3 text-sm font-semibold text-white shadow-brand transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in…' : 'Log in'}
          </button>

          <p className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-[#FF2D55] underline-offset-4 transition hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </AuthCard>
    </div>
  );
}
