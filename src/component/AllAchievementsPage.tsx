import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  Award,
  Trophy,
  ExternalLink,
  ShieldCheck,
  Code2,
  Cloud,
  X,
  Filter,
  Sparkles,
  Calendar,
  Layers,
  TrendingUp,
  Flame,
  Zap,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getAchievements,
  fetchLeetCodeStats,
  type Achievement,
  type BadgeCategory,
  type LeetCodeFullProfile
} from '../data/achievementsData';
import { LeetCodeSolvedCard } from './ui/LeetCodeSolvedCard';
import { ArcReactorBackground } from './ArcReactorBackground';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from './hooks/useTheme';

// ─── Animated Counter ──────────────────────────────────────────────────────────
const AnimatedCounter = ({ value, duration = 1800 }: { value: number; duration?: number }) => {
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

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

export const AllAchievementsPage = () => {
  const { isDark, toggle } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [activeModalBadge, setActiveModalBadge] = useState<Achievement | null>(null);

  // Dynamic achievements state sourced from JSON database & local cache
  const [achievements, setAchievements] = useState<Achievement[]>(() => getAchievements());

  // Sync with /api/achievements server endpoint if available
  useEffect(() => {
    let cancelled = false;
    fetch('/api/achievements')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Endpoint not available');
      })
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setAchievements(data);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Live LeetCode data
  const [lcData, setLcData] = useState<LeetCodeFullProfile | null>(null);
  const [lcLoading, setLcLoading] = useState(true);
  const leetcodeUsername = import.meta.env.VITE_LEETCODE_USERNAME || '';

  useEffect(() => {
    if (!leetcodeUsername) { setLcLoading(false); return; }
    let cancelled = false;
    fetchLeetCodeStats(leetcodeUsername)
      .then((data) => { if (!cancelled) setLcData(data); })
      .catch(() => { })
      .finally(() => { if (!cancelled) setLcLoading(false); });
    return () => { cancelled = true; };
  }, [leetcodeUsername]);

  const categories: { id: BadgeCategory | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Badges', icon: <Layers className="w-4 h-4" /> },
    { id: 'leetcode', label: 'LeetCode', icon: <Code2 className="w-4 h-4 text-amber-500" /> },
    { id: 'google', label: 'Google Skill Boost', icon: <Cloud className="w-4 h-4 text-blue-500" /> },
    { id: 'certification', label: 'Certifications', icon: <Trophy className="w-4 h-4 text-purple-500" /> },
  ];

  // Dynamic filter based on JSON database achievements
  const filteredAchievements = useMemo(() => {
    return achievements.filter((badge) => {
      const matchesCategory = selectedCategory === 'all' || badge.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        badge.title.toLowerCase().includes(query) ||
        badge.issuer.toLowerCase().includes(query) ||
        badge.description.toLowerCase().includes(query) ||
        badge.skills.some((s) => s.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [achievements, selectedCategory, searchQuery]);

  const renderBadgeIcon = (type: Achievement['iconType'], imageUrl?: string) => {
    if (imageUrl) {
      return (
        <div className="w-10 h-10 rounded-xl bg-slate-800/20 border border-slate-700/40 flex items-center justify-center p-1 shrink-0 overflow-hidden">
          <img src={imageUrl} alt="Badge" className="w-full h-full object-contain rounded-lg" />
        </div>
      );
    }

    switch (type) {
      case 'leetcode':
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center p-2 shrink-0 text-amber-500">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
            </svg>
          </div>
        );
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
      case 'aws':
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center p-2 shrink-0 text-amber-500 font-extrabold text-xs">
            AWS
          </div>
        );
      case 'coursera':
        return (
          <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center p-2 shrink-0 text-blue-500 font-bold text-xs">
            Coursera
          </div>
        );
      case 'hackerrank':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
        );
      case 'badge':
        return (
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
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

  const formatTimestamp = (ts: string) => {
    const date = new Date(parseInt(ts) * 1000);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="fixed inset-0 z-0">
        <ArcReactorBackground isDark={isDark} />
      </div>
      <ThemeToggle isDark={isDark} toggle={toggle} />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b ${isDark ? 'bg-slate-950/80 border-slate-800/80 text-white' : 'bg-white/80 border-slate-200 text-slate-900'
        }`}>
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className={`inline-flex items-center gap-2 font-semibold text-sm px-4 py-2 rounded-full border transition-all ${isDark ? 'border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white hover:border-sky-500/50' : 'border-slate-200 bg-white/70 text-slate-700 hover:text-sky-800 hover:border-sky-300'
            }`}>
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-bold tracking-wide text-base">Achievements Vault</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-28 pb-20 container mx-auto px-6 max-w-6xl">

        {/* Hero Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live Stats & Verified Credentials</span>
          </div>
          <h1 className={`text-4xl md:text-6xl font-extrabold mb-4 tracking-tight ${isDark ? 'text-[#D4A853]' : 'text-slate-800'
            }`}>
            All Achievements
          </h1>
          <p className={`text-base md:text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Complete repository of live LeetCode stats, Google Cloud badges, and verified certifications.
          </p>
        </motion.div>

        {/* ─── Live LeetCode Overview Panel ─────────────────────────────── */}
        {leetcodeUsername && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`rounded-3xl border p-6 md:p-8 mb-10 backdrop-blur-xl relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-800/40 border-slate-700/60' : 'bg-gradient-to-br from-white/90 to-slate-50/90 border-slate-200 shadow-xl'
              }`}
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
                  </svg>
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>LeetCode Dashboard</h3>
                  <p className={`text-xs flex items-center gap-1.5 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`}>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    @{leetcodeUsername} — Live Data
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              {lcLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className={`w-8 h-8 rounded-full border-2 border-t-transparent animate-spin ${isDark ? 'border-amber-400' : 'border-amber-600'}`} />
                  <p className={`text-sm animate-pulse ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Syncing with LeetCode...</p>
                </div>
              ) : lcData ? (
                <div className="space-y-6">
                  {/* LeetCode Circular Solved Meter & Difficulty Breakdown */}
                  <LeetCodeSolvedCard stats={lcData.stats} isDark={isDark} />

                  {/* Stats Grid (Side Row-Wise Layout) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {[
                      { label: 'Total Solved', value: lcData.stats.totalSolved, icon: <Code2 className="w-4 h-4" />, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
                      { label: 'Easy', value: lcData.stats.easySolved, icon: <CheckCircle className="w-4 h-4" />, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                      { label: 'Medium', value: lcData.stats.mediumSolved, icon: <Flame className="w-4 h-4" />, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                      { label: 'Hard', value: lcData.stats.hardSolved, icon: <Zap className="w-4 h-4" />, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
                      { label: 'Contest Rating', value: lcData.contest.contestRating, icon: <TrendingUp className="w-4 h-4" />, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
                    ].map((item) => (
                      <div key={item.label} className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${isDark ? 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600' : 'bg-white/60 border-slate-200 hover:border-slate-300'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${item.color}`}>
                          {item.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`text-xl font-extrabold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            <AnimatedCounter value={item.value} />
                          </div>
                          <div className={`text-xs font-medium truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recent Submissions */}
                  {lcData.recentSubmissions.length > 0 && (
                    <div>
                      <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <Clock className="w-4 h-4 text-amber-400" />
                        Recent Submissions
                      </h4>
                      <div className="space-y-2">
                        {lcData.recentSubmissions.slice(0, 5).map((sub, i) => (
                          <motion.div
                            key={`${sub.titleSlug}-${i}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-800/60' : 'bg-white/50 border-slate-200 hover:bg-white/80'
                              } transition-colors`}
                          >
                            <div className="flex items-center gap-3">
                              {sub.statusDisplay === 'Accepted' ? (
                                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                              )}
                              <div>
                                <a href={`https://leetcode.com/problems/${sub.titleSlug}/`} target="_blank" rel="noopener noreferrer"
                                  className={`text-sm font-medium hover:underline ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  {sub.title}
                                </a>
                                <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                  {sub.lang}
                                </span>
                              </div>
                            </div>
                            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              {sub.timestamp ? formatTimestamp(sub.timestamp) : ''}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* LeetCode Badges */}
                  {lcData.badges.length > 0 && (
                    <div>
                      <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <Award className="w-4 h-4 text-amber-400" />
                        LeetCode Badges ({lcData.badges.length})
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {lcData.badges.map((badge, i) => (
                          <motion.div
                            key={badge.id || i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -3, scale: 1.05 }}
                            className={`px-4 py-3 rounded-xl border flex items-center gap-3 transition-all ${isDark ? 'bg-slate-800/60 border-amber-500/20 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]' : 'bg-white/80 border-amber-200 hover:border-amber-400 hover:shadow-lg'
                              }`}
                          >
                            {badge.icon ? (
                              <img src={badge.icon} alt={badge.displayName} className="w-8 h-8 rounded-lg" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                <Award className="w-4 h-4 text-amber-400" />
                              </div>
                            )}
                            <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                              {badge.displayName}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </motion.div>
        )}

        {/* ─── Search & Category Filters ─────────────────────────────────── */}
        <div className="max-w-6xl mx-auto mb-10 space-y-4">
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, issuer, or skills..."
              className={`w-full pl-12 pr-10 py-3.5 rounded-2xl border backdrop-blur-md outline-none transition-all ${isDark ? 'bg-slate-900/80 border-slate-800 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20' : 'bg-white/90 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                }`}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all border ${selectedCategory === cat.id
                  ? isDark ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-amber-600 border-amber-600 text-white shadow-md'
                  : isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80' : 'bg-white/80 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="max-w-6xl mx-auto flex items-center justify-between mb-6 px-2">
          <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Showing {filteredAchievements.length} of {achievements.length} Badges
          </span>
        </div>

        {/* ─── Achievement Cards ─────────────────────────────────────────── */}
        {filteredAchievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredAchievements.map((badge, idx) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => setActiveModalBadge(badge)}
                className={`p-6 rounded-2xl border backdrop-blur-md flex flex-col justify-between cursor-pointer transition-all group ${isDark ? 'bg-slate-900/70 border-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]' : 'bg-white/90 border-slate-200 hover:border-sky-400 hover:shadow-xl'
                  }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {renderBadgeIcon(badge.iconType, badge.badgeImageUrl)}
                      <div>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badge.category === 'leetcode' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          badge.category === 'google' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          }`}>
                          {badge.issuer}
                        </span>
                        <h3 className={`text-lg font-bold mt-1 group-hover:text-cyan-400 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {badge.title}
                        </h3>
                      </div>
                    </div>
                    {badge.date && (
                      <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Calendar className="w-3 h-3" />
                        {badge.date}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mb-4 line-clamp-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{badge.description}</p>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {badge.skills.map((skill) => (
                      <span key={skill} className={`text-xs px-2.5 py-1 rounded-md border ${isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-slate-800/50' : 'border-slate-200'}`}>
                    <span className="text-xs font-medium text-sky-400 group-hover:underline">Click to view details</span>
                    {badge.verificationUrl && (
                      <a href={badge.verificationUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                        className={`p-1.5 rounded-lg border transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40' : 'bg-slate-100 text-slate-700 hover:text-sky-600 hover:border-sky-300'}`}
                        title="Verify credential">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 max-w-md mx-auto">
            <Filter className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>No Badges Found</h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>No achievements match your search.</p>
            <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} className="px-6 py-2.5 rounded-full bg-amber-500 text-white font-medium text-sm hover:bg-amber-600 transition-colors">
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* ─── Detail Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeModalBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModalBadge(null)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative z-10 w-full max-w-lg rounded-3xl p-6 md:p-8 border shadow-2xl backdrop-blur-xl ${isDark ? 'bg-slate-900/95 border-slate-700 text-white' : 'bg-white/95 border-slate-300 text-slate-900'}`}
            >
              <button onClick={() => setActiveModalBadge(null)} className="absolute top-6 right-6 p-2 rounded-full border border-slate-700 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                {renderBadgeIcon(activeModalBadge.iconType, activeModalBadge.badgeImageUrl)}
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">{activeModalBadge.issuer}</span>
                  <h3 className="text-2xl font-bold">{activeModalBadge.title}</h3>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Overview</h4>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{activeModalBadge.description}</p>
                </div>
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeModalBadge.skills.map((s) => (
                      <span key={s} className={`text-xs px-3 py-1 rounded-lg border font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-cyan-300' : 'bg-sky-50 border-sky-200 text-sky-800'}`}>{s}</span>
                    ))}
                  </div>
                </div>
                {activeModalBadge.level && (
                  <div className="flex items-center justify-between pt-2">
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Proficiency Level</span>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">{activeModalBadge.level}</span>
                  </div>
                )}
              </div>

              {activeModalBadge.verificationUrl && (
                <a href={activeModalBadge.verificationUrl} target="_blank" rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-amber-500/25 transition-all">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Verify Credential</span>
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


