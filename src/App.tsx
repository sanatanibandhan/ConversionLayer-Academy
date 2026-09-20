import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AuditorTool } from './components/AuditorTool';
import { AcademyCourses } from './components/AcademyCourses';
import { DFYServices } from './components/DFYServices';
import { Footer } from './components/Footer';
import { HireModal } from './components/HireModal';
import { EnrollModal } from './components/EnrollModal';
import { COURSES_DATA, SERVICES_DATA, Course, Service } from './data/academyData';

export default function App() {
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [hireServiceTitle, setHireServiceTitle] = useState('Full Tracking Audit & CAPI Setup');
  const [hireInitialDomain, setHireInitialDomain] = useState('');
  const [hireInitialPlatform, setHireInitialPlatform] = useState('Meta CAPI');

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

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

  const handleEnrollCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsEnrollModalOpen(true);
  };

  const scrollToAuditor = () => {
    const el = document.getElementById('auditor-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToCourses = () => {
    const el = document.getElementById('courses-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="conversion-layer-app" className="min-h-screen bg-slate-950 text-slate-300 antialiased selection:bg-indigo-600 selection:text-white">
      {/* Sticky Header Navbar */}
      <Navbar onOpenHireModal={() => handleOpenHireModal()} />

      <main id="main-content">
        {/* Hero Section */}
        <Hero
          onScrollToAuditor={scrollToAuditor}
          onScrollToCourses={scrollToCourses}
        />

        {/* The Tracking Auditor (Placed directly below the Hero text) */}
        <AuditorTool onHireFix={handleHireFromAuditor} />

        {/* Academy Courses Section */}
        <AcademyCourses
          courses={COURSES_DATA}
          onEnroll={handleEnrollCourse}
        />

        {/* DFY Services Section (Fiverr Integration) */}
        <DFYServices
          services={SERVICES_DATA}
          onOrderService={handleOrderService}
        />
      </main>

      {/* Footer */}
      <Footer onOpenHireModal={() => handleOpenHireModal()} />

      {/* Interactive Fiverr Hire / Consultation Modal */}
      <HireModal
        isOpen={isHireModalOpen}
        onClose={() => setIsHireModalOpen(false)}
        serviceTitle={hireServiceTitle}
        initialDomain={hireInitialDomain}
        initialPlatform={hireInitialPlatform}
      />

      {/* Interactive Academy Course Enrollment Modal */}
      <EnrollModal
        course={selectedCourse}
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
      />
    </div>
  );
}

