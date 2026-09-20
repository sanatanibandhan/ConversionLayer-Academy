import React, { useState } from 'react';

interface NavbarProps {
  onOpenHireModal: (serviceName?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenHireModal }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-50 w-full border-b border-slate-800/80 backdrop-blur-md bg-slate-950/80 transition-all duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Tech Icon */}
          <a
            href="#"
            id="nav-logo-link"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600/30 group-hover:border-indigo-400 transition-all">
              {/* Tech Signal / Layered Nodes SVG */}
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg sm:text-xl tracking-tight flex items-center gap-1.5">
                ConversionLayer
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-950 border border-indigo-700/50 text-indigo-300">
                  Academy
                </span>
              </span>
              <span className="text-xs text-slate-400 font-mono tracking-wider">
                SERVER-SIDE SIGNAL STACK
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav id="desktop-nav-menu" className="hidden md:flex items-center gap-8">
            <a
              href="#auditor-section"
              id="nav-link-audit"
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors py-2"
            >
              Free Audit
            </a>
            <a
              href="#courses-section"
              id="nav-link-courses"
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors py-2"
            >
              Courses
            </a>
            <a
              href="#services-section"
              id="nav-link-services"
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors py-2"
            >
              DFY Services
            </a>

            {/* Prominent "Hire on Fiverr" Button */}
            <button
              type="button"
              id="nav-btn-hire-fiverr"
              onClick={() => onOpenHireModal()}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 active:scale-[0.98]"
            >
              <svg className="w-4 h-4 text-emerald-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm-2-8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
              </svg>
              <span>Hire on Fiverr</span>
              <span className="text-xs bg-indigo-900/80 text-indigo-200 px-1.5 py-0.5 rounded font-mono">
                ★ 5.0
              </span>
            </button>
          </nav>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              id="mobile-menu-toggle-btn"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle Navigation Menu"
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-center transition-colors"
            >
              {isMobileMenuOpen ? (
                // Close SVG Icon
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                // Hamburger SVG Icon
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-6 animate-fadeIn transition-all"
        >
          <div className="flex flex-col space-y-2">
            <a
              href="#auditor-section"
              id="mobile-nav-link-audit"
              onClick={closeMobileMenu}
              className="min-h-[44px] flex items-center px-4 py-3 rounded-lg text-base font-medium text-slate-200 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-3 text-indigo-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Free Audit
            </a>
            <a
              href="#courses-section"
              id="mobile-nav-link-courses"
              onClick={closeMobileMenu}
              className="min-h-[44px] flex items-center px-4 py-3 rounded-lg text-base font-medium text-slate-200 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-3 text-indigo-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              Courses
            </a>
            <a
              href="#services-section"
              id="mobile-nav-link-services"
              onClick={closeMobileMenu}
              className="min-h-[44px] flex items-center px-4 py-3 rounded-lg text-base font-medium text-slate-200 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-3 text-indigo-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" />
                <line x1="6" y1="18" x2="6.01" y2="18" />
              </svg>
              DFY Services
            </a>

            <div className="pt-2">
              <button
                type="button"
                id="mobile-nav-btn-hire-fiverr"
                onClick={() => {
                  closeMobileMenu();
                  onOpenHireModal();
                }}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-lg shadow-indigo-600/30 transition-all"
              >
                <span>Hire on Fiverr</span>
                <span className="text-xs bg-indigo-900/90 text-indigo-200 px-2 py-0.5 rounded font-mono">
                  Level 2 Verified
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
