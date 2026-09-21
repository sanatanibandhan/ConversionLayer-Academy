import React, { useState } from 'react';
import { doc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, OrderStatus } from '../../data/syncOpsData';
import {
  generateWhatsAppRevisionNotificationUrl,
  generateWhatsAppCompletedNotificationUrl
} from '../../services/notificationService';

export interface ReviewDeliverablesModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: (updatedOrder: Order) => void;
}

export const ReviewDeliverablesModal: React.FC<ReviewDeliverablesModalProps> = ({
  order,
  isOpen,
  onClose,
  onStatusUpdated
}) => {
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopyUrl = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // 1. Request Revision (Reverts status to 'ACTIVE')
  const handleRequestRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionNotes.trim()) {
      setError('Please describe the specific adjustments or missing telemetry requirements.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const orderRef = doc(db, 'orders', order.id);
      const updateData = {
        status: 'ACTIVE' as OrderStatus,
        revisionNotes: revisionNotes.trim(),
        revisionCount: (order.revisionCount || 0) + 1,
        updatedAt: serverTimestamp()
      };

      await updateDoc(orderRef, updateData);

      const updatedOrder: Order = {
        ...order,
        status: 'ACTIVE',
        revisionNotes: revisionNotes.trim(),
        revisionCount: (order.revisionCount || 0) + 1,
        updatedAt: new Date().toISOString()
      };

      // Generate WhatsApp link for instant architect alert
      const waUrl = generateWhatsAppRevisionNotificationUrl(updatedOrder, revisionNotes.trim());

      onStatusUpdated(updatedOrder);
      onClose();

      // Open WhatsApp notification in new tab
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } catch (err: unknown) {
      console.error('Error requesting revision:', err);
      setError('Failed to submit revision request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Approve & Complete (Changes status to 'COMPLETED')
  const handleApproveAndComplete = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const orderRef = doc(db, 'orders', order.id);
      const updateData = {
        status: 'COMPLETED' as OrderStatus,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(orderRef, updateData);

      const updatedOrder: Order = {
        ...order,
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Generate WhatsApp notification link
      const waUrl = generateWhatsAppCompletedNotificationUrl(updatedOrder);

      onStatusUpdated(updatedOrder);
      onClose();

      // Optional architect alert
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } catch (err: unknown) {
      console.error('Error approving order:', err);
      setError('Failed to approve delivery. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const deliverables = order.deliverables || [];

  return (
    <div
      id="review-deliverables-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="review-deliverables-modal"
        className="w-full max-w-3xl bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/40 relative my-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Stage 4: Client Review &amp; Handover
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Review Final Architecture Deliverables
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Project: <span className="text-slate-200 font-semibold">{order.serviceTitle}</span> (Order ID: #{order.id.slice(-6)})
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-xs font-mono text-rose-300">
            {error}
          </div>
        )}

        {/* Lead Architect Delivery Summary */}
        <div className="mt-6 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-indigo-400 font-bold uppercase tracking-wider">
              Lead Architect Summary &amp; Verification
            </span>
            <span className="text-[10px] text-slate-500">Adesh Chandra, Principal Telemetry Architect</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
            {order.deliverySummary ||
              'All telemetry components have been provisioned and verified in your production environment.'}
          </p>
        </div>

        {/* Deliverable Artifacts List */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300">
              Attached Artifacts &amp; Access URLs ({deliverables.length})
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Click to inspect or copy</span>
          </div>

          {deliverables.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs font-mono text-slate-500">
              No artifact links were attached to this delivery record.
            </div>
          ) : (
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {deliverables.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono truncate">{item.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 uppercase">
                        {item.type || 'Artifact'}
                      </span>
                    </div>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-indigo-400 hover:text-indigo-300 truncate block hover:underline"
                    >
                      {item.url}
                    </a>

                    {item.notes && (
                      <p className="text-[11px] text-slate-400 font-mono">{item.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(item.url, idx)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <span className="text-emerald-400">✓ Copied</span>
                        </>
                      ) : (
                        <>
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <span>Open Link ↗</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revision Request Form Toggle */}
        {showRevisionForm ? (
          <form onSubmit={handleRequestRevision} className="mt-6 p-5 rounded-2xl bg-amber-950/20 border border-amber-800/60 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-300 uppercase">
                Submit Revision Request
              </span>
              <button
                type="button"
                onClick={() => setShowRevisionForm(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Please specify the modifications or additional parameter mappings needed. Submitting this form will revert the project to{' '}
              <strong className="text-white">ACTIVE</strong> status and alert the lead architect directly.
            </p>

            <textarea
              required
              rows={3}
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="e.g. Please verify the value parameter on the AddToCart event in TikTok Events API..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-amber-800/60 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-amber-500"
            />

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono font-bold transition-all disabled:opacity-50"
              >
                {isProcessing ? 'Submitting...' : 'Revert to ACTIVE & Notify Architect'}
              </button>
            </div>
          </form>
        ) : (
          /* Decision Action Bar */
          <div className="mt-8 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => setShowRevisionForm(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-800/40 text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2"
            >
              <span>🔄 Request Revision</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                disabled={isProcessing}
                onClick={onClose}
                className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-mono transition-colors"
              >
                Close
              </button>

              <button
                type="button"
                id="btn-client-approve-complete"
                disabled={isProcessing}
                onClick={handleApproveAndComplete}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs shadow-xl shadow-emerald-950/60 border border-emerald-400/40 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Sign-Off...</span>
                  </>
                ) : (
                  <>
                    <span>✓ Approve &amp; Complete Project</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
