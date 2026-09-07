import { motion } from 'framer-motion';
import ArcJarvisLoader from '../components/ArcJarvisLoader';
import { useState, useEffect } from 'react';

export const Loader3D = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 4000;
    const interval = 30;
    const steps = duration / interval;
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      currentStep++;
      setProgress((currentStep / steps) * 100);

      if (currentStep >= steps) {
        clearInterval(progressInterval);
      }
    }, interval);

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
    >
      <ArcJarvisLoader />

      {/* Responsive progress overlay centered directly under the 3D Arc reactor */}
      <div className="absolute inset-x-0 bottom-6 sm:bottom-8 md:bottom-10 flex flex-col items-center justify-center pointer-events-none z-10 px-4">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col items-center text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-xs sm:text-sm font-mono tracking-widest text-orange-400 uppercase mb-2 text-center"
          >
            Initializing System...
          </motion.p>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="w-full"
          >
            <div className="relative w-full h-1.5 sm:h-2 bg-gray-900/90 rounded-full overflow-hidden border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
            <motion.p className="text-orange-400/80 font-mono text-[10px] sm:text-xs mt-1.5 text-center tracking-wider">
              {Math.round(progress)}%
            </motion.p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
