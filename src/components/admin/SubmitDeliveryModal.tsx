import React, { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, DeliverableItem, OrderStatus } from '../../data/syncOpsData';
import { generateWhatsAppDeliveredNotificationUrl } from '../../services/notificationService';

export interface SubmitDeliveryModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedOrder: Order) => void;
}

export const SubmitDeliveryModal: React.FC<SubmitDeliveryModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [deliverySummary, setDeliverySummary] = useState(
    order.deliverySummary ||
      `All server-side tracking pipelines have been deployed to Google Cloud Run and validated. 100% deduplicated Meta CAPI & TikTok Events API active with Event Match Quality 8.5+.`
  );

  const [deliverables, setDeliverables] = useState<DeliverableItem[]>(
    order.deliverables && order.deliverables.length > 0
      ? order.deliverables
      : [
          {
            title: 'Server GTM Container JSON Export',
            url: 'https://storage.googleapis.com/syncops-exports/gtm-server-container.json',
            type: 'gtm_export',
            notes: 'Import into Google Tag Manager server container workspace.'
          },
          {
            title: 'Cloud Run & Custom Domain DNS Telemetry Map',
            url: `https://data.${order.websiteUrl ? order.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'brand.com'}/healthz`,
            type: 'cloud_run',
            notes: 'Live HTTPS first-party subdomain endpoint.'
          },
          {
            title: 'Client Technical Handover & Verification Documentation',
            url: 'https://docs.syncops.studio/handover/capi-architecture',
            type: 'docs',
            notes: 'Step-by-step SOP for client engineering and marketing team.'
          }
        ]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddDeliverable = () => {
    setDeliverables([
      ...deliverables,
      {
        title: '',
        url: '',
        type: 'other',
        notes: ''
      }
    ]);
  };

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const handleDeliverableChange = (
    index: number,
    field: keyof DeliverableItem,
    value: string
  ) => {
    const updated = [...deliverables];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setDeliverables(updated);
  };

  const handlePresetAdd = (presetType: 'github' | 'looker') => {
    if (presetType === 'github') {
      setDeliverables([
        ...deliverables,
        {
          title: 'GitHub Infrastructure Repository',
          url: 'https://github.com/syncops-studio/capi-infrastructure-client',
          type: 'github',
          notes: 'Terraform and Cloud Run Docker configuration.'
        }
      ]);
    } else {
      setDeliverables([
        ...deliverables,
        {
          title: 'Looker Studio EMQ & Deduplication Dashboard',
          url: 'https://lookerstudio.google.com/reporting/syncops-telemetry-audit',
          type: 'looker',
          notes: 'Real-time Event Match Quality score monitoring.'
        }
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverySummary.trim()) {
      setError('Please provide a delivery summary message for the client.');
      return;
    }

    const validDeliverables = deliverables.filter((d) => (d.title?.trim() || d.label?.trim()) && d.url.trim());
    if (validDeliverables.length === 0) {
      setError('Please provide at least one valid deliverable with title and URL.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const normalizedDeliverables = validDeliverables.map((d) => ({
        label: d.label || d.title,
        title: d.title || d.label,
        url: d.url.trim(),
        type: d.type || 'other',
        notes: d.notes || '',
        submittedAt: serverTimestamp()
      }));

      const orderRef = doc(db, 'orders', order.id);
      const updateData = {
        status: 'DELIVERED' as OrderStatus,
        deliverySummary: deliverySummary.trim(),
        deliverables: normalizedDeliverables,
        deliveredAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(orderRef, updateData);

      const updatedOrder: Order = {
        ...order,
        status: 'DELIVERED',
        deliverySummary: deliverySummary.trim(),
        deliverables: normalizedDeliverables as DeliverableItem[],
        deliveredAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      onSuccess(updatedOrder);
      onClose();
    } catch (err: unknown) {
      console.error('Error submitting delivery:', err);
      setError('Failed to submit final delivery to Firestore. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="submit-delivery-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="submit-delivery-modal"
        className="w-full max-w-2xl bg-slate-900 border border-indigo-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/80 relative my-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold">
                Stage 4: Final Handover
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Submit Final Architecture Delivery
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Order: <span className="text-slate-200 font-semibold">{order.serviceTitle}</span> (Client: {order.clientEmail})
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

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Summary Message */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-semibold text-slate-300">
              Delivery Summary &amp; Verification Message <span className="text-indigo-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={deliverySummary}
              onChange={(e) => setDeliverySummary(e.target.value)}
              placeholder="Detail the completed deployments, EMQ scores, and container access..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <span className="text-[10px] text-slate-500 block">
              This summary message will be displayed prominently in the client's Review Deliverables screen.
            </span>
          </div>

          {/* Attached Deliverable Links */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono font-semibold text-slate-300">
                Attached Deliverables &amp; Artifact Links (GTM JSON, Repos, URLs)
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePresetAdd('github')}
                  className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  + Add GitHub
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetAdd('looker')}
                  className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  + Add Looker
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {deliverables.map((item, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 relative group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold">
                      Artifact #{index + 1}
                    </span>
                    {deliverables.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(index)}
                        className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                        title="Remove deliverable"
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Deliverable Title (e.g. Server GTM Container JSON)"
                      value={item.title}
                      onChange={(e) => handleDeliverableChange(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />

                    <input
                      type="url"
                      required
                      placeholder="Direct URL (https://...)"
                      value={item.url}
                      onChange={(e) => handleDeliverableChange(index, 'url', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Optional notes or instructions for client..."
                    value={item.notes || ''}
                    onChange={(e) => handleDeliverableChange(index, 'notes', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddDeliverable}
              className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500/60 text-xs font-mono text-slate-400 hover:text-indigo-300 transition-all flex items-center justify-center gap-2"
            >
              <span>+ Add Another Deliverable Link</span>
            </button>
          </div>

          {/* Impact Notice */}
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-[11px] font-mono text-indigo-300 leading-relaxed">
            <span className="font-bold">Lifecycle State Transition:</span> Submitting this delivery will transition the status to{' '}
            <strong className="text-white">DELIVERED</strong>, freeze the active deadline countdown timer, and prompt the client to review deliverables and sign off or request revisions.
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-mono font-bold shadow-lg shadow-indigo-950/50 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Deliverables...</span>
                </>
              ) : (
                <>
                  <span>🚀 Finalize Delivery &amp; Notify Client</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
