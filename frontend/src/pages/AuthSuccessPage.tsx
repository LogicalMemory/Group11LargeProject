import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard';

type SuccessState = {
  from?: 'signup' | 'login';
  firstName?: string;
};

export default function AuthSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as SuccessState) || {};

  const headline =
    state.from === 'signup'
      ? `Welcome to LoopU${state.firstName ? `, ${state.firstName}` : ''}!`
      : `You're logged in${state.firstName ? `, ${state.firstName}` : ''}!`;

  const description =
    state.from === 'signup'
      ? 'Your account is ready. Explore events, RSVP, and keep your campus loop alive.'
      : 'You’re good to go. Head to your dashboard to catch up on what’s happening tonight.';

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4 py-12 sm:px-6 lg:px-8">
      <AuthCard title="Success!" subtitle={headline}>
        <div className="space-y-6 text-center">
          <p className="text-sm text-slate-600">{description}</p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate('/cards')}
              className="rounded-full bg-gradient-to-r from-[#FF7A18] via-[#FF2D55] to-[#7B2FFF] px-4 py-3 text-sm font-semibold text-white shadow-brand transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
            >
              Go to dashboard
            </button>
            <Link
              to="/"
              className="rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
            >
              Back to landing page
            </Link>
          </div>
        </div>
      </AuthCard>
    </div>
  );
}
