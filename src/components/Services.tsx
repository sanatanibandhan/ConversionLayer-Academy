import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Service,
  ServiceCategory,
  SERVICE_CATEGORIES,
  DEFAULT_SERVICES,
  APPLICATION_FORM_URL,
  WHATSAPP_TRIAGE_URL
} from '../data/syncOpsData';
import { ApplicationModal } from './ApplicationModal';

export interface ServicesProps {
  services?: Service[];
  onOrderService?: (service: Service) => void;
}

export const Services: React.FC<ServicesProps> = ({ services: propServices, onOrderService }) => {
  const [services, setServices] = useState<Service[]>(propServices || []);
  const [loading, setLoading] = useState(!propServices || propServices.length === 0);
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('Data & Measurement');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<Service | null>(null);

  useEffect(() => {
    if (propServices && propServices.length > 0) {
      setServices(propServices);
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchServices() {
      try {
        const colRef = collection(db, 'services');
        const snapshot = await getDocs(colRef);
        if (!snapshot.empty && isMounted) {
          const fetched: Service[] = snapshot.docs.map((docSnap, index) => {
            const data = docSnap.data();

            // Deliverables list normalization
            let deliverablesList: string[] = [];
            if (Array.isArray(data.deliverables) && data.deliverables.length > 0) {
              deliverablesList = data.deliverables.filter(
                (d: unknown) => typeof d === 'string' && d.trim().length > 0
              );
            } else if (data.description) {
              deliverablesList = [data.description];
            } else {
              deliverablesList = [
                'Full Enterprise Architecture & QA Handover',
                'First-party client container & subdomain routing',
                'Event deduplication & schema validation'
              ];
            }

            // Tech stack normalization
            let techStackList: string[] = [];
            if (Array.isArray(data.techStack) && data.techStack.length > 0) {
              techStackList = data.techStack.filter(
                (t: unknown) => typeof t === 'string' && t.trim().length > 0
              );
            } else if (typeof data.techStack === 'string' && data.techStack.trim().length > 0) {
              techStackList = data.techStack.split(',').map((s: string) => s.trim());
            } else {
              techStackList = ['Server GTM', 'Meta CAPI', 'Cloud Run', 'Consent Mode v2'];
            }

            // Category assignment with safe inference
            let category: ServiceCategory = 'Data & Measurement';
            if (data.category && SERVICE_CATEGORIES.some((c) => c.id === data.category)) {
              category = data.category as ServiceCategory;
            } else if (data.title?.toLowerCase().includes('shopify') || data.title?.toLowerCase().includes('woocommerce') || data.title?.toLowerCase().includes('merchant')) {
              category = 'E-Commerce Engineering';
            } else if (data.title?.toLowerCase().includes('seo') || data.title?.toLowerCase().includes('growth') || data.title?.toLowerCase().includes('social')) {
              category = 'Growth Operations';
            }

            return {
              id: docSnap.id,
              category,
              title: data.title || `Enterprise Capability ${index + 1}`,
              tier: data.tier || 'Enterprise Scope',
              price: Number(data.price || data.startingPrice) || undefined,
              turnaround: data.turnaround || 'Sprint / Project Basis',
              description:
                data.description ||
                'High-ticket technical infrastructure engineered for enterprise attribution, conversion performance, and complete data ownership.',
              techStack: techStackList,
              deliverables: deliverablesList,
              recommended: data.recommended !== undefined ? Boolean(data.recommended) : (index === 0),
              link: data.link || data.applicationUrl || APPLICATION_FORM_URL,
              imageUrl: data.imageUrl || '',
              rating: Number(data.rating) || 5.0,
              ordersCount: Number(data.ordersCount) || (40 + index * 5)
            };
          });
          setServices(fetched);
        } else if (isMounted) {
          setServices(DEFAULT_SERVICES);
        }
      } catch (err) {
        console.warn('Firestore services fetch fallback notice:', err);
        if (isMounted) {
          setServices(DEFAULT_SERVICES);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchServices();

    return () => {
      isMounted = false;
    };
  }, [propServices]);

  // Filter services by active category
  const filteredServices = services.filter(
    (item) => (item.category || 'Data & Measurement') === activeCategory
  );

  // Category metadata for rich tab rendering
  const categoryTabDetails: Record<
    ServiceCategory,
    { subtitle: string; icon: string; count: number }
  > = {
    'Data & Measurement': {
      subtitle: 'Tracking, CAPI, Analytics',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      count: services.filter((s) => (s.category || 'Data & Measurement') === 'Data & Measurement').length
    },
    'E-Commerce Engineering': {
      subtitle: 'Shopify, WordPress, GMC',
      icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
      count: services.filter((s) => s.category === 'E-Commerce Engineering').length
    },
    'Growth Operations': {
      subtitle: 'SEO, Social Media Management',
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      count: services.filter((s) => s.category === 'Growth Operations').length
    }
  };

  const handleOpenGlobalApplication = () => {
    // Select the first or recommended service of the active category to provide context
    const contextService =
      filteredServices.find((s) => s.recommended) || filteredServices[0] || {
        id: `custom-${activeCategory.toLowerCase().replace(/\s+/g, '-')}`,
        category: activeCategory,
        title: `${activeCategory} Engagement`,
        tier: 'Enterprise Scope',
        deliverables: ['Custom architectural scoping & sandbox deployment'],
        description: `Architecture engagement for ${activeCategory}.`,
        link: APPLICATION_FORM_URL
      };

    setSelectedServiceForModal(contextService);
    setIsModalOpen(true);
    if (onOrderService) {
      onOrderService(contextService);
    }
  };

  return (
    <section
      id="services-section"
      className="py-20 sm:py-28 relative border-t border-slate-900 bg-slate-950 overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-indigo-600/10 blur-[160px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-mono mb-4 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span>ENTERPRISE CAPABILITIES MATRIX</span>
          </div>
          <h2
            id="services-section-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight"
          >
            Engineering-Led Growth &amp; Infrastructure
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
            Full-stack infrastructure built for high-scale enterprise brands. From server-side signal
            telemetry to headless e-commerce engineering and programmatic growth operations.
          </p>
        </div>

        {/* Tabbed Navigation UI */}
        <div
          id="services-category-tabs"
          role="tablist"
          aria-label="Capabilities Matrix Categories"
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-4xl mx-auto mb-14"
        >
          {SERVICE_CATEGORIES.map((catObj) => {
            const category = catObj.id;
            const isActive = activeCategory === category;
            const meta = categoryTabDetails[category];

            return (
              <button
                key={category}
                id={`tab-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(category)}
                className={`group relative flex-1 p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-950/60 ring-1 ring-indigo-500/50'
                    : 'bg-slate-900/40 hover:bg-slate-900/80 border-slate-800/80 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-950 text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d={meta.icon} />
                      </svg>
                    </div>
                    <span
                      className={`text-sm font-bold tracking-tight transition-colors ${
                        isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                      }`}
                    >
                      {catObj.title}
                    </span>
                  </div>

                  {/* Count badge */}
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                        : 'bg-slate-950 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {meta.count}
                  </span>
                </div>

                <p
                  className={`text-xs transition-colors pl-9 ${
                    isActive ? 'text-indigo-300/90 font-medium' : 'text-slate-500'
                  }`}
                >
                  {catObj.subtitle}
                </p>

                {isActive && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-indigo-500 rounded-full blur-[1px]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading ? (
          <div
            id="services-loading-state"
            className="py-20 flex flex-col items-center justify-center space-y-4 text-center"
          >
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            </div>
            <p className="text-xs font-mono text-slate-400">Loading enterprise matrix from Firestore...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center max-w-xl mx-auto">
            <p className="text-slate-300 font-medium mb-2">No capabilities listed in this category yet.</p>
            <p className="text-xs text-slate-500 mb-4">
              Add new services in the Admin Dashboard under &quot;{activeCategory}&quot;.
            </p>
          </div>
        ) : (
          /* Enterprise Capabilities Matrix Grid */
          <div
            id="capabilities-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch"
          >
            {filteredServices.map((service) => {
              const isFeatured = Boolean(service.recommended);

              return (
                <div
                  key={service.id}
                  id={`capability-card-${service.id}`}
                  className={`relative rounded-3xl backdrop-blur-xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                    isFeatured
                      ? 'bg-slate-900/90 border-2 border-indigo-500 shadow-2xl shadow-indigo-950/70 ring-1 ring-indigo-500/50 hover:shadow-indigo-500/20'
                      : 'bg-slate-900/60 border border-slate-800/80 shadow-xl shadow-black/40 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  {/* Featured Badge */}
                  {isFeatured && (
                    <div className="absolute -top-3.5 left-7 z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-mono text-[10px] font-extrabold uppercase tracking-wider shadow-md shadow-indigo-500/30 border border-indigo-300/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                        <span>Featured Capability</span>
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-3.5 pt-1">
                      <span className="text-[11px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-lg bg-indigo-950/90 text-indigo-300 border border-indigo-800/60 uppercase">
                        {service.tier || 'Enterprise Scope'}
                      </span>
                      {service.turnaround && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800">
                          ⚡ {service.turnaround}
                        </span>
                      )}
                    </div>

                    {/* Service Title */}
                    <h3
                      id={`capability-title-${service.id}`}
                      className="text-xl font-extrabold text-white tracking-tight leading-snug mb-3"
                    >
                      {service.title}
                    </h3>

                    {/* Highly Technical Description */}
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                      {service.description}
                    </p>

                    {/* Tech Stack & Platforms Pills */}
                    {service.techStack && service.techStack.length > 0 && (
                      <div className="mb-6 pt-4 border-t border-slate-800/80">
                        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-300 block mb-2.5">
                          Supported Tech Stack &amp; Platforms:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {service.techStack.map((tech, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-950 text-indigo-300 border border-slate-800/90 font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Deliverables / Architectural Protocols Checklist */}
                    {service.deliverables && service.deliverables.length > 0 && (
                      <div className="pt-2 mb-2">
                        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-300 block mb-3">
                          Architectural Deliverables:
                        </span>
                        <ul className="space-y-2.5">
                          {service.deliverables.map((item, dIdx) => (
                            <li
                              key={dIdx}
                              className="flex items-start gap-2.5 text-xs text-slate-300 leading-snug"
                            >
                              <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                                <svg
                                  className="w-2.5 h-2.5"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </div>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Verified SLA & Security Indicator (No button on individual card) */}
                  <div className="pt-5 mt-4 border-t border-slate-800/70 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Direct Sandbox Handover</span>
                    </span>
                    <span className="text-slate-500">100% Client Ownership</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Global Glowing CTA at Section Bottom */}
        <div
          id="global-services-cta"
          className="mt-16 sm:mt-20 p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-indigo-500/40 shadow-2xl shadow-indigo-950/60 backdrop-blur-xl max-w-4xl mx-auto text-center relative overflow-hidden"
        >
          {/* Subtle glow behind the CTA */}
          <div
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-40 bg-indigo-500/20 blur-[90px] rounded-full pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 text-xs font-mono mb-4 border border-indigo-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>DIRECT TECHNICAL TRIAGE • ZERO FLUFF</span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Ready to Deploy Enterprise Architecture?
            </h3>

            <p className="text-sm sm:text-base text-slate-300 mt-3 mb-8 leading-relaxed">
              Skip agency account managers and generic discovery meetings. Submit your technical
              parameters to receive an architectural scope and fixed-scope delivery proposal within 4 hours.
            </p>

            {/* Massive Glowing Primary Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                id="global-submit-application-btn"
                onClick={handleOpenGlobalApplication}
                className="w-full sm:w-auto min-h-[54px] px-9 py-4 rounded-2xl font-extrabold text-sm sm:text-base font-mono tracking-wide bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-xl shadow-indigo-600/40 border border-indigo-400/40 flex items-center justify-center gap-3 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <span>Submit Architecture Application</span>
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </button>

              {/* Secondary Ghost WhatsApp Triage */}
              <a
                href={WHATSAPP_TRIAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                id="global-whatsapp-triage-btn"
                className="w-full sm:w-auto min-h-[54px] px-7 py-4 rounded-2xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white text-xs sm:text-sm font-mono font-medium flex items-center justify-center gap-2.5 active:scale-95 transition-all duration-200 shadow-md"
              >
                <svg
                  className="w-4 h-4 fill-current text-emerald-400"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.18-.47-.3" />
                </svg>
                <span>Initiate Triage Chat (WhatsApp)</span>
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>100% Client Infrastructure Ownership</span>
              </span>
              <span>•</span>
              <span>Direct Staging &amp; Sandbox Handover</span>
              <span>•</span>
              <span>Non-Disclosure &amp; Enterprise SLA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reusable Native Lead Application Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedService={selectedServiceForModal}
        selectedTier={selectedServiceForModal?.tier}
      />
    </section>
  );
};

export default Services;
