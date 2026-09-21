import React, { useState } from 'react';
import { FIVERR_PROFILE_URL } from '../data/syncOpsData';

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
      className="sticky top-0 z-50 w-full border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/80 shadow-lg shadow-black/25 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Tech Icon */}
          <a
            href="#"
            id="nav-logo-link"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl p-1 transition-transform active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-700/10 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600/30 group-hover:border-indigo-400 group-hover:text-indigo-300 transition-all duration-300 shadow-inner">
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
              <span className="text-white font-bold text-lg sm:text-xl tracking-tight flex items-center gap-2">
                SyncOps Studio
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 shadow-sm">
                  Engineering
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono tracking-wider">
                SERVER-SIDE TRACKING &amp; CAPI
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav id="desktop-nav-menu" className="hidden md:flex items-center gap-8">
            <a
              href="#auditor-section"
              id="nav-link-audit"
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors py-2 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-indigo-500 after:absolute after:bottom-0 after:left-0 after:transition-all"
            >
              Free Audit
            </a>
            <a
              href="#case-studies-section"
              id="nav-link-case-studies"
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors py-2 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-indigo-500 after:absolute after:bottom-0 after:left-0 after:transition-all"
            >
              Case Studies
            </a>
            <a
              href="#deployment-protocol-section"
              id="nav-link-protocol"
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors py-2 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-indigo-500 after:absolute after:bottom-0 after:left-0 after:transition-all"
            >
              Protocol
            </a>
            <a
              href="#services-section"
              id="nav-link-services"
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors py-2 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-indigo-500 after:absolute after:bottom-0 after:left-0 after:transition-all"
            >
              Capabilities
            </a>
            <a
              href="#faq-section"
              id="nav-link-faq"
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors py-2 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-indigo-500 after:absolute after:bottom-0 after:left-0 after:transition-all"
            >
              FAQ
            </a>

            {/* Global Fiverr Verified CTA */}
            <a
              href={FIVERR_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              id="nav-btn-hire-fiverr"
              className="min-h-[44px] inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 border border-indigo-400/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 active:scale-95"
            >
              <svg className="w-4 h-4 text-emerald-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm-2-8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
              </svg>
              <span>Hire on Fiverr</span>
              <span className="text-[11px] bg-indigo-950/90 text-indigo-200 px-1.5 py-0.5 rounded font-mono border border-indigo-700/40">
                ★ 5.0
              </span>
            </a>
          </nav>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              id="mobile-menu-toggle-btn"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle Navigation Menu"
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-center transition-colors active:scale-95"
            >
              {isMobileMenuOpen ? (
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

      {/* Mobile Menu Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl px-5 pt-4 pb-8 shadow-2xl transition-all duration-300"
        >
          <div className="flex flex-col space-y-2.5">
            <a
              href="#auditor-section"
              id="mobile-nav-link-audit"
              onClick={closeMobileMenu}
              className="min-h-[44px] flex items-center px-4 py-3 rounded-xl text-base font-medium text-slate-200 hover:text-white hover:bg-slate-900/90 border border-transparent hover:border-slate-800 transition-colors"
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
              href="#case-studies-section"
              id="mobile-nav-link-case-studies"
              onClick={closeMobileMenu}
              className="min-h-[44px] flex items-center px-4 py-3 rounded-xl text-base font-medium text-slate-200 hover:text-white hover:bg-slate-900/90 border border-transparent hover:border-slate-800 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-3 text-indigo-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Case Studies
            </a>
            <a
              href="#deployment-protocol-section"
              id="mobile-nav-link-protocol"
              onClick={closeMobileMenu}
              className="min-h-[44px] flex items-center px-4 py-3 rounded-xl text-base font-medium text-slate-200 hover:text-white hover:bg-slate-900/90 border border-transparent hover:border-slate-800 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-3 text-indigo-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              Protocol
            </a>
            <a
              href="#services-section"
              id="mobile-nav-link-services"
              onClick={closeMobileMenu}
              className="min-h-[44px] flex items-center px-4 py-3 rounded-xl text-base font-medium text-slate-200 hover:text-white hover:bg-slate-900/90 border border-transparent hover:border-slate-800 transition-colors"
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
              Capabilities Matrix
            </a>
            <a
              href="#faq-section"
              id="mobile-nav-link-faq"
              onClick={closeMobileMenu}
              className="min-h-[44px] flex items-center px-4 py-3 rounded-xl text-base font-medium text-slate-200 hover:text-white hover:bg-slate-900/90 border border-transparent hover:border-slate-800 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-3 text-indigo-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              FAQ
            </a>

            <div className="pt-3">
              <a
                href={FIVERR_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                id="mobile-nav-btn-hire-fiverr"
                onClick={closeMobileMenu}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold text-base shadow-lg shadow-indigo-600/30 border border-indigo-400/30 transition-all active:scale-95"
              >
                <span>Hire on Fiverr</span>
                <span className="text-xs bg-indigo-950 text-indigo-200 px-2 py-0.5 rounded-full font-mono border border-indigo-700/50">
                  Level 2 Verified ★ 5.0
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
