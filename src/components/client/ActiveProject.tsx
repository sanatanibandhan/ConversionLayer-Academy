import React, { useState, useEffect } from 'react';
import { Order, WHATSAPP_DIRECT_URL, ARCHITECT_EMAIL } from '../../data/syncOpsData';
import { formatDeadlineDate } from '../../services/notificationService';
import { ReviewDeliverablesModal } from './ReviewDeliverablesModal';

export interface ActiveProjectProps {
  order: Order;
  onRefresh?: () => void;
  onStatusUpdated?: (updatedOrder: Order) => void;
}

interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateTimeRemaining(deadlineStr?: string): TimeRemaining {
  if (!deadlineStr) {
    return { totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false };
  }

  const deadlineMs = new Date(deadlineStr).getTime();
  const nowMs = Date.now();
  const diff = deadlineMs - nowMs;

  if (diff <= 0) {
    return { totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return { totalMs: diff, days, hours, minutes, seconds, isExpired: false };
}

export const ActiveProject: React.FC<ActiveProjectProps> = ({ order, onRefresh, onStatusUpdated }) => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(order.deadlineDate)
  );
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const isDelivered = order.status === 'DELIVERED';
  const isCompleted = order.status === 'COMPLETED';

  // Live ticking countdown timer (HALTED if DELIVERED or COMPLETED)
  useEffect(() => {
    if (!order.deadlineDate || isDelivered || isCompleted) return;

    // Immediately calculate
    setTimeLeft(calculateTimeRemaining(order.deadlineDate));

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(order.deadlineDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [order.deadlineDate, isDelivered, isCompleted]);

  // Compute sprint progress percentage based on startedAt and deadlineDate
  const getSprintProgress = (): number => {
    if (isDelivered || isCompleted) return 100;
    if (!order.deadlineDate) return 50;
    const deadlineMs = new Date(order.deadlineDate).getTime();
    const durationDays = order.durationDays || 7;
    const totalSprintMs = durationDays * 24 * 60 * 60 * 1000;
    const elapsedMs = Math.max(0, totalSprintMs - (deadlineMs - Date.now()));
    const percentage = Math.min(100, Math.max(10, Math.round((elapsedMs / totalSprintMs) * 100)));
    return percentage;
  };

  const progressPct = getSprintProgress();

  const handleCopyUrl = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Architectural phases
  const phases = [
    {
      step: '01',
      title: 'Infrastructure & Container Provisioning',
      desc: 'Google Cloud Run server-side cluster, DNS handshake, and first-party subdomain SSL routing.',
      completed: true
    },
    {
      step: '02',
      title: 'Data Layer & Event Schema Engineering',
      desc: 'First-party client cookie setting, user data hashing (SHA-256), and server GTM tagging configuration.',
      completed: progressPct >= 50 || isDelivered
    },
    {
      step: '03',
      title: 'Conversions API (CAPI) Deduplication',
      desc: 'Real-time event_id matching across browser and server payloads to prevent double-counting.',
      completed: progressPct >= 80 || isDelivered
    },
    {
      step: '04',
      title: 'EMQ 8.5+ Verification & Client Handover',
      desc: 'Diagnostic signal audit, verified Event Match Quality score, and complete container ownership transfer.',
      completed: isDelivered || isCompleted
    }
  ];

  return (
    <div
      id={`active-project-workspace-${order.id}`}
      className={`p-6 sm:p-8 rounded-3xl bg-slate-900 border shadow-2xl relative overflow-hidden transition-all ${
        isDelivered
          ? 'border-emerald-500/80 shadow-emerald-950/40 ring-1 ring-emerald-500/40'
          : 'border-indigo-500/50 shadow-indigo-950/40'
      }`}
    >
      {/* Background ambient glow */}
      <div
        className={`absolute -top-24 right-0 w-80 h-80 blur-[100px] rounded-full pointer-events-none ${
          isDelivered ? 'bg-emerald-500/10' : 'bg-indigo-500/10'
        }`}
        aria-hidden="true"
      />

      {/* Header section */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {isDelivered ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500 text-[11px] font-mono font-bold text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>FINAL WORK DELIVERED • PENDING APPROVAL</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700/80 text-[11px] font-mono font-bold text-indigo-300">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span>ACTIVE SPRINT EXECUTION</span>
              </span>
            )}

            <span className="text-xs font-mono text-slate-500">Order ID: #{order.id.slice(-6)}</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-indigo-400 font-semibold">{order.serviceCategory}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {order.serviceTitle}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {isDelivered
              ? 'The Lead Architect has submitted all final deliverables, container JSON exports, and DNS maps. Please review the artifacts below to request revisions or sign off.'
              : 'Lead Architect Adesh Chandra is currently deploying and validating your server-side telemetry. Review the live sprint countdown and milestone phases below.'}
          </p>

          {/* Active Revision Banner if client requested revision */}
          {order.revisionNotes && !isDelivered && (
            <div className="mt-3 p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs font-mono text-amber-200">
              <span className="font-bold text-amber-400 uppercase">
                Active Revision Cycle #{order.revisionCount || 1}:
              </span>{' '}
              <span>{order.revisionNotes}</span>
            </div>
          )}
        </div>

        {/* Financial & Architect Metrics */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-right">
            <span className="block text-[10px] font-mono uppercase text-slate-500">Allocated Escrow</span>
            <span className="text-base sm:text-lg font-mono font-bold text-emerald-400">
              {order.totalPrice || 'Verified Escrow'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-right">
            <span className="block text-[10px] font-mono uppercase text-slate-500">Sprint SLA</span>
            <span className="text-base sm:text-lg font-mono font-bold text-slate-200">
              {order.durationDays || 7} Days
            </span>
          </div>
        </div>
      </div>

      {/* STAGE 4: CLIENT REVIEW DELIVERABLES UI (WHEN STATUS IS DELIVERED) */}
      {isDelivered ? (
        <div
          id="client-review-deliverables-section"
          className="my-8 p-6 sm:p-8 rounded-2xl bg-slate-950 border border-emerald-500/50 shadow-2xl space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h3 className="text-base font-mono uppercase tracking-wider font-bold text-emerald-300">
                  Review Deliverables &amp; Infrastructure Handover
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Deadline Countdown Halted. Inspect the attached container exports, endpoints, and summary message below.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold">
                Status: DELIVERED
              </span>
            </div>
          </div>

          {/* Admin Summary Message */}
          {order.deliverySummary && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-indigo-400 font-bold uppercase tracking-wider">
                  Lead Architect Delivery Statement:
                </span>
                <span className="text-slate-500">Adesh Chandra</span>
              </div>
              <p className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                {order.deliverySummary}
              </p>
            </div>
          )}

          {/* Attached Artifacts & URLs */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300">
              Attached Artifacts &amp; Access URLs ({(order.deliverables || []).length})
            </h4>

            {(order.deliverables || []).length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/50 border border-dashed border-slate-800 text-xs font-mono text-slate-500 text-center">
                No individual files attached. Refer to delivery statement.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {order.deliverables!.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold font-mono text-white truncate">{item.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 uppercase">
                          {item.type || 'Artifact'}
                        </span>
                      </div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-indigo-400 hover:underline truncate block"
                      >
                        {item.url}
                      </a>
                      {item.notes && <p className="text-[11px] font-mono text-slate-400">{item.notes}</p>}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800 justify-end">
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(item.url, idx)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
                      >
                        {copiedIndex === idx ? '✓ Copied' : 'Copy URL'}
                      </button>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-medium transition-colors"
                      >
                        Open Link ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TWO PRIMARY ACTIONS: REQUEST REVISION & APPROVE AND COMPLETE */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              id="btn-client-open-revision"
              onClick={() => setIsReviewModalOpen(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-amber-800/60 text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🔄 Request Revision</span>
            </button>

            <button
              type="button"
              id="btn-client-open-approve"
              onClick={() => setIsReviewModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs shadow-xl shadow-emerald-950/60 border border-emerald-400/40 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <span>✓ Review &amp; Approve Handover</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        /* LIVE COUNTDOWN TIMER COMPONENT (WHEN ACTIVE) */
        <div
          id="active-project-countdown-section"
          className="my-8 p-6 sm:p-8 rounded-2xl bg-slate-950/80 border border-indigo-500/30 shadow-inner"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-indigo-300">
                  Guaranteed Delivery SLA Countdown
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Handover Deadline: <strong className="text-white">{formatDeadlineDate(order.deadlineDate)}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Sprint Progress:</span>
              <span className="text-xs font-mono font-bold text-indigo-300">{progressPct}%</span>
            </div>
          </div>

          {timeLeft.isExpired ? (
            /* Expired / Final Handover Phase */
            <div className="p-6 rounded-xl bg-indigo-950/40 border border-indigo-700/60 text-center space-y-2">
              <div className="inline-flex items-center gap-2 text-indigo-300 font-mono font-bold text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>FINAL VALIDATION &amp; HANDOVER IN PROGRESS</span>
              </div>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Sprint timeline has completed. The engineering team is performing final DNS and EMQ diagnostic checks prior to client container transfer.
              </p>
            </div>
          ) : (
            /* Live Countdown Clocks */
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
              {/* Days */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center shadow-lg">
                <span className="block text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="block text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400 mt-1">
                  Days
                </span>
              </div>

              {/* Hours */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center shadow-lg">
                <span className="block text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="block text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400 mt-1">
                  Hours
                </span>
              </div>

              {/* Minutes */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center shadow-lg">
                <span className="block text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="block text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400 mt-1">
                  Minutes
                </span>
              </div>

              {/* Seconds (Active Ticking) */}
              <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-800/80 text-center shadow-lg ring-1 ring-indigo-500/30">
                <span className="block text-3xl sm:text-4xl font-extrabold font-mono text-indigo-300 tracking-tight">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="block text-[10px] sm:text-xs font-mono uppercase tracking-wider text-indigo-400 mt-1">
                  Seconds
                </span>
              </div>
            </div>
          )}

          {/* Visual Progress Bar */}
          <div className="mt-6 space-y-1.5">
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Sprint Kickoff</span>
              <span>Current Stage: Phase {progressPct < 50 ? '1-2' : progressPct < 85 ? '3' : '4'}</span>
              <span>Production Handover</span>
            </div>
          </div>
        </div>
      )}

      {/* ARCHITECTURAL DELIVERABLES TIMELINE */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-slate-300">
            Architectural Delivery Timeline
          </h3>
          <span className="text-xs font-mono text-emerald-400">Fixed-Scope SLA Guaranteed</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {phases.map((phase) => (
            <div
              key={phase.step}
              className={`p-4 rounded-2xl border transition-all ${
                phase.completed
                  ? 'bg-slate-950/80 border-emerald-800/60 text-slate-200'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-mono text-xs font-bold ${
                    phase.completed
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {phase.completed ? (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    phase.step
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white tracking-tight">{phase.title}</h4>
                    {phase.completed ? (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        In Progress / Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-500 border border-slate-800">
                        Queued
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{phase.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scope Details & Technical Spec Summary */}
      {order.projectDetails && (
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 mb-6 text-xs font-mono space-y-1">
          <span className="text-[10px] uppercase text-slate-500 font-semibold block">Client Specifications:</span>
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{order.projectDetails}</p>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Direct Access to Lead Architect Adesh Chandra</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`${WHATSAPP_DIRECT_URL}?text=Hi%20Adesh,%20I%20am%20checking%20in%20on%20my%20order%20${encodeURIComponent(order.serviceTitle)}%20(Order%20%23${order.id.slice(-6)}).`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs font-mono shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all"
          >
            <span>💬 WhatsApp Architect Triage</span>
          </a>

          <a
            href={ARCHITECT_EMAIL}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs font-mono border border-slate-700 flex items-center gap-2 transition-all"
          >
            <span>Email Technical Desk</span>
          </a>
        </div>
      </div>

      {/* Review Deliverables Full Modal */}
      {isReviewModalOpen && (
        <ReviewDeliverablesModal
          order={order}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onStatusUpdated={(updated) => {
            if (onStatusUpdated) onStatusUpdated(updated);
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
};

