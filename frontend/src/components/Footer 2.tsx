export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
        <p>© LoopU 2025. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <button type="button" className="transition hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]">
            Privacy
          </button>
          <button type="button" className="transition hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]">
            Terms
          </button>
          <button type="button" className="transition hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]">
            Contact
          </button>
        </div>
      </div>
    </footer>
  );
}
