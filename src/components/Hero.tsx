import React from 'react';
import { FIVERR_PROFILE_URL } from '../data/syncOpsData';

interface HeroProps {
  onScrollToAuditor: () => void;
  onScrollToCaseStudies: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onScrollToAuditor, onScrollToCaseStudies }) => {
  return (
    <section id="hero-section" className="relative pt-14 pb-16 md:pt-24 md:pb-28 overflow-hidden">
      {/* Dynamic ambient gradient glow orbs */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[750px] h-[350px] sm:h-[420px] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Top Specialist Credential Ribbon */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800/80 text-indigo-300 text-xs sm:text-sm font-mono mb-6 shadow-lg shadow-black/40 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span id="hero-specialist-badge">SyncOps Studio • Senior Analytics Engineering Practice</span>
            <a
              href={FIVERR_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center text-xs text-indigo-400 hover:text-white underline underline-offset-2 ml-1"
            >
              Fiverr Level 2 &rarr;
            </a>
          </div>

          {/* Headline */}
          <h1
            id="hero-headline"
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] mb-6"
          >
            Stop Burning Ad Spend on{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              Broken Tracking Signals
            </span>
          </h1>

          {/* Subheadline */}
          <p
            id="hero-subheadline"
            className="text-base sm:text-lg lg:text-xl text-slate-300/90 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
          >
            SyncOps Studio engineers high-fidelity Server-Side GTM architectures, Meta CAPI protocols, and GA4 telemetry pipelines for high-growth e-commerce and SaaS brands.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              type="button"
              id="hero-btn-test-signals"
              onClick={onScrollToAuditor}
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold text-base shadow-xl shadow-indigo-600/30 border border-indigo-400/25 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 active:scale-95"
            >
              <svg
                className="w-5 h-5 text-indigo-100"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span>Test Your Store Signals</span>
            </button>

            <button
              type="button"
              id="hero-btn-explore-case-studies"
              onClick={onScrollToCaseStudies}
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 font-semibold text-base shadow-lg shadow-black/20 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 active:scale-95"
            >
              <svg
                className="w-5 h-5 text-indigo-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <span>Explore Case Studies</span>
            </button>
          </div>

          {/* Telemetry Stats Bar */}
          <div
            id="hero-telemetry-stats"
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800/60 backdrop-blur-xl shadow-2xl shadow-black/30"
          >
            {/* Stat 1 */}
            <div
              id="stat-item-emq"
              className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800/60 transition-all duration-300 hover:border-indigo-500/40 hover:-translate-y-0.5"
            >
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white mb-1 tracking-tight">
                9.2+
              </span>
              <span className="text-xs sm:text-sm font-medium text-slate-400 text-center">
                Avg Meta EMQ
              </span>
            </div>

            {/* Stat 2 */}
            <div
              id="stat-item-latency"
              className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800/60 transition-all duration-300 hover:border-indigo-500/40 hover:-translate-y-0.5"
            >
              <span className="text-2xl sm:text-3xl font-bold font-mono text-indigo-400 mb-1 tracking-tight">
                &lt; 15ms
              </span>
              <span className="text-xs sm:text-sm font-medium text-slate-400 text-center">
                Proxy Latency
              </span>
            </div>

            {/* Stat 3 */}
            <div
              id="stat-item-tags"
              className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800/60 transition-all duration-300 hover:border-indigo-500/40 hover:-translate-y-0.5"
            >
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white mb-1 tracking-tight">
                500+
              </span>
              <span className="text-xs sm:text-sm font-medium text-slate-400 text-center">
                Tags Deployed
              </span>
            </div>

            {/* Stat 4 */}
            <div
              id="stat-item-first-party"
              className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800/60 transition-all duration-300 hover:border-indigo-500/40 hover:-translate-y-0.5"
            >
              <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 mb-1 tracking-tight">
                100%
              </span>
              <span className="text-xs sm:text-sm font-medium text-slate-400 text-center">
                First-Party Data
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
