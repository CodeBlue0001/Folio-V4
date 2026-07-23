import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  toggle: () => void;
}

export const ThemeToggle = ({ isDark, toggle }: ThemeToggleProps) => {
  return (
    <motion.button
      onClick={toggle}
      className={`fixed top-6 right-6 z-50 p-3 md:p-4 rounded-full backdrop-blur-md transition-all border shadow-lg ${
        isDark 
          ? 'bg-slate-900/60 border-slate-700/60 text-slate-100 hover:bg-white/10 hover:shadow-[0_0_15px_rgba(241,245,249,0.2)] hover:border-white/30' 
          : 'bg-white/70 border-sky-200/80 text-sky-700 hover:bg-sky-100/80 hover:shadow-[0_0_15px_rgba(56,189,248,0.25)] hover:border-sky-400'
      }`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? (
          <Sun className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 md:w-6 md:h-6 text-sky-700" />
        )}
      </motion.div>
    </motion.button>
  );
};
