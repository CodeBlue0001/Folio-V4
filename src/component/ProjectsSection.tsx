import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, FolderOpen, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface ProjectsSectionProps {
  isDark?: boolean;
}

import projectsData from '../data/projects.json';

export const ProjectsSection = ({ isDark = true }: ProjectsSectionProps) => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  
  const projects = projectsData || [];

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
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 sm:mb-4 md:mb-6 bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent font-bold tracking-tight">
            Featured Projects
          </h2>
          <p className={`text-sm sm:text-base md:text-lg lg:text-xl max-w-3xl mx-auto ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            A showcase of my recent work and creative solutions
          </p>
        </motion.div>

        {/* Mobile View - Collapsible Box */}
        <div className="block md:hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className={`${
              isDark 
                ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700' 
                : 'bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-300'
            } backdrop-blur-sm rounded-2xl border shadow-2xl overflow-hidden`}
          >
            {/* Header Button */}
            <motion.button
              onClick={() => setIsOpenMobile(!isOpenMobile)}
              className="w-full p-6 flex items-center justify-between"
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FolderOpen className={`w-6 h-6 ${
                    isDark ? 'text-amber-400' : 'text-amber-600'
                  }`} />
                </motion.div>
                <div className="text-left">
                  <h3 className={`text-xl ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>View Projects</h3>
                  <p className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>{projects.length} projects • Tap to explore</p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: isOpenMobile ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className={`w-6 h-6 ${
                  isDark ? 'text-amber-400' : 'text-amber-600'
                }`} />
              </motion.div>
            </motion.button>

            {/* Collapsible Content */}
            <AnimatePresence>
              {isOpenMobile && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className={`p-6 pt-0 space-y-4 border-t ${
                    isDark ? 'border-slate-700' : 'border-gray-300'
                  }`}>
                    {projects.map((project, index) => (
                      <motion.div
                        key={project.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`${
                          isDark 
                            ? 'bg-slate-900/50 border-slate-700' 
                            : 'bg-white/70 border-gray-300'
                        } rounded-xl overflow-hidden border`}
                      >
                        {/* Image Placeholder */}
                        <div className="relative h-32 flex items-center justify-center overflow-hidden">
                          <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} ${
                            isDark ? 'opacity-90' : 'opacity-80'
                          }`} />
                          <FolderOpen className="w-12 h-12 text-white/50 relative z-10" />
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h4 className={`text-base mb-2 ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {project.title}
                          </h4>
                          <p className={`text-xs mb-3 line-clamp-2 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {project.description}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {project.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`px-2 py-0.5 text-xs ${
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
                          <div className="flex gap-3">
                            {project.url && (
                              <a href={project.url} target="_blank" rel="noreferrer" className={`flex items-center gap-1.5 text-xs hover:underline ${
                                isDark ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                <Github className="w-3 h-3" />
                                Code
                              </a>
                            )}
                            {project.demoUrl && (
                              <a href={project.demoUrl} target="_blank" rel="noreferrer" className={`flex items-center gap-1.5 text-xs hover:underline ${
                                isDark ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                <ExternalLink className="w-3 h-3" />
                                Demo
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Desktop View - Grid Layout */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className={`group relative ${
                isDark 
                  ? 'bg-slate-900/50 border-slate-800 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.08)]' 
                  : 'bg-white/70 border-gray-200 hover:border-sky-300 hover:shadow-[0_0_30px_rgba(14,165,233,0.12)]'
              } backdrop-blur-sm rounded-2xl overflow-hidden border shadow-xl transition-all`}
            >
              {/* Image Placeholder */}
              <div className="relative h-36 sm:h-40 md:h-48 flex items-center justify-center overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} ${
                  isDark ? 'opacity-90' : 'opacity-80'
                } group-hover:opacity-100 transition-opacity`} />
                <FolderOpen className="w-16 h-16 text-white/50 relative z-10 transition-transform group-hover:scale-110" />
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5 md:p-6">
                <h3 className={`text-lg sm:text-xl md:text-2xl mb-2 sm:mb-3 transition-colors ${
                  isDark 
                    ? 'text-slate-100 group-hover:text-white group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]' 
                    : 'text-slate-800 group-hover:text-sky-600'
                }`}>
                  {project.title}
                </h3>
                <p className={`text-xs sm:text-sm md:text-base mb-3 sm:mb-4 line-clamp-3 transition-colors ${
                  isDark ? 'text-slate-400 group-hover:text-slate-350' : 'text-slate-600 group-hover:text-slate-700'
                }`}>
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-2 sm:px-3 py-1 text-xs ${
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
                      className={`flex items-center gap-2 text-xs sm:text-sm ${
                        isDark 
                          ? 'text-gray-300 hover:text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      } transition-colors`}
                    >
                      <Github className="w-3 h-3 sm:w-4 sm:h-4" />
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
                      className={`flex items-center gap-2 text-xs sm:text-sm ${
                        isDark 
                          ? 'text-gray-300 hover:text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      } transition-colors`}
                    >
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
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
      </div>
    </section>
  );
};
