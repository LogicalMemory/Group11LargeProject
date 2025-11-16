import { Link } from 'react-router-dom';

const mockEvents = [
  {
    id: 1,
    org: 'Hack@UCF',
    title: 'Intro to Lockpicking & CTF Walkthrough',
    datetime: 'Tonight · 7:00 PM',
    location: 'ENG II Atrium',
    likes: 187,
    comments: 32,
  },
  {
    id: 2,
    org: 'KnightHacks',
    title: 'Hackathon Kickoff Info Session',
    datetime: 'Thu · 6:30 PM',
    location: 'Student Union 220 (Cape Florida Ballroom)',
    likes: 264,
    comments: 41,
  },
  {
    id: 3,
    org: 'UCF Esports Club',
    title: 'Smash Ultimate Bracket Finals',
    datetime: 'Sat · 4:00 PM',
    location: 'Union Esports Lounge',
    likes: 309,
    comments: 58,
  },
];


export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#FF7A18] via-[#FF2D55] to-[#7B2FFF] blur-3xl" aria-hidden />
      <div className="mx-auto flex max-w-screen-xl flex-col-reverse items-center gap-12 px-4 py-16 sm:px-6 md:flex-row md:py-24 lg:px-8">
        <div className="w-full space-y-8 md:w-1/2">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              See what&apos;s happening on campus <span className="gradient-text">in real time.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              LoopU lets students share and discover campus events in one place, from hangouts to big nights out. Add events to your calendar, get email reminders, and stay in the loop with what your friends are doing.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A18] via-[#FF2D55] to-[#7B2FFF] px-8 py-3 text-base font-semibold text-white shadow-brand transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-3 text-base font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
            >
              Log in
            </Link>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500" aria-hidden />
        </div>
        <div className="w-full md:w-1/2">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl shadow-[#7B2FFF1A]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Today on LoopU</p>
                <h3 className="text-lg font-semibold text-slate-900">Your personalized feed</h3>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {mockEvents.map((event) => (
                <article key={event.id} className="rounded-2xl border border-slate-100 p-4 transition hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-10 w-10 rounded-full border-2 border-white bg-gradient-to-br from-[#FF7A18] via-[#FF2D55] to-[#7B2FFF] shadow-sm" aria-hidden />
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">{event.org}</p>
                        <h4 className="text-base font-semibold text-slate-900">{event.title}</h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <svg className="h-4 w-4 text-[#FF7A18]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v4.5m0 0H3m3.75 0h4.5M12 6.75v12m0 0h-4.5m4.5 0h4.5M17.25 12H21m-3.75 0h-4.5" />
                          </svg>
                          {event.datetime}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <svg className="h-4 w-4 text-[#FF2D55]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 10.5-7.5 10.5S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          {event.location}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <Link
                          to="/signup"
                          className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-gray-300 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
                        >
                          Join the loop
                        </Link>
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                        <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1">
                          ❤️ {event.likes}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1">
                          💬 {event.comments}
                        </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
