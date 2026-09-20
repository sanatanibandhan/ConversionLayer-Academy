import React, { useState, useEffect } from 'react';

type AdPlatform = 'meta' | 'google' | 'tiktok';

type ScanState = 'idle' | 'scanning' | 'results';

interface AuditorToolProps {
  onHireFix: (platform: string, url: string) => void;
}

export const AuditorTool: React.FC<AuditorToolProps> = ({ onHireFix }) => {
  const [storeUrl, setStoreUrl] = useState('');
  const [platform, setPlatform] = useState<AdPlatform>('meta');
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scanProgressText, setScanProgressText] = useState('Probing Server-Side GTM...');
  const [scanPercent, setScanPercent] = useState(0);
  const [urlError, setUrlError] = useState('');

  // Handle simulated scanning
  useEffect(() => {
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;
    let timer3: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    if (scanState === 'scanning') {
      setScanPercent(15);
      setScanProgressText('Probing Server-Side GTM...');

      // Incremental progress bar
      progressInterval = setInterval(() => {
        setScanPercent((prev) => {
          if (prev >= 90) return prev;
          return prev + 5;
        });
      }, 150);

      // Transition to second phase at 1.5s
      timer1 = setTimeout(() => {
        setScanProgressText('Analyzing DataLayer...');
      }, 1500);

      // Transition to final result at 3s
      timer2 = setTimeout(() => {
        setScanPercent(100);
      }, 2700);

      timer3 = setTimeout(() => {
        setScanState('results');
      }, 3000);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearInterval(progressInterval);
    };
  }, [scanState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeUrl.trim()) {
      setUrlError('Please enter a valid store or website URL');
      return;
    }
    setUrlError('');
    setScanState('scanning');
  };

  const handleReset = () => {
    setScanState('idle');
    setScanPercent(0);
    setScanProgressText('Probing Server-Side GTM...');
  };

  const getPlatformLabel = (p: AdPlatform) => {
    switch (p) {
      case 'meta':
        return 'Meta';
      case 'google':
        return 'Google Ads';
      case 'tiktok':
        return 'TikTok';
    }
  };

  return (
    <section id="auditor-section" className="py-12 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Card Container with glowing SaaS border effect */}
        <div
          id="tracking-auditor-card"
          className="relative rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-10 shadow-2xl shadow-indigo-950/40 overflow-hidden"
        >
          {/* Subtle top indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-600" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-xs font-mono font-bold tracking-wider text-indigo-400 uppercase">
                  Lead Magnet Engine
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                The Tracking Auditor
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Inspect your live domain for server-side signal leakage and broken pixel triggers.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-xs font-mono text-slate-400">Status:</span>
              <span className="text-xs font-mono font-medium text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Ready to Probe
              </span>
            </div>
          </div>

          {/* INITIAL STATE */}
          {scanState === 'idle' && (
            <form id="auditor-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Platform Selector Toggle */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                  Select Target Ad Platform
                </label>
                <div
                  id="platform-toggle-group"
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
                  role="radiogroup"
                  aria-label="Ad Platform"
                >
                  {/* Meta Option */}
                  <button
                    type="button"
                    id="platform-btn-meta"
                    onClick={() => setPlatform('meta')}
                    className={`min-h-[44px] px-4 py-3 rounded-xl flex items-center justify-center gap-2.5 font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      platform === 'meta'
                        ? 'bg-indigo-600/20 border-2 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {/* Meta SVG Icon */}
                    <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span>Meta (CAPI)</span>
                  </button>

                  {/* Google Ads Option */}
                  <button
                    type="button"
                    id="platform-btn-google"
                    onClick={() => setPlatform('google')}
                    className={`min-h-[44px] px-4 py-3 rounded-xl flex items-center justify-center gap-2.5 font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      platform === 'google'
                        ? 'bg-indigo-600/20 border-2 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {/* Google Search / Target Icon */}
                    <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                    </svg>
                    <span>Google Ads</span>
                  </button>

                  {/* TikTok Option */}
                  <button
                    type="button"
                    id="platform-btn-tiktok"
                    onClick={() => setPlatform('tiktok')}
                    className={`min-h-[44px] px-4 py-3 rounded-xl flex items-center justify-center gap-2.5 font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      platform === 'tiktok'
                        ? 'bg-indigo-600/20 border-2 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {/* TikTok SVG Icon */}
                    <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .59.043.87.126V9.41a6.34 6.34 0 0 0-.87-.06A6.33 6.33 0 0 0 3.12 15.68a6.33 6.33 0 0 0 8.78 5.86 6.31 6.31 0 0 0 3.88-5.87V8.59a8.28 8.28 0 0 0 5.17 1.83V7a4.83 4.83 0 0 1-1.36-.31z" />
                    </svg>
                    <span>TikTok Events</span>
                  </button>
                </div>
              </div>

              {/* URL Input & Inspection Button */}
              <div>
                <label
                  htmlFor="auditor-url-input"
                  className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2.5"
                >
                  Store or Funnel Domain URL
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="auditor-url-input"
                      value={storeUrl}
                      onChange={(e) => {
                        setStoreUrl(e.target.value);
                        if (urlError) setUrlError('');
                      }}
                      placeholder="e.g. store.yourbrand.com or https://example.com"
                      className="w-full min-h-[44px] pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    id="auditor-submit-btn"
                    className="min-h-[44px] px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 active:scale-[0.98] whitespace-nowrap"
                  >
                    <svg
                      className="w-4 h-4 text-indigo-200"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>Run Free Tracking Inspection</span>
                  </button>
                </div>
                {urlError && (
                  <p id="auditor-url-error" className="text-rose-400 text-xs mt-2 flex items-center gap-1 font-mono">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {urlError}
                  </p>
                )}
              </div>

              {/* Sample Quick Demo Clickers */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
                <span className="text-xs text-slate-500 font-mono">Quick test targets:</span>
                {['mystore-shopify.com', 'luxwear-direct.io', 'peaknutrition.co'].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      setStoreUrl(sample);
                      if (urlError) setUrlError('');
                    }}
                    className="text-xs font-mono text-slate-400 hover:text-indigo-300 hover:underline px-2 py-1 rounded bg-slate-950/80 border border-slate-800"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </form>
          )}

          {/* SCANNING STATE (Simulated 3 seconds) */}
          {scanState === 'scanning' && (
            <div id="auditor-scanning-view" className="py-10 text-center space-y-6 animate-fadeIn">
              {/* Spinning Radar Animation */}
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                  <svg
                    className="w-5 h-5 animate-pulse"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
              </div>

              <div>
                <h3
                  id="auditor-scanning-status-text"
                  className="text-lg sm:text-xl font-bold text-white font-mono transition-all duration-300"
                >
                  {scanProgressText}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Inspecting domain:{' '}
                  <span className="text-indigo-300">{storeUrl.replace(/^https?:\/\//, '')}</span> for {getPlatformLabel(platform)}
                </p>
              </div>

              {/* Progress bar */}
              <div className="max-w-md mx-auto">
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-200"
                    style={{ width: `${scanPercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs font-mono text-slate-500 mt-2">
                  <span>SSL Handshake OK</span>
                  <span>{scanPercent}% Processed</span>
                </div>
              </div>
            </div>
          )}

          {/* RESULT STATE */}
          {scanState === 'results' && (
            <div id="auditor-results-view" className="space-y-6 animate-fadeIn">
              {/* Scorecard Hero Banner */}
              <div className="p-5 sm:p-6 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Visual Radial Gauge Badge */}
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border-2 border-rose-500/50 flex flex-col items-center justify-center text-rose-400 font-mono">
                    <span className="text-2xl font-bold leading-none">42</span>
                    <span className="text-[10px] text-slate-400">/ 100</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        Critical Drop-off
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Target: {getPlatformLabel(platform)}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                      Signal Degradation Detected
                    </h3>
                    <p className="text-xs text-slate-400">
                      Estimated 28% to 35% of ad conversions are dropped by Safari ITP & ad blockers.
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right font-mono text-xs text-slate-400 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                  <div>Host: <span className="text-slate-200">{storeUrl.replace(/^https?:\/\//, '')}</span></div>
                  <div>Audit Timestamp: <span className="text-indigo-400">Just now</span></div>
                </div>
              </div>

              {/* Diagnostic Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Diagnostic Breakdown (1 Passed • 2 Failed)
                </h4>

                {/* 1 GREEN SUCCESS ITEM */}
                <div
                  id="result-item-success"
                  className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    {/* Checkmark SVG */}
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-emerald-300 block">
                      Client-Side Base Pixel Detected
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Standard browser tag is active in the page header. Firing PageView event, but highly susceptible to iOS 14.5+ cookie expiration and client-side script blockers.
                    </p>
                  </div>
                </div>

                {/* RED FAILURE ITEM 1 */}
                <div
                  id="result-item-fail-capi"
                  className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                    {/* Alert / X SVG */}
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-rose-300 block">
                      Server-Side CAPI Missing
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      No first-party server proxy or server-side event deduplication header was detected. Ad platform algorithms cannot attribute purchases made on Safari or private browsers.
                    </p>
                  </div>
                </div>

                {/* RED FAILURE ITEM 2 */}
                <div
                  id="result-item-fail-triggers"
                  className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                    {/* Alert / X SVG */}
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-rose-300 block">
                      Dynamic Element Triggers Missing
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      AddToCart, InitiateCheckout, and Purchase payloads lack normalized dataLayer variables. Currency values and hashed customer email parameters are failing transmission.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  id="auditor-btn-hire-fiverr"
                  onClick={() => onHireFix(getPlatformLabel(platform), storeUrl)}
                  className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-lg shadow-indigo-600/30 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 active:scale-[0.98]"
                >
                  <svg
                    className="w-5 h-5 text-emerald-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                  <span>Hire Me on Fiverr to Fix This</span>
                </button>

                <button
                  type="button"
                  id="auditor-btn-scan-another"
                  onClick={handleReset}
                  className="min-h-[44px] px-6 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-600 active:scale-[0.98]"
                >
                  Scan Another URL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
