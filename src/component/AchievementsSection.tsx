import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Award, ExternalLink, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchLeetCodeStats, type LeetCodeFullProfile } from '../data/achievementsData';
import { LeetCodeSolvedCard } from './ui/LeetCodeSolvedCard';
import { usePortfolioContent } from './hooks/usePortfolioContent';

interface AchievementsSectionProps {
  isDark?: boolean;
}

// ─── Animated Counter Component ────────────────────────────────────────────────
const AnimatedCounter = ({ value, duration = 2000, suffix = '' }: { value: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (value <= 0 || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// ─── Main Component ────────────────────────────────────────────────────────────
export const AchievementsSection = ({ isDark = true }: AchievementsSectionProps) => {
  const { getThemeColors } = usePortfolioContent();
  const { headingColor } = getThemeColors(isDark);
  const [lcData, setLcData] = useState<LeetCodeFullProfile | null>(null);
  const [lcLoading, setLcLoading] = useState(true);
  const [lcError, setLcError] = useState<string | null>(null);

  const leetcodeUsername = import.meta.env.VITE_LEETCODE_USERNAME || '';

  useEffect(() => {
    if (!leetcodeUsername) {
      setLcLoading(false);
      setLcError('Add VITE_LEETCODE_USERNAME to .env');
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        setLcLoading(true);
        const data = await fetchLeetCodeStats(leetcodeUsername);
        if (!cancelled) setLcData(data);
      } catch (err: any) {
        if (!cancelled) setLcError(err.message || 'Failed to fetch LeetCode stats');
      } finally {
        if (!cancelled) setLcLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [leetcodeUsername]);

  const stats = lcData?.stats;

  return (
    <section id="achievements" className="py-12 sm:py-16 md:py-20 px-4 md:px-6 relative z-10 overflow-hidden">
      <div className="container mx-auto max-w-6xl">

        {/* ─── Section Header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-medium mb-3 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Live Stats & Credentials</span>
            {/* Pulsing live dot */}
            <span className="relative flex h-1.5 w-1.5 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
          </div>

          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2 sm:mb-3 tracking-tight transition-colors"
            style={{ color: headingColor }}
          >
            Achievements & Badges
          </h2>
          <p className={`max-w-xl mx-auto text-xs sm:text-sm md:text-base ${isDark ? 'text-[#CBD5E1]' : 'text-slate-600'}`}>
            Real-time coding stats from LeetCode, cloud certifications, and competitive programming milestones.
          </p>
        </motion.div>

        {/* ─── Live LeetCode Dashboard ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className={`rounded-2xl border p-4 sm:p-5 md:p-6 mb-8 backdrop-blur-xl relative overflow-hidden ${isDark
            ? 'bg-slate-900/70 border-slate-800'
            : 'bg-white/90 border-slate-200 shadow-xl'
            }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-5 relative z-10">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-md ${
                isDark ? 'bg-slate-800 border border-slate-700 text-[#D4A853]' : 'bg-slate-100 border border-slate-200 text-slate-800'
              }`}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>LeetCode Live</h3>
                <p className={`text-[11px] flex items-center gap-1.5 flex-wrap ${isDark ? 'text-emerald-400' : 'text-teal-600'}`}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  {leetcodeUsername ? `@${leetcodeUsername}` : 'Configure username'}
                  {stats?.ranking ? (
                    <span className={`ml-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${isDark ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>
                      Global Rank #<AnimatedCounter value={stats.ranking} />
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
            {leetcodeUsername && (
              <a
                href={`https://leetcode.com/u/${leetcodeUsername}/`}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs font-medium flex items-center gap-1 transition-colors ${isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-700'}`}
              >
                View Profile <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Content */}
          <div className="relative z-10">
            {lcLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className={`w-8 h-8 rounded-full border-2 border-t-transparent animate-spin ${isDark ? 'border-amber-400' : 'border-amber-600'}`} />
                <p className={`text-sm animate-pulse ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fetching live stats from LeetCode...</p>
              </div>
            ) : lcError ? (
              <div className="text-center py-8">
                <p className={`text-sm mb-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>{lcError}</p>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Add VITE_LEETCODE_USERNAME to your .env file</p>
              </div>
            ) : stats ? (
              <div className="space-y-6">

                {/* ─── Row Layout: Difficulty Breakdown (Col 1) & LeetCode Badges (Col 2) ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  {/* Column 1: LeetCode Solved Gauge & Difficulty Cards */}
                  <LeetCodeSolvedCard stats={stats} isDark={isDark} />

                  {/* Column 2: LeetCode Badges */}
                  <div className={`rounded-2xl border p-5 flex flex-col justify-between ${isDark ? 'bg-slate-800/40 border-slate-700/40' : 'bg-white/50 border-slate-200'}`}>
                    <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-400" />
                        LeetCode Badges
                      </span>
                      {lcData && lcData.badges.length > 0 && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-100 text-amber-800'}`}>
                          {lcData.badges.length} Earned
                        </span>
                      )}
                    </h4>

                    {lcData && lcData.badges.length > 0 ? (
                      <div className="flex flex-wrap gap-3 max-h-[220px] overflow-y-auto p-1 scrollbar-thin">
                        {lcData.badges.map((badge, i) => (
                          <motion.div
                            key={badge.id || i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -4, scale: 1.08 }}
                            title={badge.displayName}
                            className={`relative w-[60px] h-[60px] min-w-[60px] min-h-[60px] rounded-2xl border flex items-center justify-center p-2 transition-all group cursor-pointer ${isDark
                              ? 'bg-slate-800/80 border-amber-500/30 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                              : 'bg-white border-amber-200 hover:border-amber-400 hover:shadow-lg'
                              }`}
                          >
                            {badge.icon ? (
                              <img src={badge.icon} alt={badge.displayName} className="w-10 h-10 object-contain rounded-lg transition-transform duration-300 group-hover:scale-110" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                <Award className="w-5 h-5 text-amber-400" />
                              </div>
                            )}

                            {/* Tooltip on hover */}
                            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 text-[10px] font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-20 border ${isDark ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-200'}`}>
                              {badge.displayName}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <Award className={`w-8 h-8 mb-2 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No LeetCode badges found</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className={`mt-6 pt-4 border-t flex justify-between items-center text-xs relative z-10 ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
            <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Powered by LeetCode API</span>
            <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Auto-refreshes on load</span>
          </div>
        </motion.div>


        {/* ─── View All CTA ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-6 sm:mt-8"
        >
          <Link to="/achievements">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all shadow-lg font-medium border text-xs sm:text-sm ${isDark
                ? 'bg-slate-900/50 border-slate-500/80 hover:border-white hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.25)]'
                : 'bg-white/80 border border-sky-100 hover:bg-sky-50/50 hover:border-sky-300 hover:shadow-[0_0_20px_rgba(125,211,252,0.25)]'
                }`}
            >
              <span className="rainbow-text-effect font-semibold">View All Achievements & Badges</span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
