import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { AuditorTool } from '../components/AuditorTool';
import { CaseStudies } from '../components/CaseStudies';
import { Services } from '../components/Services';
import { Footer } from '../components/Footer';
import { HireModal } from '../components/HireModal';
import { Service } from '../data/syncOpsData';

export const Home: React.FC = () => {
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [hireServiceTitle, setHireServiceTitle] = useState('Full Tracking Audit & CAPI Setup');
  const [hireInitialDomain, setHireInitialDomain] = useState('');
  const [hireInitialPlatform, setHireInitialPlatform] = useState('Meta CAPI');

  const handleOpenHireModal = (serviceName?: string, domain = '', platform = 'Meta CAPI') => {
    setHireServiceTitle(serviceName || 'Full Tracking Audit & CAPI Setup');
    setHireInitialDomain(domain);
    setHireInitialPlatform(platform);
    setIsHireModalOpen(true);
  };

  const handleHireFromAuditor = (targetPlatform: string, domainUrl: string) => {
    handleOpenHireModal(
      `Signal Leakage Remediation (${targetPlatform})`,
      domainUrl,
      targetPlatform === 'Meta' ? 'Meta CAPI' : targetPlatform
    );
  };

  const handleOrderService = (service: Service) => {
    handleOpenHireModal(service.title);
  };

  const scrollToAuditor = () => {
    const el = document.getElementById('auditor-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToCaseStudies = () => {
    const el = document.getElementById('case-studies-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="syncops-studio-app" className="min-h-screen bg-slate-950 text-slate-300 antialiased selection:bg-indigo-600 selection:text-white">
      {/* Sticky Header Navbar */}
      <Navbar onOpenHireModal={() => handleOpenHireModal()} />

      <main id="main-content">
        {/* Hero Section */}
        <Hero
          onScrollToAuditor={scrollToAuditor}
          onScrollToCaseStudies={scrollToCaseStudies}
        />

        {/* The Tracking Auditor (Real Gemini-powered Diagnostic Tool) */}
        <AuditorTool onHireFix={handleHireFromAuditor} />

        {/* Client Case Studies Section (Real Dynamic Firestore Integration) */}
        <CaseStudies onOpenConsultation={(topic) => handleOpenHireModal(topic)} />

        {/* Enterprise Capabilities Matrix (Categorized Dynamic Firestore Integration) */}
        <Services onOrderService={handleOrderService} />
      </main>

      {/* Footer */}
      <Footer onOpenHireModal={() => handleOpenHireModal()} />

      {/* Interactive Fiverr Hire / Technical Architecture Consultation Modal */}
      <HireModal
        isOpen={isHireModalOpen}
        onClose={() => setIsHireModalOpen(false)}
        serviceTitle={hireServiceTitle}
        initialDomain={hireInitialDomain}
        initialPlatform={hireInitialPlatform}
      />
    </div>
  );
};
