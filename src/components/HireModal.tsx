import React, { useState } from 'react';

interface HireModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTitle?: string;
  initialDomain?: string;
  initialPlatform?: string;
}

export const HireModal: React.FC<HireModalProps> = ({
  isOpen,
  onClose,
  serviceTitle = 'Full CAPI + Server Setup',
  initialDomain = '',
  initialPlatform = 'Meta CAPI'
}) => {
  const [domain, setDomain] = useState(initialDomain);
  const [targetPlatform, setTargetPlatform] = useState(initialPlatform);
  const [contactEmail, setContactEmail] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div
      id="hire-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hire-modal-title"
    >
      <div
        id="hire-modal-container"
        className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden"
      >
        {/* Accent top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400" />

        {/* Close Button (Min 44px touch target) */}
        <button
          type="button"
          id="hire-modal-close-btn"
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          aria-label="Close dialog"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {!isSubmitted ? (
          <div>
            {/* Seller Credential Ribbon */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                FIVERR LEVEL 2 SELLER
              </span>
              <span className="text-xs font-mono text-slate-400">
                ★ 5.0 (142 Reviews)
              </span>
            </div>

            <h3
              id="hire-modal-title"
              className="text-2xl font-bold text-white tracking-tight mb-1"
            >
              Order Service: {serviceTitle}
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Connect directly on Fiverr or submit your project details below to receive a custom proposal within 2 hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="hire-domain-input"
                  className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Your Store / Funnel Domain
                </label>
                <input
                  type="text"
                  id="hire-domain-input"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. brandstore.com"
                  required
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="hire-platform-select"
                    className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                  >
                    Primary Focus Platform
                  </label>
                  <select
                    id="hire-platform-select"
                    value={targetPlatform}
                    onChange={(e) => setTargetPlatform(e.target.value)}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Meta CAPI">Meta CAPI (Facebook/Instagram)</option>
                    <option value="Google Ads">Google Ads Enhanced Conversions</option>
                    <option value="TikTok Events">TikTok Events API</option>
                    <option value="Multi-Platform GTM">Full Multi-Platform Stack</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="hire-email-input"
                    className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                  >
                    Contact Email / Fiverr Username
                  </label>
                  <input
                    type="email"
                    id="hire-email-input"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="hire-notes-input"
                  className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Notes or Symptoms (Optional)
                </label>
                <textarea
                  id="hire-notes-input"
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g. EMQ is at 4.2, missing Purchase events on Shopify checkout, Safari attribution drop..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="pt-3 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  id="hire-submit-inquiry-btn"
                  className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 active:scale-[0.98]"
                >
                  <span>Submit Order Inquiry</span>
                </button>

                <a
                  href="https://www.fiverr.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="hire-direct-fiverr-link"
                  className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-600"
                >
                  <span>Open Fiverr Directly</span>
                  <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            </form>
          </div>
        ) : (
          <div id="hire-success-view" className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white">Inquiry Dispatched!</h3>
            <p className="text-slate-300 text-sm max-w-sm mx-auto leading-relaxed">
              We received your tracking inquiry for <span className="font-mono text-indigo-300 font-semibold">{domain || 'your store'}</span>.
              A Level 2 engineer will review your signal leakage and reply at <span className="text-white font-medium">{contactEmail}</span>.
            </p>
            <div className="pt-4">
              <button
                type="button"
                id="hire-success-close-btn"
                onClick={handleResetAndClose}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all"
              >
                Back to Academy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
