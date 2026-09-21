import React, { useState } from 'react';
import { 
  ChevronDown, 
  MessageSquare, 
  HelpCircle, 
  ShieldCheck, 
  Terminal, 
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { WHATSAPP_TRIAGE_URL } from '../data/syncOpsData';

interface FAQProps {
  onOpenConsultation?: (topic?: string) => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'Model' | 'Technical' | 'Infrastructure' | 'Timeline';
  highlight?: boolean;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-discovery-calls',
    category: 'Model',
    question: 'Do you offer live discovery calls?',
    answer: 'No. We believe in deep engineering work, not endless meetings. All project scoping, architectural blueprints, and telemetry reviews are handled asynchronously via a dedicated, text-based WhatsApp channel to ensure a strict technical paper trail.',
    highlight: true
  },
  {
    id: 'faq-server-side-why',
    category: 'Technical',
    question: 'Why choose server-side tracking over standard browser pixels?',
    answer: 'Client-side pixels routinely drop 30% to 50% of conversion signals due to Safari ITP (which caps cookie lifespans to 1 to 7 days), browser ad blockers, and network packet drops. Server-Side CAPI routes first-party events through your custom subdomain, preserving 365-day attribution lifespans, unlocking higher ROAS, and training ad algorithms on clean, unadulterated purchase data.',
    highlight: false
  },
  {
    id: 'faq-headless-shopify',
    category: 'Technical',
    question: 'Do you support custom headless Shopify, Hydrogen, and Next.js builds?',
    answer: 'Yes. We specialize in complex modern architectures including Shopify Hydrogen/Remix, Next.js Commerce, Gatsby, and bespoke Liquid 2.0 themes. We interface with Shopify Customer Events / Web Pixels API and configure server webhooks directly to bypass client sandbox limitations and script-blocking restrictions.',
    highlight: false
  },
  {
    id: 'faq-infrastructure-hosts',
    category: 'Infrastructure',
    question: 'Which server-side infrastructure do you deploy on?',
    answer: 'We provision dedicated Google Tag Manager (sGTM) containers on Google Cloud Run or high-throughput edge nodes (such as Stape.io). Both configurations leverage custom subdomain CNAME records (e.g., data.yourbrand.com), automated SSL certificate rotation, and auto-scaling to handle peak Black Friday / Cyber Monday traffic bursts.',
    highlight: false
  },
  {
    id: 'faq-deduplication-guarantee',
    category: 'Technical',
    question: 'How do you guarantee 100% deduplication between browser and server?',
    answer: 'We implement deterministic cryptographic event_id generation directly in the client dataLayer that matches the server CAPI payload byte-for-byte. Ad networks (Meta, TikTok, Pinterest) deduplicate these signals in real time, completely eliminating double-counted purchase events and CPA distortion.',
    highlight: false
  },
  {
    id: 'faq-turnaround-timeline',
    category: 'Timeline',
    question: 'What is the typical turnaround timeline for an omnichannel deployment?',
    answer: 'Standard enterprise telemetry deployments (Meta CAPI, TikTok Events API, GA4 BigQuery streaming, and Google Consent Mode v2) are engineered, tested, and validated within 3 to 5 business days with zero downtime or interruption to your live ad campaigns.',
    highlight: false
  },
  {
    id: 'faq-post-launch-warranty',
    category: 'Model',
    question: 'What happens if a tracking pixel or API endpoint breaks after launch?',
    answer: 'Every deployment includes a full technical runbook, schema dictionary, and a 30-day post-launch telemetry warranty. If an ad network alters their API contract or schema requirements, we patch and recertify your pipeline at zero additional cost.',
    highlight: false
  }
];

export const FAQ: React.FC<FAQProps> = ({ onOpenConsultation }) => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'faq-discovery-calls': true,
    'faq-server-side-why': false
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <section id="faq-section" className="py-20 sm:py-28 relative border-t border-slate-900 bg-slate-950 overflow-hidden">
      {/* Ambient background lighting */}
      <div 
        className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[550px] h-[350px] bg-indigo-500/5 blur-[140px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-xs font-mono mb-4 shadow-sm">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>OBJECTION HANDLING &amp; SPECIFICATIONS</span>
          </div>
          <h2
            id="faq-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight"
          >
            The Anti-Agency FAQ
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
            Zero fluff, zero vanity metrics, and no 45-minute discovery calls. Direct answers to high-stakes telemetry, compliance, and engineering questions.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item) => {
            const isOpen = !!openItems[item.id];

            return (
              <div
                key={item.id}
                id={`faq-card-${item.id}`}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  item.highlight
                    ? 'bg-slate-900/90 border-indigo-500/50 shadow-lg shadow-indigo-950/20'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <button
                  type="button"
                  id={`faq-btn-${item.id}`}
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  className="w-full min-h-[56px] px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {item.highlight ? (
                      <span className="px-2.5 py-1 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800/60 text-[10px] font-mono font-bold uppercase tracking-wider shrink-0">
                        ASYNC MODEL
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 text-[10px] font-mono font-semibold uppercase shrink-0">
                        {item.category}
                      </span>
                    )}
                    <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {item.question}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0 transition-transform duration-200">
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`faq-content-${item.id}`}
                    className="px-6 pb-6 pt-1 text-sm sm:text-base text-slate-300 leading-relaxed border-t border-slate-800/60 font-normal"
                  >
                    <p className="mt-2">{item.answer}</p>

                    {item.highlight && (
                      <div className="mt-4 p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-mono text-indigo-300">
                          <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Strict technical paper trail via dedicated WhatsApp engineering channel</span>
                        </div>
                        <a
                          id="faq-whatsapp-link"
                          href={WHATSAPP_TRIAGE_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-sm whitespace-nowrap"
                        >
                          <span>Open WhatsApp Triage</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-14 p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left shadow-2xl">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white tracking-tight">Have a custom or edge-case stack?</h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Submit your domain URL for an asynchronous telemetry evaluation within 2 hours.
            </p>
          </div>
          {onOpenConsultation && (
            <button
              type="button"
              id="btn-faq-request-consult"
              onClick={() => onOpenConsultation('Technical Architecture Consultation')}
              className="w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <span>Request Engineering Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
