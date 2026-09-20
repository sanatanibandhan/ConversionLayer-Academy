import React, { useState } from 'react';
import { Course } from '../data/academyData';

interface EnrollModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EnrollModal: React.FC<EnrollModalProps> = ({ course, isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !course) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setEmail('');
    onClose();
  };

  return (
    <div
      id="enroll-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enroll-modal-title"
    >
      <div
        id="enroll-modal-container"
        className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-600" />

        {/* Close Button */}
        <button
          type="button"
          id="enroll-modal-close-btn"
          onClick={handleClose}
          className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          aria-label="Close dialog"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {!isSuccess ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                {course.badge}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Lifetime Access
              </span>
            </div>

            <h3 id="enroll-modal-title" className="text-2xl font-bold text-white tracking-tight">
              {course.title}
            </h3>

            <div className="my-4 p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-mono font-extrabold text-white">${course.price}</span>
                <span className="text-xs font-mono text-slate-400 ml-1">USD (One-time)</span>
              </div>
              <span className="text-xs font-mono text-indigo-400">{course.duration}</span>
            </div>

            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Immediate access to container templates, GTM JSON exports, server proxy schemas, and weekly student QA calls.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="enroll-email-input"
                  className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Student Access Email
                </label>
                <input
                  type="email"
                  id="enroll-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@yourcompany.com"
                  required
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="enroll-confirm-btn"
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 active:scale-[0.98]"
                >
                  <span>Confirm Enrollment &amp; Unlock Curriculum</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div id="enroll-success-view" className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 mx-auto flex items-center justify-center">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white">Enrollment Confirmed!</h3>
            <p className="text-slate-300 text-sm max-w-sm mx-auto leading-relaxed">
              Your curriculum access credentials for <span className="font-semibold text-indigo-300">{course.title}</span> have been sent to <span className="text-white font-medium">{email}</span>.
            </p>
            <div className="pt-4">
              <button
                type="button"
                id="enroll-success-close-btn"
                onClick={handleClose}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all"
              >
                Close &amp; Continue Learning
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
