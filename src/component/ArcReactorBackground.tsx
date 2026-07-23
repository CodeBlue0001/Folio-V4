import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface ArcReactorBackgroundProps {
  isDark: boolean;
}

// Pre-compute particle random values at module level (stable across renders)
const PARTICLE_COUNT = 20;
const particleData = Array.from({ length: PARTICLE_COUNT }, () => ({
  width: 2 + Math.random() * 4,
  height: 2 + Math.random() * 4,
  left: Math.random() * 100,
  top: Math.random() * 100,
  xOffset: Math.random() * 100 - 50,
  yOffset: Math.random() * 100 - 50,
  duration: 5 + Math.random() * 5,
  delay: Math.random() * 5,
}));

export const ArcReactorBackground = ({ isDark }: ArcReactorBackgroundProps) => {
  // Memoize particle styles so they don't re-create on every render
  const particleStyles = useMemo(() => {
    return particleData.map((p) => ({
      width: `${p.width}px`,
      height: `${p.height}px`,
      left: `${p.left}%`,
      top: `${p.top}%`,
      filter: 'blur(1px)',
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Gradient Background */}
      <div
        className={`absolute inset-0 ${
          isDark
            ? 'bg-gradient-to-b from-[#07101e] via-[#0c1a2e] to-[#07101e]'
            : 'bg-gradient-to-b from-[#e8f4fd] via-[#dbeafe] to-[#e8f4fd]'
        }`}
      />

      {/* Animated Grid — subtle natural tones */}
      <div className="absolute inset-0 opacity-20">
        <div
          className={`w-full h-full ${
            isDark
              ? 'bg-[linear-gradient(rgba(52,211,153,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.08)_1px,transparent_1px)]'
              : 'bg-[linear-gradient(rgba(14,165,233,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.15)_1px,transparent_1px)]'
          }`}
          style={{ backgroundSize: '50px 50px' }}
        />
      </div>

      {/* Arc Reactor Rings — moonlight teal tones */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`arc-ring-${i}`}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${
              isDark ? 'border-emerald-400/15' : 'border-sky-500/20'
            }`}
            style={{
              width: `${(i + 1) * 100}px`,
              height: `${(i + 1) * 100}px`,
              borderWidth: '2px',
            }}
            animate={{
              rotate: i % 2 === 0 ? 360 : -360,
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              rotate: {
                duration: 10 + i * 5,
                repeat: Infinity,
                ease: 'linear',
              },
              scale: {
                duration: 3 + i,
                repeat: Infinity,
                ease: 'easeInOut',
              },
              opacity: {
                duration: 2 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          />
        ))}
      </div>

      {/* Floating Energy Particles — amber / sage / sky */}
      {particleData.map((p, i) => (
        <motion.div
          key={`energy-particle-${i}`}
          className={`absolute rounded-full ${
            i % 3 === 0
              ? isDark ? 'bg-amber-400' : 'bg-amber-500'
              : i % 3 === 1
                ? isDark ? 'bg-emerald-400' : 'bg-green-500'
                : isDark ? 'bg-sky-400' : 'bg-sky-500'
          }`}
          style={particleStyles[i]}
          animate={{
            x: [0, p.xOffset],
            y: [0, p.yOffset],
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Radial Glow Effect — moonlight teal / daylight sky */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(52, 211, 153, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
        }}
      />

      {/* Scan Lines Effect */}
      <motion.div
        className={`absolute inset-0 ${
          isDark
            ? 'bg-[linear-gradient(transparent_50%,rgba(52,211,153,0.02)_50%)]'
            : 'bg-[linear-gradient(transparent_50%,rgba(14,165,233,0.04)_50%)]'
        }`}
        style={{ backgroundSize: '100% 4px' }}
        animate={{
          backgroundPosition: ['0% 0%', '0% 100%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};
