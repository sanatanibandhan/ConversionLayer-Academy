import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Service } from '../data/syncOpsData';

export interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier?: string;
  selectedService?: Service | null;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  selectedTier,
  selectedService
}) => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [adPlatform, setAdPlatform] = useState('Meta');
  const [monthlyAdSpend, setMonthlyAdSpend] = useState('$10k-$50k');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [trackingChallenge, setTrackingChallenge] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic client-side validation
    if (!websiteUrl.trim()) {
      setErrorMessage('Please provide your website or funnel URL.');
      return;
    }
    if (!whatsappNumber.trim()) {
      setErrorMessage('Please provide your WhatsApp number for asynchronous technical triage.');
      return;
    }

    setIsSubmitting(true);

    try {
      const leadsCollection = collection(db, 'leads');
      await addDoc(leadsCollection, {
        websiteUrl: websiteUrl.trim(),
        adPlatform,
        monthlyAdSpend,
        whatsappNumber: whatsappNumber.trim(),
        trackingChallenge: trackingChallenge.trim(),
        serviceTier: selectedTier || selectedService?.tier || selectedService?.title || 'General Architecture Intake',
        createdAt: serverTimestamp()
      });

      setIsSuccess(true);
      // Reset form fields
      setWebsiteUrl('');
      setTrackingChallenge('');
      setWhatsappNumber('');
    } catch (err: unknown) {
      console.error('Failed to submit application to Firestore leads collection:', err);
      setErrorMessage('Unable to save application. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const activeTierLabel = selectedTier || selectedService?.tier || selectedService?.title;

  return (
    <div
      id="application-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        id="application-modal-card"
        className="relative w-full max-w-lg rounded-3xl bg-slate-950/90 border border-slate-800/90 p-6 sm:p-8 shadow-2xl shadow-indigo-950/60 backdrop-blur-2xl transition-all my-8"
      >
        {/* Close Button */}
        <button
          type="button"
          id="application-modal-close-btn"
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-mono mb-3">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span>DIRECT ARCHITECTURE APPLICATION</span>
          </div>
          <h2
            id="application-modal-title"
            className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
          >
            Apply for Tracking Architecture
          </h2>
          {activeTierLabel ? (
            <p className="text-xs font-mono text-indigo-400 mt-1">
              Selected Package: <strong className="text-white">{activeTierLabel}</strong>
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Direct intake for first-party tracking setup, server GTM containers, and CAPI deduplication.
            </p>
          )}
        </div>

        {/* Success State: Hide the form fields and render exact message */}
        {isSuccess ? (
          <div id="application-modal-success-state" className="py-8 px-4 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/50">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            {/* Exact required success message tag */}
            <p id="form-message" className="text-center mt-4 text-green-600 font-bold">
              Success! We will contact you shortly.
            </p>

            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Our lead tracking engineer will analyze your domain and initiate your technical triage asynchronously via WhatsApp within 4 business hours.
            </p>

            <div className="pt-4">
              <button
                type="button"
                id="application-modal-done-btn"
                onClick={handleClose}
                className="w-full min-h-[44px] px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-sm font-mono font-semibold transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          /* Form Fields */
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {errorMessage && (
              <div
                id="application-form-error"
                className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs font-mono"
              >
                {errorMessage}
              </div>
            )}

            {/* Website URL (Required) */}
            <div>
              <label
                htmlFor="lead-website-url"
                className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Website URL <span className="text-rose-400">*</span>
              </label>
              <input
                type="url"
                id="lead-website-url"
                name="websiteUrl"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourbrand.com"
                required
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
            </div>

            {/* Two Column Grid for Ad Platform & Ad Spend */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Ad Platform (Select: Meta, Google, TikTok, Other) */}
              <div>
                <label
                  htmlFor="lead-ad-platform"
                  className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Primary Ad Platform <span className="text-rose-400">*</span>
                </label>
                <select
                  id="lead-ad-platform"
                  name="adPlatform"
                  value={adPlatform}
                  onChange={(e) => setAdPlatform(e.target.value)}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
                >
                  <option value="Meta">Meta</option>
                  <option value="Google">Google</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Monthly Ad Spend (Select: Under $10k, $10k-$50k, $50k+) */}
              <div>
                <label
                  htmlFor="lead-monthly-ad-spend"
                  className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Monthly Ad Spend <span className="text-rose-400">*</span>
                </label>
                <select
                  id="lead-monthly-ad-spend"
                  name="monthlyAdSpend"
                  value={monthlyAdSpend}
                  onChange={(e) => setMonthlyAdSpend(e.target.value)}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
                >
                  <option value="Under $10k">Under $10k</option>
                  <option value="$10k-$50k">$10k-$50k</option>
                  <option value="$50k+">$50k+</option>
                </select>
              </div>
            </div>

            {/* WhatsApp Number (Required) */}
            <div>
              <label
                htmlFor="lead-whatsapp-number"
                className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                WhatsApp Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                id="lead-whatsapp-number"
                name="whatsappNumber"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+1 555 123 4567"
                required
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
              <span className="text-[11px] font-mono text-slate-500 block mt-1">
                Include your international country code for immediate domain diagnostic dispatch.
              </span>
            </div>

            {/* Primary Tracking Challenge (Textarea) */}
            <div>
              <label
                htmlFor="lead-tracking-challenge"
                className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Primary Tracking Challenge
              </label>
              <textarea
                id="lead-tracking-challenge"
                name="trackingChallenge"
                value={trackingChallenge}
                onChange={(e) => setTrackingChallenge(e.target.value)}
                rows={3}
                placeholder="e.g. Meta Conversions API event match quality is low (4.2/10), iOS 14 drop in purchases, or Shopify server GTM deduplication mismatch..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="lead-submit-btn"
                disabled={isSubmitting}
                className="w-full min-h-[48px] px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm font-mono tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 border border-indigo-400/40 active:scale-95 transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Architecture Application</span>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-[11px] font-mono text-slate-500 pt-1">
              🔒 Confidential • Zero spam • Direct technical triage review
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ApplicationModal;
