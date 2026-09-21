import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
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
            return {
              id: docSnap.id,
              client: data.client || 'Enterprise Client',
              clientType: data.clientType || 'High-Growth Brand',
              challenge: data.challenge || '',
              solution: data.solution || '',
              result: data.result || '',
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
    <section id="case-studies-section" className="py-16 sm:py-24 relative border-t border-slate-900 bg-slate-950 overflow-hidden">
      {/* Background ambient gradient glow */}
      <div
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[520px] h-[340px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-800/60 text-indigo-300 text-xs font-mono mb-4 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PROVEN INFRASTRUCTURE DEPLOYMENTS</span>
          </div>
          <h2
            id="case-studies-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight"
          >
            Client Case Studies &amp; Outcomes
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-3.5 max-w-2xl mx-auto leading-relaxed">
            Real telemetry recovery metrics and signal deduplication results engineered for high-growth e-commerce brands.
          </p>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div
            id="case-studies-loading"
            className="py-16 flex flex-col items-center justify-center space-y-4 text-center"
          >
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            </div>
            <p className="text-xs font-mono text-slate-400">Loading Case Studies from Firestore...</p>
          </div>
        ) : (
          <div
            id="case-studies-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch"
          >
            {studies.map((study) => (
              <div
                key={study.id}
                id={`case-study-card-${study.id}`}
                className="flex flex-col justify-between rounded-2xl bg-slate-900/80 border border-slate-800/70 hover:border-indigo-500/50 p-6 sm:p-8 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-indigo-950/40 hover:-translate-y-1 transition-all duration-300 group backdrop-blur-sm"
              >
                <div>
                  {/* Client Name & Type Badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                        {study.client}
                      </h3>
                      {study.clientType && (
                        <span className="text-xs font-mono text-indigo-400 block mt-1">
                          {study.clientType}
                        </span>
                      )}
                    </div>
                    <span className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 group-hover:bg-indigo-600/30 group-hover:text-indigo-300 transition-all">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                    </span>
                  </div>

                  {/* Optional Image thumbnail */}
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

                  {/* Challenge Section */}
                  <div className="mb-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 shadow-inner">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      Tracking Challenge:
                    </span>
                    <p className="text-xs text-slate-300/90 leading-relaxed font-normal">
                      {study.challenge}
                    </p>
                  </div>

                  {/* Solution Section */}
                  <div className="mb-6">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      Server-Side Solution:
                    </span>
                    <p className="text-xs text-slate-300/90 leading-relaxed font-normal">
                      {study.solution}
                    </p>
                  </div>
                </div>

                {/* Result Highlight Banner */}
                <div className="pt-4 border-t border-slate-800/80">
                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/50 mb-4 shadow-sm">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1">
                      <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Verified Outcome:
                    </span>
                    <p className="text-xs font-mono font-bold text-emerald-200 leading-snug">
                      {study.result}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {onOpenConsultation && (
                      <button
                        type="button"
                        onClick={() => onOpenConsultation(`Case Study: ${study.client}`)}
                        className="flex-1 min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-mono font-medium transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <span>Request Architecture</span>
                      </button>
                    )}

                    <a
                      href={FIVERR_PROFILE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-400 text-xs font-mono font-medium transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap"
                    >
                      <span>Fiverr Review &rarr;</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
