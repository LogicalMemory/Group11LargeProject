import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeatureGrid from '../components/FeatureGrid';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <section id="about" className="bg-white py-20">
          <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Built for the students who bring campus to life.
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  LoopU is where campus events live. From film screenings and hackathons to club fairs and night markets, we give organizations the tools to reach their people and help students discover unforgettable experiences.
                </p>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  We&apos;re rolling out at universities across the country in Fall 2025. Secure your organization&apos;s spot on the waitlist and get ready to loop your campus in.
                </p>
              </div>
              <div className="relative rounded-3xl border border-slate-100 bg-[#fafafa] p-8 shadow-inner">
                <div className="pointer-events-none absolute -left-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br from-[#FF7A18] via-[#FF2D55] to-[#7B2FFF] opacity-40 blur-2xl" aria-hidden />
                <ul className="space-y-4 text-sm text-slate-700">
                  <li className="rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm">
                    <span className="font-semibold text-slate-900">For event organizers:</span> Publish events in minutes, manage RSVPs, and keep your community engaged.
                  </li>
                  <li className="rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm">
                    <span className="font-semibold text-slate-900">For students:</span> Curated feeds, instant invites, and the power to never miss a moment worth remembering.
                  </li>
                  <li className="rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm">
                    <span className="font-semibold text-slate-900">For campuses:</span> Verified accounts, moderation tools, and analytics for understanding student engagement.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <FeatureGrid />
      </main>
      <Footer />
    </div>
  );
}
