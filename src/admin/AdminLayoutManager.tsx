import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sliders,
  Layers,
  Award,
  Zap,
  Sparkles,
  Eye,
  Save,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Globe,
  Code,
  User,
  Cpu,
  Monitor,
} from 'lucide-react';
import {
  type PortfolioContent,
  type ComponentVisibility,
  DEFAULT_CONTENT,
  DEFAULT_VISIBILITY,
} from '../component/hooks/usePortfolioContent';

// ─── Toggle Switch Component ────────────────────────────────────────────────

interface ToggleItemProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  badge?: string;
}

const ToggleItem: React.FC<ToggleItemProps> = ({ label, description, checked, onChange, badge }) => (
  <div
    onClick={() => onChange(!checked)}
    className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 ${
      checked
        ? 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
        : 'bg-slate-900/40 border-slate-800/60 opacity-60 hover:opacity-85'
    }`}
  >
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <span className={`text-xs sm:text-sm font-bold ${checked ? 'text-white' : 'text-slate-400'}`}>
          {label}
        </span>
        {badge && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {badge}
          </span>
        )}
      </div>
      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{description}</p>
    </div>

    {/* Toggle Switch */}
    <div
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-amber-500' : 'bg-slate-700'
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </div>
  </div>
);

// ─── Section Card Component ────────────────────────────────────────────────

interface CategoryCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
  children: React.ReactNode;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, icon, color, badge, children }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-4 sm:p-5 space-y-3.5">
    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
        <h3 className="text-sm font-extrabold text-white tracking-wide">{title}</h3>
      </div>
      {badge && (
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
          {badge}
        </span>
      )}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">{children}</div>
  </div>
);

// ─── Main Admin Layout Manager ─────────────────────────────────────────────

export const AdminLayoutManager: React.FC = () => {
  const [content, setContent] = useState<PortfolioContent>(DEFAULT_CONTENT);
  const [visibility, setVisibility] = useState<ComponentVisibility>(DEFAULT_VISIBILITY);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/portfolio-content')
      .then((res) => (res.ok ? res.json() : DEFAULT_CONTENT))
      .then((data) => {
        setContent(data);
        if (data.visibility) {
          // Deep merge with default visibility
          setVisibility(deepMergeVisibility(DEFAULT_VISIBILITY, data.visibility));
        }
      })
      .catch(() => {
        // Local fallback
        try {
          const cached = localStorage.getItem('folio_portfolio_content');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.data?.visibility) {
              setVisibility(deepMergeVisibility(DEFAULT_VISIBILITY, parsed.data.visibility));
            }
          }
        } catch { }
      });
  }, []);

  const deepMergeVisibility = (defaults: ComponentVisibility, custom?: Partial<ComponentVisibility>): ComponentVisibility => {
    if (!custom) return { ...defaults };
    return {
      sections: { ...defaults.sections, ...(custom.sections || {}) },
      achievements: { ...defaults.achievements, ...(custom.achievements || {}) },
      hero: { ...defaults.hero, ...(custom.hero || {}) },
      about: { ...defaults.about, ...(custom.about || {}) },
      projects: { ...defaults.projects, ...(custom.projects || {}) },
      skills: { ...defaults.skills, ...(custom.skills || {}) },
      contact: { ...defaults.contact, ...(custom.contact || {}) },
      decorations: { ...defaults.decorations, ...(custom.decorations || {}) },
    };
  };

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const updateToggle = <G extends keyof ComponentVisibility, K extends keyof ComponentVisibility[G]>(
    group: G,
    key: K,
    value: boolean
  ) => {
    setVisibility((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const applyPreset = (presetName: 'all' | 'badgesOnly' | 'statsOnly' | 'minimal') => {
    let next = { ...visibility };
    if (presetName === 'all') {
      next = { ...DEFAULT_VISIBILITY };
      showFeedback('success', 'Preset applied: All elements and sections enabled.');
    } else if (presetName === 'badgesOnly') {
      next = {
        ...next,
        achievements: {
          ...next.achievements,
          showLeetCodeDashboard: true,
          showLeetCodeStats: false, // HIDE LIVE STATS
          showLeetCodeBadges: true,  // SHOW BADGES ONLY
        },
      };
      showFeedback('success', 'Preset applied: LeetCode Badges only (Stats hidden).');
    } else if (presetName === 'statsOnly') {
      next = {
        ...next,
        achievements: {
          ...next.achievements,
          showLeetCodeDashboard: true,
          showLeetCodeStats: true,  // SHOW STATS
          showLeetCodeBadges: false, // HIDE BADGES
        },
      };
      showFeedback('success', 'Preset applied: LeetCode Stats only (Badges hidden).');
    } else if (presetName === 'minimal') {
      next = {
        ...next,
        decorations: {
          ...next.decorations,
          showArcReactor: false,
          showCosmicOrbit: false,
        },
        about: {
          ...next.about,
          showFloatingParticles: false,
        },
        hero: {
          ...next.hero,
          showScrollIndicator: false,
        },
      };
      showFeedback('success', 'Preset applied: Minimalist presentation mode.');
    }

    setVisibility(next);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const updatedContent: PortfolioContent = {
      ...content,
      visibility,
    };

    // Save locally to browser immediately
    try {
      localStorage.setItem('folio_portfolio_content', JSON.stringify({ data: updatedContent, timestamp: Date.now() }));
    } catch { }

    try {
      const res = await fetch('/api/portfolio-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedContent),
      });

      if (res.ok) {
        showFeedback('success', 'Layout & Visibility configurations saved successfully! Changes reflect immediately.');
        setHasChanges(false);
        setContent(updatedContent);
        window.dispatchEvent(new CustomEvent('portfolio-content-updated'));
      } else {
        showFeedback('success', 'Configurations saved to your browser! Changes are active immediately.');
        setHasChanges(false);
        window.dispatchEvent(new CustomEvent('portfolio-content-updated'));
      }
    } catch {
      showFeedback('success', 'Configurations saved locally! Changes are active immediately.');
      setHasChanges(false);
      window.dispatchEvent(new CustomEvent('portfolio-content-updated'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-extrabold text-white">Layout & Component Visibility Manager</h2>
          </div>
          <p className="text-[11px] text-slate-400 max-w-2xl">
            Control which widgets, decorations, and sections appear on your portfolio. Customizations persist
            dynamically to both serverless deployment and your browser.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer ${
              hasChanges
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/20'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : hasChanges ? 'Save Layout Changes' : 'No Changes'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-3.5 rounded-2xl border flex items-center gap-3 text-xs font-medium ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Presets Bar */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Quick Layout Presets
          </span>
          <span className="text-[10px] text-slate-500 font-mono">One-click visibility switching</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPreset('all')}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Show Everything (Default)</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('badgesOnly')}
            className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>LeetCode Badges Only (Hide Stats)</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('statsOnly')}
            className="px-3 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Code className="w-3.5 h-3.5 text-purple-400" />
            <span>Stats Only (Hide Badges)</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('minimal')}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Minimalist Mode</span>
          </button>
        </div>
      </div>

      {/* ── Category: Achievements & LeetCode Dashboard ── */}
      <CategoryCard
        title="Achievements & LeetCode Live Widgets"
        icon={<Award className="w-4 h-4 text-amber-400" />}
        color="bg-amber-500/10 border border-amber-500/20"
        badge="Requested Control"
      >
        <ToggleItem
          label="LeetCode Live Dashboard Container"
          description="The complete live stats and badges card in the Achievements section."
          checked={visibility.achievements.showLeetCodeDashboard}
          onChange={(v) => updateToggle('achievements', 'showLeetCodeDashboard', v)}
        />
        <ToggleItem
          label="Live Stats, Gauge & Breakdown"
          description="Problems solved gauge, ranking badge, streak, and difficulty breakdown cards."
          checked={visibility.achievements.showLeetCodeStats}
          onChange={(v) => updateToggle('achievements', 'showLeetCodeStats', v)}
          badge="Live API"
        />
        <ToggleItem
          label="LeetCode Earned Badges Grid"
          description="Grid of earned badges from LeetCode. Displays full-width if stats are hidden!"
          checked={visibility.achievements.showLeetCodeBadges}
          onChange={(v) => updateToggle('achievements', 'showLeetCodeBadges', v)}
          badge="Badges"
        />
        <ToggleItem
          label="'View All Achievements' Button"
          description="Button linking to the dedicated All Achievements & Certifications page."
          checked={visibility.achievements.showViewAllButton}
          onChange={(v) => updateToggle('achievements', 'showViewAllButton', v)}
        />
      </CategoryCard>

      {/* ── Category: Main Section Master Toggles ── */}
      <CategoryCard
        title="Main Portfolio Sections (Page Structure)"
        icon={<Layers className="w-4 h-4 text-indigo-400" />}
        color="bg-indigo-500/10 border border-indigo-500/20"
      >
        <ToggleItem
          label="Hero Section"
          description="The main landing introduction with typewriter title and 3D background."
          checked={visibility.sections.hero}
          onChange={(v) => updateToggle('sections', 'hero', v)}
        />
        <ToggleItem
          label="About Me Section"
          description="Profile photo, bio, journey timeline, and personal details."
          checked={visibility.sections.about}
          onChange={(v) => updateToggle('sections', 'about', v)}
        />
        <ToggleItem
          label="Featured Projects Section"
          description="Interactive cards showing GitHub and featured project work."
          checked={visibility.sections.projects}
          onChange={(v) => updateToggle('sections', 'projects', v)}
        />
        <ToggleItem
          label="Skills & Activity Section"
          description="Categorized technical competencies and live GitHub contribution calendar."
          checked={visibility.sections.skills}
          onChange={(v) => updateToggle('sections', 'skills', v)}
        />
        <ToggleItem
          label="Achievements & Badges Section"
          description="LeetCode live profile, stats, milestones, and credentials."
          checked={visibility.sections.achievements}
          onChange={(v) => updateToggle('sections', 'achievements', v)}
        />
        <ToggleItem
          label="Contact & HoloEarth Section"
          description="Interactive 3D globe viewer and direct communication channels."
          checked={visibility.sections.contact}
          onChange={(v) => updateToggle('sections', 'contact', v)}
        />
        <ToggleItem
          label="Footer"
          description="Copyright notice and bottom decorative elements."
          checked={visibility.sections.footer}
          onChange={(v) => updateToggle('sections', 'footer', v)}
        />
      </CategoryCard>

      {/* ── Category: About Section Elements ── */}
      <CategoryCard
        title="About Section Components"
        icon={<User className="w-4 h-4 text-cyan-400" />}
        color="bg-cyan-500/10 border border-cyan-500/20"
      >
        <ToggleItem
          label="Profile Photo Card"
          description="Your uploaded portrait or avatar placeholder box in the About section."
          checked={visibility.about.showProfileImage}
          onChange={(v) => updateToggle('about', 'showProfileImage', v)}
        />
        <ToggleItem
          label="Journey Timeline"
          description="Chronological milestones and education history timeline."
          checked={visibility.about.showJourneyTimeline}
          onChange={(v) => updateToggle('about', 'showJourneyTimeline', v)}
        />
        <ToggleItem
          label="Bio Description"
          description="Main introductory paragraph under the About Me heading."
          checked={visibility.about.showBio}
          onChange={(v) => updateToggle('about', 'showBio', v)}
        />
        <ToggleItem
          label="Hobbies & Interests"
          description="Bottom quote describing personal activities and interests."
          checked={visibility.about.showHobbies}
          onChange={(v) => updateToggle('about', 'showHobbies', v)}
        />
        <ToggleItem
          label="Floating 3D Background Particles"
          description="Animated floating ambient circles in the About section."
          checked={visibility.about.showFloatingParticles}
          onChange={(v) => updateToggle('about', 'showFloatingParticles', v)}
        />
      </CategoryCard>

      {/* ── Category: Contact & 3D HoloEarth Globe ── */}
      <CategoryCard
        title="Contact & HoloEarth 3D Globe"
        icon={<Globe className="w-4 h-4 text-emerald-400" />}
        color="bg-emerald-500/10 border border-emerald-500/20"
      >
        <ToggleItem
          label="HoloEarth 3D Globe"
          description="The live rotating Three.js holographic globe with real-time visitor locations."
          checked={visibility.contact.showHoloEarth}
          onChange={(v) => updateToggle('contact', 'showHoloEarth', v)}
          badge="Three.js"
        />
        <ToggleItem
          label="Contact Information Cards"
          description="Email, phone, and geographic location direct reach-out cards."
          checked={visibility.contact.showContactInfoCards}
          onChange={(v) => updateToggle('contact', 'showContactInfoCards', v)}
        />
        <ToggleItem
          label="Social Profile Links"
          description="GitHub and LinkedIn quick-access external link pills."
          checked={visibility.contact.showSocialLinks}
          onChange={(v) => updateToggle('contact', 'showSocialLinks', v)}
        />
      </CategoryCard>

      {/* ── Category: Hero Landing Elements ── */}
      <CategoryCard
        title="Hero Landing Components"
        icon={<Monitor className="w-4 h-4 text-blue-400" />}
        color="bg-blue-500/10 border border-blue-500/20"
      >
        <ToggleItem
          label="Three.js 3D Background Canvas"
          description="The interactive particle/wave background animation on the hero slide."
          checked={visibility.hero.showThreeBackground}
          onChange={(v) => updateToggle('hero', 'showThreeBackground', v)}
          badge="Three.js"
        />
        <ToggleItem
          label="Typewriter Heading"
          description="Animated typing presentation phrases."
          checked={visibility.hero.showTypewriter}
          onChange={(v) => updateToggle('hero', 'showTypewriter', v)}
        />
        <ToggleItem
          label="Hero Subtitle"
          description="Role tagline (e.g. Full Stack Developer | Creative Designer)."
          checked={visibility.hero.showSubtitle}
          onChange={(v) => updateToggle('hero', 'showSubtitle', v)}
        />
        <ToggleItem
          label="Resume PDF Download Button"
          description="Direct action button linking to your uploaded resume."
          checked={visibility.hero.showResumeButton}
          onChange={(v) => updateToggle('hero', 'showResumeButton', v)}
        />
        <ToggleItem
          label="Scroll Down Chevron Indicator"
          description="Animated bouncing chevron prompt at the bottom of the hero."
          checked={visibility.hero.showScrollIndicator}
          onChange={(v) => updateToggle('hero', 'showScrollIndicator', v)}
        />
      </CategoryCard>

      {/* ── Category: Skills & Activity ── */}
      <CategoryCard
        title="Skills & Activity Elements"
        icon={<Cpu className="w-4 h-4 text-teal-400" />}
        color="bg-teal-500/10 border border-teal-500/20"
      >
        <ToggleItem
          label="Skill Proficiency Categories"
          description="Expert, Proficient, and Familiar skill cards with interactive filters."
          checked={visibility.skills.showSkillCategories}
          onChange={(v) => updateToggle('skills', 'showSkillCategories', v)}
        />
        <ToggleItem
          label="GitHub Live Activity Heatmap"
          description="Real-time contribution calendar and recent commit statistics from GitHub."
          checked={visibility.skills.showGithubActivity}
          onChange={(v) => updateToggle('skills', 'showGithubActivity', v)}
          badge="GitHub API"
        />
      </CategoryCard>

      {/* ── Category: Projects Showcase ── */}
      <CategoryCard
        title="Projects Showcase Elements"
        icon={<Code className="w-4 h-4 text-violet-400" />}
        color="bg-violet-500/10 border border-violet-500/20"
      >
        <ToggleItem
          label="GitHub Repositories Cards"
          description="Live repository cards loaded from your GitHub account."
          checked={visibility.projects.showGithubRepos}
          onChange={(v) => updateToggle('projects', 'showGithubRepos', v)}
        />
        <ToggleItem
          label="Star Counters"
          description="GitHub star metrics badge on project cards."
          checked={visibility.projects.showStars}
          onChange={(v) => updateToggle('projects', 'showStars', v)}
        />
        <ToggleItem
          label="Technology & Topic Tags"
          description="Framework and language pills on each project card."
          checked={visibility.projects.showTags}
          onChange={(v) => updateToggle('projects', 'showTags', v)}
        />
      </CategoryCard>

      {/* ── Category: Atmosphere & Visual Decorations ── */}
      <CategoryCard
        title="Atmosphere & Global Decorations"
        icon={<Sparkles className="w-4 h-4 text-rose-400" />}
        color="bg-rose-500/10 border border-rose-500/20"
      >
        <ToggleItem
          label="Arc Reactor Ambient Background"
          description="High-tech particle reactor background canvas throughout the page."
          checked={visibility.decorations.showArcReactor}
          onChange={(v) => updateToggle('decorations', 'showArcReactor', v)}
          badge="Canvas"
        />
        <ToggleItem
          label="Cosmic Orbit Planetary System"
          description="Interactive rotating orbit rings and celestial elements."
          checked={visibility.decorations.showCosmicOrbit}
          onChange={(v) => updateToggle('decorations', 'showCosmicOrbit', v)}
        />
        <ToggleItem
          label="Scroll Progress Bar"
          description="Top horizontal indicator bar tracking scroll percentage."
          checked={visibility.decorations.showScrollProgress}
          onChange={(v) => updateToggle('decorations', 'showScrollProgress', v)}
        />
        <ToggleItem
          label="Floating Scroll-to-Top Button"
          description="Circular button appearing at the bottom-right on scroll."
          checked={visibility.decorations.showScrollToTop}
          onChange={(v) => updateToggle('decorations', 'showScrollToTop', v)}
        />
        <ToggleItem
          label="Theme Toggle Switch"
          description="Light / Dark mode floating sun & moon switcher button."
          checked={visibility.decorations.showThemeToggle}
          onChange={(v) => updateToggle('decorations', 'showThemeToggle', v)}
        />
      </CategoryCard>

      {/* Floating Save Bar when changes exist */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="sticky bottom-4 flex justify-center z-20"
          >
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2.5 px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:from-amber-600 hover:to-orange-600 transition-all cursor-pointer border border-amber-400/30"
            >
              <Save className="w-4.5 h-4.5" />
              <span>{isSaving ? 'Saving Changes...' : 'Save All Layout Changes'}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
