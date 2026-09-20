import React from 'react';

interface HeroProps {
  onScrollToAuditor: () => void;
  onScrollToCourses: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onScrollToAuditor, onScrollToCourses }) => {
  return (
    <section id="hero-section" className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Background ambient gradient glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-xs sm:text-sm font-mono mb-6 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span id="hero-specialist-badge">Level 2 Analytics Engineer & CAPI Specialist</span>
          </div>

          {/* Headline */}
          <h1
            id="hero-headline"
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6"
          >
            Stop Burning Ad Spend on{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-indigo-500 bg-clip-text text-transparent">
              Broken Tracking Signals
            </span>
          </h1>

          {/* Subheadline */}
          <p
            id="hero-subheadline"
            className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
          >
            I engineer high-fidelity Server-Side GTM architectures, Meta CAPI protocols, and GA4 pipelines.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              type="button"
              id="hero-btn-test-signals"
              onClick={onScrollToAuditor}
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-lg shadow-indigo-600/25 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 active:scale-[0.98]"
            >
              <svg
                className="w-5 h-5 text-indigo-200"
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
              id="hero-btn-browse-courses"
              onClick={onScrollToCourses}
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-semibold text-base transition-all focus:outline-none focus:ring-2 focus:ring-slate-500 active:scale-[0.98]"
            >
              <svg
                className="w-5 h-5 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              <span>Browse Tracking Courses</span>
            </button>
          </div>

          {/* Telemetry Stats Bar: 4 columns on desktop, 2 on mobile */}
          <div
            id="hero-telemetry-stats"
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-sm"
          >
            {/* Stat 1 */}
            <div
              id="stat-item-emq"
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/60 border border-slate-800/60"
            >
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono text-white mb-1 tracking-tight">
                9.2+
              </span>
              <span className="text-xs sm:text-sm font-medium text-slate-400 text-center">
                Avg Meta EMQ
              </span>
            </div>

            {/* Stat 2 */}
            <div
              id="stat-item-latency"
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/60 border border-slate-800/60"
            >
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono text-indigo-400 mb-1 tracking-tight">
                &lt; 15ms
              </span>
              <span className="text-xs sm:text-sm font-medium text-slate-400 text-center">
                Proxy Latency
              </span>
            </div>

            {/* Stat 3 */}
            <div
              id="stat-item-tags"
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/60 border border-slate-800/60"
            >
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono text-white mb-1 tracking-tight">
                500+
              </span>
              <span className="text-xs sm:text-sm font-medium text-slate-400 text-center">
                Tags Deployed
              </span>
            </div>

            {/* Stat 4 */}
            <div
              id="stat-item-first-party"
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/60 border border-slate-800/60"
            >
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono text-emerald-400 mb-1 tracking-tight">
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
