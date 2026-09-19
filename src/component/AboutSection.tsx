import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { usePortfolioContent } from './hooks/usePortfolioContent';

import { useState, useEffect } from 'react';

interface AboutSectionProps {
  isDark?: boolean;
}

export const AboutSection = ({ isDark = true }: AboutSectionProps) => {
  const { content, getThemeColors } = usePortfolioContent();
  const [imageError, setImageError] = useState(false);
  const features: { icon: any; title: string; description: string }[] = [];

  const themeColors = getThemeColors(isDark);
  const headingColor = themeColors.headingColor;
  const aboutVis = content.visibility?.about;
  const showParticles = aboutVis ? aboutVis.showFloatingParticles !== false : true;
  const showBio = aboutVis ? aboutVis.showBio !== false : true;
  const showTimeline = aboutVis ? aboutVis.showJourneyTimeline !== false : true;
  const showProfile = aboutVis ? aboutVis.showProfileImage !== false : true;
  const showHobbies = aboutVis ? aboutVis.showHobbies !== false : true;

  useEffect(() => {
    setImageError(false);
  }, [content.about.profileImage]);

  return (
    <section id="about" className={`relative min-h-screen flex items-center justify-center py-12 sm:py-16 md:py-20 px-4 md:px-6 overflow-hidden ${isDark
      ? 'bg-gradient-to-b from-[#07101e] to-[#0c1a2e]'
      : 'bg-gradient-to-b from-[#e8f4fd] to-[#dbeafe]'
      }`}>
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className={`absolute inset-0 ${isDark
          ? 'bg-gradient-to-br from-[#07101e] via-emerald-950/20 to-[#07101e]'
          : 'bg-gradient-to-br from-[#f0f9ff] via-sky-100/30 to-[#f0f9ff]'
          }`} />

        {/* 3D floating elements */}
        {showParticles && [...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 6 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            className={`absolute w-3 h-3 rounded-full ${isDark ? 'bg-emerald-400/20' : 'bg-sky-500/25'
              }`}
            style={{
              left: `${10 + (i * 12)}%`,
              top: `${20 + (i * 8)}%`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 sm:mb-4 md:mb-6 font-bold tracking-tight transition-colors"
            style={{ color: headingColor }}
          >
            {content.about.heading}
          </h2>
          {showBio && (
            <p className={`text-sm sm:text-base md:text-lg lg:text-xl max-w-3xl mx-auto ${isDark ? 'text-[#CBD5E1]' : 'text-slate-600'
              }`}>
              {content.about.bio}
            </p>
          )}
        </motion.div>

        <div className={`grid gap-8 md:gap-12 items-start mb-8 md:mb-12 ${
          showTimeline && (showProfile || showHobbies) ? 'lg:grid-cols-2' : 'max-w-3xl mx-auto'
        }`}>
          {/* 3D Timeline */}
          {showTimeline && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className={`p-6 md:p-8 ${isDark
                ? 'bg-slate-900/60 border-slate-800'
                : 'bg-white/80 border-sky-100 shadow-sky-100/50'
                } backdrop-blur-sm shadow-xl`}>
                <h3 className={`text-xl md:text-2xl mb-6 md:mb-8 ${isDark ? 'text-slate-200' : 'text-slate-800'
                  }`}>Journey</h3>
                <div className="relative">
                  {/* Timeline line */}
                  <div
                    className="absolute left-4 top-0 bottom-0 w-0.5 transition-colors"
                    style={{ backgroundColor: `${headingColor}60` }}
                  />

                  {content.about.timeline.map((item, index) => (
                    <motion.div
                      key={item.year}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="relative pl-8 md:pl-10 pb-6 md:pb-8 last:pb-0 group"
                    >
                      {/* Timeline dot */}
                      <motion.div
                        whileHover={{ scale: 1.5 }}
                        className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full -translate-x-1/2 transition-all group-hover:shadow-[0_0_12px_rgba(59,130,246,0.6)] cursor-pointer"
                        style={{ backgroundColor: headingColor }}
                      />

                      <span
                        className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1 border transition-colors"
                        style={{
                          backgroundColor: `${headingColor}15`,
                          borderColor: `${headingColor}40`,
                          color: headingColor
                        }}
                      >
                        {item.year}
                      </span>
                      <h4 className={`text-base md:text-lg font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}>{item.title}</h4>
                      <p className={`text-xs md:text-sm mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>{item.description}</p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Profile Image & Features Grid */}
          {(showProfile || showHobbies) && (
            <div className="space-y-6 md:space-y-8">
              {/* Profile Image */}
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className={`relative overflow-hidden rounded-2xl border-2 ${isDark ? 'border-blue-500/50' : 'border-blue-400/50'
                    } shadow-2xl`}>
                    <div className="relative aspect-square lg:aspect-[4/3] bg-slate-900/40">
                      {content.about.profileImage && !imageError ? (
                        <img
                          src={content.about.profileImage}
                          alt="Dipayan Sardar"
                          className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                          <div className="text-center p-6">
                            <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-700/60 text-slate-500' : 'bg-slate-200 text-slate-400'}`}>
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Profile Photo Placeholder</p>
                            <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Upload via Admin Panel</p>
                          </div>
                        </div>
                      )}
                      {/* Subtle edge gradient that preserves face visibility */}
                      {content.about.profileImage && !imageError && (
                        <div className={`absolute inset-0 pointer-events-none ${isDark
                          ? 'bg-gradient-to-t from-slate-950/50 via-transparent to-transparent'
                          : 'bg-gradient-to-t from-slate-900/15 via-transparent to-transparent'
                          }`} />
                      )}
                    </div>

                    {/* Animated border effect */}
                    <motion.div
                      animate={{
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className={`absolute inset-0 border-2 rounded-2xl ${isDark ? 'border-blue-400/30' : 'border-blue-500/40'
                        }`}
                    />
                  </div>
                </motion.div>
              )}

              {/* Features Grid */}
              {showHobbies && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className={`group ${isDark
                        ? 'bg-gradient-to-br from-slate-900 to-[#0c1a2e] border-slate-800/60 hover:border-white/30 hover:shadow-[0_0_25px_rgba(255,255,255,0.08)]'
                        : 'bg-white border-gray-200 hover:border-sky-300 hover:shadow-[0_0_25px_rgba(14,165,233,0.12)]'
                        } p-4 sm:p-6 rounded-2xl border shadow-xl hover:shadow-2xl transition-all`}
                    >
                      <div className="mb-3 sm:mb-4">
                        <feature.icon className={`w-8 h-8 sm:w-10 sm:h-10 ${isDark ? 'text-[#D4A853]' : 'text-slate-800'
                          }`} />
                      </div>
                      <h3 className={`text-base sm:text-lg md:text-xl mb-2 transition-colors ${isDark ? 'text-slate-100 group-hover:text-white group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]' : 'text-slate-800 group-hover:text-sky-600'
                        }`}>
                        {feature.title}
                      </h3>
                      <p className={`text-xs sm:text-sm transition-colors ${isDark ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-600 group-hover:text-slate-700'
                        }`}>
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {showHobbies && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className={`text-sm sm:text-base md:text-lg max-w-2xl mx-auto ${isDark ? 'text-[#CBD5E1]' : 'text-slate-600'
              }`}>
              {content.about.hobbies}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};