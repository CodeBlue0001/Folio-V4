import { motion } from 'framer-motion';
import { ExternalLink, Github, FolderOpen, FolderGit2, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import projectsData from '../data/projects.json';
import { usePortfolioContent } from './hooks/usePortfolioContent';

interface ProjectsSectionProps {
  isDark?: boolean;
}

interface ProjectItem {
  title: string;
  description: string;
  tags: string[];
  url: string;
  demoUrl: string;
  stars: number;
  gradient: string;
}

const GITHUB_USERNAME: string = (import.meta as any).env?.VITE_GITHUB_USERNAME || "";

const DEFAULT_GRADIENTS = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-orange-500 to-red-500",
  "from-emerald-500 to-teal-500",
  "from-indigo-500 to-violet-500",
  "from-amber-500 to-yellow-500",
];

export const ProjectsSection = ({ isDark = true }: ProjectsSectionProps) => {
  const { getThemeColors } = usePortfolioContent();
  const { headingColor } = getThemeColors(isDark);

  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    try {
      const cached = localStorage.getItem("_gh_repos");
      if (cached) {
        const p = JSON.parse(cached);
        if (p?.d?.length) {
          return p.d.slice(0, 6).map((r: any, idx: number): ProjectItem => ({
            title: r.name,
            description: r.description || "Open-source project on GitHub.",
            tags: r.topics?.length ? r.topics.slice(0, 3) : [r.language || 'Code'],
            url: r.html_url,
            demoUrl: r.liveUrl || r.homepage || "",
            stars: r.stargazers_count || 0,
            gradient: projectsData[idx]?.gradient || DEFAULT_GRADIENTS[idx % DEFAULT_GRADIENTS.length]
          }));
        }
      }
    } catch { }
    return (projectsData as ProjectItem[]) || [];
  });

  useEffect(() => {
    const fetchLiveProjects = async () => {
      try {
        let raw: any[] = [];
        try {
          const proxyUrl = GITHUB_USERNAME ? `/api/github/repos/${encodeURIComponent(GITHUB_USERNAME)}` : '/api/github/repos';
          const res = await fetch(proxyUrl);
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json.repos) && json.repos.length) raw = json.repos;
          }
        } catch {}

        if (!raw.length && GITHUB_USERNAME) {
          const direct = await fetch(`https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}/repos?sort=updated&per_page=12`);
          if (direct.ok) raw = await direct.json();
        }

        if (raw.length) {
          const mapped = raw.slice(0, 6).map((r: any, idx: number): ProjectItem => ({
            title: r.name,
            description: r.description || "Open-source project on GitHub.",
            tags: r.topics?.length ? r.topics.slice(0, 3) : [r.language || 'Code'],
            url: r.html_url,
            demoUrl: r.homepage && !(GITHUB_USERNAME && r.homepage.includes(`github.com/${GITHUB_USERNAME}/${r.name}`)) ? r.homepage : "",
            stars: r.stargazers_count || 0,
            gradient: projectsData[idx]?.gradient || DEFAULT_GRADIENTS[idx % DEFAULT_GRADIENTS.length]
          }));
          setProjects(mapped);
        }
      } catch {}
    };

    fetchLiveProjects();
    const interval = setInterval(fetchLiveProjects, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="projects" className={`relative min-h-screen py-12 sm:py-16 md:py-20 px-4 md:px-6 ${
      isDark 
        ? 'bg-gradient-to-b from-[#0c1a2e] to-[#07101e]' 
        : 'bg-gradient-to-b from-[#dbeafe] to-[#e8f4fd]'
    }`}>
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 sm:mb-3 font-bold tracking-tight transition-colors"
            style={{ color: headingColor }}
          >
            Featured Projects
          </h2>
          <p className={`text-xs sm:text-sm md:text-base max-w-2xl mx-auto ${
            isDark ? 'text-[#CBD5E1]' : 'text-slate-600'
          }`}>
            A showcase of my recent work and creative solutions
          </p>
        </motion.div>

        {/* Mobile View - Clean Minimal Cards (No extra images or accordion button) */}
        <div className="grid md:hidden grid-cols-1 gap-3.5 sm:gap-4">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              className={`rounded-xl border p-4 transition-all ${
                isDark
                  ? 'bg-slate-900/60 border-slate-800/90 shadow-md shadow-black/25'
                  : 'bg-white/85 border-sky-100 shadow-sm shadow-sky-900/5'
              } backdrop-blur-sm`}
            >
              {/* Header: Title & Optional Stars */}
              <div className="flex items-start justify-between gap-2.5 mb-1.5">
                <h3
                  className={`text-sm sm:text-base font-bold tracking-tight leading-snug ${
                    isDark ? 'text-slate-100' : 'text-slate-850'
                  }`}
                >
                  {project.title}
                </h3>
                {project.stars > 0 && (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full shrink-0 font-medium ${
                      isDark
                        ? 'bg-amber-950/40 text-amber-300 border border-amber-800/40'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    ★ {project.stars}
                  </span>
                )}
              </div>

              {/* Description */}
              <p
                className={`text-xs mb-2.5 line-clamp-2 leading-relaxed ${
                  isDark ? 'text-[#CBD5E1]' : 'text-slate-600'
                }`}
              >
                {project.description}
              </p>

              {/* Tech Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded-md border ${
                      isDark
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div
                className={`flex items-center gap-2.5 pt-2.5 border-t ${
                  isDark ? 'border-slate-800/80' : 'border-slate-100'
                }`}
              >
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isDark
                        ? 'bg-slate-800/70 hover:bg-slate-700 text-slate-200 border border-slate-700/60'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>Code</span>
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isDark
                        ? 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30'
                        : 'bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop View - Grid Layout */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className={`group relative ${
                isDark 
                  ? 'bg-slate-900/50 border-slate-800 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.08)]' 
                  : 'bg-white/70 border-gray-200 hover:border-sky-300 hover:shadow-[0_0_30px_rgba(14,165,233,0.12)]'
              } backdrop-blur-sm rounded-2xl overflow-hidden border shadow-xl transition-all`}
            >
              {/* Image Placeholder */}
              <div className="relative h-28 sm:h-32 md:h-36 flex items-center justify-center overflow-hidden">
                <div className={`absolute inset-0 ${
                  isDark ? 'bg-slate-800/80' : 'bg-slate-100'
                } transition-colors`} />
                <FolderOpen className={`w-10 h-10 ${isDark ? 'text-[#D4A853]' : 'text-slate-700'} relative z-10 transition-transform group-hover:scale-110`} />
              </div>

              {/* Content */}
              <div className="p-3.5 sm:p-4 md:p-4.5">
                <h3 className={`text-base sm:text-lg md:text-xl font-bold mb-1.5 transition-colors ${
                  isDark 
                    ? 'text-slate-100 group-hover:text-[#D4A853]' 
                    : 'text-slate-800 group-hover:text-slate-900'
                }`}>
                  {project.title}
                </h3>
                <p className={`text-xs sm:text-sm mb-2.5 sm:mb-3 line-clamp-2 sm:line-clamp-3 transition-colors ${
                  isDark ? 'text-[#CBD5E1]' : 'text-slate-600'
                }`}>
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-2.5 sm:mb-3">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-2 sm:px-2.5 py-0.5 text-[11px] sm:text-xs ${
                        isDark 
                          ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50' 
                          : 'bg-green-50 text-green-700 border-green-200'
                      } rounded-full border`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex gap-3 sm:gap-4">
                  {project.url && (
                    <motion.a
                      href={project.url}
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-1.5 text-xs sm:text-sm ${
                        isDark 
                          ? 'text-gray-300 hover:text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      } transition-colors`}
                    >
                      <Github className="w-3.5 h-3.5" />
                      Code
                    </motion.a>
                  )}
                  {project.demoUrl && (
                    <motion.a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-1.5 text-xs sm:text-sm ${
                        isDark 
                          ? 'text-gray-300 hover:text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      } transition-colors`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Live Demo
                    </motion.a>
                  )}
                </div>
              </div>

              {/* Hover Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${
                isDark ? 'from-white/10' : 'from-sky-300/15'
              } to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
            </motion.div>
          ))}
        </div>

        {/* ─── View All Projects CTA ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mt-8 sm:mt-10 md:mt-12"
        >
          <Link to="/projects">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`group inline-flex items-center gap-2.5 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all shadow-lg font-medium border ${
                isDark
                  ? 'bg-slate-900/60 border-slate-700/80 hover:border-amber-400/80 hover:bg-slate-800/80 hover:shadow-[0_0_25px_rgba(251,191,36,0.25)]'
                  : 'bg-white/90 border-slate-200 hover:bg-sky-50 hover:border-sky-400 hover:shadow-[0_0_20px_rgba(56,189,248,0.25)]'
              }`}
            >
              <FolderGit2 className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isDark ? 'text-amber-400' : 'text-sky-600'} group-hover:rotate-6 transition-transform`} />
              <span className="rainbow-text-effect font-bold text-xs sm:text-sm">
                View All Projects &amp; Live Demos
              </span>
              <ArrowRight className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDark ? 'text-amber-400' : 'text-sky-600'} group-hover:translate-x-1 transition-transform`} />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
