import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, ExternalLink, ShieldCheck, Cloud, Sparkles, Zap } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeetcode } from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';
import { getFeaturedAchievements, fetchLeetCodeStats, type Achievement, type LeetCodeFullProfile } from '../data/achievementsData';
import { LeetCodeSolvedCard } from './ui/LeetCodeSolvedCard';
import { Button } from '../components/ui/button';

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
  const featuredBadges = getFeaturedAchievements();
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

  const renderProviderIcon = (type: Achievement['iconType']) => {
    switch (type) {
      case 'google':
        return (
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center p-2 shrink-0">
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>
        );
      case 'hackerrank':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-emerald-400">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" fill="none" strokeWidth="2" />
            </svg>
          </div>
        );
      case 'coursera':
        return (
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/30 flex items-center justify-center font-bold text-blue-400 text-xs shrink-0">
            <Award className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
        );
    }
  };

  const stats = lcData?.stats;

  return (
    <section id="achievements" className="py-24 relative z-10 overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl">

        {/* ─── Section Header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm font-medium mb-4 backdrop-blur-md">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Live Stats & Credentials</span>
            {/* Pulsing live dot */}
            <span className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>

          <h2 className={`text-4xl md:text-5xl font-extrabold mb-4 tracking-tight ${isDark
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-orange-400'
            : 'text-slate-900'
            }`}>
            Achievements & Badges
          </h2>
          <p className={`max-w-2xl mx-auto text-base md:text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Real-time coding stats from LeetCode, cloud certifications, and competitive programming milestones.
          </p>
        </motion.div>

        {/* ─── Live LeetCode Dashboard ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className={`rounded-3xl border p-6 md:p-8 mb-10 backdrop-blur-xl relative overflow-hidden ${isDark
            ? 'bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-800/40 border-slate-700/60'
            : 'bg-gradient-to-br from-white/90 via-white/80 to-slate-50/90 border-slate-200 shadow-xl'
            }`}
        >
          {/* Decorative glow blobs */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20 flex items-center justify-center">
                <FontAwesomeIcon icon={faLeetcode} className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>LeetCode Live</h3>
                <p className={`text-xs flex items-center gap-1.5 flex-wrap ${isDark ? 'text-emerald-400' : 'text-teal-600'}`}>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
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
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-20 border border-slate-700">
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
            <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Powered by alfa-leetcode-api</span>
            <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Auto-refreshes on load</span>
          </div>
        </motion.div>


        {/* ─── Certifications & Skill Badges ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Cloud className="w-5 h-5 text-blue-400" />
            Certifications & Cloud Badges
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredBadges.map((badge, idx) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                className={`group relative p-6 rounded-2xl border backdrop-blur-md flex flex-col justify-between transition-all overflow-hidden ${isDark
                  ? 'bg-slate-900/60 border-slate-800/80 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.12)]'
                  : 'bg-white/80 border-slate-200 hover:border-sky-300 hover:shadow-xl'
                  }`}
              >
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%]" style={{ transition: 'transform 0.8s ease' }} />

                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {renderProviderIcon(badge.iconType)}
                      <div>
                        <span className={`text-xs font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full border ${badge.category === 'google'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          }`}>
                          {badge.issuer}
                        </span>
                        <h4 className={`text-base font-bold mt-1.5 group-hover:text-cyan-400 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {badge.title}
                        </h4>
                      </div>
                    </div>
                    {badge.level && (
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 ${isDark ? 'bg-slate-800 text-cyan-300 border border-slate-700' : 'bg-slate-100 text-slate-700'}`}>
                        {badge.level}
                      </span>
                    )}
                  </div>

                  <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {badge.description}
                  </p>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {badge.skills.map((skill) => (
                      <span key={skill} className={`text-xs px-2.5 py-1 rounded-md border ${isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                        {skill}
                      </span>
                    ))}
                  </div>

                  {badge.verificationUrl && (
                    <a href={badge.verificationUrl} target="_blank" rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-sky-600 hover:text-sky-700'}`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <Button>Verify Credential</Button>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ─── View All CTA ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/achievements">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-full transition-all shadow-lg font-medium border ${isDark
                ? 'bg-slate-900/50 border-slate-500/80 hover:border-white hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.25)]'
                : 'bg-white/80 border border-sky-100 hover:bg-sky-50/50 hover:border-sky-300 hover:shadow-[0_0_20px_rgba(125,211,252,0.25)]'
                }`}
            >
              {/* <Award className="w-5 h-5 text-black-100 group-hover:rotate-12 transition-transform duration-300" /> */}
              <span className="rainbow-text-effect font-semibold" >View All Achievements & Badges</span>


            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
