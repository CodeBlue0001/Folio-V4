import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface NavigationProps {
  activeSection: string;
  scrollToSection: (section: string) => void;
  isDark?: boolean;
}

export const Navigation = ({ activeSection, scrollToSection, isDark = true }: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  // Close mobile menu on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        mobileButtonRef.current &&
        !mobileButtonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const navItems = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`hidden md:flex fixed top-6 left-1/2 -translate-x-1/2 z-50 gap-2 backdrop-blur-md ${isDark
          ? 'bg-slate-900/60 border-slate-700/60 shadow-black/40'
          : 'bg-white/70 border-sky-200/80 shadow-sky-200/30'
          } px-5 py-2 rounded-full border shadow-lg`}
      >
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={`px-3.5 py-1.5 rounded-full transition-all font-medium text-xs sm:text-sm border ${activeSection === item.id
              ? isDark
                ? 'bg-gradient-to-r from-sky-500/20 to-cyan-400/20 border-sky-500/40 text-sky-300 shadow-[0_0_12px_rgba(125,211,252,0.25)]'
                : 'bg-sky-100 border-sky-300/80 text-sky-800 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
              : isDark
                ? 'border-transparent text-slate-300 hover:text-white hover:bg-white/10 hover:shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                : 'border-transparent text-slate-700 hover:text-sky-800 hover:bg-sky-200/80 hover:shadow-[0_0_12px_rgba(56,189,248,0.35)]'
              }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {item.label}
          </motion.button>
        ))}
        <motion.a
          href="/Dipayan_Sardar_Resume_2026_sept.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className={`px-3.5 py-1.5 rounded-full transition-all font-medium text-xs sm:text-sm border flex items-center justify-center ${isDark
            ? 'border-transparent text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 hover:shadow-[0_0_12px_rgba(52,211,153,0.15)]'
            : 'border-transparent text-green-700 hover:text-green-800 hover:bg-green-100 hover:shadow-[0_0_12px_rgba(74,222,128,0.15)]'
            }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Resume
        </motion.a>
      </motion.nav>

      {/* Mobile Navigation Button */}
      <motion.button
        ref={mobileButtonRef}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`md:hidden fixed top-6 left-6 z-50 p-3 rounded-full backdrop-blur-md ${isDark
          ? 'bg-slate-900/60 border-slate-700/60 hover:bg-white/10 hover:shadow-[0_0_12px_rgba(255,255,255,0.2)]'
          : 'bg-white/70 border-sky-200/80 hover:bg-sky-200/80 hover:shadow-[0_0_12px_rgba(56,189,248,0.25)]'
          } border shadow-lg transition-all`}
      >
        {isOpen ? (
          <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-slate-800'}`} />
        ) : (
          <Menu className={`w-6 h-6 ${isDark ? 'text-white' : 'text-slate-800'}`} />
        )}
      </motion.button>

      {/* Mobile Navigation Menu */}
      <motion.div
        ref={mobileMenuRef}
        initial={{ opacity: 0, x: -100 }}
        animate={{
          opacity: isOpen ? 1 : 0,
          x: isOpen ? 0 : -100,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        transition={{ duration: 0.3 }}
        className={`md:hidden fixed top-20 left-6 z-40 backdrop-blur-md ${isDark
          ? 'bg-slate-900/90 border-slate-700/60 shadow-black/50'
          : 'bg-white/90 border-sky-200/80 shadow-sky-200/30'
          } rounded-2xl border shadow-lg overflow-hidden`}
      >
        <div className="flex flex-col p-2">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => {
                scrollToSection(item.id);
                setIsOpen(false);
              }}
              className={`px-6 py-3 rounded-lg text-left transition-all font-medium border ${activeSection === item.id
                ? isDark
                  ? 'bg-gradient-to-r from-sky-500/20 to-cyan-400/20 border-sky-500/40 text-sky-300'
                  : 'bg-sky-100 border-sky-300/80 text-sky-800'
                : isDark
                  ? 'border-transparent text-slate-300 hover:text-white hover:bg-white/10 hover:shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                  : 'border-transparent text-slate-700 hover:text-sky-800 hover:bg-sky-200/80 hover:shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                }`}
              whileTap={{ scale: 0.95 }}
            >
              {item.label}
            </motion.button>
          ))}
          <motion.a
            href="Dipayan_Sardar_Resume_2026_sept.pdf"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className={`px-6 py-3 rounded-lg text-left transition-all font-medium border flex items-center justify-between ${isDark
              ? 'border-transparent text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
              : 'border-transparent text-green-700 hover:text-green-800 hover:bg-green-100'
              }`}
            whileTap={{ scale: 0.95 }}
          >
            Resume
          </motion.a>
        </div>
      </motion.div>
    </>
  );
};