import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { 
  Cpu, 
  Layers, 
  ExternalLink, 
  Youtube, 
  Terminal, 
  Sparkles, 
  ArrowLeft, 
  Code2, 
  Database, 
  Activity,
  Play,
  Clock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { db } from '../lib/firebase';
import { 
  LabProject, 
  LabVideo, 
  DEFAULT_LAB_PROJECTS, 
  DEFAULT_LAB_VIDEOS,
  FIVERR_PROFILE_URL,
  WHATSAPP_DIRECT_URL,
  ARCHITECT_EMAIL 
} from '../data/syncOpsData';

// Helper to normalize any YouTube watch/short URL into an embed URL
export function formatYoutubeEmbedUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.includes('/embed/')) return trimmed;
  
  const watchMatch = trimmed.match(/[?&]v=([^&#]+)/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  const shortMatch = trimmed.match(/youtu\.be\/([^?&#]+)/);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  return trimmed;
}

export const Labs: React.FC = () => {
  const [projects, setProjects] = useState<LabProject[]>([]);
  const [videos, setVideos] = useState<LabVideo[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    document.title = 'SyncOps Labs | Internal Engineering Sandbox';
    let isMounted = true;

    async function loadLabData() {
      // 1. Fetch Lab Projects from Firestore 'lab_projects'
      try {
        const projColRef = collection(db, 'lab_projects');
        const projSnap = await getDocs(projColRef);
        if (!projSnap.empty && isMounted) {
          const fetchedProjects: LabProject[] = projSnap.docs.map((docSnap) => {
            const data = docSnap.data();
            let techList: string[] = [];
            if (Array.isArray(data.techStack)) {
              techList = data.techStack.filter((t: unknown) => typeof t === 'string' && t.trim().length > 0);
            } else if (typeof data.techStack === 'string') {
              techList = data.techStack.split(',').map((s: string) => s.trim()).filter(Boolean);
            }

            return {
              id: docSnap.id,
              name: data.name || 'Proprietary Project',
              description: data.description || '',
              techStack: techList.length > 0 ? techList : ['React Native', 'Firebase', 'TypeScript'],
              url: data.url || '#',
              category: data.category || 'Internal Application',
              badge: data.badge || 'Proprietary Software',
              imageUrl: data.imageUrl || '',
              createdAt: data.createdAt
            };
          });
          setProjects(fetchedProjects);
        } else if (isMounted) {
          setProjects(DEFAULT_LAB_PROJECTS);
        }
      } catch (err) {
        console.warn('Firestore lab_projects query notice:', err);
        if (isMounted) {
          setProjects(DEFAULT_LAB_PROJECTS);
        }
      } finally {
        if (isMounted) setLoadingProjects(false);
      }

      // 2. Fetch Lab Videos from Firestore 'lab_videos'
      try {
        const vidColRef = collection(db, 'lab_videos');
        const vidSnap = await getDocs(vidColRef);
        if (!vidSnap.empty && isMounted) {
          const fetchedVideos: LabVideo[] = vidSnap.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              title: data.title || 'Technical Architecture Breakdown',
              embedUrl: formatYoutubeEmbedUrl(data.embedUrl || data.url || ''),
              description: data.description || '',
              category: data.category || 'Engineering Insight',
              duration: data.duration || 'Deep-Dive',
              createdAt: data.createdAt
            };
          });
          setVideos(fetchedVideos);
        } else if (isMounted) {
          setVideos(DEFAULT_LAB_VIDEOS);
        }
      } catch (err) {
        console.warn('Firestore lab_videos query notice:', err);
        if (isMounted) {
          setVideos(DEFAULT_LAB_VIDEOS);
        }
      } finally {
        if (isMounted) setLoadingVideos(false);
      }
    }

    loadLabData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div id="syncops-labs-page" className="min-h-screen bg-slate-950 text-slate-300 antialiased flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Labs Header Bar */}
      <header id="labs-top-bar" className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo & Back to Main Funnel */}
            <div className="flex items-center gap-4">
              <Link
                to="/"
                id="labs-back-to-agency-btn"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white hover:border-slate-700 transition-all min-h-[40px]"
                title="Return to SyncOps Agency Main Services"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
                <span>Return to Agency</span>
              </Link>

              <div className="h-5 w-px bg-slate-800 hidden sm:block" />

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-sm">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-base sm:text-lg tracking-tight">SyncOps</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-[11px] font-mono font-bold tracking-wider uppercase">
                    Labs / R&amp;D
                  </span>
                </div>
              </div>
            </div>

            {/* Right Meta Badges */}
            <div className="flex items-center gap-3">
              <div className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active Internal Builds: {projects.length}</span>
              </div>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                id="labs-header-yt-channel"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-mono font-semibold transition-all min-h-[40px]"
              >
                <Youtube className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">Engineering Channel</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Hero & Content Canvas */}
      <main className="flex-1">
        {/* Hero Section */}
        <section id="labs-hero" className="relative py-16 sm:py-24 border-b border-slate-900 overflow-hidden">
          {/* Ambient Background Lighting Gradients */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none -z-10"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 right-10 w-[500px] h-[300px] bg-emerald-500/5 blur-[130px] rounded-full pointer-events-none -z-10"
            aria-hidden="true"
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-indigo-400 text-xs font-mono mb-6 shadow-sm">
              <Terminal className="w-3.5 h-3.5" />
              <span>PROPRIETARY R&amp;D SHOWCASE • SEPARATE FROM CLIENT AGENCY</span>
            </div>

            <h1
              id="labs-hero-title"
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight"
            >
              SyncOps Labs: Internal Engineering Sandbox.
            </h1>

            <p
              id="labs-hero-subtitle"
              className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal"
            >
              We don't just architect telemetry for enterprise clients; we engineer, deploy, and scale our own proprietary software applications.
            </p>

            {/* Quick Metrics Bar */}
            <div className="mt-10 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-left">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">Architecture</span>
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  Full-Stack &amp; Native
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">Infrastructure</span>
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Firebase &amp; Cloud Run
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm col-span-2 sm:col-span-1">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">Telemetry Rigor</span>
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  100% In-House Tested
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION A: Proprietary Software (Dark-mode Glassmorphic Grid) */}
        <section id="labs-proprietary-software" className="py-20 sm:py-28 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 mb-2">
                  <Layers className="w-3.5 h-3.5" />
                  <span>SECTION A • PRODUCTION BUILDS</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Proprietary Software Applications
                </h2>
                <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
                  Explore internal mobile and web platforms engineered from conception to production deployment by the SyncOps engineering core.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500 self-start md:self-auto">
                Dynamic Sync: Firestore (lab_projects)
              </span>
            </div>

            {loadingProjects ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-xs font-mono text-slate-400">Loading proprietary applications...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    id={`lab-project-card-${project.id}`}
                    className="group relative rounded-3xl bg-slate-900/70 border border-slate-800/90 hover:border-indigo-500/50 p-6 sm:p-8 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
                  >
                    {/* Top ambient glow on hover */}
                    <div
                      className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none"
                      aria-hidden="true"
                    />

                    <div>
                      {/* Badge and Category */}
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="text-[11px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 tracking-wider">
                          {project.badge || 'Proprietary Software'}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {project.category || 'Internal App'}
                        </span>
                      </div>

                      {/* App Name */}
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                        {project.name}
                      </h3>

                      {/* Description */}
                      <p className="text-sm sm:text-base text-slate-300 mt-3.5 leading-relaxed font-normal">
                        {project.description}
                      </p>

                      {/* Tech Stack Metrics */}
                      <div className="mt-6 pt-5 border-t border-slate-800/80">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2.5 flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Engineered Tech Stack:</span>
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {project.techStack.map((tech, idx) => (
                            <span
                              key={idx}
                              className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 group-hover:border-slate-700 transition-colors"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Action: View Application Ghost Button */}
                    <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                        <Activity className="w-3.5 h-3.5 animate-pulse" />
                        <span>Production Status: Live</span>
                      </div>

                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        id={`btn-view-app-${project.id}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-transparent hover:bg-indigo-600/10 text-indigo-300 hover:text-white border border-indigo-500/40 hover:border-indigo-500 text-xs font-mono font-bold transition-all min-h-[44px] cursor-pointer shadow-sm hover:shadow-indigo-950/50"
                      >
                        <span>View Application</span>
                        <ExternalLink className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SECTION B: Engineering Insights (YouTube Video Grid) */}
        <section id="labs-engineering-insights" className="py-20 sm:py-28 relative border-t border-slate-900 bg-slate-950/80">
          {/* Ambient light for videos section */}
          <div
            className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[350px] bg-rose-500/5 blur-[140px] rounded-full pointer-events-none -z-10"
            aria-hidden="true"
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-rose-400 mb-2">
                  <Youtube className="w-4 h-4 text-rose-500" />
                  <span>SECTION B • TECHNICAL CHANNEL</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Engineering Insights &amp; Video Breakdowns
                </h2>
                <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
                  Deep-dive architectural reviews, server-side container walk-throughs, and code-level telemetry audits from our official YouTube technical channel.
                </p>
              </div>

              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                id="btn-labs-sub-youtube"
                className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold transition-all shadow-lg shadow-rose-950/40 min-h-[44px] cursor-pointer"
              >
                <Youtube className="w-4 h-4" />
                <span>Visit YouTube Channel</span>
              </a>
            </div>

            {loadingVideos ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-slate-800 border-t-rose-500 rounded-full animate-spin" />
                <p className="text-xs font-mono text-slate-400">Loading technical videos...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {videos.map((video) => {
                  const embedSrc = formatYoutubeEmbedUrl(video.embedUrl);

                  return (
                    <div
                      key={video.id}
                      id={`lab-video-card-${video.id}`}
                      className="rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 overflow-hidden shadow-2xl transition-all flex flex-col justify-between"
                    >
                      {/* Responsive YouTube Embed Container */}
                      <div className="relative w-full aspect-video bg-slate-950 border-b border-slate-800">
                        {embedSrc ? (
                          <iframe
                            className="w-full h-full"
                            src={embedSrc}
                            title={video.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2 p-6 text-center">
                            <Play className="w-8 h-8 text-rose-500" />
                            <span className="text-xs font-mono">Video stream ready in production</span>
                          </div>
                        )}
                      </div>

                      {/* Video Information */}
                      <div className="p-6 sm:p-8 space-y-3">
                        <div className="flex items-center justify-between gap-3 text-xs font-mono">
                          <span className="px-2.5 py-1 rounded bg-slate-950 text-indigo-400 border border-slate-800 font-semibold">
                            {video.category || 'Architecture Deep-Dive'}
                          </span>
                          {video.duration && (
                            <span className="text-slate-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{video.duration}</span>
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                          {video.title}
                        </h3>

                        {video.description && (
                          <p className="text-sm text-slate-300 leading-relaxed font-normal">
                            {video.description}
                          </p>
                        )}
                      </div>

                      {/* Video Footer Action */}
                      <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-slate-800/60">
                        <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Verified Technical Guide</span>
                        </span>
                        <a
                          href={video.embedUrl.replace('/embed/', '/watch?v=')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-rose-400 hover:text-rose-300 inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Open in YouTube</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Labs Footer */}
      <footer id="labs-footer" className="border-t border-slate-900 bg-slate-950 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-white font-bold text-base">SyncOps Labs</span>
                <span className="text-xs font-mono text-slate-400">• Internal R&amp;D Division</span>
              </div>
              <p className="text-xs text-slate-400">
                Proprietary intellectual property and experimental software engines.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors min-h-[40px] flex items-center"
              >
                ← Back to Agency Services
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-400 gap-4">
            <div>&copy; {new Date().getFullYear()} SyncOps Studio. All rights reserved.</div>
            <div className="flex items-center gap-3">
              <span>React Native</span>
              <span>&bull;</span>
              <span>Cloud Run</span>
              <span>&bull;</span>
              <span>Firebase</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
