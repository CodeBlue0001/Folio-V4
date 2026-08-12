import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, ExternalLink, ShieldCheck, Cloud, Loader2 } from 'lucide-react';
import { fetchCertifications, getFeaturedAchievements, type Achievement } from '../data/achievementsData';
import { Button } from '../components/ui/button';

interface CertificationsProps {
  isDark?: boolean;
}

export const Certifications: React.FC<CertificationsProps> = ({ isDark = true }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const credlyUsername = import.meta.env.VITE_CREDLY_USERNAME || '';
  const gcsbProfileId = import.meta.env.VITE_GCSB_PROFILE_ID || '';

  useEffect(() => {
    let cancelled = false;

    const loadCertifications = async () => {
      setLoading(true);
      try {
        if (credlyUsername || gcsbProfileId) {
          const liveList = await fetchCertifications({ credlyUsername, gcsbProfileId });
          if (!cancelled) setAchievements(liveList);
        } else {
          // Fallback to static featured achievements if no env credentials configured
          if (!cancelled) setAchievements(getFeaturedAchievements());
        }
      } catch {
        if (!cancelled) setAchievements(getFeaturedAchievements());
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCertifications();
    return () => {
      cancelled = true;
    };
  }, [credlyUsername, gcsbProfileId]);

  const renderProviderIcon = (badge: Achievement) => {
    if (badge.badgeImageUrl) {
      return (
        <div className="w-10 h-10 rounded-xl bg-slate-800/20 border border-slate-700/40 flex items-center justify-center p-1 shrink-0 overflow-hidden">
          <img src={badge.badgeImageUrl} alt={badge.title} className="w-full h-full object-contain rounded-lg" />
        </div>
      );
    }

    switch (badge.iconType) {
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

  return (
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

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-3">
          <Loader2 className={`w-6 h-6 animate-spin ${isDark ? 'text-cyan-400' : 'text-sky-600'}`} />
          <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Fetching live certifications...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {achievements.map((badge, idx) => (
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
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%]"
                style={{ transition: 'transform 0.8s ease' }}
              />

              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    {renderProviderIcon(badge)}
                    <div>
                      <span
                        className={`text-xs font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full border ${badge.category === 'google'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          }`}
                      >
                        {badge.issuer}
                      </span>
                      <h4
                        className={`text-base font-bold mt-1.5 group-hover:text-cyan-400 transition-colors ${isDark ? 'text-white' : 'text-slate-900'
                          }`}
                      >
                        {badge.title}
                      </h4>
                    </div>
                  </div>
                  {badge.level && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 ${isDark
                        ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                        : 'bg-slate-100 text-slate-700'
                        }`}
                    >
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
                    <span
                      key={skill}
                      className={`text-xs px-2.5 py-1 rounded-md border ${isDark
                        ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {badge.verificationUrl && (
                  <a
                    href={badge.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-sky-600 hover:text-sky-700'
                      }`}
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
      )}
    </motion.div>
  );
};
