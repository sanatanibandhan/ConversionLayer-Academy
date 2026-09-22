import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, OrderStatus } from '../../data/syncOpsData';
import {
  generateWhatsAppActiveNotificationUrl,
  generateWhatsAppProposalReadyUrl,
  generateWhatsAppDeliveredNotificationUrl,
  formatDeadlineDate,
  triggerClientNotification
} from '../../services/notificationService';
import { SubmitDeliveryModal } from './SubmitDeliveryModal';
import { OrderHistoryView } from '../orders/OrderHistoryView';

export const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('PENDING_REVIEW');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Approval Modal State
  const [approvingOrder, setApprovingOrder] = useState<Order | null>(null);
  const [totalPrice, setTotalPrice] = useState('$3,500');
  const [paymentUrl, setPaymentUrl] = useState('https://buy.stripe.com/test_syncops_escrow');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [proposalNotes, setProposalNotes] = useState('');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);

  // Final Delivery Submission Modal State
  const [deliveringOrder, setDeliveringOrder] = useState<Order | null>(null);

  // Action Loading States
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  // Fetch orders from Firestore
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const ordersCol = collection(db, 'orders');
      const snapshot = await getDocs(ordersCol);
      const fetched: Order[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const durDays = Number(data.timeline?.durationDays || data.durationDays) || 7;
        const totPrice = data.pricing?.total 
          ? `$${data.pricing.total.toLocaleString()}` 
          : (data.totalPrice || '$0');
        const payUrl = data.pricing?.paymentUrl || data.paymentUrl;
        const startAt = data.timeline?.startDate || data.startedAt;
        const deadDate = data.timeline?.deadlineDate || data.deadlineDate;
        const projDetails = data.requirements?.projectDetails || data.projectDetails || 'No technical details provided.';
        const targetPlatforms = data.requirements?.targetPlatforms || data.targetPlatforms || [];
        const webUrl = data.requirements?.websiteUrl || data.websiteUrl;

        return {
          id: docSnap.id,
          clientEmail: data.clientEmail || 'unknown@client.com',
          clientUid: data.clientUid,
          clientName: data.clientName,
          companyName: data.companyName,
          websiteUrl: webUrl,
          whatsappNumber: data.whatsappNumber,
          serviceId: data.serviceId,
          serviceTitle: data.serviceTitle || 'Enterprise Architecture Scope',
          serviceCategory: data.serviceCategory || 'Data & Measurement',
          projectDetails: projDetails,
          targetPlatforms,
          pricing: data.pricing || {
            total: parseFloat(String(totPrice).replace(/[^0-9.]/g, '')) || 0,
            currency: 'USD',
            paymentUrl: payUrl
          },
          timeline: data.timeline || {
            durationDays: durDays,
            startDate: startAt,
            deadlineDate: deadDate
          },
          requirements: data.requirements || {
            projectDetails: projDetails,
            websiteUrl: webUrl,
            targetPlatforms
          },
          status: (data.status as OrderStatus) || 'PENDING_REVIEW',
          totalPrice: totPrice,
          paymentUrl: payUrl,
          durationDays: durDays,
          proposalNotes: data.proposalNotes,
          approvedAt: data.approvedAt,
          startedAt: startAt,
          deadlineDate: deadDate,
          deliverables: data.deliverables,
          deliverySummary: data.deliverySummary,
          deliveredAt: data.deliveredAt,
          revisionNotes: data.revisionNotes,
          revisionCount: data.revisionCount,
          completedAt: data.completedAt,
          notificationSent: data.notificationSent,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
      });

      // Sort client-side: newest orders first
      fetched.sort((a, b) => {
        const timeA = (a.createdAt as { seconds?: number })?.seconds || 0;
        const timeB = (b.createdAt as { seconds?: number })?.seconds || 0;
        return timeB - timeA;
      });

      setOrders(fetched);
    } catch (err: unknown) {
      console.error('Error fetching orders from Firestore:', err);
      setFeedback({
        type: 'error',
        message: 'Could not load orders from Firestore. Please verify security rules.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'ALL') return true;
    return o.status === filterStatus;
  });

  // Count badges
  const pendingCount = orders.filter((o) => o.status === 'PENDING_REVIEW').length;
  const awaitingCount = orders.filter((o) => o.status === 'AWAITING_FUNDS').length;
  const activeCount = orders.filter((o) => o.status === 'ACTIVE').length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;

  // Open Approval Form for an order
  const handleOpenApprovalModal = (order: Order) => {
    setApprovingOrder(order);
    setTotalPrice(order.totalPrice || '$3,500');
    setPaymentUrl(order.paymentUrl || 'https://buy.stripe.com/test_syncops_escrow');
    setDurationDays(order.durationDays || 7);
    setProposalNotes(
      order.proposalNotes ||
        `Deployment includes first-party Cloud Run container, custom domain DNS handshake, and verified CAPI deduplication with 8.5+ Event Match Quality.`
    );
  };

  // Submit Approval: updates status to AWAITING_FUNDS
  const handleSubmitApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingOrder) return;

    if (!totalPrice.trim()) {
      setFeedback({ type: 'error', message: 'Total price is required.' });
      return;
    }
    if (!paymentUrl.trim()) {
      setFeedback({ type: 'error', message: 'Stripe or Payoneer payment link is required.' });
      return;
    }

    setIsSubmittingApproval(true);
    setFeedback(null);

    try {
      const orderRef = doc(db, 'orders', approvingOrder.id);
      const parsedTotal = parseFloat(totalPrice.replace(/[^0-9.]/g, '')) || 0;
      const updateData = {
        totalPrice: totalPrice.trim(),
        paymentUrl: paymentUrl.trim(),
        durationDays: Number(durationDays) || 7,
        proposalNotes: proposalNotes.trim(),
        pricing: {
          total: parsedTotal,
          currency: 'USD',
          paymentUrl: paymentUrl.trim()
        },
        timeline: {
          ...(approvingOrder.timeline || {}),
          durationDays: Number(durationDays) || 7
        },
        status: 'AWAITING_FUNDS' as OrderStatus,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(orderRef, updateData);

      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === approvingOrder.id
            ? {
                ...o,
                ...updateData
              }
            : o
        )
      );

      setFeedback({
        type: 'success',
        message: `Order #${approvingOrder.id.slice(-6)} approved. Status updated to AWAITING_FUNDS.`
      });

      setApprovingOrder(null);
    } catch (err: unknown) {
      console.error('Failed to approve order:', err);
      setFeedback({
        type: 'error',
        message: 'Could not approve order in Firestore. Please try again.'
      });
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  // Action: Verify Payment & Initialize Architecture (Starts Project)
  // Updates status to ACTIVE, calculates deadlineDate based on durationDays
  const handleStartProject = async (order: Order) => {
    setProcessingOrderId(order.id);
    setFeedback(null);

    const durationDays = order.timeline?.durationDays || order.durationDays || 7;
    const deadlineMs = Date.now() + durationDays * 24 * 60 * 60 * 1000;
    const deadlineDate = new Date(deadlineMs).toISOString();

    try {
      const orderRef = doc(db, 'orders', order.id);
      const updateData = {
        status: 'ACTIVE' as OrderStatus,
        startedAt: serverTimestamp(),
        deadlineDate,
        timeline: {
          ...(order.timeline || {}),
          durationDays,
          startDate: serverTimestamp(),
          deadlineDate
        },
        updatedAt: serverTimestamp()
      };

      await updateDoc(orderRef, updateData);

      // Trigger notification event
      const updatedOrder: Order = {
        ...order,
        status: 'ACTIVE',
        startedAt: new Date().toISOString(),
        deadlineDate,
        timeline: {
          ...(order.timeline || {}),
          durationDays,
          startDate: new Date().toISOString(),
          deadlineDate
        }
      };
      await triggerClientNotification(updatedOrder, 'ORDER_ACTIVATED');

      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? {
                ...o,
                ...updateData,
                status: 'ACTIVE',
                deadlineDate
              }
            : o
        )
      );

      setFeedback({
        type: 'success',
        message: `Project #${order.id.slice(-6)} started! Status is ACTIVE with deadline ${formatDeadlineDate(deadlineDate)}.`
      });
    } catch (err: unknown) {
      console.error('Failed to start project:', err);
      setFeedback({
        type: 'error',
        message: 'Could not start project in Firestore.'
      });
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Action: Mark Complete
  const handleMarkCompleted = async (order: Order) => {
    setProcessingOrderId(order.id);
    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: 'COMPLETED' as OrderStatus,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: 'COMPLETED' } : o))
      );

      setFeedback({
        type: 'success',
        message: `Order #${order.id.slice(-6)} marked as COMPLETED.`
      });
    } catch (err) {
      console.error('Failed to complete order:', err);
      setFeedback({
        type: 'error',
        message: 'Could not complete order in Firestore.'
      });
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Action: Delete order
  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to permanently remove this order?')) return;
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setFeedback({ type: 'success', message: 'Order deleted.' });
    } catch (err) {
      console.error('Failed to delete order:', err);
      setFeedback({ type: 'error', message: 'Could not delete order.' });
    }
  };

  // Seed sample demo order
  const handleSeedDemoOrder = async () => {
    try {
      const ordersCol = collection(db, 'orders');
      const demoOrder = {
        clientEmail: 'client@apexbrand.com',
        companyName: 'Apex Brand Direct',
        websiteUrl: 'https://apexbrand.com',
        whatsappNumber: '+1 415 555 2671',
        serviceId: 'omnichannel-server-capi',
        serviceTitle: 'Omnichannel Server-Side CAPI & Signal Gateway',
        serviceCategory: 'Data & Measurement',
        projectDetails: 'We are scaling Meta Ads spend past $40k/mo on Shopify. iOS 14.5 attribution drop-off is hurting our ROAS. We need Google Cloud Run server container and 100% deduplicated Meta CAPI & TikTok Events API.',
        urgency: 'Standard',
        status: 'PENDING_REVIEW' as OrderStatus,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(ordersCol, demoOrder);
      const newOrder: Order = {
        ...demoOrder,
        id: docRef.id
      };
      setOrders((prev) => [newOrder, ...prev]);
      setFeedback({
        type: 'success',
        message: 'Sample demo order created in PENDING_REVIEW status.'
      });
    } catch (e) {
      console.error('Failed to seed demo order:', e);
    }
  };

  return (
    <div id="admin-order-management" className="space-y-6">
      {/* Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-xl font-bold text-white tracking-tight">Order-to-Delivery Pipeline</h2>
          </div>
          <p className="text-xs text-slate-400">
            Native agency pipeline for architectural requests, scope approvals, milestone escrow, and automated start triggers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchOrders}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono font-medium transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>Refresh Orders</span>
          </button>

          {orders.length === 0 && !loading && (
            <button
              type="button"
              onClick={handleSeedDemoOrder}
              className="px-3.5 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-mono font-medium transition-colors flex items-center gap-1.5"
            >
              <span>+ Seed Sample Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-300'
              : 'bg-rose-950/40 border border-rose-800 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100 font-mono"
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* Pipeline Status Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-xl">
        <button
          type="button"
          onClick={() => setFilterStatus('PENDING_REVIEW')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
            filterStatus === 'PENDING_REVIEW'
              ? 'bg-yellow-500 text-slate-950 font-bold shadow-md shadow-yellow-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span>Pending Review</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-950/80 text-yellow-300 text-[10px]">
            {pendingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('AWAITING_FUNDS')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
            filterStatus === 'AWAITING_FUNDS'
              ? 'bg-yellow-500 text-slate-950 font-bold shadow-md shadow-yellow-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span>Awaiting Funds</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-950/80 text-yellow-300 text-[10px]">
            {awaitingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('ACTIVE')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
            filterStatus === 'ACTIVE'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span>Active Deployments</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-950/80 text-blue-300 text-[10px]">
            {activeCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('DELIVERED')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
            filterStatus === 'DELIVERED'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span>Delivered / In Review</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-950/80 text-purple-300 text-[10px]">
            {deliveredCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('COMPLETED')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
            filterStatus === 'COMPLETED'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span>Completed</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-950/80 text-emerald-300 text-[10px]">
            {completedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('ALL')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
            filterStatus === 'ALL'
              ? 'bg-slate-700 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span>All ({orders.length})</span>
        </button>
      </div>

      {/* Orders List / Table */}
      {filterStatus === 'COMPLETED' ? (
        <OrderHistoryView isAdmin={true} onReorder={fetchOrders} />
      ) : loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 mx-auto border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-400">Loading orders from Firestore...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800">
          <p className="text-sm font-medium text-slate-300">No orders found in status &quot;{filterStatus}&quot;.</p>
          <p className="text-xs text-slate-500 mt-1">
            New client requests submitted from the Enterprise Capabilities Matrix will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isPending = order.status === 'PENDING_REVIEW';
            const isAwaiting = order.status === 'AWAITING_FUNDS';
            const isActive = order.status === 'ACTIVE';
            const isDelivered = order.status === 'DELIVERED';
            const isCompleted = order.status === 'COMPLETED';

            return (
              <div
                key={order.id}
                id={`admin-order-card-${order.id}`}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {/* Status Badge */}
                      <span
                        className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          isPending
                            ? 'bg-yellow-950/80 text-yellow-300 border border-yellow-700/80'
                            : isAwaiting
                            ? 'bg-yellow-950/80 text-yellow-300 border border-yellow-700/80'
                            : isActive
                            ? 'bg-blue-950/80 text-blue-300 border border-blue-700/80'
                            : isDelivered
                            ? 'bg-purple-950/80 text-purple-300 border border-purple-700/80'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/80'
                        }`}
                      >
                        {order.status}
                      </span>

                      <span className="text-xs font-mono text-slate-500">ID: #{order.id.slice(-6)}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs font-mono text-slate-400">{order.serviceCategory}</span>
                    </div>

                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {order.serviceTitle}
                    </h3>
                  </div>

                  {/* Financial & Timeline Metrics */}
                  <div className="flex items-center gap-3">
                    {order.totalPrice && (
                      <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-right">
                        <span className="block text-[10px] font-mono uppercase text-slate-500">Scope Value</span>
                        <span className="text-sm font-mono font-bold text-emerald-400">{order.totalPrice}</span>
                      </div>
                    )}

                    {order.durationDays && (
                      <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-right">
                        <span className="block text-[10px] font-mono uppercase text-slate-500">Sprint SLA</span>
                        <span className="text-sm font-mono font-semibold text-slate-300">{order.durationDays} Days</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Client & Technical Specifications */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs font-mono">
                  <div>
                    <span className="block text-slate-500 text-[10px] uppercase">Client Email</span>
                    <span className="text-indigo-300 font-semibold">{order.clientEmail}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-[10px] uppercase">Company / Domain</span>
                    <span className="text-slate-200">
                      {order.companyName || 'N/A'} {order.websiteUrl && `(${order.websiteUrl})`}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-[10px] uppercase">WhatsApp Contact</span>
                    <span className="text-slate-300">{order.whatsappNumber || 'Not provided'}</span>
                  </div>
                </div>

                {/* Scope Requirements */}
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
                  <span className="block text-[11px] font-mono font-semibold text-slate-400 mb-1">
                    Technical Specifications &amp; Client Objectives:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {order.projectDetails}
                  </p>
                </div>

                {/* Revision Notes Alert (if client requested adjustment) */}
                {order.revisionNotes && (
                  <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs font-mono text-amber-200 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span className="font-bold text-amber-400 uppercase">
                        Client Revision Request #{order.revisionCount || 1}
                      </span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{order.revisionNotes}</p>
                  </div>
                )}

                {/* Delivered Work Banner */}
                {isDelivered && (
                  <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/60 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-purple-300 font-mono">
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                        <span className="font-semibold">Work Delivered to Client • Awaiting Client Sign-Off</span>
                      </div>

                      <a
                        href={generateWhatsAppDeliveredNotificationUrl(order, order.whatsappNumber)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
                      >
                        <span>💬 WhatsApp Delivery Alert</span>
                      </a>
                    </div>

                    {order.deliverySummary && (
                      <div className="text-xs font-mono text-slate-300 bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
                        <span className="text-purple-400 font-semibold block mb-1">Delivery Handover Statement:</span>
                        {order.deliverySummary}
                      </div>
                    )}

                    {order.deliverables && order.deliverables.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">
                          Attached Deliverable Links ({order.deliverables.length}):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {order.deliverables.map((item, idx) => (
                            <a
                              key={idx}
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-800 hover:border-purple-500/50 transition-colors flex items-center gap-1.5"
                            >
                              <span>📎 {item.title}</span>
                              <span className="text-purple-400">↗</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Active Deadline Banner */}
                {isActive && order.deadlineDate && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="font-mono font-semibold">Active Execution Deadline:</span>
                      <span className="text-white font-bold">{formatDeadlineDate(order.deadlineDate)}</span>
                    </div>

                    <a
                      href={generateWhatsAppActiveNotificationUrl(order, order.whatsappNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
                    >
                      <span>💬 WhatsApp Client Alert</span>
                    </a>
                  </div>
                )}

                {/* Proposal Notes (if Awaiting Funds) */}
                {isAwaiting && (
                  <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono text-indigo-300 font-semibold">
                        Proposal Approved &amp; Escrow Link Active:
                      </span>
                      <p className="text-slate-300 text-xs">{order.proposalNotes}</p>
                    </div>

                    <a
                      href={generateWhatsAppProposalReadyUrl(order, order.whatsappNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 text-xs font-mono flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <span>💬 Send Proposal Link</span>
                    </a>
                  </div>
                )}

                {/* Completed Handover Summary */}
                {isCompleted && (
                  <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-800/50 space-y-2 text-xs font-mono">
                    <div className="flex items-center gap-2 text-teal-300 font-bold">
                      <span>✓ Permanent Handover Certified</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">Order Completed &amp; Archived</span>
                    </div>
                    {order.deliverables && order.deliverables.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {order.deliverables.map((item, idx) => (
                          <a
                            key={idx}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded bg-slate-950 text-teal-300 text-[11px] border border-slate-800 hover:border-teal-500/50 transition-colors"
                          >
                            <span>📎 {item.title} ↗</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ACTION BUTTONS TOOLBAR */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500">Pipeline Actions:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* ACTION 1: APPROVE PROPOSAL (Available for PENDING_REVIEW or editing AWAITING_FUNDS) */}
                    {(isPending || isAwaiting) && (
                      <button
                        type="button"
                        id={`btn-approve-order-${order.id}`}
                        onClick={() => handleOpenApprovalModal(order)}
                        className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{isPending ? 'Approve & Create Proposal' : 'Edit Scope & Price'}</span>
                      </button>
                    )}

                    {/* ACTION 2: START PROJECT (Available once AWAITING_FUNDS) */}
                    {isAwaiting && (
                      <button
                        type="button"
                        id={`btn-start-project-${order.id}`}
                        disabled={processingOrderId === order.id}
                        onClick={() => handleStartProject(order)}
                        className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {processingOrderId === order.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        )}
                        <span>Verify Payment &amp; Initialize Architecture</span>
                      </button>
                    )}

                    {/* ACTION 3: SUBMIT FINAL DELIVERY (Available when ACTIVE or DELIVERED) */}
                    {(isActive || isDelivered) && (
                      <button
                        type="button"
                        id={`btn-submit-delivery-${order.id}`}
                        onClick={() => setDeliveringOrder(order)}
                        className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                          <line x1="12" y1="22.08" x2="12" y2="12" />
                        </svg>
                        <span>{isDelivered ? 'Edit Deliverables' : '📦 Submit Final Delivery'}</span>
                      </button>
                    )}

                    {/* ACTION 4: MARK COMPLETED (Available when ACTIVE or DELIVERED) */}
                    {(isActive || isDelivered) && (
                      <button
                        type="button"
                        id={`btn-complete-project-${order.id}`}
                        disabled={processingOrderId === order.id}
                        onClick={() => handleMarkCompleted(order)}
                        className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <span>Force Sign-Off / Complete</span>
                      </button>
                    )}

                    {/* ACTION 5: DELETE */}
                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(order.id)}
                      className="px-3 py-2 rounded-xl text-xs font-mono text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Delete Order"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* APPROVAL PROPOSAL MODAL */}
      {approvingOrder && (
        <div
          id="admin-approval-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 text-left">
            <button
              type="button"
              onClick={() => setApprovingOrder(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            <div className="mb-6">
              <span className="text-[11px] font-mono text-indigo-400 font-semibold uppercase">
                Order Pipeline Approval
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                Approve Scope: {approvingOrder.serviceTitle}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Set the project price, checkout escrow URL, and delivery duration. Submitting will update the order status to <strong className="text-white">AWAITING_FUNDS</strong>.
              </p>
            </div>

            <form onSubmit={handleSubmitApproval} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Total Price */}
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-slate-300 mb-1.5">
                    Total Price ($) *
                  </label>
                  <input
                    type="text"
                    required
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(e.target.value)}
                    placeholder="e.g. $3,500"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* Project Duration (in days) */}
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-slate-300 mb-1.5">
                    Project Duration (Days) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Payment Link (Stripe/Payoneer URL) */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-slate-300 mb-1.5">
                  Payment Link (Stripe / Payoneer URL) *
                </label>
                <input
                  type="url"
                  required
                  value={paymentUrl}
                  onChange={(e) => setPaymentUrl(e.target.value)}
                  placeholder="https://buy.stripe.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                />
                <span className="block text-[11px] text-slate-500 mt-1">
                  The client will see this direct checkout link inside their Client Workspace alert.
                </span>
              </div>

              {/* Proposal Notes / Deliverables breakdown */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-slate-300 mb-1.5">
                  Proposal Notes / Scope Specification
                </label>
                <textarea
                  rows={3}
                  value={proposalNotes}
                  onChange={(e) => setProposalNotes(e.target.value)}
                  placeholder="Specific architectural notes, Cloud Run provisioning scope, deduplication SLAs..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Notice */}
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/50 text-[11px] font-mono text-indigo-300">
                <span>Transition rule: Status moves to <strong>AWAITING_FUNDS</strong>. Once the client funds the escrow, use &quot;Start Project&quot; to calculate the deadline and trigger the live countdown.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setApprovingOrder(null)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApproval}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingApproval ? 'Updating Status...' : 'Approve & Set Awaiting Funds'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FINAL DELIVERY SUBMISSION MODAL */}
      {deliveringOrder && (
        <SubmitDeliveryModal
          order={deliveringOrder}
          isOpen={Boolean(deliveringOrder)}
          onClose={() => setDeliveringOrder(null)}
          onSuccess={(updatedOrder) => {
            setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
            setFeedback({
              type: 'success',
              message: `Final delivery submitted for "${updatedOrder.serviceTitle}". Status is now DELIVERED and ready for client sign-off.`
            });
            setDeliveringOrder(null);
          }}
        />
      )}
    </div>
  );
};
