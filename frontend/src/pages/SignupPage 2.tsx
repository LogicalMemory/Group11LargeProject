import { type FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCard from '../components/AuthCard';

type SignupForm = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type SignupErrors = Partial<Record<keyof SignupForm, string>>;

type SignupTouched = Partial<Record<keyof SignupForm, boolean>>;

const initialFormState: SignupForm = {
  fullName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function SignupPage() {
  const [formData, setFormData] = useState<SignupForm>(initialFormState);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [touched, setTouched] = useState<SignupTouched>({});

  const isFormValid = useMemo(() => Object.values(errors).every((value) => !value) && Object.keys(touched).length === Object.keys(formData).length, [errors, touched]);

  const validateField = (field: keyof SignupForm, value: string, currentData: SignupForm): string => {
    if (!value.trim()) {
      return 'This field is required.';
    }

    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Enter a valid email address.';
      }
    }

    if (field === 'password' && value.length < 8) {
      return 'Password must be at least 8 characters.';
    }

    if (field === 'confirmPassword' && value !== currentData.password) {
      return 'Passwords must match.';
    }

    return '';
  };

  const validateForm = (data: SignupForm) => {
    const nextErrors: SignupErrors = {};
    (Object.keys(data) as Array<keyof SignupForm>).forEach((key) => {
      const error = validateField(key, data[key], data);
      if (error) {
        nextErrors[key] = error;
      }
    });
    return nextErrors;
  };

  const handleChange = (field: keyof SignupForm) => (event: FormEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    const nextFormState = { ...formData, [field]: value };
    setFormData(nextFormState);

    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value, nextFormState) }));
    }
  };

  const handleBlur = (field: keyof SignupForm) => (event: FormEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value, formData) }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextTouched: SignupTouched = {};
    (Object.keys(formData) as Array<keyof SignupForm>).forEach((key) => {
      nextTouched[key] = true;
    });
    setTouched(nextTouched);

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      // TODO: integrate POST /auth/register
      console.log('Registering user with payload:', formData);
    }
  };

  const inputClass = (field: keyof SignupForm) => {
    const baseClasses = 'mt-1 w-full rounded-xl border px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';
    const stateClasses = errors[field] ? 'border-rose-300 focus-visible:outline-rose-400' : 'border-gray-200 focus-visible:outline-[#FF7A18]';
    return `${baseClasses} ${stateClasses}`;
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#fafafa] via-white to-[#fafafa] px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-6 top-12 h-64 rounded-full bg-gradient-to-br from-[#FF7A18]/20 via-[#FF2D55]/20 to-[#7B2FFF]/30 blur-3xl" aria-hidden />
      <AuthCard title="Create your LoopU account" subtitle="Step into the feed and never miss what’s next on campus.">
        <form className="space-y-5" noValidate onSubmit={handleSubmit}>
          <div>
            <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              placeholder="Jordan Alvarez"
              className={inputClass('fullName')}
              value={formData.fullName}
              onChange={handleChange('fullName')}
              onBlur={handleBlur('fullName')}
            />
            <p className={`mt-1 text-xs ${errors.fullName ? 'text-rose-500' : 'text-slate-400'}`}>Use your real name so friends can find you.</p>
            {errors.fullName ? <p className="mt-1 text-xs text-rose-500">{errors.fullName}</p> : null}
          </div>

          <div>
            <label htmlFor="username" className="text-sm font-medium text-slate-700">
              Handle / Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="@loopulife"
              className={inputClass('username')}
              value={formData.username}
              onChange={handleChange('username')}
              onBlur={handleBlur('username')}
            />
            <p className={`mt-1 text-xs ${errors.username ? 'text-rose-500' : 'text-slate-400'}`}>This is how friends will tag you.</p>
            {errors.username ? <p className="mt-1 text-xs text-rose-500">{errors.username}</p> : null}
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              School Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@university.edu"
              className={inputClass('email')}
              value={formData.email}
              onChange={handleChange('email')}
              onBlur={handleBlur('email')}
            />
            <p className={`mt-1 text-xs ${errors.email ? 'text-rose-500' : 'text-slate-400'}`}>We&apos;ll verify this to keep the community safe.</p>
            {errors.email ? <p className="mt-1 text-xs text-rose-500">{errors.email}</p> : null}
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="At least 8 characters"
              className={inputClass('password')}
              value={formData.password}
              onChange={handleChange('password')}
              onBlur={handleBlur('password')}
            />
            <p className={`mt-1 text-xs ${errors.password ? 'text-rose-500' : 'text-slate-400'}`}>Add numbers or symbols for a stronger password.</p>
            {errors.password ? <p className="mt-1 text-xs text-rose-500">{errors.password}</p> : null}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Re-enter your password"
              className={inputClass('confirmPassword')}
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
            />
            {errors.confirmPassword ? <p className="mt-1 text-xs text-rose-500">{errors.confirmPassword}</p> : <p className="mt-1 text-xs text-slate-400">We&apos;ll double-check that everything matches.</p>}
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A18] via-[#FF2D55] to-[#7B2FFF] px-4 py-3 text-sm font-semibold text-white shadow-brand transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!isFormValid && Object.keys(touched).length > 0}
          >
            Create Account
          </button>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#FF2D55] underline-offset-4 transition hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </AuthCard>
    </div>
  );
}
