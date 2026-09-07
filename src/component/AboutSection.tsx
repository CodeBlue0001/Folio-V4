import { motion } from 'framer-motion';
import { Code, Palette, Rocket, Zap } from 'lucide-react';
import { Card } from './ui/card';

interface AboutSectionProps {
  isDark?: boolean;
}

export const AboutSection = ({ isDark = true }: AboutSectionProps) => {
  const features = [
    // {
    //   icon: Code,
    //   title: 'Clean Code',
    //   description: 'Writing maintainable and efficient code with best practices',
    // },
    // {
    //   icon: Palette,
    //   title: 'Creative Design',
    //   description: 'Crafting beautiful and intuitive user interfaces',
    // },
    // {
    //   icon: Rocket,
    //   title: 'Fast Performance',
    //   description: 'Optimizing for speed and user experience',
    // },
    // {
    //   icon: Zap,
    //   title: 'Modern Stack',
    //   description: 'Using cutting-edge technologies and frameworks',
    // },
  ];

  const timelineItems = [
    {
      year: "2025 - Present",
      title: "B.Tech CSE Student",
      description: "Pursuing Computer Science at Narula Institute of Technology, Kolkata."
    },
    {
      year: "2025",
      title: "Diploma in CS",
      description: "Graduated from Central Calcutta Polytechnic with 86.6%."
    },
    {
      year: "Experience",
      title: "Web Dev & AI/ML Intern",
      description: "Interned at YCSAS Pvt. Ltd. (Web) and Codsoft Pvt. Ltd. (AI & ML)."
    }
  ];

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
        {[...Array(8)].map((_, i) => (
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
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 sm:mb-4 md:mb-6 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent font-bold tracking-tight">
            About Me
          </h2>
          <p className={`text-sm sm:text-base md:text-lg lg:text-xl max-w-3xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
            Hello! I'm Dipayan Sardar, a B.Tech CSE student, Web Developer, and Vibe Coder.
            I love creating exceptional digital experiences that combine beautiful design with powerful functionality.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start mb-8 md:mb-12">
          {/* 3D Timeline */}
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
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-400 to-green-400" />

                {timelineItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className="relative pl-12 pb-8 last:pb-0"
                  >
                    {/* Timeline dot */}
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                      className={`absolute left-2.5 w-3 h-3 bg-green-500 rounded-full border-2 ${isDark ? 'border-[#0c1a2e]' : 'border-white'
                        }`}
                    />

                    <div className={`${isDark
                      ? 'bg-slate-900/50 border-slate-800/80 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                      : 'bg-white border-slate-200 hover:border-sky-300 hover:shadow-[0_0_15px_rgba(14,165,233,0.08)]'
                      } p-4 rounded-lg border transition-all`}>
                      <div className={`text-xs sm:text-sm mb-1 ${isDark ? 'text-amber-400' : 'text-green-700'
                        }`}>{item.year}</div>
                      <h4 className={`text-base sm:text-lg mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}>{item.title}</h4>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Profile Image & Features Grid */}
          <div className="space-y-6 md:space-y-8">
            {/* Profile Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className={`relative overflow-hidden rounded-2xl border-2 ${isDark ? 'border-blue-500/50' : 'border-blue-400/50'
                } shadow-2xl`}>
                <div className="relative aspect-square lg:aspect-[4/3]">
                  {/* <img
                    src="https://images.unsplash.com/photo-1737575655055-e3967cbefd03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBkZXZlbG9wZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjM3Mjk0NzN8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Developer Portrait"
                    className="w-full h-full object-cover"
                  /> */}
                  {/* Overlay gradient */}
                  <div className={`absolute inset-0 ${isDark
                    ? 'bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent'
                    : 'bg-gradient-to-t from-white/60 via-white/10 to-transparent'
                    }`} />
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

            {/* Features Grid */}
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
                    <feature.icon className={`w-8 h-8 sm:w-10 sm:h-10 ${isDark ? 'text-emerald-400' : 'text-green-600'
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
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className={`text-sm sm:text-base md:text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
            When I'm not coding, you'll find me playing chess, listening to music & audio stories, or reading books.
          </p>
        </motion.div>
      </div>
    </section>
  );
};