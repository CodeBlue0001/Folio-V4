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
      <br /><br />
      {/* 
        Responsive overlay: 
        - On mobile (small screens), use bottom anchoring so text never falls off-screen.
        - On desktop, position from the top at 60%.
      */}
      <div className="absolute inset-x-0 bottom-[1%] sm:bottom-[1%] md:bottom-auto md:top-[90%] flex flex-col items-center justify-center pointer-events-none" >
        <br /><br />
        <div className="text-bottom w-full max-w-xs sm:max-w-sm md:max-w-md px-6 sm:px-8">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-orange-400 mb-3 sm:mb-4 md:mb-6"
          >
            Initializing System...
          </motion.p>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="w-full"
          >
            <div className="relative w-full h-1.5 sm:h-2 bg-gray-900 rounded-full overflow-hidden border border-orange-900">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-yellow-500"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
            <motion.p className="text-orange-400/60 text-[10px] sm:text-xs md:text-sm mt-2 sm:mt-3 text-center">
              {Math.round(progress)}%
            </motion.p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
