import React from 'react';
import { Course } from '../data/academyData';

interface AcademyCoursesProps {
  courses: Course[];
  onEnroll: (course: Course) => void;
}

export const AcademyCourses: React.FC<AcademyCoursesProps> = ({ courses, onEnroll }) => {
  return (
    <section id="courses-section" className="py-20 relative border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 text-xs font-mono mb-4">
            <span>CURRICULUM SPECIFICATION</span>
          </div>
          <h2
            id="courses-section-title"
            className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
          >
            Engineering-Grade Tracking Education
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-3">
            Architected by a Level 2 Specialist. No beginner theory—straight production deployment of server containers and CAPI payloads.
          </p>
        </div>

        {/* Courses Responsive Grid */}
        <div
          id="courses-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {courses.map((course) => (
            <div
              key={course.id}
              id={`course-card-${course.id}`}
              className="flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 overflow-hidden group shadow-xl hover:shadow-indigo-950/30"
            >
              {/* Card Image / Terminal Schematics Placeholder */}
              <div
                id={`course-img-placeholder-${course.id}`}
                className="relative h-48 bg-slate-950 border-b border-slate-800/80 p-4 flex flex-col justify-between overflow-hidden"
              >
                {/* Visual architectural wireframe lines */}
                <div
                  className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px]"
                  aria-hidden="true"
                />

                {/* Top tech header */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 font-mono text-[11px] text-slate-500">
                      {course.id}.proto
                    </span>
                  </div>

                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
                    {course.badge}
                  </span>
                </div>

                {/* Simulated Server/CAPI telemetry visual */}
                <div className="relative z-10 font-mono text-xs text-slate-400 space-y-1 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-indigo-300">
                    <span>&gt; endpoint.verify()</span>
                    <span className="text-emerald-400">200 OK</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    payload: &#123; event: &quot;Purchase&quot;, emq: 9.4, dedupe: true &#125;
                  </div>
                </div>

                {/* Duration indicator */}
                <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{course.duration}</span>
                  <span className="text-indigo-400 font-semibold">Self-Paced HD</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-7 flex flex-col flex-1">
                <div className="flex items-baseline justify-between mb-3">
                  <h3
                    id={`course-title-${course.id}`}
                    className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors"
                  >
                    {course.title}
                  </h3>
                  <div className="text-right">
                    <span
                      id={`course-price-${course.id}`}
                      className="text-2xl font-extrabold font-mono text-white"
                    >
                      ${course.price}
                    </span>
                    <span className="text-xs text-slate-400 block font-mono">one-time</span>
                  </div>
                </div>

                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                  {course.description}
                </p>

                {/* 3 Bullet Points */}
                <div className="space-y-3 mb-8 flex-1">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                    Syllabus Highlights:
                  </h4>
                  {course.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded bg-indigo-950 border border-indigo-800/80 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                        {/* Check icon */}
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
                        {bullet}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Enroll Button (Min 44px height) */}
                <button
                  type="button"
                  id={`course-enroll-btn-${course.id}`}
                  onClick={() => onEnroll(course)}
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 active:scale-[0.98] border border-slate-700 hover:border-indigo-500"
                >
                  <span>Enroll Now</span>
                  <svg
                    className="w-4 h-4 text-slate-400 group-hover:text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
