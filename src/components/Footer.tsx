import React from 'react';
import {
  FIVERR_PROFILE_URL,
  WHATSAPP_DIRECT_URL,
  ARCHITECT_EMAIL
} from '../data/syncOpsData';

interface FooterProps {
  onOpenHireModal?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer id="app-footer" className="border-t border-slate-900 bg-slate-950 text-slate-400 py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-slate-900">
          {/* Brand & Mission Column (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-700/10 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="12 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg sm:text-xl tracking-tight">
                SyncOps <span className="text-indigo-400 font-mono text-sm">Studio</span>
              </span>
            </div>

            <p className="text-sm text-slate-400 max-w-md leading-relaxed font-normal">
              High-ticket consulting and turnkey engineering for Server-Side GTM architectures, Meta Conversions API (CAPI), Google Ads Enhanced Conversions, and first-party signal telemetry.
            </p>

            {/* Live Operational Status */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Proxy Infrastructure: 99.99% Uptime SLA</span>
            </div>
          </div>

          {/* Quick Navigation Column (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              System Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#auditor-section" className="hover:text-indigo-400 transition-colors">
                  Tracking Auditor
                </a>
              </li>
              <li>
                <a href="#case-studies-section" className="hover:text-indigo-400 transition-colors">
                  Case Studies &amp; Benchmarks
                </a>
              </li>
              <li>
                <a href="#services-section" className="hover:text-indigo-400 transition-colors">
                  Pricing Architecture
                </a>
              </li>
            </ul>
          </div>

          {/* Connect with the Architect Hub (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Connect with the Architect</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                Direct access for enterprise audits, custom scope proposals, and urgent tracking triage.
              </p>
            </div>

            {/* Minimal Inline SVG Channels with Hover Effects */}
            <div className="space-y-2 pt-1">
              {/* Fiverr */}
              <a
                href={FIVERR_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                id="footer-channel-fiverr"
                className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-slate-900 hover:-translate-y-1 transition-all duration-200"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/40 transition-colors">
                    {/* Fiverr Minimal SVG Icon */}
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="18" cy="7" r="1.5" />
                      <path d="M7 6v2H5v2h2v8h3v-8h3V8h-3V6.5c0-.6.4-1 1-1h2V3h-2.5C9.6 3 7 4.6 7 6.5V6zM15 10h3v8h-3z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-mono font-medium block text-white group-hover:text-indigo-300 transition-colors">
                      Fiverr Pro Profile
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 block">
                      @adesh_chandra • Level 2 Seller
                    </span>
                  </div>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href={WHATSAPP_DIRECT_URL}
                target="_blank"
                rel="noopener noreferrer"
                id="footer-channel-whatsapp"
                className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-slate-900 hover:-translate-y-1 transition-all duration-200"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/40 transition-colors">
                    {/* Minimal WhatsApp SVG Icon */}
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.18-.47-.3" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-mono font-medium block text-white group-hover:text-indigo-300 transition-colors">
                      WhatsApp Direct
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 block">
                      +880 1608-533529 • Instant Response
                    </span>
                  </div>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>

              {/* Email */}
              <a
                href={ARCHITECT_EMAIL}
                id="footer-channel-email"
                className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-slate-900 hover:-translate-y-1 transition-all duration-200"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/40 transition-colors">
                    {/* Minimal Email SVG Icon */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-mono font-medium block text-white group-hover:text-indigo-300 transition-colors">
                      Direct Architect Email
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 block">
                      iadeshchandra@gmail.com
                    </span>
                  </div>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright & technical specifications */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-4">
          <div>
            &copy; {new Date().getFullYear()} SyncOps Studio. Lead Architect: Adesh Chandra.
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span>Meta CAPI</span>
            <span>&bull;</span>
            <span>GA4 Measurement Protocol</span>
            <span>&bull;</span>
            <span>SS-GTM Cloud Run</span>
            <span>&bull;</span>
            <span className="text-emerald-400">First-Party Protected</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
