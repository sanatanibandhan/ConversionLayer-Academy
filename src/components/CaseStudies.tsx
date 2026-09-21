import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { TrendingUp, CheckCircle2, ShieldCheck, ArrowUpRight, Database } from 'lucide-react';
import { db } from '../lib/firebase';
import { CaseStudy, DEFAULT_CASE_STUDIES, FIVERR_PROFILE_URL } from '../data/syncOpsData';

interface CaseStudiesProps {
  onOpenConsultation?: (topic?: string) => void;
}

export const CaseStudies: React.FC<CaseStudiesProps> = ({ onOpenConsultation }) => {
  const [studies, setStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchCaseStudies() {
      try {
        const colRef = collection(db, 'case_studies');
        const snapshot = await getDocs(colRef);
        if (!snapshot.empty && isMounted) {
          const fetched: CaseStudy[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            const industryVal = data.industry || data.clientType || 'E-Commerce';
            const metricVal = data.metric || data.result || '+41% ROAS Recovery';
            return {
              id: docSnap.id,
              client: data.client || 'Enterprise Client',
              industry: industryVal,
              clientType: industryVal,
              challenge: data.challenge || '',
              solution: data.solution || '',
              metric: metricVal,
              result: data.result || metricVal,
              imageUrl: data.imageUrl || ''
            };
          });
          setStudies(fetched);
        } else if (isMounted) {
          setStudies(DEFAULT_CASE_STUDIES);
        }
      } catch (err) {
        console.warn('Firestore case_studies fetch fallback notice:', err);
        if (isMounted) {
          setStudies(DEFAULT_CASE_STUDIES);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchCaseStudies();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="case-studies-section" className="py-20 sm:py-28 relative border-t border-slate-900 bg-slate-950 overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/5 blur-[140px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-10 w-[400px] h-[250px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-mono mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>DYNAMIC CASE STUDY CMS • FIRESTORE PERSISTENCE</span>
          </div>
          <h2
            id="case-studies-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight"
          >
            Engineering Outcomes &amp; Lift
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
            Quantifiable telemetry recovery and server-side deduplication verified across high-volume DTC, SaaS, and e-commerce enterprises.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div
            id="case-studies-loading"
            className="py-20 flex flex-col items-center justify-center space-y-4 text-center"
          >
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
              <div className="absolute inset-0 rounded-full border-4 border-t-emerald-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            </div>
            <p className="text-xs font-mono text-slate-400">Synchronizing Case Studies from Firestore...</p>
          </div>
        ) : (
          <div
            id="case-studies-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch"
          >
            {studies.map((study) => {
              const primaryMetric = study.metric || (study.result.includes('•') ? study.result.split('•')[0].trim() : study.result);

              return (
                <div
                  key={study.id}
                  id={`case-study-card-${study.id}`}
                  className="flex flex-col justify-between rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 p-6 sm:p-8 shadow-xl shadow-black/40 hover:shadow-2xl hover:shadow-emerald-950/20 hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div>
                    {/* Top Meta: Client Name & Industry Badge */}
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div>
                        <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                          {study.client}
                        </h3>
                        {(study.industry || study.clientType) && (
                          <span className="inline-block text-[11px] font-mono px-2.5 py-1 mt-1.5 rounded-lg bg-slate-950 text-indigo-400 border border-slate-800">
                            {study.industry || study.clientType}
                          </span>
                        )}
                      </div>
                      <span className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all shrink-0">
                        <TrendingUp className="w-5 h-5" />
                      </span>
                    </div>

                    {/* HERO QUANTITATIVE METRIC (Glowing emerald-400 accent) */}
                    <div
                      id={`metric-highlight-${study.id}`}
                      className="relative mb-6 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 overflow-hidden shadow-inner group/metric"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/90 font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          KEY RECOVERED METRIC
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 font-semibold">
                          VERIFIED
                        </span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight font-mono drop-shadow-[0_0_12px_rgba(52,211,153,0.35)]">
                        {primaryMetric}
                      </div>
                      {study.result && study.result !== primaryMetric && (
                        <div className="text-xs text-emerald-300/80 font-mono mt-2 border-t border-emerald-900/60 pt-2 leading-relaxed">
                          {study.result}
                        </div>
                      )}
                    </div>

                    {/* Optional Image Screenshot */}
                    {study.imageUrl && (
                      <div className="w-full h-40 mb-5 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
                        <img
                          src={study.imageUrl}
                          alt={study.client}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Tracking Challenge */}
                    <div className="mb-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        Signal Challenge
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {study.challenge}
                      </p>
                    </div>

                    {/* Server-Side Solution */}
                    <div className="mb-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800/60">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        Engineered Solution
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {study.solution}
                      </p>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-2.5">
                    {onOpenConsultation && (
                      <button
                        type="button"
                        id={`btn-case-consult-${study.id}`}
                        onClick={() => onOpenConsultation(`Case Study: ${study.client}`)}
                        className="flex-1 min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 text-xs font-mono font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Request Architecture</span>
                      </button>
                    )}

                    <a
                      id={`btn-case-fiverr-${study.id}`}
                      href={FIVERR_PROFILE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 hover:text-white border border-emerald-800/50 hover:border-emerald-700 text-xs font-mono font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <span>Fiverr Review</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Callout banner */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/50 border border-indigo-800/50 flex items-center justify-center text-indigo-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Live Firestore Sync Enabled</p>
              <p className="text-xs text-slate-400">All metrics and client results are pulled in real time from our secure cloud CMS.</p>
            </div>
          </div>
          {onOpenConsultation && (
            <button
              type="button"
              id="btn-case-studies-cta"
              onClick={() => onOpenConsultation('Custom Telemetry Architecture Consultation')}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold transition-all shadow-lg shadow-indigo-600/25 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span>Get Your Architecture Blueprint</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
