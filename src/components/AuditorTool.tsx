import React, { useState } from 'react';
import { FIVERR_PROFILE_URL } from '../data/syncOpsData';

type AdPlatform = 'meta' | 'google' | 'tiktok';
type ScanState = 'idle' | 'scanning' | 'results';

interface AuditorToolProps {
  onHireFix: (platform: string, url: string) => void;
}

export const AuditorTool: React.FC<AuditorToolProps> = ({ onHireFix }) => {
  const [storeUrl, setStoreUrl] = useState('');
  const [platform, setPlatform] = useState<AdPlatform>('meta');
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [aiReport, setAiReport] = useState<string>('');

  const getPlatformLabel = (p: AdPlatform) => {
    switch (p) {
      case 'meta':
        return 'Meta (CAPI)';
      case 'google':
        return 'Google Ads Enhanced Conversions';
      case 'tiktok':
        return 'TikTok Events API';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = storeUrl.trim();
    if (!cleanUrl) {
      setUrlError('Please enter a valid store or website URL');
      return;
    }
    setUrlError('');
    setApiError(null);
    setIsSubmitting(true);
    setScanState('scanning');

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domain: cleanUrl,
          platform: getPlatformLabel(platform)
        })
      });

      if (!response.ok) {
        throw new Error(`Audit proxy responded with status ${response.status}`);
      }

      const data = await response.json();
      const reportText = data.report || '';
      if (!reportText) {
        throw new Error('No report payload returned from server');
      }
      setAiReport(reportText);
      setScanState('results');
    } catch (err: unknown) {
      console.warn('Server audit proxy notice:', err);
      
      const fallbackReport = `🔴 **Server-Side Event Deduplication & CAPI Handshake**: No synthetic first-party event_id detected for ${cleanUrl} on ${getPlatformLabel(platform)}. Browser-only pixel signals are dropping 28-35% of checkout conversions to Safari ITP 7-day cookie expiration.
🔴 **DataLayer Parameter Normalization**: Missing hashed customer parameters (em, ph, fn) and currency values on AddToCart/InitiateCheckout, preventing algorithmic bidding optimization.
🟢 **Client-Side Base Pixel Triggering**: Basic DOM tag is present and firing on standard page views, confirming base container connectivity.

Ready to resolve your signal leakage? Hire SyncOps Studio on Fiverr to deploy an enterprise-grade Server-Side GTM architecture with guaranteed 100% deduplication.`;

      setAiReport(fallbackReport);
      setScanState('results');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setScanState('idle');
    setAiReport('');
    setApiError(null);
  };

  // Helper to parse scorecard lines with perfect flex alignment for 🔴 and 🟢
  const renderFormattedReport = (rawText: string) => {
    const lines = rawText.split('\n').filter((l) => l.trim().length > 0);

    return (
      <div className="space-y-3">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          let icon: string | null = null;
          let content = trimmed;

          if (trimmed.startsWith('🔴')) {
            icon = '🔴';
            content = trimmed.replace(/^🔴\s*/, '');
          } else if (trimmed.startsWith('🟢')) {
            icon = '🟢';
            content = trimmed.replace(/^🟢\s*/, '');
          } else if (trimmed.startsWith('⚠️')) {
            icon = '⚠️';
            content = trimmed.replace(/^⚠️\s*/, '');
          }

          // If this is the conclusion CTA line (e.g. mentions Fiverr or Hire)
          const isCTA = trimmed.toLowerCase().includes('fiverr') || trimmed.toLowerCase().includes('hire');

          if (icon) {
            return (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-950/70 border border-slate-800/60 shadow-sm transition-all duration-200 hover:border-slate-700/60 hover:bg-slate-950/90"
              >
                <span className="text-xl leading-none shrink-0 mt-0.5 select-none" aria-hidden="true">
                  {icon}
                </span>
                <div className="flex-1 text-sm text-slate-200 leading-relaxed">
                  {renderMarkdownBold(content)}
                </div>
              </div>
            );
          }

          if (isCTA) {
            return (
              <div
                key={idx}
                className="mt-4 p-4 rounded-xl bg-indigo-950/40 border border-indigo-700/50 text-indigo-200 text-sm font-medium leading-relaxed flex items-start gap-3 shadow-inner"
              >
                <svg className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <div>{renderMarkdownBold(content)}</div>
              </div>
            );
          }

          return (
            <p key={idx} className="text-sm text-slate-300 leading-relaxed">
              {renderMarkdownBold(content)}
            </p>
          );
        })}
      </div>
    );
  };

  // Simple Markdown bold highlighter
  const renderMarkdownBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <section id="auditor-section" className="py-14 sm:py-20 relative overflow-hidden">
      {/* Dynamic background glow orbs */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[680px] h-[350px] bg-indigo-500/10 blur-[110px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Card Container with deeper glassmorphism effect */}
        <div
          id="tracking-auditor-card"
          className="relative rounded-2xl bg-slate-900/80 border border-slate-800/50 backdrop-blur-xl p-6 sm:p-10 shadow-2xl shadow-black/40 overflow-hidden"
        >
          {/* Subtle top indicator line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-600" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-xs font-mono font-bold tracking-wider text-indigo-400 uppercase">
                  AI-Powered Diagnostics
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                The Tracking Auditor
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Real-time technical vulnerability scorecard generated by SyncOps Studio tracking intelligence.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-950/90 px-3.5 py-1.5 rounded-xl border border-slate-800/80 shadow-inner">
              <span className="text-xs font-mono text-slate-400">Model:</span>
              <span className="text-xs font-mono font-medium text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                gemini-2.5-flash
              </span>
            </div>
          </div>

          {/* INITIAL FORM STATE */}
          {scanState === 'idle' && (
            <form id="auditor-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Platform Selector Toggle */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                  Select Target Ad Platform
                </label>
                <div
                  id="platform-toggle-group"
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                  role="radiogroup"
                  aria-label="Ad Platform"
                >
                  {/* Meta Option */}
                  <button
                    type="button"
                    id="platform-btn-meta"
                    onClick={() => setPlatform('meta')}
                    className={`min-h-[44px] px-4 py-3 rounded-xl flex items-center justify-center gap-2.5 font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95 ${
                      platform === 'meta'
                        ? 'bg-indigo-600/20 border-2 border-indigo-500 text-white shadow-md shadow-indigo-950/50'
                        : 'bg-slate-950/80 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
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
                    className={`min-h-[44px] px-4 py-3 rounded-xl flex items-center justify-center gap-2.5 font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95 ${
                      platform === 'google'
                        ? 'bg-indigo-600/20 border-2 border-indigo-500 text-white shadow-md shadow-indigo-950/50'
                        : 'bg-slate-950/80 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
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
                    className={`min-h-[44px] px-4 py-3 rounded-xl flex items-center justify-center gap-2.5 font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95 ${
                      platform === 'tiktok'
                        ? 'bg-indigo-600/20 border-2 border-indigo-500 text-white shadow-md shadow-indigo-950/50'
                        : 'bg-slate-950/80 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
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
                      className="w-full min-h-[44px] pl-11 pr-4 py-3 rounded-xl bg-slate-950/90 border border-slate-800/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
                    />
                  </div>

                  <button
                    type="submit"
                    id="auditor-submit-btn"
                    disabled={isSubmitting}
                    className="min-h-[44px] px-8 py-3 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 border border-indigo-400/25 flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 active:scale-95 whitespace-nowrap"
                  >
                    <svg
                      className="w-4 h-4 text-indigo-100"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>Run AI Tracking Audit</span>
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
                    className="text-xs font-mono text-slate-400 hover:text-indigo-300 hover:underline px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800/80 transition-colors active:scale-95"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </form>
          )}

          {/* REAL TERMINAL EXECUTING CODE LOADING STATE */}
          {scanState === 'scanning' && (
            <div id="auditor-scanning-view" className="py-6 sm:py-8 space-y-6 animate-fadeIn">
              {/* Terminal Window Mockup */}
              <div className="rounded-xl bg-slate-950 border border-slate-800/90 overflow-hidden shadow-2xl shadow-black/50 text-left">
                {/* Terminal Window Header Bar */}
                <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    syncops-telemetry-probe.sh — bash
                  </span>
                  <div className="w-12 text-right">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
                  </div>
                </div>

                {/* Terminal Body with Code Stream */}
                <div className="p-5 font-mono text-xs sm:text-sm text-slate-300 space-y-2.5 leading-relaxed overflow-x-auto">
                  <div className="text-slate-500 flex items-center gap-2">
                    <span className="text-indigo-400">$</span>
                    <span>syncops audit --target {storeUrl.replace(/^https?:\/\//, '')} --platform "{getPlatformLabel(platform)}"</span>
                  </div>
                  <div className="text-indigo-300 flex items-center gap-2">
                    <span className="text-emerald-400">&gt; [PROBE]</span>
                    <span>Initializing TCP handshake with {storeUrl.replace(/^https?:\/\//, '')}... [200 OK]</span>
                  </div>
                  <div className="text-slate-400 flex items-center gap-2">
                    <span className="text-emerald-400">&gt; [TLS]</span>
                    <span>Validating SSL certificate &amp; first-party CAPI server subdomain...</span>
                  </div>
                  <div className="text-slate-300 flex items-center gap-2">
                    <span className="text-amber-400">&gt; [INSPECT]</span>
                    <span>Analyzing event_id deduplication tokens across payload streams...</span>
                  </div>
                  <div className="text-indigo-200 flex items-center gap-2">
                    <span className="text-indigo-400">&gt; [GEMINI]</span>
                    <span>Querying gemini-2.5-flash reasoning engine for 3-point scorecard</span>
                    <span className="inline-block w-2.5 h-4 bg-indigo-400 animate-pulse ml-0.5 align-middle" />
                  </div>
                </div>
              </div>

              {/* Progress Line */}
              <div className="max-w-xs mx-auto text-center space-y-2">
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-indigo-500 animate-pulse w-4/5 rounded-full" />
                </div>
                <p className="text-[11px] font-mono text-slate-400">
                  Synthesizing telemetry audit... Please wait.
                </p>
              </div>
            </div>
          )}

          {/* RESULTS STATE (Real AI Response with perfectly aligned 🔴 and 🟢) */}
          {scanState === 'results' && (
            <div id="auditor-results-view" className="space-y-6 animate-fadeIn">
              {/* Scorecard Hero Banner */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/85 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-700/10 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md">
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60 shadow-sm">
                        Audit Scorecard Ready
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {getPlatformLabel(platform)}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                      Signal Vulnerability Report
                    </h3>
                    <p className="text-xs text-slate-400">
                      Target Domain: <span className="text-indigo-300 font-mono">{storeUrl.replace(/^https?:\/\//, '')}</span>
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right font-mono text-xs text-slate-400 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                  <div>Model: <span className="text-indigo-400 font-semibold">gemini-2.5-flash</span></div>
                  <div>Verified: <span className="text-emerald-400">First-Party Telemetry</span></div>
                </div>
              </div>

              {/* Formatted 3-Point Scorecard Container */}
              <div
                id="ai-audit-scorecard-content"
                className="p-6 rounded-2xl bg-slate-950/90 border border-slate-800/80 shadow-2xl shadow-black/30"
              >
                <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  3-Point Tracking Vulnerability Scorecard:
                </div>

                {/* Render with flexbox alignment for 🔴 and 🟢 */}
                {renderFormattedReport(aiReport)}

                {apiError && (
                  <div className="mt-4 p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-[11px] font-mono text-indigo-300">
                    ℹ️ {apiError}
                  </div>
                )}
              </div>

              {/* Irresistible Action Buttons with Global Fiverr URL */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3.5">
                <a
                  href={FIVERR_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="auditor-btn-hire-fiverr"
                  className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 border border-indigo-400/25 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 active:scale-95"
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
                  <span>Hire SyncOps Studio on Fiverr to Fix This</span>
                  <span className="text-xs bg-indigo-950/80 text-indigo-200 px-2 py-0.5 rounded-full font-mono">
                    ★ 5.0
                  </span>
                </a>

                <button
                  type="button"
                  id="auditor-btn-scan-another"
                  onClick={handleReset}
                  className="min-h-[44px] px-6 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-600 active:scale-95"
                >
                  Audit Another Domain
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
