import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, DeliverableItem } from '../../data/syncOpsData';

export interface OrderHistoryViewProps {
  clientEmailFilter?: string; // If provided, limits to specific client (Client Dashboard)
  clientEmail?: string;
  isAdmin?: boolean;
  onReorder?: () => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  clientEmailFilter,
  clientEmail,
  isAdmin = false,
  onReorder
}) => {
  const effectiveEmail = clientEmailFilter || clientEmail;
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const fetchCompletedOrders = async () => {
    setLoading(true);
    try {
      const ordersCol = collection(db, 'orders');
      let orderList: Order[] = [];

      try {
        let q = query(ordersCol, where('status', '==', 'COMPLETED'));
        if (effectiveEmail) {
          q = query(
            ordersCol,
            where('status', '==', 'COMPLETED'),
            where('clientEmail', '==', effectiveEmail.trim().toLowerCase())
          );
        }
        const snap = await getDocs(q);
        snap.forEach((docSnap) => {
          orderList.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Order, 'id'>)
          });
        });
      } catch (qErr) {
        console.warn('Composite index fallback for completed orders:', qErr);
        const snap = await getDocs(ordersCol);
        snap.forEach((docSnap) => {
          const data = docSnap.data() as Omit<Order, 'id'>;
          if (data.status === 'COMPLETED') {
            if (!effectiveEmail || data.clientEmail?.toLowerCase() === effectiveEmail.trim().toLowerCase()) {
              orderList.push({
                id: docSnap.id,
                ...data
              });
            }
          }
        });
      }

      // Sort newest completed first
      orderList.sort((a, b) => {
        const timeA = (a.completedAt as { seconds?: number })?.seconds || 0;
        const timeB = (b.completedAt as { seconds?: number })?.seconds || 0;
        return timeB - timeA;
      });

      setCompletedOrders(orderList);
    } catch (err) {
      console.error('Error fetching completed order archives:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedOrders();
  }, [effectiveEmail]);

  const handleCopyUrl = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(key);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filtered = completedOrders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.serviceTitle.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      (o.clientEmail && o.clientEmail.toLowerCase().includes(q)) ||
      (o.companyName && o.companyName.toLowerCase().includes(q))
    );
  });

  const formatTimestamp = (ts: unknown): string => {
    if (!ts) return 'Archived';
    try {
      if (typeof ts === 'object' && 'seconds' in (ts as { seconds: number })) {
        return new Date((ts as { seconds: number }).seconds * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
      return new Date(ts as string).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Archived';
    }
  };

  return (
    <div id="order-history-archive-container" className="space-y-6">
      {/* Top Banner / Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Permanent Completed Architecture Archive
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Immutable records of verified deployments, final container exports, and audited telemetry scopes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search archived orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 px-3.5 py-2 pl-9 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <svg
              className="w-4 h-4 text-slate-500 absolute left-3 top-2.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <button
            type="button"
            onClick={fetchCompletedOrders}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-mono"
            title="Refresh Archive"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Main Records List */}
      {loading ? (
        <div className="p-16 text-center space-y-4 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400">Loading Permanent Architecture Archives...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 sm:p-16 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h4 className="text-base font-bold text-white">No Completed Orders in Archive</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {clientEmailFilter
              ? `There are currently no completed projects archived for ${clientEmailFilter}. Once deliverables are signed off, they are permanently stored here.`
              : 'No orders have reached COMPLETED status in Firestore yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filtered.map((order) => {
            const deliverables = order.deliverables || [];
            return (
              <div
                key={order.id}
                id={`archive-order-card-${order.id}`}
                className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all shadow-xl space-y-6 relative overflow-hidden"
              >
                {/* Subtle verified seal banner */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-[11px] font-mono font-bold text-emerald-300">
                        <span>✓</span>
                        <span>VERIFIED ARCHIVE RECORD</span>
                      </span>

                      <span className="text-xs font-mono text-slate-400">Order ID: #{order.id.slice(-6)}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs font-mono text-indigo-400 font-semibold">{order.serviceCategory}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs font-mono text-slate-400">
                        Completed: {formatTimestamp(order.completedAt)}
                      </span>
                    </div>

                    <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {order.serviceTitle}
                    </h4>

                    {isAdmin && (
                      <p className="text-xs font-mono text-slate-400">
                        Client: <strong className="text-slate-200">{order.clientEmail}</strong>{' '}
                        {order.companyName && `(${order.companyName})`}
                      </p>
                    )}
                  </div>

                  {/* Financial & Certification Stamp */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-right">
                      <span className="block text-[10px] font-mono uppercase text-slate-500">Paid Escrow Value</span>
                      <span className="text-lg font-mono font-bold text-emerald-400">
                        {order.totalPrice || '$0'}
                      </span>
                      <span className="block text-[9px] font-mono text-emerald-500/80 uppercase">Settled In Full</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-800/60 text-right">
                      <span className="block text-[10px] font-mono uppercase text-emerald-400 font-bold">EMQ 8.5+</span>
                      <span className="text-xs font-mono text-slate-300">Handover Complete</span>
                    </div>
                  </div>
                </div>

                {/* Final Handover Summary */}
                {order.deliverySummary && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 block">
                      Lead Architect Handover Notes:
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                      {order.deliverySummary}
                    </p>
                  </div>
                )}

                {/* Permanent Deliverables Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300">
                      Permanent Deliverable Artifacts ({deliverables.length})
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      Forever accessible &amp; downloadable
                    </span>
                  </div>

                  {deliverables.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-xs font-mono text-slate-500">
                      No external artifacts were attached to this record.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {deliverables.map((item, idx) => {
                        const copyKey = `${order.id}-${idx}`;
                        return (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold font-mono text-white truncate">{item.title}</span>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 uppercase">
                                  {item.type || 'Artifact'}
                                </span>
                              </div>

                              <span className="text-xs font-mono text-indigo-400 truncate block">
                                {item.url}
                              </span>

                              {item.notes && (
                                <p className="text-[11px] font-mono text-slate-400">{item.notes}</p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-slate-900 justify-end">
                              <button
                                type="button"
                                onClick={() => handleCopyUrl(item.url, copyKey)}
                                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-800 transition-colors"
                              >
                                {copiedIndex === copyKey ? '✓ Copied' : 'Copy'}
                              </button>

                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-medium transition-colors"
                              >
                                Open ↗
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Original Scope Details & Technical Spec */}
                {order.projectDetails && (
                  <details className="group text-xs font-mono">
                    <summary className="cursor-pointer text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-2">
                      <span className="text-indigo-400">▶</span>
                      <span>View Original Client Intake Specifications &amp; Scope</span>
                    </summary>
                    <div className="mt-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {order.projectDetails}
                    </div>
                  </details>
                )}

                {/* Card Actions: Reorder & Direct WhatsApp */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-mono text-slate-500">
                    Handover Hash: {order.id.slice(0, 12)}...
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href="https://wa.me/8801608533529"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 transition-colors inline-flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Post-Launch Support</span>
                    </a>

                    {onReorder && (
                      <button
                        type="button"
                        onClick={onReorder}
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-medium shadow-md shadow-indigo-950/40 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Reorder / New Scope</span>
                        <span>→</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
