import { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader3D } from './component/Loader3D';
import { ThemeToggle } from './component/ThemeToggle';
import { Navigation } from './component/Navigation';
import { HeroSection } from './component/HeroSection';
import { AboutSection } from './component/AboutSection';
import { ProjectsSection } from './component/ProjectsSection';
import { SkillsSection } from './component/SkillSection';
import { AchievementsSection } from './component/AchievementsSection';
import { AllAchievementsPage } from './component/AllAchievementsPage';
import { CosmicOrbit } from './component/CosmicOrbit';
import { useTheme } from './component/hooks/useTheme';
import { useScrollSpy } from './component/hooks/useScrollSpy';
import { ScrollProgress } from './component/ScrollProgress';
import { ArcReactorBackground } from './component/ArcReactorBackground';
import { useViewerLocation } from './component/hooks/useViewerLocation';
import { Toaster } from 'sonner';

// Lazy-load ContactSection (contains heavy HoloEarth/Three.js)
const ContactSection = lazy(() =>
  import('./component/ContactSection').then((m) => ({ default: m.ContactSection }))
);

// Pre-compute particle random values at module level for stable rendering
const PARTICLE_COUNT = 20;
const STARDUST_COUNT = 8;

const particleData = Array.from({ length: PARTICLE_COUNT }, () => ({
  yOffset: -120 - Math.random() * 50,
  xOffset: Math.random() * 100 - 50,
  duration: 10 + Math.random() * 8,
  delay: Math.random() * 10,
  size: 2 + Math.random() * 3,
  left: Math.random() * 100,
}));

const stardustData = Array.from({ length: STARDUST_COUNT }, () => ({
  duration: 3 + Math.random() * 2,
  delay: Math.random() * 5,
  left: Math.random() * 100,
  top: Math.random() * 100,
}));

function MainLayout() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { isDark, toggle } = useTheme();
  const { activeSection, scrollToSection } = useScrollSpy([
    'hero',
    'about', 
    'projects',
    'skills',
    'achievements',
    'contact'
  ]);

  // Collect viewer location IMMEDIATELY on app mount
  const { userLocation, viewers, locationError } = useViewerLocation();

  // Show/hide scroll-to-top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Memoize particle styles
  const particleStyles = useMemo(() =>
    particleData.map((p) => ({
      width: `${p.size}px`,
      height: `${p.size}px`,
      left: `${p.left}%`,
      bottom: '-20px',
      filter: 'blur(0.5px)',
    })),
  []);

  const stardustStyles = useMemo(() =>
    stardustData.map((s) => ({
      left: `${s.left}%`,
      top: `${s.top}%`,
      boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
    })),
  []);

  return (
    <div className="min-h-screen relative">
      {/* Arc Reactor Background for entire page */}
      <div className="fixed inset-0 z-0">
        <ArcReactorBackground isDark={isDark}/>
      </div>
      
      {/* Cosmic Orbit System */}
      <CosmicOrbit isDark={isDark} />

      {/* Theme Toggle */}
      <ThemeToggle isDark={isDark} toggle={toggle} />

      {/* Navigation */}
      <Navigation 
        activeSection={activeSection} 
        scrollToSection={scrollToSection}
        isDark={isDark}
      />

      {/* Page Sections */}
      <main className="relative z-10">
        {/* Scroll Progress Indicator */}
        <ScrollProgress />
        
        {/* Hero with Three.js Background */}
        <HeroSection isDark={isDark} />
        
        {/* Other Sections */}
        <AboutSection isDark={isDark} />
        <ProjectsSection isDark={isDark} />
        <SkillsSection isDark={isDark} />
        <AchievementsSection isDark={isDark} />
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className={`w-8 h-8 rounded-full border-2 border-t-transparent animate-spin ${isDark ? 'border-emerald-400' : 'border-teal-600'}`} />
          </div>
        }>
          <ContactSection isDark={isDark} userLocation={userLocation} viewers={viewers} locationError={locationError} />
        </Suspense>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className={`${
            isDark 
              ? 'bg-slate-900/95 border-slate-800' 
              : 'bg-gray-100/95 border-gray-300'
          } border-t py-8`}
        >
          <div className="container mx-auto px-6 text-center">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className={isDark ? 'text-slate-400' : 'text-gray-600'}
            >
              © {new Date().getFullYear()} Dipayan. Crafted with passion and precision.
            </motion.p>
            
            {/* Footer decorative elements */}
            <div className="flex justify-center mt-4 gap-4">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 4 + i,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className={`w-2 h-2 rounded-full ${
                    isDark ? 'bg-blue-400/30' : 'bg-blue-600/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.footer>
      </main>

      {/* Scroll to Top Button — only visible after scrolling down */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={() => scrollToSection('hero')}
            className={`fixed bottom-6 right-6 z-40 w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg flex items-center justify-center transition-all border ${
              isDark 
                ? 'bg-slate-800/80 border-slate-600/60 text-slate-200 hover:bg-white/15 hover:border-white/40 hover:text-white hover:shadow-[0_0_15px_rgba(241,245,249,0.2)]' 
                : 'bg-white/80 border-sky-200/80 text-sky-700 hover:bg-sky-100/80 hover:border-sky-400 hover:shadow-[0_0_15px_rgba(56,189,248,0.3)]'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5 dark:opacity-10 z-[5]">
        <motion.div 
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_50%)]" 
        />
        <motion.div 
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.08)_0%,transparent_60%)]" 
        />
      </div>

      {/* Global Particle System */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[5]">
        {particleData.map((p, i) => (
          <motion.div
            key={`particle-${i}`}
            animate={{
              y: [0, p.yOffset, 0],
              x: [0, p.xOffset, 0],
              opacity: [0, 0.8, 0],
              scale: [0.3, 1.2, 0.3],
              rotate: [0, 360],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
            className={`absolute rounded-full ${
              i % 3 === 0 ? 'bg-blue-400' : 
              i % 3 === 1 ? 'bg-purple-400' : 'bg-cyan-400'
            }`}
            style={particleStyles[i]}
          />
        ))}

        {stardustData.map((s, i) => (
          <motion.div
            key={`star-${i}`}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: s.duration,
              repeat: Infinity,
              delay: s.delay,
              ease: "easeInOut",
            }}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={stardustStyles[i]}
          />
        ))}
      </div>
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <div className="relative">
        <Toaster
          position="top-center"
          richColors
          theme={isDark ? 'dark' : 'light'}
        />

        <AnimatePresence>
          {loading && <Loader3D />}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: loading ? 0 : 1 }}
          transition={{ duration: 0.5, delay: loading ? 0 : 0.5 }}
          className="min-h-screen"
        >
          <Routes>
            <Route path="/" element={<MainLayout />} />
            <Route path="/achievements" element={<AllAchievementsPage />} />
          </Routes>
        </motion.div>
      </div>
    </BrowserRouter>
  );
}

export default App;