import React from 'react';
import { Service } from '../data/academyData';

interface DFYServicesProps {
  services: Service[];
  onOrderService: (service: Service) => void;
}

export const DFYServices: React.FC<DFYServicesProps> = ({ services, onOrderService }) => {
  return (
    <section id="services-section" className="py-20 relative border-t border-slate-900 bg-slate-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 text-xs font-mono mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>FIVERR VERIFIED LEVEL 2 SERVICE</span>
          </div>
          <h2
            id="services-section-title"
            className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
          >
            Done-For-You Engineering
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-3">
            Direct turnkey implementation on your Google Cloud, Stape.io, GTM, and Shopify/WooCommerce stores with 100% order protection.
          </p>
        </div>

        {/* Services Responsive Grid */}
        <div
          id="services-grid"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch"
        >
          {services.map((service) => (
            <div
              key={service.id}
              id={`service-card-${service.id}`}
              className={`flex flex-col rounded-2xl bg-slate-900 border transition-all duration-300 relative p-6 sm:p-8 ${
                service.recommended
                  ? 'border-indigo-500 shadow-2xl shadow-indigo-950/50 bg-slate-900/95 ring-1 ring-indigo-500/50'
                  : 'border-slate-800 hover:border-slate-700 shadow-lg'
              }`}
            >
              {/* Recommended Badge if applicable */}
              {service.recommended && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-600 text-white text-xs font-mono uppercase font-bold tracking-wider px-3.5 py-1 rounded-full shadow-md">
                    Most Requested by Brands
                  </span>
                </div>
              )}

              {/* Tier and Title */}
              <div className="mb-4">
                <span
                  id={`service-tier-${service.id}`}
                  className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold block mb-1"
                >
                  {service.tier}
                </span>
                <h3
                  id={`service-title-${service.id}`}
                  className="text-2xl font-bold text-white tracking-tight"
                >
                  {service.title}
                </h3>
              </div>

              {/* Price & Turnaround */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 mb-6 flex items-baseline justify-between">
                <div>
                  <span
                    id={`service-price-${service.id}`}
                    className="text-3xl font-extrabold font-mono text-white tracking-tight"
                  >
                    ${service.price}
                  </span>
                  <span className="text-xs text-slate-400 ml-1 font-mono">USD</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{service.turnaround}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                {service.description}
              </p>

              {/* Deliverables List */}
              <div className="space-y-3 mb-8 flex-1">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  Included Deliverables:
                </h4>
                {service.deliverables.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-xs text-slate-300 leading-snug">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA linking / triggering Fiverr order (min-h-[44px]) */}
              <div className="pt-2">
                <button
                  type="button"
                  id={`service-order-btn-${service.id}`}
                  onClick={() => onOrderService(service)}
                  className={`w-full min-h-[44px] flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 active:scale-[0.98] ${
                    service.recommended
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 focus:ring-indigo-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 focus:ring-slate-500'
                  }`}
                >
                  <svg
                    className="w-4 h-4 text-emerald-300"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm-2-8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
                  </svg>
                  <span>Order on Fiverr</span>
                  <svg
                    className="w-4 h-4 text-slate-400 ml-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </button>
                <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[11px] font-mono text-slate-500">
                  <span>Guaranteed Escrow Protection via Fiverr</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
