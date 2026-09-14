import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Lightbulb, Hexagon, X, ExternalLink } from 'lucide-react';
import { GitHubActivity } from './GitHubActivity';
import skillsData from '../data/skills.json';
import skillReposData from '../data/skill_repos.json';

const skillIcons: Record<string, React.ReactNode> = {
  "TypeScript": (
    <svg className="w-4 h-4 shrink-0 rounded" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#3178C6"/>
      <text x="12" y="16.5" fill="white" fontSize="11" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold" textAnchor="middle">TS</text>
    </svg>
  ),
  "JavaScript": (
    <svg className="w-4 h-4 shrink-0 rounded" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#F7DF1E"/>
      <text x="12" y="16.5" fill="black" fontSize="11" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold" textAnchor="middle">JS</text>
    </svg>
  ),
  "HTML": (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 0H22.5L20.25 21L12 24L3.75 21L1.5 0Z" fill="#E34F26"/>
      <path d="M12 2.25V21.75L18.75 19.3L20.625 2.25H12Z" fill="#F06529"/>
      <path d="M12 5.25H7.125L7.5 9H12V5.25ZM12 10.5H7.625L8 14.25L12 15.38V10.5Z" fill="white"/>
      <path d="M12 5.25V9H16.5L16.125 12.75L12 13.88V15.38L16.88 14.06L17.625 5.25H12Z" fill="#EBEBEB"/>
    </svg>
  ),
  "CSS": (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 0H22.5L20.25 21L12 24L3.75 21L1.5 0Z" fill="#1572B6"/>
      <path d="M12 2.25V21.75L18.75 19.3L20.625 2.25H12Z" fill="#33A9DC"/>
      <path d="M12 5.25H7.125L7.5 9H12V5.25ZM12 10.5H7.625L8 14.25L12 15.38V10.5Z" fill="white"/>
      <path d="M12 5.25V9H16.5L16.125 12.75L12 13.88V15.38L16.88 14.06L17.625 5.25H12Z" fill="#EBEBEB"/>
    </svg>
  ),
  "Python": (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.9 0C5.33 0 5.67 2.89 5.67 2.89L5.68 5.75H12V6.63H3.25S0 7.03 0 12.1c0 5.07 2.84 4.88 2.84 4.88H5.2v-3.23s-.08-3.86 3.79-3.86h6.14s3.62-.05 3.62-3.52V2.89S18.75 0 11.9 0z" fill="#3776AB"/>
      <path d="M12.1 24c6.57 0 6.23-2.89 6.23-2.89l-.01-2.86H12v-.88h8.75s3.25-.4 3.25-5.47c0-5.07-2.84-4.88-2.84-4.88H18.8v3.23s.08 3.86-3.79 3.86H8.87s-3.62.05-3.62 3.52v3.52S5.25 24 12.1 24z" fill="#FFD43B"/>
      <circle cx="8.38" cy="2.93" r="0.8" fill="white"/>
      <circle cx="15.62" cy="21.07" r="0.8" fill="black"/>
    </svg>
  ),
  "Jupyter Notebook": (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9z" fill="#F37626"/>
      <circle cx="8" cy="12" r="2" fill="#E44D26"/>
      <circle cx="16" cy="12" r="2" fill="#F16529"/>
      <ellipse cx="12" cy="12" rx="7" ry="1.5" stroke="#F37626" strokeWidth="1.5" fill="none" />
    </svg>
  ),
  "EJS": (
    <svg className="w-4 h-4 shrink-0 rounded" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#B4CA65"/>
      <text x="12" y="16" fill="#3C3C3C" fontSize="10" fontFamily="monospace, Courier" fontWeight="bold" textAnchor="middle">&lt;%&gt;</text>
    </svg>
  ),
  "C": (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#A8B9CC"/>
      <path d="M17 7.5C15.8 6.3 14.1 5.5 12.2 5.5C8.2 5.5 5 8.7 5 12.7C5 16.7 8.2 19.9 12.2 19.9C14.2 19.9 15.9 19.1 17.1 17.8L14.7 15.5C14 16.3 13.1 16.7 12.1 16.7C9.9 16.7 8.2 14.9 8.2 12.7C8.2 10.5 9.9 8.7 12.1 8.7C13.2 8.7 14.1 9.2 14.8 9.9L17 7.5Z" fill="#3949AB"/>
    </svg>
  ),
  "PowerShell": (
    <svg className="w-4 h-4 shrink-0 rounded" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#012456"/>
      <path d="M4.5 7.5L10.5 12L4.5 16.5M12 16.5H19.5" stroke="#53A5DF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  "Batchfile": (
    <svg className="w-4 h-4 shrink-0 rounded" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#2D3748"/>
      <path d="M5 7.5L10 12L5 16.5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 16.5H18" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  "Hack": (
    <svg className="w-4 h-4 shrink-0 rounded" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#1A1A1A"/>
      <text x="12" y="16.5" fill="#4F5D95" fontSize="11" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold" textAnchor="middle">h</text>
    </svg>
  ),
  "Dockerfile": (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="10" width="3" height="3" fill="#0db7ed"/>
      <rect x="7" y="10" width="3" height="3" fill="#0db7ed"/>
      <rect x="11" y="10" width="3" height="3" fill="#0db7ed"/>
      <rect x="15" y="10" width="3" height="3" fill="#0db7ed"/>
      <rect x="7" y="6" width="3" height="3" fill="#0db7ed"/>
      <rect x="11" y="6" width="3" height="3" fill="#0db7ed"/>
      <rect x="15" y="6" width="3" height="3" fill="#0db7ed"/>
      <rect x="11" y="2" width="3" height="3" fill="#0db7ed"/>
      <path d="M1.5 14C1.5 19.5 5 21.5 10 21.5C17.5 21.5 21.5 17 22.5 14H1.5Z" fill="#0db7ed"/>
    </svg>
  ),
};

const getSkillIcon = (skill: string) => {
  return skillIcons[skill] || (
    <svg className="w-4 h-4 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"></polyline>
      <polyline points="8 6 2 12 8 18"></polyline>
    </svg>
  );
};

interface SkillsSectionProps {
  isDark?: boolean;
}

export const SkillsSection = ({ isDark = true }: SkillsSectionProps) => {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const skillCategories = [
    {
      title: 'Expert',
      description: 'Highly proficient, used in production environments regularly.',
      icon: BrainCircuit,
      skills: skillsData.expert || [],
      color: 'from-green-500 to-teal-500',
      borderColor: isDark ? 'border-blue-800' : 'border-blue-200',
      bgHover: isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200',
    },
    {
      title: 'Proficient',
      description: 'Comfortable using these independently for various projects.',
      icon: Lightbulb,
      skills: skillsData.proficient || [],
      color: 'from-yellow-500 to-orange-500',
      borderColor: isDark ? 'border-orange-900' : 'border-gray-300',
      bgHover: isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200',
    },
    {
      title: 'Familiar',
      description: 'Have prior experience, can pick up quickly if needed.',
      icon: Hexagon,
      skills: skillsData.familiar || [],
      color: 'from-orange-500 to-red-500',
      borderColor: isDark ? 'border-slate-800' : 'border-slate-200',
      bgHover: isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200',
    },
  ];

  const handleSkillClick = (skill: string) => {
    setSelectedSkill(skill);
    document.body.style.overflow = 'hidden';
  };

  const closePopup = () => {
    setSelectedSkill(null);
    document.body.style.overflow = 'auto';
  };

  const activeRepos = selectedSkill ? (skillReposData as Record<string, any[]>)[selectedSkill] || [] : [];

  // Close modal on Escape key
  useEffect(() => {
    if (!selectedSkill) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePopup();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedSkill]);

  return (
    <section id="skills" className={`relative min-h-screen py-12 sm:py-16 md:py-20 px-4 md:px-6 ${
      isDark 
        ? 'bg-gradient-to-b from-[#07101e] to-[#0c1a2e]' 
        : 'bg-gradient-to-b from-[#e8f4fd] to-[#dbeafe]'
    } overflow-hidden`}>
      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 sm:mb-3 bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent font-bold tracking-tight">
            Skills & Activity
          </h2>
          <p className={`text-xs sm:text-sm md:text-base max-w-xl mx-auto ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            My technical arsenal categorized by proficiency. Click any skill to explore the related repositories!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Skills Column */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            {skillCategories.map((category, idx) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className={`p-4 sm:p-5 md:p-6 rounded-2xl border backdrop-blur-sm shadow-md transition-all duration-300 group ${
                    isDark 
                      ? 'bg-slate-900/40 border-slate-800 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.08)]' 
                      : 'bg-white/60 border-gray-200 hover:border-sky-300 hover:shadow-[0_0_30px_rgba(14,165,233,0.12)]'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3.5 sm:mb-4">
                    <div className={`p-2 sm:p-2.5 rounded-xl bg-gradient-to-br ${category.color} text-white shadow-md shrink-0 w-fit`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h3 className={`text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                        {category.title}
                      </h3>
                      <p className={`text-xs sm:text-sm mt-0.5 transition-colors ${isDark ? 'text-slate-400 group-hover:text-slate-350' : 'text-slate-650 group-hover:text-slate-750'}`}>
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:gap-2.5">
                    {category.skills.map((skill) => (
                      <motion.button
                        key={skill}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSkillClick(skill)}
                        className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium border transition-all ${
                          isDark 
                            ? 'bg-[#0c1a2e]/50 border-slate-800 text-slate-300 hover:border-white/40 hover:text-white hover:bg-white/5 hover:shadow-[0_0_15px_rgba(241,245,249,0.15)]' 
                            : 'bg-white border-slate-200 text-slate-700 hover:border-sky-400 hover:text-sky-600 hover:bg-sky-100/80 hover:shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                        } shadow-sm cursor-pointer flex items-center gap-2`}
                      >
                        {getSkillIcon(skill)}
                        <span>{skill}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* GitHub Activity Column */}
          <div className="lg:col-span-5 flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="h-full min-h-[400px] lg:sticky lg:top-24"
            >
              <GitHubActivity isDark={isDark} username={import.meta.env.VITE_GITHUB_USERNAME || ''} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Popup Modal for Skill Repositories */}
      <AnimatePresence>
        {selectedSkill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePopup}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={`relative w-full max-w-2xl overflow-hidden flex flex-col rounded-3xl border shadow-2xl ${
                isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
              }`}
              style={{ maxHeight: '85vh' }}
            >
              {/* Modal Header */}
              <div className={`p-4 sm:p-6 flex items-center justify-between border-b shrink-0 ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 shrink-0">
                    {getSkillIcon(selectedSkill)}
                  </div>
                  <div>
                    <h3 className={`text-lg sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedSkill} Activities
                    </h3>
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Repositories using {selectedSkill}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closePopup}
                  className={`p-2 rounded-full ${isDark ? 'hover:bg-slate-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div 
                className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4 custom-scrollbar"
                style={{ maxHeight: '60vh' }}
              >
                <style>{`
                  .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: ${isDark ? 'rgba(56, 189, 248, 0.5) rgba(255, 255, 255, 0.05)' : 'rgba(2, 132, 199, 0.5) rgba(0, 0, 0, 0.05)'};
                  }
                  .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                  }
                  .custom-scrollbar::-webkit-scrollbar-track {
                    background: ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
                    border-radius: 9999px;
                  }
                  .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${isDark ? 'rgba(56, 189, 248, 0.5)' : 'rgba(2, 132, 199, 0.5)'};
                    border-radius: 9999px;
                  }
                  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: ${isDark ? 'rgba(56, 189, 248, 0.8)' : 'rgba(2, 132, 199, 0.8)'};
                  }
                `}</style>
                {activeRepos.length === 0 ? (
                  <p className={`text-center py-8 text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    No repositories found utilizing this skill.
                  </p>
                ) : (
                  activeRepos.map((repo, idx) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={repo.name}
                      className={`p-4 rounded-xl border ${
                        isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noreferrer"
                          className={`text-base sm:text-lg font-semibold hover:underline flex items-center gap-2 break-all ${
                            isDark ? 'text-cyan-400' : 'text-cyan-600'
                          }`}
                        >
                          {repo.name}
                          <ExternalLink className="w-4 h-4 shrink-0" />
                        </a>
                        <span className={`text-xs px-2 py-1 rounded-full border self-start sm:self-auto shrink-0 ${
                          isDark ? 'bg-slate-900 border-slate-600 text-gray-300' : 'bg-white border-gray-300 text-gray-600'
                        }`}>
                          ⭐ {repo.stars}
                        </span>
                      </div>
                      <p className={`text-xs sm:text-sm line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {repo.description || 'No description provided.'}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Decorative Background Elements */}
      <div className={`absolute top-1/4 left-0 w-72 h-72 rounded-full blur-[100px] opacity-20 pointer-events-none ${isDark ? 'bg-emerald-700' : 'bg-green-400'}`}></div>
      <div className={`absolute bottom-1/4 right-0 w-96 h-96 rounded-full blur-[100px] opacity-20 pointer-events-none ${isDark ? 'bg-amber-700' : 'bg-amber-300'}`}></div>
    </section>
  );
};
