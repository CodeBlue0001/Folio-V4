import { motion } from 'framer-motion';
import { ThreeBackground } from '../components/ThreeBackground';
import { ChevronDown } from 'lucide-react';
import { TypewriterHeading } from './TypewriterHeading';
import { usePortfolioContent } from './hooks/usePortfolioContent';

interface HeroSectionProps {
  isDark?: boolean;
}

export const HeroSection = ({ isDark = true }: HeroSectionProps) => {
  const { content } = usePortfolioContent();
  const heroVis = content.visibility?.hero;

  const threeThemes = {
    dark: {
      background: '#07101e',
      primary: '#34d399',
      secondary: '#fbbf24',
      tertiary: '#38bdf8'
    },
    light: {
      background: '#e8f4fd',
      primary: '#059669',
      secondary: '#d97706',
      tertiary: '#0284c7'
    }
  };

  return (
    <section id="hero" className="relative h-screen overflow-hidden">
      {/* Three.js Background */}
      {heroVis?.showThreeBackground !== false && (
        <div className="absolute inset-0 z-0">
          <ThreeBackground theme={threeThemes[isDark ? 'dark' : 'light']} />
        </div>
      )}

      {/* Overlay gradient for better text readability */}
      <div className={`absolute inset-0 z-[1] ${isDark
        ? 'bg-gradient-to-b from-transparent via-indigo-950/30 to-indigo-950/80'
        : 'bg-gradient-to-b from-transparent via-sky-100/30 to-sky-50/80'
        }`} />

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center max-w-5xl"
        >
          {heroVis?.showTypewriter !== false && (
            <motion.h1
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-4 md:mb-6 tracking-tight min-h-[72px] sm:min-h-[64px] md:min-h-[84px] lg:min-h-[100px] flex items-center justify-center font-bold"
            >
              <TypewriterHeading isDark={isDark} phrases={content.hero.phrases} />
            </motion.h1>
          )}

          {heroVis?.showSubtitle !== false && (
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className={`text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 max-w-3xl mx-auto ${isDark ? 'text-[#CBD5E1]' : 'text-slate-600'
                }`}
            >
              {content.hero.subtitle}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
              className={`w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-full transition-all shadow-lg font-medium border ${isDark
                ? 'bg-slate-900/50 border-slate-500/80 hover:border-white hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.25)]'
                : 'bg-white/80 border border-sky-100 hover:bg-sky-50/50 hover:border-sky-300 hover:shadow-[0_0_20px_rgba(125,211,252,0.25)]'
                }`}
            >
              <span className="rainbow-text-effect font-semibold">View Projects</span>
            </motion.button>

            {heroVis?.showResumeButton !== false && (
              <motion.a
                href={`/${content.hero.resumeFileName}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-full transition-all backdrop-blur-sm font-medium border text-center flex items-center justify-center ${isDark
                  ? 'bg-slate-900/50 border-emerald-500/80 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-500/10 hover:shadow-[0_0_20px_rgba(52,211,153,0.25)]'
                  : 'bg-white/80 border border-green-300 text-green-700 hover:border-green-400 hover:bg-green-50/50 hover:shadow-[0_0_20px_rgba(74,222,128,0.25)]'
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="font-semibold">View Resume</span>
              </motion.a>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className={`w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-full transition-all backdrop-blur-sm font-medium border-2 ${isDark
                ? 'border-slate-500/80 hover:border-white hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.25)]'
                : 'border-sky-200 hover:border-sky-300 hover:bg-sky-50/50 hover:shadow-[0_0_20px_rgba(125,211,252,0.25)]'
                }`}
            >
              <span className="sun-orange-text-effect font-semibold">Get in Touch</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        {heroVis?.showScrollIndicator !== false && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{
              opacity: { delay: 1, duration: 0.5 },
              y: { delay: 1.5, duration: 1.5, repeat: Infinity },
            }}
            className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className={`w-6 h-6 md:w-8 md:h-8 ${isDark ? 'text-amber-300/60' : 'text-sky-700/60'}`} />
          </motion.div>
        )}
      </div>
    </section>
  );
};