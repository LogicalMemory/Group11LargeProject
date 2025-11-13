const features = [
  {
    title: 'RSVP in one tap',
    description: 'Mark yourself as going in seconds and see who else is headed there.',
  },
  {
    title: 'Follow orgs you care about',
    description: 'Subscribe to campus groups and get their events pinned to your feed.',
  },
  {
    title: 'Real-time updates',
    description: 'Instant push alerts for event changes, likes, comments, and reminders.',
  },
  {
    title: 'Verified campus accounts',
    description: 'Keep spam low and safety high with authenticated organizations.',
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="bg-[#fafafa] py-20">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Designed for campus life <span className="gradient-text">from day one.</span>
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Everything you need to discover what&apos;s happening tonight, stay in the loop, and bring your friends along.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="relative flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7A18] via-[#FF2D55] to-[#7B2FFF] text-white shadow-brand">
                <span className="text-lg font-semibold">•</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
