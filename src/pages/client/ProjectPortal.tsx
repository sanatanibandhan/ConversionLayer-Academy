import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { ClientProject } from '../../data/syncOpsData';

export const ProjectPortal: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState<ClientProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) {
        setError('Missing project identifier.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const docRef = doc(db, 'projects', projectId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError('Project deployment not found or removed.');
          setLoading(false);
          return;
        }

        const data = docSnap.data();
        const projectData: ClientProject = {
          id: docSnap.id,
          name: data.name || 'Architecture Project',
          clientEmail: data.clientEmail || '',
          totalValue: data.totalValue || '$0',
          status: data.status || 'ACTIVE',
          milestones: Array.isArray(data.milestones) ? data.milestones : [],
          description: data.description || '',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };

        // Relational access check: Must match client's email or be an admin
        const clientEmailMatch =
          projectData.clientEmail.trim().toLowerCase() === user?.email?.trim().toLowerCase();

        if (!clientEmailMatch && !isAdmin) {
          setError('Access Denied: You are not authorized to inspect this project deployment.');
          setLoading(false);
          return;
        }

        setProject(projectData);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Unable to load project architecture details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, user, isAdmin]);

  const totalMilestones = project?.milestones?.length || 0;
  const paidMilestones = project?.milestones?.filter((m) => m.status === 'PAID').length || 0;
  const progressPercent = totalMilestones > 0 ? Math.round((paidMilestones / totalMilestones) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono text-slate-400">Loading Milestone Architecture Terminal...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-400 flex items-center justify-center mb-4">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{error || 'Project Not Found'}</h2>
        <p className="text-xs font-mono text-slate-400 max-w-md mb-6">
          Please check your project URL or navigate back to your client dashboard to view your authorized projects.
        </p>
        <Link
          to="/client/dashboard"
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-semibold transition-all inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Return to Client Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div
      id="project-portal-page"
      className="min-h-screen bg-slate-950 text-slate-200 antialiased flex flex-col selection:bg-indigo-500 selection:text-white"
    >
      {/* Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/client/dashboard"
              id="btn-back-to-dashboard"
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5 min-h-[40px]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>All Deployments</span>
            </Link>

            <div className="hidden sm:block h-5 w-px bg-slate-800" />

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Portal:</span>
              <span className="text-xs font-mono text-indigo-400 truncate max-w-[200px]">
                {project.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-block text-xs font-mono text-slate-400">
              {user?.email}
            </span>
            <button
              onClick={() => logout().then(() => navigate('/login'))}
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-800 text-xs font-mono transition-all flex items-center gap-1.5"
            >
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Project Header Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${
                    project.status === 'ACTIVE'
                      ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  }`}
                >
                  {project.status === 'ACTIVE' ? 'Active Deployment' : 'Architecture Completed'}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Client: {project.clientEmail}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>

            {/* Total Value Metric */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-right shrink-0">
              <span className="text-xs font-mono text-slate-400 block uppercase tracking-wider">
                Total Agreement Value
              </span>
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {project.totalValue}
              </span>
              <span className="text-[11px] font-mono text-indigo-400 block mt-0.5">
                Stripe &amp; Payoneer Verified
              </span>
            </div>
          </div>

          {/* Progress Bar & Summary */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">
                Milestone Funding Completion: <strong className="text-white">{paidMilestones} of {totalMilestones}</strong>
              </span>
              <span className="text-indigo-400 font-bold">{progressPercent}% Funded</span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  progressPercent === 100
                    ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                    : 'bg-gradient-to-r from-indigo-500 via-cyan-500 to-indigo-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Milestone Timeline Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <h2 className="text-lg font-bold text-white">Project Milestone Timeline &amp; Escrow</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Sequential Deliverables Release
            </span>
          </div>

          {totalMilestones === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-sm">
              No milestones recorded for this project yet. Contact your lead architect.
            </div>
          ) : (
            <div className="space-y-6">
              {project.milestones.map((milestone, idx) => {
                const isPaid = milestone.status === 'PAID';
                const isPending = milestone.status === 'PENDING';

                return (
                  <div
                    key={milestone.id || idx}
                    id={`milestone-card-${milestone.id || idx}`}
                    className={`p-6 rounded-2xl border transition-all relative overflow-hidden ${
                      isPaid
                        ? 'bg-slate-900/90 border-emerald-900/50 shadow-lg'
                        : 'bg-slate-900 border-slate-800 shadow-xl hover:border-indigo-500/60'
                    }`}
                  >
                    {/* Status side bar accent */}
                    <div
                      className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                        isPaid ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                    />

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pl-2">
                      {/* Milestone Details */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-indigo-400 border border-slate-800">
                            STEP {String(idx + 1).padStart(2, '0')}
                          </span>

                          <span
                            className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border ${
                              isPaid
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                : 'bg-amber-950/60 text-amber-300 border-amber-800/80'
                            }`}
                          >
                            {isPaid ? (
                              <>
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span>PAID &amp; RELEASED</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                                <span>PAYMENT PENDING</span>
                              </>
                            )}
                          </span>

                          <span className="text-sm font-mono font-bold text-white">
                            {milestone.amount}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-white">{milestone.title}</h3>

                        {milestone.description && (
                          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                            {milestone.description}
                          </p>
                        )}
                      </div>

                      {/* Payment Action Area */}
                      <div className="lg:text-right shrink-0 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3">
                        {isPending ? (
                          <>
                            <a
                              href={milestone.paymentUrl || 'https://wa.me/8801608533529'}
                              target="_blank"
                              rel="noopener noreferrer"
                              id={`btn-fund-milestone-${milestone.id || idx}`}
                              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-mono text-xs font-bold shadow-lg shadow-indigo-950/50 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                            >
                              <svg className="w-4 h-4 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                <line x1="1" y1="10" x2="23" y2="10" />
                              </svg>
                              <span>Fund Milestone ({milestone.amount})</span>
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                              </svg>
                            </a>
                            <span className="text-[11px] font-mono text-slate-400">
                              Direct Stripe / Payoneer Checkout
                            </span>
                          </>
                        ) : (
                          <div className="p-3 rounded-xl bg-slate-950 border border-emerald-900/60 text-left lg:text-right">
                            <span className="text-xs font-mono text-emerald-400 font-semibold block flex items-center gap-1.5 lg:justify-end">
                              <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                              </svg>
                              Escrow Settled
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 mt-0.5 block">
                              Deliverable code deployed &amp; active
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Engineering Support & Inquiry Card */}
        <div className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">Have questions regarding this deployment?</h4>
            <p className="text-xs text-slate-400">
              Direct telemetry triage with Lead Architect Adesh Chandra via WhatsApp or email.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="https://wa.me/8801608533529"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-all flex items-center gap-2 min-h-[40px]"
            >
              <span>WhatsApp Architect</span>
            </a>

            <a
              href="mailto:iadeshchandra@gmail.com"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono font-bold border border-slate-700 transition-all flex items-center gap-2 min-h-[40px]"
            >
              <span>Email Support</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};
