import { useState } from 'react';
import { Link } from 'react-router-dom';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#about' },
  { label: 'Log in', href: '/login' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-50">
      <nav className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
          <span className="text-2xl font-semibold text-slate-900">Loop</span>
          <span className="text-2xl font-semibold gradient-text">U</span>
        </Link>

        <div className="hidden items-center space-x-8 md:flex">
          {navLinks.map((link) =>
            link.href.startsWith('#') ? (
              <a key={link.label} href={link.href} className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
                {link.label}
              </a>
            ) : (
              <Link key={link.label} to={link.href} className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
                {link.label}
              </Link>
            ),
          )}
          <Link
            to="/signup"
            className="rounded-full bg-gradient-to-r from-[#FF7A18] via-[#FF2D55] to-[#7B2FFF] px-5 py-2 text-sm font-semibold text-white shadow-brand transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
          >
            Get started
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center rounded-md p-2 text-slate-600 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18] md:hidden"
          onClick={handleToggle}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
        </button>
      </nav>
      <div
        id="mobile-menu"
        className={`md:hidden ${isOpen ? 'max-h-screen border-t border-gray-100 bg-white pb-6 shadow-lg transition-all duration-300 ease-out' : 'max-h-0 overflow-hidden transition-all duration-300 ease-in'}`}
      >
        <div className="mx-auto flex max-w-screen-xl flex-col space-y-4 px-4 pt-4 sm:px-6">
          {navLinks.map((link) =>
            link.href.startsWith('#') ? (
              <a
                key={link.label}
                href={link.href}
                className="text-base font-medium text-slate-700 transition hover:text-slate-900"
                onClick={closeMenu}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className="text-base font-medium text-slate-700 transition hover:text-slate-900"
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ),
          )}
          <Link
            to="/signup"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A18] via-[#FF2D55] to-[#7B2FFF] px-5 py-2 text-sm font-semibold text-white shadow-brand transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A18]"
            onClick={closeMenu}
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
