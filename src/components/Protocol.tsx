import React, { useState } from 'react';
import { 
  FileCode2, 
  Server, 
  GitFork, 
  ShieldCheck, 
  ArrowRight, 
  Terminal, 
  CheckCircle2, 
  Cpu, 
  Layers,
  Sparkles
} from 'lucide-react';

interface ProtocolProps {
  onOpenConsultation?: (topic?: string) => void;
}

interface ProtocolStep {
  stepNumber: string;
  phaseCode: string;
  title: string;
  turnaround: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  deliverables: string[];
  commandPreview: string;
  slaBadge: string;
}

const PROTOCOL_STEPS: ProtocolStep[] = [
  {
    stepNumber: '01',
    phaseCode: 'PHASE_01_AUDIT',
    title: 'Diagnostic & Blueprint',
    turnaround: 'Hours 0–24',
    description: 'Comprehensive DOM scan, client dataLayer schema inspection, ad-blocker vulnerability assessment, and architectural RFC specification tailored to your stack.',
    icon: FileCode2,
    deliverables: [
      'Raw DOM & client-side pixel leakage audit',
      'Unified dataLayer schema specification (GA4 / E-Commerce 2.0)',
      'ITP Safari cookie decay quantification model',
      'Target architecture blueprint (GCP Cloud Run vs. Stape.io)'
    ],
    commandPreview: 'syncops inspect --url target.com --audit=omnichannel --strict-emq',
    slaBadge: 'Zero-Impact Non-Breaking Scan'
  },
  {
    stepNumber: '02',
    phaseCode: 'PHASE_02_INFRA',
    title: 'Server-Side Provisioning',
    turnaround: 'Hours 24–48',
    description: 'Spin up isolated, dedicated server-side Google Tag Manager (sGTM) containers on Google Cloud Run or high-throughput edge nodes with first-party DNS routing.',
    icon: Server,
    deliverables: [
      'Server-Side GTM container provisioning on Google Cloud Run',
      'First-party subdomain CNAME routing (e.g., data.yourbrand.com)',
      'Automated SSL / TLS certificate renewal pipeline',
      'HTTP-only cookie extension preserving 365-day attribution lifespans'
    ],
    commandPreview: 'gcloud run deploy sgtm-cluster --image=gcr.io/cloud-tagging/sgtm:latest',
    slaBadge: '100% First-Party Domain Context'
  },
  {
    stepNumber: '03',
    phaseCode: 'PHASE_03_ROUTING',
    title: 'Signal Routing & Deduplication',
    turnaround: 'Hours 48–72',
    description: 'Deploy deterministic client/server cryptographic event_id pairing, Google Consent Mode v2 gating, and multi-network server dispatch to Meta, Google, TikTok, and Pinterest.',
    icon: GitFork,
    deliverables: [
      'Deterministic SHA-256 customer data normalization (em, ph, fn, ln, ct, zp)',
      'Meta Conversions API (CAPI) with 100% duplicate elimination',
      'Google Ads Enhanced Conversions & GA4 Measurement Protocol relays',
      'Google Consent Mode v2 payload gating with automated event throttling'
    ],
    commandPreview: 'syncops route --event=Purchase --dedup=sha256 --capi=meta,tiktok,ga4',
    slaBadge: '100% Deduplication Guarantee'
  },
  {
    stepNumber: '04',
    phaseCode: 'PHASE_04_VERIFY',
    title: 'Telemetry Verification',
    turnaround: 'Hours 72–96',
    description: 'Rigorous end-to-end payload auditing, live test event terminal streams, Event Match Quality (EMQ) benchmark optimization, and post-launch architectural runbook handover.',
    icon: ShieldCheck,
    deliverables: [
      'Live Meta Test Events tool validation with EMQ score > 8.5/10',
      'Direct BigQuery / GA4 real-time stream ingestion verification',
      'Automated failure alerting webhook dispatch via Slack/WhatsApp',
      'Complete technical documentation & architectural handover manual'
    ],
    commandPreview: 'syncops verify --emq-target=8.5+ --status=certified --output=runbook.pdf',
    slaBadge: '8.5+ EMQ Guaranteed'
  }
];

