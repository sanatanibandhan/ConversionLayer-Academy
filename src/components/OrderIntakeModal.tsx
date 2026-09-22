import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Service, WHATSAPP_DIRECT_URL } from '../data/syncOpsData';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export interface OrderIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
}

export const OrderIntakeModal: React.FC<OrderIntakeModalProps> = ({
  isOpen,
  onClose,
  service
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [clientEmail, setClientEmail] = useState(user?.email || '');
  const [companyName, setCompanyName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [projectDetails, setProjectDetails] = useState('');
  const [targetPlatforms, setTargetPlatforms] = useState<string[]>([
    'Meta Conversions API',
    'Google Ads / GA4 Server Container'
  ]);
  const [urgency, setUrgency] = useState<'Standard' | 'Urgent (<48h)' | 'Enterprise Sprint'>('Standard');

  const AVAILABLE_PLATFORMS = [
    'Meta Conversions API',
    'Google Ads / GA4 Server Container',
    'TikTok Events API',
    'Pinterest CAPI',
    'Klaviyo Server Telemetry',
    'Stape Cloud / Cloud Run Setup'
  ];

  const togglePlatform = (p: string) => {
    if (targetPlatforms.includes(p)) {
      setTargetPlatforms(targetPlatforms.filter((item) => item !== p));
    } else {
      setTargetPlatforms([...targetPlatforms, p]);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !service) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!clientEmail.trim()) {
      setErrorMessage('Please provide your work email address for client portal access and proposal delivery.');
      return;
    }
    if (!projectDetails.trim()) {
      setErrorMessage('Please describe your technical architecture requirements and target objectives.');
      return;
    }

    setIsSubmitting(true);

    try {
      const ordersCol = collection(db, 'orders');
      const durationDays = urgency === 'Urgent (<48h)' ? 2 : urgency === 'Enterprise Sprint' ? 4 : 7;
      
      const orderPayload = {
        serviceTitle: service.title,
        clientEmail: clientEmail.trim().toLowerCase(),
        clientUid: user?.uid || '',
        status: 'PENDING_REVIEW', // Stage 1: PENDING_REVIEW
        pricing: {
          total: 0,
          currency: 'USD',
          paymentUrl: ''
        },
        timeline: {
          durationDays,
          startDate: null,
          deadlineDate: null
        },
        requirements: {
          projectScope: projectDetails.trim(),
          domainUrl: websiteUrl.trim() || 'N/A',
          targetPlatforms: targetPlatforms.length > 0 ? targetPlatforms : ['Meta Conversions API']
        },
        deliverables: [],
        revisionNotes: '',
        // Flat compatibility fields
        companyName: companyName.trim() || 'Undisclosed Entity',
        websiteUrl: websiteUrl.trim() || 'N/A',
        whatsappNumber: whatsappNumber.trim() || '',
        serviceId: service.id,
        serviceCategory: service.category || 'Data & Measurement',
        projectDetails: projectDetails.trim(),
        durationDays,
        urgency,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(ordersCol, orderPayload);
      setSubmittedOrderId(docRef.id);
      setIsSuccess(true);
    } catch (err: unknown) {
      console.error('Failed to submit order request to Firestore:', err);
      setErrorMessage('Network or permission notice: could not write to Firestore orders collection. Please try again or reach out on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setSubmittedOrderId(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div
      id="order-intake-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-intake-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleResetAndClose();
      }}
    >
      <div
        id="order-intake-modal-container"
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 my-8 text-left transition-all"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleResetAndClose}
          aria-label="Close intake modal"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {isSuccess ? (
          /* SUCCESS STATE */
          <div id="order-submission-success" className="py-6 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/50">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/80 text-[11px] font-mono text-emerald-300 font-semibold mb-2">
                <span>STATUS: PENDING_REVIEW</span>
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Architecture Request Logged
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
                Your request for <strong className="text-white">{service.title}</strong> has been received by Lead Architect Adesh Chandra.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Client Identification:</span>
                <span className="text-white font-semibold">{clientEmail}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Reference ID:</span>
                <span className="text-indigo-300 font-mono">{submittedOrderId || 'PROJ-ORD-' + Date.now().toString().slice(-6)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Pipeline Stage:</span>
                <span className="text-amber-400">Awaiting Engineering Review</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-lg mx-auto">
              Our engineering team will assess your scope, configure milestone deliverables, set the turnaround time, and attach a direct escrow payment link into your Client Workspace.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                id="btn-goto-client-dashboard"
                onClick={() => {
                  handleResetAndClose();
                  navigate('/client/dashboard');
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Track in Client Portal</span>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>

              <a
                href={`${WHATSAPP_DIRECT_URL}?text=Hi%20Adesh,%20I%20just%20submitted%20an%20architecture%20request%20for%20${encodeURIComponent(service.title)}%20via%20email%20${encodeURIComponent(clientEmail)}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Instant WhatsApp Triage</span>
              </a>
            </div>
          </div>
        ) : (
          /* FORM INTAKE STATE */
          <div>
            {/* Header */}
            <div className="mb-6 pr-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-800/80 text-[11px] font-mono text-indigo-300 font-semibold mb-2">
                <span>{service.category || 'Enterprise Architecture'}</span>
                <span>•</span>
                <span className="text-emerald-400">Native Pipeline</span>
              </div>
              <h2 id="order-intake-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Request Architecture: {service.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                Provide your parameters below to receive an architectural scope, timeline guarantee, and escrow agreement.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 mb-5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
                <svg className="w-4 h-4 shrink-0 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Client Email */}
                <div>
                  <label htmlFor="order-client-email" className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Your Email (Client Portal ID) *
                  </label>
                  <input
                    type="email"
                    id="order-client-email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="e.g. founder@brand.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Company / Brand Name */}
                <div>
                  <label htmlFor="order-company-name" className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Brand / Company Name
                  </label>
                  <input
                    type="text"
                    id="order-company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Commerce Inc."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Website / Funnel URL */}
                <div>
                  <label htmlFor="order-website-url" className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Store / Funnel Domain
                  </label>
                  <input
                    type="text"
                    id="order-website-url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="e.g. https://store.brand.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label htmlFor="order-whatsapp-number" className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    WhatsApp (For Triage Notifications)
                  </label>
                  <input
                    type="tel"
                    id="order-whatsapp-number"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Target Ad & Telemetry Platforms */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Target Telemetry &amp; Ad Platforms *
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_PLATFORMS.map((platform) => {
                    const isSelected = targetPlatforms.includes(platform);
                    return (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => togglePlatform(platform)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-mono border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-400 font-semibold shadow-md'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                        <span>{platform}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Project Details & Technical Specifications */}
              <div>
                <label htmlFor="order-project-details" className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Project Scope &amp; Technical Requirements *
                </label>
                <textarea
                  id="order-project-details"
                  required
                  rows={4}
                  value={projectDetails}
                  onChange={(e) => setProjectDetails(e.target.value)}
                  placeholder="Detail your current tracking setup, CRM stack, issues with attribution/iOS restrictions, target ad platforms (Meta, TikTok, Google Ads), and delivery deadlines..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Target Urgency */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-mono text-slate-300">Deployment Urgency:</span>
                <div className="flex items-center gap-2">
                  {(['Standard', 'Urgent (<48h)', 'Enterprise Sprint'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setUrgency(lvl)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-mono transition-all ${
                        urgency === lvl
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* SLA & Security notice */}
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-[11px] text-indigo-300/90 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                <span>
                  Requests enter our pipeline under <strong>PENDING_REVIEW</strong>. We do not charge upfront until you review the formal technical scope and approve the proposal.
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  id="submit-order-request-btn"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Architecture Request</span>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
