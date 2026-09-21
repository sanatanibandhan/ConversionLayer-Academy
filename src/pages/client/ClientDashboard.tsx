import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { ClientProject, Order, WHATSAPP_DIRECT_URL, ARCHITECT_EMAIL } from '../../data/syncOpsData';
import { ActiveProject } from '../../components/client/ActiveProject';
import { OrderHistoryView } from '../../components/orders/OrderHistoryView';

export const ClientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');
  const [isSeedingDemo, setIsSeedingDemo] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchClientProjects = async () => {
      if (!user?.email) return;

      setLoading(true);
      const userEmailNormalized = user.email.trim().toLowerCase();

      try {
        // Query projects by clientEmail
        const projectsRef = collection(db, 'projects');
        let projectList: ClientProject[] = [];

        try {
          const q = query(projectsRef, where('clientEmail', '==', userEmailNormalized));
          const querySnapshot = await getDocs(q);
          
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            projectList.push({
              id: docSnap.id,
              name: data.name || 'Unnamed Architecture Project',
              clientEmail: data.clientEmail || userEmailNormalized,
              totalValue: data.totalValue || '$0',
              status: data.status || 'ACTIVE',
              milestones: Array.isArray(data.milestones) ? data.milestones : [],
              description: data.description || '',
              createdAt: data.createdAt,
              updatedAt: data.updatedAt
            });
          });
        } catch (queryErr) {
          console.warn('Firestore query error (attempting full collection fallback):', queryErr);
          // Fallback: fetch all and filter client-side if compound index/permissions require
          const allSnap = await getDocs(projectsRef);
          allSnap.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.clientEmail?.trim().toLowerCase() === userEmailNormalized) {
              projectList.push({
                id: docSnap.id,
                name: data.name || 'Unnamed Architecture Project',
                clientEmail: data.clientEmail || userEmailNormalized,
                totalValue: data.totalValue || '$0',
                status: data.status || 'ACTIVE',
                milestones: Array.isArray(data.milestones) ? data.milestones : [],
                description: data.description || '',
                createdAt: data.createdAt,
                updatedAt: data.updatedAt
              });
            }
          });
        }

        setProjects(projectList);

        // Also fetch orders for this client
        try {
          const ordersRef = collection(db, 'orders');
          let orderList: Order[] = [];
          try {
            const orderQ = query(ordersRef, where('clientEmail', '==', userEmailNormalized));
            const orderSnap = await getDocs(orderQ);
            orderSnap.forEach((docSnap) => {
              const d = docSnap.data();
              orderList.push({
                id: docSnap.id,
                clientEmail: d.clientEmail || userEmailNormalized,
                companyName: d.companyName,
                websiteUrl: d.websiteUrl,
                whatsappNumber: d.whatsappNumber,
                serviceId: d.serviceId,
                serviceTitle: d.serviceTitle || 'Enterprise Architecture Scope',
                serviceCategory: d.serviceCategory || 'Data & Measurement',
                projectDetails: d.projectDetails || '',
                status: d.status || 'PENDING_REVIEW',
                totalPrice: d.totalPrice,
                paymentUrl: d.paymentUrl,
                durationDays: Number(d.durationDays) || 7,
                proposalNotes: d.proposalNotes,
                approvedAt: d.approvedAt,
                startedAt: d.startedAt,
                deadlineDate: d.deadlineDate,
                deliverables: d.deliverables,
                deliverySummary: d.deliverySummary,
                deliveredAt: d.deliveredAt,
                revisionNotes: d.revisionNotes,
                revisionCount: d.revisionCount,
                completedAt: d.completedAt,
                createdAt: d.createdAt,
                updatedAt: d.updatedAt
              });
            });
          } catch (ordQueryErr) {
            console.warn('Orders query fallback to full fetch:', ordQueryErr);
            const allOrderSnap = await getDocs(ordersRef);
            allOrderSnap.forEach((docSnap) => {
              const d = docSnap.data();
              if (d.clientEmail?.trim().toLowerCase() === userEmailNormalized) {
                orderList.push({
                  id: docSnap.id,
                  clientEmail: d.clientEmail || userEmailNormalized,
                  companyName: d.companyName,
                  websiteUrl: d.websiteUrl,
                  whatsappNumber: d.whatsappNumber,
                  serviceId: d.serviceId,
                  serviceTitle: d.serviceTitle || 'Enterprise Architecture Scope',
                  serviceCategory: d.serviceCategory || 'Data & Measurement',
                  projectDetails: d.projectDetails || '',
                  status: d.status || 'PENDING_REVIEW',
                  totalPrice: d.totalPrice,
                  paymentUrl: d.paymentUrl,
                  durationDays: Number(d.durationDays) || 7,
                  proposalNotes: d.proposalNotes,
                  approvedAt: d.approvedAt,
                  startedAt: d.startedAt,
                  deadlineDate: d.deadlineDate,
                  deliverables: d.deliverables,
                  deliverySummary: d.deliverySummary,
                  deliveredAt: d.deliveredAt,
                  revisionNotes: d.revisionNotes,
                  revisionCount: d.revisionCount,
                  completedAt: d.completedAt,
                  createdAt: d.createdAt,
                  updatedAt: d.updatedAt
                });
              }
            });
          }
          setOrders(orderList);
        } catch (ordErr) {
          console.error('Error fetching client orders:', ordErr);
        }
      } catch (err) {
        console.error('Error fetching client projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientProjects();
  }, [user]);

  const handleSeedDemoProject = async () => {
    if (!user?.email) return;
    setIsSeedingDemo(true);
    setFeedback(null);

    const demoProject = {
      name: 'Omnichannel Server-Side CAPI & Stape Cloud Architecture',
      clientEmail: user.email.trim().toLowerCase(),
      totalValue: '$4,800',
      status: 'ACTIVE',
      description: 'End-to-end deployment of Google Cloud Run server container, Meta Conversions API with 100% deduplication, and TikTok Events API.',
      milestones: [
        {
          id: 'ms-1',
          title: 'Milestone 01: Cloud Run Container & Custom Domain Verification',
          amount: '$1,600',
          description: 'Provisioning of Google Cloud Run server cluster, DNS first-party subdomain mapping (data.brand.com), and SSL TLS handshakes.',
          status: 'PAID',
          paymentUrl: 'https://buy.stripe.com/test_demo_m1'
        },
        {
          id: 'ms-2',
          title: 'Milestone 02: Meta CAPI Deduplication & Event Match Quality 8.5+',
          amount: '$1,800',
          description: 'Server GTM tagging configuration, user data parameter hashing (SHA-256), and event_id matching across browser & server.',
          status: 'PENDING',
          paymentUrl: 'https://buy.stripe.com/test_demo_m2'
        },
        {
          id: 'ms-3',
          title: 'Milestone 03: TikTok Events API & Consent Mode v2 Audit',
          amount: '$1,400',
          description: 'Implementation of TikTok Server Gateway, Google Consent Mode v2 signal telemetry, and handoff documentation.',
          status: 'PENDING',
          paymentUrl: 'https://buy.stripe.com/test_demo_m3'
        }
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, 'projects'), demoProject);
      const newProj: ClientProject = {
        id: docRef.id,
        ...demoProject,
        status: 'ACTIVE',
        milestones: demoProject.milestones as ClientProject['milestones']
      };
      setProjects((prev) => [newProj, ...prev]);
      setFeedback({
        type: 'success',
        message: 'Sample architecture deployment successfully initialized in Firestore for your account.'
      });
    } catch (err) {
      console.error('Error seeding demo project:', err);
      // Local fallback
      const localProj: ClientProject = {
        id: `demo-${Date.now()}`,
        ...demoProject,
        status: 'ACTIVE',
        milestones: demoProject.milestones as ClientProject['milestones']
      };
      setProjects((prev) => [localProj, ...prev]);
      setFeedback({
        type: 'success',
        message: 'Sample architecture deployment loaded in preview session.'
      });
    } finally {
      setIsSeedingDemo(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const activeProjects = projects.filter((p) => p.status === 'ACTIVE');
  const completedProjects = projects.filter((p) => p.status === 'COMPLETED');
  const displayedProjects = activeTab === 'ACTIVE' ? activeProjects : completedProjects;

  const awaitingFundsOrders = orders.filter((o) => o.status === 'AWAITING_FUNDS');
  const activeOrders = orders.filter((o) => o.status === 'ACTIVE' || o.status === 'DELIVERED');
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED');
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const pendingOrders = orders.filter((o) => o.status === 'PENDING_REVIEW');

  return (
    <div
      id="client-dashboard-page"
      className="min-h-screen bg-slate-950 text-slate-200 antialiased flex flex-col selection:bg-indigo-500 selection:text-white"
    >
      {/* Top Client Bar */}
      <header
        id="client-dashboard-header"
        className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-700/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:border-indigo-400 transition-colors shadow-inner">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-base sm:text-lg tracking-tight">SyncOps Studio</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                    Client Portal
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 hidden sm:block">
                  Dedicated Architecture &amp; Milestone Terminal
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Authenticated user indicator */}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-medium text-slate-200">{user?.displayName || 'Client Partner'}</span>
              <span className="text-[11px] font-mono text-indigo-400 truncate max-w-[200px]">{user?.email}</span>
            </div>

            <Link
              to="/"
              id="client-nav-agency-site"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-all min-h-[40px]"
            >
              <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Agency Home</span>
            </Link>

            <button
              type="button"
              id="client-signout-btn"
              onClick={handleLogout}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-900/60 text-xs font-mono transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Telemetry Node Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Client Architecture Portfolio
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Track the live engineering progress of your server-side tracking pipelines, verify data deduplication, and fund deliverable milestones.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <a
              href="https://wa.me/8801608533529"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-slate-700 hover:border-emerald-500/50 text-xs font-mono text-slate-200 transition-all min-h-[42px]"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Architect WhatsApp</span>
            </a>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-xl text-xs font-mono flex items-center justify-between gap-3 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/40 border border-rose-800/60 text-rose-300'
            }`}
          >
            <span>{feedback.message}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Stats Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Active Deployments</span>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {activeProjects.length + activeOrders.length}
            </div>
            <span className="text-[11px] font-mono text-indigo-400 mt-1 block">
              {activeOrders.length > 0 ? `${activeOrders.length} Native Pipeline Active` : 'In Active Production'}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Proposals Ready</span>
            <div className="text-2xl sm:text-3xl font-bold text-amber-400 mt-1">
              {awaitingFundsOrders.length}
            </div>
            <span className="text-[11px] font-mono text-amber-400/90 mt-1 block">
              {awaitingFundsOrders.length > 0 ? 'Awaiting Escrow Funding' : '0 Pending Escrow'}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Completed Architecture</span>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {completedProjects.length + completedOrders.length}
            </div>
            <span className="text-[11px] font-mono text-emerald-400 mt-1 block">Fully Verified &amp; Handed Off</span>
          </div>
        </div>

        {/* DELIVERED ORDERS REVIEW BANNER */}
        {deliveredOrders.length > 0 && (
          <div
            id="client-delivered-orders-banner"
            className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/40 border-2 border-purple-500/80 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono"
          >
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-purple-400 animate-ping shrink-0" />
              <div>
                <span className="text-purple-300 font-bold text-sm block">
                  📦 Final Delivery Ready for Client Sign-Off ({deliveredOrders.length})
                </span>
                <span className="text-slate-300">
                  {deliveredOrders.map((o) => o.serviceTitle).join(', ')}. Review the attached container exports and audit logs below.
                </span>
              </div>
            </div>
            <span className="px-3.5 py-1.5 rounded-xl bg-purple-900/60 text-purple-200 border border-purple-700/60 font-semibold shrink-0">
              Action Required: Review &amp; Sign-Off
            </span>
          </div>
        )}

        {/* PENDING REVIEW NOTIFICATION BANNER */}
        {pendingOrders.length > 0 && (
          <div
            id="client-pending-orders-banner"
            className="p-4 rounded-2xl bg-slate-900/90 border border-amber-600/50 shadow-lg text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-300"
          >
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <div>
                <span className="text-amber-300 font-bold">
                  Architecture Request In Review ({pendingOrders.length}):
                </span>{' '}
                <span>
                  {pendingOrders.map((o) => o.serviceTitle).join(', ')}. Lead Architect Adesh Chandra is evaluating telemetry requirements.
                </span>
              </div>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/80 shrink-0">
              Est. &lt; 4 Hours Turnaround
            </span>
          </div>
        )}

        {/* PROMINENT ALERT: REVIEW PROPOSAL & FUND PROJECT (AWAITING_FUNDS) */}
        {awaitingFundsOrders.map((order) => (
          <div
            key={order.id}
            id={`alert-awaiting-funds-${order.id}`}
            className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-2 border-indigo-500/80 shadow-2xl shadow-indigo-950/60 relative overflow-hidden"
          >
            {/* Ambient indicator */}
            <div
              className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[90px] rounded-full pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/80 border border-indigo-400/50 text-xs font-mono font-bold text-indigo-200">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>ACTION REQUIRED: REVIEW PROPOSAL &amp; FUND PROJECT</span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono text-slate-400">Order ID: #{order.id.slice(-6)} • {order.serviceCategory}</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {order.serviceTitle}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Lead Architect Adesh Chandra has audited your telemetry requirements and approved your fixed-scope architecture proposal.
                  Fund the project escrow to trigger immediate Google Cloud Run container provisioning and live telemetry deployment.
                </p>

                {/* Proposal Notes / Deliverables */}
                {order.proposalNotes && (
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-800/60 text-xs font-mono text-indigo-300 space-y-1">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">
                      Architect Scope Deliverables &amp; Technical Notes:
                    </span>
                    <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{order.proposalNotes}</p>
                  </div>
                )}

                {/* Price and SLA Metrics */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1">
                  <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <span className="text-slate-500 uppercase text-[10px]">Fixed Escrow:</span>
                    <span className="text-base font-bold text-emerald-400">{order.totalPrice || '$0'}</span>
                  </div>

                  <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <span className="text-slate-500 uppercase text-[10px]">Guaranteed SLA:</span>
                    <span className="text-white font-bold">{order.durationDays || 7} Business Days</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 shrink-0 sm:min-w-[280px]">
                {order.paymentUrl ? (
                  <a
                    href={order.paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    id={`btn-fund-escrow-${order.id}`}
                    className="w-full min-h-[50px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm font-mono tracking-wide shadow-xl shadow-emerald-950/60 border border-emerald-400/40 flex items-center justify-center gap-2 active:scale-95 transition-all text-center cursor-pointer"
                  >
                    <span>Review Proposal &amp; Fund Project</span>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </a>
                ) : (
                  <a
                    href={`${WHATSAPP_DIRECT_URL}?text=Hi%20Adesh,%20I%20am%20ready%20to%20fund%20my%20order%20${encodeURIComponent(order.serviceTitle)}%20(Order%20%23${order.id.slice(-6)}).`}
                    target="_blank"
                    rel="noopener noreferrer"
                    id={`btn-fund-escrow-${order.id}`}
                    className="w-full min-h-[50px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm font-mono tracking-wide shadow-xl shadow-emerald-950/60 border border-emerald-400/40 flex items-center justify-center gap-2 active:scale-95 transition-all text-center cursor-pointer"
                  >
                    <span>Request Escrow Invoice via WhatsApp</span>
                  </a>
                )}

                <a
                  href={`${WHATSAPP_DIRECT_URL}?text=Hi%20Adesh,%20I%20am%20reviewing%20the%20proposal%20for%20${encodeURIComponent(order.serviceTitle)}%20(Order%20%23${order.id.slice(-6)}).`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[42px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-mono transition-colors flex items-center justify-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Discuss Scope with Architect</span>
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* ACTIVE PROJECT WORKSPACE (ACTIVE ORDERS) WITH LIVE COUNTDOWN TIMER */}
        {activeOrders.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Active Production Workspaces ({activeOrders.length})
                </h2>
              </div>
              <span className="text-xs font-mono text-indigo-400">Live Delivery Telemetry</span>
            </div>

            {activeOrders.map((order) => (
              <ActiveProject key={order.id} order={order} />
            ))}
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              type="button"
              id="tab-active-deployments"
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 min-h-[38px] ${
                activeTab === 'ACTIVE'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Active Deployments</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-300">
                {activeProjects.length + activeOrders.length}
              </span>
            </button>

            <button
              type="button"
              id="tab-completed-architecture"
              onClick={() => setActiveTab('COMPLETED')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 min-h-[38px] ${
                activeTab === 'COMPLETED'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Completed &amp; Order History</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-300">
                {completedProjects.length + completedOrders.length}
              </span>
            </button>
          </div>
        </div>

        {/* COMPLETED TAB: Order History Archive + Legacy Projects */}
        {activeTab === 'COMPLETED' ? (
          <div className="space-y-8 animate-fadeIn">
            {/* Native Order History Archive */}
            <OrderHistoryView
              clientEmail={user?.email || undefined}
              onReorder={() => navigate('/')}
            />

            {/* Legacy Completed Projects */}
            {completedProjects.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-mono uppercase text-slate-400 font-semibold tracking-wider">
                    Legacy Architecture Projects ({completedProjects.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {completedProjects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => navigate(`/client/project/${project.id}`)}
                      className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 transition-all duration-300 shadow-xl flex flex-col justify-between gap-6 cursor-pointer"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Completed Architecture
                          </span>
                          <span className="text-sm font-bold text-white font-mono">{project.totalValue}</span>
                        </div>
                        <h4 className="text-lg font-bold text-white">{project.name}</h4>
                        {project.description && (
                          <p className="text-xs text-slate-400 line-clamp-2">{project.description}</p>
                        )}
                      </div>
                      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-emerald-400">
                        <span>Milestones Verified (100%)</span>
                        <span>Open Project Portal →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ACTIVE TAB: Project Cards Grid */
          loading ? (
            <div className="p-16 text-center space-y-4 rounded-2xl bg-slate-900/40 border border-slate-800">
              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-400">Loading Relational Architecture Deployments...</p>
            </div>
          ) : activeProjects.length === 0 ? (
            <div className="p-12 sm:p-16 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 text-indigo-400 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">No Active Deployments Found</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  There are currently no standalone projects assigned to{' '}
                  <span className="text-slate-200 font-semibold">{user?.email}</span>.
                </p>
              </div>

              {/* Quick Demo Initializer */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  id="btn-seed-sample-project"
                  disabled={isSeedingDemo}
                  onClick={handleSeedDemoProject}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold shadow-lg shadow-indigo-950/40 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSeedingDemo ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Deploying Sample Project...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <span>Seed Sample Project for {user?.email}</span>
                    </>
                  )}
                </button>

                <a
                  href="https://wa.me/8801608533529"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-mono transition-colors flex items-center gap-2"
                >
                  <span>Request Project Pipeline via WhatsApp</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeProjects.map((project) => {
                const totalMilestones = project.milestones?.length || 0;
                const paidMilestones = project.milestones?.filter((m) => m.status === 'PAID').length || 0;
                const progressPercentage =
                  totalMilestones > 0 ? Math.round((paidMilestones / totalMilestones) * 100) : 0;

                return (
                  <div
                    key={project.id}
                    id={`project-card-${project.id}`}
                    onClick={() => navigate(`/client/project/${project.id}`)}
                    className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 transition-all duration-300 shadow-xl hover:shadow-indigo-950/30 flex flex-col justify-between gap-6 cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/40 group-hover:via-indigo-500 to-transparent transition-all" />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border bg-indigo-950 text-indigo-300 border-indigo-800">
                            Active Deployment
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {totalMilestones} {totalMilestones === 1 ? 'Milestone' : 'Milestones'}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-mono text-slate-400 block">Total Value</span>
                          <span className="text-lg font-bold text-white font-mono">{project.totalValue}</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {project.description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-400">Milestones Cleared</span>
                          <span className="text-indigo-300 font-semibold">
                            {paidMilestones} of {totalMilestones} ({progressPercentage}%)
                          </span>
                        </div>

                        <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              progressPercentage === 100
                                ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                                : 'bg-gradient-to-r from-indigo-500 to-cyan-500'
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      {totalMilestones > 0 && (
                        <div className="pt-2 flex flex-wrap gap-1.5">
                          {project.milestones.map((m, idx) => (
                            <div
                              key={m.id || idx}
                              className={`text-[10px] font-mono px-2 py-1 rounded-md border flex items-center gap-1 ${
                                m.status === 'PAID'
                                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/60'
                                  : 'bg-slate-950 text-slate-400 border-slate-800'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  m.status === 'PAID' ? 'bg-emerald-400' : 'bg-amber-400'
                                }`}
                              />
                              <span>M{idx + 1}: {m.status}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">
                        ID: {project.id.slice(0, 10)}...
                      </span>
                      <span className="text-xs font-mono text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1 font-semibold">
                        <span>Open Project Portal</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </main>
    </div>
  );
};