export const Protocol: React.FC<ProtocolProps> = ({ onOpenConsultation }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  return (
    <section id="deployment-protocol-section" className="py-20 sm:py-28 relative border-t border-slate-900 bg-slate-950 overflow-hidden">
      {/* Background ambient lighting */}
      <div 
        className="absolute top-1/4 right-0 w-[500px] h-[350px] bg-indigo-500/5 blur-[140px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div 
        className="absolute bottom-10 left-10 w-[450px] h-[300px] bg-emerald-500/5 blur-[130px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-xs font-mono mb-4 shadow-sm">
            <Terminal className="w-3.5 h-3.5" />
            <span>4-STAGE ENGINEERING PIPELINE</span>
          </div>
          <h2
            id="protocol-section-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight"
          >
            The Deployment Protocol
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
            A battle-tested server-side telemetry engineering methodology built to deploy zero-leakage tracking infrastructure with zero ad campaign disruption.
          </p>
        </div>

        {/* Pipeline Navigation / Stepper Bar */}
        <div className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {PROTOCOL_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStepIndex === idx;

            return (
              <button
                key={step.stepNumber}
                type="button"
                id={`protocol-step-tab-${step.stepNumber}`}
                onClick={() => setActiveStepIndex(idx)}
                className={`text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer relative group ${
                  isActive
                    ? 'bg-slate-900 border-indigo-500/80 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/30'
                    : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}>
                    STEP {step.stepNumber}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{step.turnaround}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span className={`text-xs sm:text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {step.title}
                  </span>
                </div>
                {isActive && (
                  <div className="absolute -bottom-px left-4 right-4 h-0.5 bg-gradient-to-r from-indigo-500 via-emerald-400 to-indigo-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Protocol Step Deep-Dive Card (Terminal / Infrastructure Pipeline UI) */}
        {(() => {
          const currentStep = PROTOCOL_STEPS[activeStepIndex];
          const CurrentIcon = currentStep.icon;

          return (
            <div 
              id={`protocol-detail-card-${currentStep.stepNumber}`}
              className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-6 sm:p-10 backdrop-blur-md"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Metadata & Narrative */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400 shadow-inner">
                      <CurrentIcon className="w-6 h-6" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-indigo-400 font-bold tracking-wider">
                          {currentStep.phaseCode}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                        <span className="text-xs font-mono text-slate-400 font-medium">
                          {currentStep.turnaround}
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {currentStep.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    {currentStep.description}
                  </p>

                  {/* Deliverables Checklist */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Standard Architectural Deliverables</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentStep.deliverables.map((item, dIdx) => (
                        <div 
                          key={dIdx} 
                          className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300 leading-normal"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex flex-wrap items-center gap-3">
                    {onOpenConsultation && (
                      <button
                        type="button"
                        id="btn-protocol-request-blueprint"
                        onClick={() => onOpenConsultation(`Protocol Step ${currentStep.stepNumber}: ${currentStep.title}`)}
                        className="min-h-[44px] px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold transition-all shadow-lg shadow-indigo-600/25 cursor-pointer flex items-center gap-2"
                      >
                        <span>Schedule Step {currentStep.stepNumber} Blueprint</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                    <span className="px-3.5 py-2 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-mono font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{currentStep.slaBadge}</span>
                    </span>
                  </div>
                </div>

                {/* Right Column: Interactive Terminal Preview */}
                <div className="lg:col-span-5 w-full">
                  <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
                    {/* Terminal Window Chrome */}
                    <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                        <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                        <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">syncops-protocol-cli — v3.4.0</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-emerald-900/50">
                        LIVE
                      </span>
                    </div>

                    {/* Terminal Content */}
                    <div className="p-5 font-mono text-xs space-y-3">
                      <div className="text-slate-400 flex items-center gap-2">
                        <span className="text-emerald-400">$</span>
                        <span className="text-slate-200">{currentStep.commandPreview}</span>
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-800/60 pt-3">
                        <p className="text-indigo-400">&gt; Initializing protocol engine: [{currentStep.phaseCode}]</p>
                        <p className="text-emerald-400">&gt; Status: 200 OK — Pipeline stage healthy</p>
                        <p className="text-slate-400">&gt; Latency: 18ms • Payload: Hashed SHA-256</p>
                        <p className="text-slate-400">&gt; Gate: Consent Mode v2 (ad_storage: granted)</p>
                        <p className="text-emerald-300 font-bold">&gt; Target SLA: Verified without downtime</p>
                      </div>

                      {/* Step Progress indicators */}
                      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Pipeline Execution:</span>
                        <span className="text-indigo-400 font-bold">
                          Step {activeStepIndex + 1} of 4 Complete
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-300"
                          style={{ width: `${((activeStepIndex + 1) / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick summary note */}
                  <div className="mt-4 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <span>Zero ad campaign pause required</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">RFC-991 Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
};
