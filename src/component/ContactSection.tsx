import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Github, Linkedin } from 'lucide-react';
// import { useState } from 'react';
// import { Send, CheckCircle, Loader2 } from 'lucide-react';
import { HoloEarth } from './HoloEarth';
// import { toast } from 'sonner';

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
  /*
  // Contact Form State & Mail Handler (Commented out as requested)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');

    const subject = encodeURIComponent(`Portfolio Contact from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    const mailtoUrl = `mailto:dipayansardar477@gmail.com?subject=${subject}&body=${body}`;

    setTimeout(() => {
      window.open(mailtoUrl, '_self');
      setFormStatus('success');
      toast.success('Email client opened! Send the email to complete your message.', {
        duration: 5000,
      });
      setTimeout(() => {
        setFormData({ name: '', email: '', message: '' });
        setFormStatus('idle');
      }, 3000);
    }, 600);
  };
  */

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'dipayansardar477@gmail.com',
      href: 'mailto:dipayansardar477@gmail.com',
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+91- 9875357834',
      href: 'tel:+91 9875357834',
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Kolkata, West Bengal',
      href: '#',
    },
  ];

  const socialLinks = [
    { icon: Github, label: 'GitHub', href: 'https://github.com/CodeBlue0001' },
    { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/dipayan-sardar-321594307/' },
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
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 sm:mb-4 md:mb-6 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent font-bold tracking-tight">
            Get In Touch
          </h2>
          <p className={`text-sm sm:text-base md:text-lg lg:text-xl max-w-3xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
            Feel free to reach out directly through email, phone, or social profiles!
          </p>
        </motion.div>

        {/* Holographic Earth */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-12 sm:mb-16 md:mb-20"
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
          className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 max-w-4xl mx-auto"
        >
          <div className={`${isDark
            ? 'bg-slate-900/60 border-slate-800'
            : 'bg-white/80 border-sky-100 shadow-sky-100/50'
            } backdrop-blur-sm p-6 sm:p-8 rounded-2xl border`}>
            <h3 className={`text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-6 ${isDark ? 'text-slate-100' : 'text-slate-800'
              }`}>Contact Information</h3>
            <div className="space-y-4 sm:space-y-6">
              {contactInfo.map((info, index) => (
                <motion.a
                  key={info.label}
                  href={info.href}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ x: 10 }}
                  className={`flex items-start gap-3 sm:gap-4 ${isDark
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                    } transition-colors`}
                >
                  <div className={`p-2 sm:p-3 ${isDark ? 'bg-emerald-700/20' : 'bg-emerald-500/20'
                    } rounded-lg`}>
                    <info.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'
                      }`} />
                  </div>
                  <div>
                    <p className={`text-xs sm:text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>{info.label}</p>
                    <p className="text-sm sm:text-base font-medium">{info.value}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>

          <div className={`${isDark
            ? 'bg-slate-900/60 border-slate-800'
            : 'bg-white/80 border-sky-100 shadow-sky-100/50'
            } backdrop-blur-sm p-6 sm:p-8 rounded-2xl border flex flex-col justify-between`}>
            <div>
              <h3 className={`text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-6 ${isDark ? 'text-slate-100' : 'text-slate-800'
                }`}>Follow Me</h3>
              <p className={`text-xs sm:text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Connect with me on GitHub & LinkedIn to explore repositories, projects, and work!
              </p>
              <div className="flex gap-3 sm:gap-4">
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
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 sm:p-4 rounded-lg border transition-all ${isDark
                      ? 'bg-slate-950 border-slate-850 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] text-slate-300 hover:text-white'
                      : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 hover:shadow-[0_0_15px_rgba(14,165,233,0.1)] text-sky-600 hover:text-sky-700'
                      }`}
                    aria-label={social.label}
                  >
                    <social.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'
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