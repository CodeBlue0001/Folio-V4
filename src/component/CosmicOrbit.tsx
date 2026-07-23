import { motion } from 'framer-motion';

interface CosmicOrbitProps {
  isDark: boolean;
}

export const CosmicOrbit = ({ isDark }: CosmicOrbitProps) => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-1">
      {/* Orbital Rings */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`orbit-${i}`}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/10 dark:border-blue-400/10"
          style={{
            width: `${(i + 1) * 400}px`,
            height: `${(i + 1) * 400}px`,
          }}
          animate={{
            rotate: i % 2 === 0 ? 360 : -360,
            scale: [1, 1.05, 1],
          }}
          transition={{
            rotate: {
              duration: 40 + i * 10,
              repeat: Infinity,
              ease: 'linear',
            },
            scale: {
              duration: 5 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        />
      ))}

      {/* Orbiting Particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`particle-orbit-${i}`}
          className="absolute top-1/2 left-1/2"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            width: `${(i % 3 + 1) * 300}px`,
            height: `${(i % 3 + 1) * 300}px`,
            marginLeft: `${-(i % 3 + 1) * 150}px`,
            marginTop: `${-(i % 3 + 1) * 150}px`,
          }}
        >
          <motion.div
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${
              i % 3 === 0 ? 'bg-blue-400' : i % 3 === 1 ? 'bg-purple-400' : 'bg-cyan-400'
            }`}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              boxShadow: `0 0 20px ${
                i % 3 === 0 ? 'rgba(96, 165, 250, 0.8)' : 
                i % 3 === 1 ? 'rgba(168, 85, 247, 0.8)' : 
                'rgba(34, 211, 238, 0.8)'
              }`,
            }}
          />
        </motion.div>
      ))}

      {/* Central Glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
        }}
      />
    </div>
  );
};
