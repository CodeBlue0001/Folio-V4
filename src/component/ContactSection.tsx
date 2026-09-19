import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Github, Linkedin } from 'lucide-react';
import { HoloEarth } from './HoloEarth';
import { usePortfolioContent } from './hooks/usePortfolioContent';

interface Viewer {
  lat: number;
  lon: number;
  id: string;
}

interface ContactSectionProps {
  isDark?: boolean;
  userLocation?: { lat: number; lon: number } | null;
  viewers?: Viewer[];
  locationError?: string | null;
}

export const ContactSection = ({ isDark = true, userLocation, viewers, locationError }: ContactSectionProps) => {
  const { content, getThemeColors } = usePortfolioContent();
  const themeColors = getThemeColors(isDark);
  const headingColor = themeColors.headingColor;

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: content.contact.email,
      href: `mailto:${content.contact.email}`,
    },
    {
      icon: Phone,
      label: 'Phone',
      value: content.contact.phone,
      href: `tel:${content.contact.phone.replace(/[^+\d]/g, '')}`,
    },
    {
      icon: MapPin,
      label: 'Location',
      value: content.contact.location,
      href: '#',
    },
  ];

  const socialLinks = [
    { icon: Github, label: 'GitHub', href: content.contact.github },
    { icon: Linkedin, label: 'LinkedIn', href: content.contact.linkedin },
  ];

  return (
    <section id="contact" className={`relative min-h-screen py-12 sm:py-16 md:py-20 px-4 md:px-6 ${isDark
      ? 'bg-gradient-to-b from-[#0c1a2e] to-[#07101e]'
      : 'bg-gradient-to-b from-[#dbeafe] to-[#e8f4fd]'
      }`}>
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 sm:mb-3 font-bold tracking-tight transition-colors"
            style={{ color: headingColor }}
          >
            {content.contact.heading}
          </h2>
          <p className={`text-xs sm:text-sm md:text-base max-w-2xl mx-auto ${isDark ? 'text-[#CBD5E1]' : 'text-slate-600'
            }`}>
            {content.contact.subtitle}
          </p>
        </motion.div>

        {/* Holographic Earth */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-8 sm:mb-10 md:mb-12"
        >
          <HoloEarth isDark={isDark} userLocation={userLocation} viewers={viewers} locationError={locationError} />
        </motion.div>

        {/* 
        ========================================================================
        SEND MESSAGE FORM CODE (COMMENTED OUT AS REQUESTED)
        ========================================================================
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className={`${isDark
            ? 'bg-slate-900/60 border-slate-800'
            : 'bg-white/80 border-sky-100 shadow-sky-100/50'
            } backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl border`}
        >
          <h3 className={`text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-6 ${isDark ? 'text-slate-100' : 'text-slate-800'
            }`}>Send a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="name" className={`block text-xs sm:text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
              <input type="text" id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="..." required />
            </div>
            <div>
              <label htmlFor="email" className={`block text-xs sm:text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
              <input type="email" id="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="..." required />
            </div>
            <div>
              <label htmlFor="message" className={`block text-xs sm:text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Message</label>
              <textarea id="message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={5} className="..." required />
            </div>
            <button type="submit">Send Message</button>
          </form>
        </motion.div>
        ========================================================================
        */}

        {/* Contact Information & Social Display */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8 max-w-4xl mx-auto"
        >
          <div className={`${isDark
            ? 'bg-slate-900/60 border-slate-800'
            : 'bg-white/80 border-sky-100 shadow-sky-100/50'
            } backdrop-blur-sm p-4 sm:p-5 md:p-6 rounded-2xl border`}>
            <h3 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 ${isDark ? 'text-slate-100' : 'text-slate-800'
              }`}>Contact Information</h3>
            <div className="space-y-3 sm:space-y-3.5">
              {contactInfo.map((info, index) => (
                <motion.a
                  key={info.label}
                  href={info.href}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ x: 8 }}
                  className={`flex items-start gap-2.5 sm:gap-3 ${isDark
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                    } transition-colors`}
                >
                  <div className={`p-2 ${isDark ? 'bg-slate-800/80 border border-slate-700' : 'bg-slate-100 border border-slate-200'
                    } rounded-lg`}>
                    <info.icon className={`w-4 h-4 ${isDark ? 'text-[#D4A853]' : 'text-slate-700'
                      }`} />
                  </div>
                  <div>
                    <p className={`text-[11px] sm:text-xs mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}>{info.label}</p>
                    <p className="text-xs sm:text-sm font-medium">{info.value}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>

          <div className={`${isDark
            ? 'bg-slate-900/60 border-slate-800'
            : 'bg-white/80 border-sky-100 shadow-sky-100/50'
            } backdrop-blur-sm p-4 sm:p-5 md:p-6 rounded-2xl border flex flex-col justify-between`}>
            <div>
              <h3 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 ${isDark ? 'text-slate-100' : 'text-slate-800'
                }`}>Follow Me</h3>
              <p className={`text-xs mb-4 sm:mb-5 ${isDark ? 'text-[#CBD5E1]' : 'text-slate-600'}`}>
                Connect with me on GitHub & LinkedIn to explore repositories, projects, and work!
              </p>
              <div className="flex gap-2.5 sm:gap-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.08, rotate: 4 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2.5 sm:p-3 rounded-lg border transition-all ${isDark
                      ? 'bg-slate-950 border-slate-850 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] text-slate-300 hover:text-white'
                      : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 hover:shadow-[0_0_15px_rgba(14,165,233,0.1)] text-sky-600 hover:text-sky-700'
                      }`}
                    aria-label={social.label}
                  >
                    <social.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'
                      }`} />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};