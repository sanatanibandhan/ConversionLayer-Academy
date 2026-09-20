import React from 'react';

interface FooterProps {
  onOpenHireModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenHireModal }) => {
  return (
    <footer id="app-footer" className="border-t border-slate-900 bg-slate-950 text-slate-400 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-900">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                ConversionLayer <span className="text-indigo-400 font-mono text-sm">Academy</span>
              </span>
            </div>

            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Engineering high-fidelity first-party data architectures, Server-Side GTM proxy pipelines, and Meta Conversions API (CAPI) deduplication systems.
            </p>

            {/* Live Operational Status */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Proxy Infrastructure: 99.99% Uptime</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#auditor-section" className="hover:text-indigo-400 transition-colors">
                  Tracking Auditor
                </a>
              </li>
              <li>
                <a href="#courses-section" className="hover:text-indigo-400 transition-colors">
                  Academy Courses
                </a>
              </li>
              <li>
                <a href="#services-section" className="hover:text-indigo-400 transition-colors">
                  DFY Engineering
                </a>
              </li>
            </ul>
          </div>

          {/* Fiverr & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Fiverr Verified
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Level 2 Analytics Engineer. Serving e-commerce brands scaling past $100k/mo ad spend.
            </p>
            <button
              type="button"
              id="footer-hire-btn"
              onClick={onOpenHireModal}
              className="min-h-[44px] px-4 py-2 rounded-lg bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold border border-slate-800 hover:border-indigo-500 transition-colors flex items-center gap-2"
            >
              <span>Contact on Fiverr</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-4">
          <div>
            &copy; {new Date().getFullYear()} ConversionLayer Academy. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Meta CAPI &bull; GA4 &bull; SS-GTM</span>
            <span>First-Party Protected</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
