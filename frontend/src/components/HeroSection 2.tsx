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
            <p className="mb-3 inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold tracking-wide text-[#FF7A18]">
              Launching Fall 2025 · Join the loop
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              See what&apos;s happening on campus <span className="gradient-text">in real time.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              LoopU lets you discover events, RSVP instantly, and never miss a night worth remembering. Follow the orgs you love and stay in sync with your campus.
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
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <div className="flex -space-x-2 overflow-hidden">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#FF7A18] via-[#FF2D55] to-[#7B2FFF] text-[10px] font-semibold text-white"
                >
                  {['SJ', 'AM', 'CL', 'KD'][index]}
                </div>
              ))}
            </div>
            <span>Trusted by campus orgs across the country</span>
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl shadow-[#7B2FFF1A]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Today on LoopU</p>
                <h3 className="text-lg font-semibold text-slate-900">Your personalized feed</h3>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">Live</span>
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
                        <button
                          type="button"
                          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#FF2D55] shadow-sm ring-1 ring-inset ring-[#FF2D55]/20 transition hover:bg-[#FF2D55] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
                        >
                          RSVP
                        </button>
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <svg className="h-4 w-4 text-rose-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.098 3.75 3 5.765 3 8.25c0 7.22 7.312 11.25 9 11.25s9-4.03 9-11.25z" />
                            </svg>
                            {event.likes}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <svg className="h-4 w-4 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3h5.25m-2.691 7.888L12 21.75l1.941-2.612a11.954 11.954 0 005.145-6.08A11.966 11.966 0 0021 8.25c0-1.518-.27-2.973-.764-4.312A48.1 48.1 0 0012 3c-3.08 0-6.03.168-8.236.938A11.966 11.966 0 003 8.25c0 1.966.474 3.82 1.314 5.458a11.953 11.953 0 005.145 6.08z" />
                            </svg>
                            {event.comments}
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
