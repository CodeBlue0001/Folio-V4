import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Type,
  User,
  Mail,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Image,
  FileText,
  Sparkles,
  GripVertical,
  X,
  RotateCcw,
  FolderGit2,
  Cpu,
  Award,
  Layers,
} from 'lucide-react';
import {
  type PortfolioContent,
  DEFAULT_CONTENT,
  type TimelineItem,
} from '../component/hooks/usePortfolioContent';

// ─── Section Panel Component ────────────────────────────────────────────────

interface SectionPanelProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const SectionPanel: React.FC<SectionPanelProps> = ({ title, icon, color, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-2xl border ${open ? 'border-slate-700' : 'border-slate-800'} bg-slate-900/60 backdrop-blur-xl overflow-hidden transition-colors`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 cursor-pointer hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
            {icon}
          </div>
          <h3 className="text-sm font-bold text-white">{title}</h3>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-800/60">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Input Component ────────────────────────────────────────────────────────

interface FieldInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
}

const FieldInput: React.FC<FieldInputProps> = ({ label, value, onChange, placeholder, type = 'text', multiline }) => (
  <div>
    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
      {label}
    </label>
    {multiline ? (
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm outline-none focus:border-amber-500 transition-colors resize-none placeholder-slate-600"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm outline-none focus:border-amber-500 transition-colors placeholder-slate-600"
      />
    )}
  </div>
);

// ─── Color Picker ───────────────────────────────────────────────────────────

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
      {label}
    </label>
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-xl border border-slate-700 cursor-pointer bg-transparent"
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm outline-none focus:border-amber-500 font-mono placeholder-slate-600"
        placeholder="#D4A853"
      />
      <div
        className="w-10 h-10 rounded-xl border border-slate-700 shrink-0"
        style={{ backgroundColor: value }}
      />
    </div>
  </div>
);

// ─── Section Color Controls ─────────────────────────────────────────────────

interface SectionColorControlsProps {
  compKey: string;
  compName: string;
  content: PortfolioContent;
  updateComponentColor: (
    compKey: string,
    mode: 'dark' | 'light',
    field: 'headingColor' | 'accentColor' | 'bgPrimary' | 'bgSecondary',
    val: string
  ) => void;
  resetComponentColor: (compKey: string) => void;
  getCompColor: (
    compKey: string,
    mode: 'dark' | 'light',
    field: 'headingColor' | 'accentColor' | 'bgPrimary' | 'bgSecondary'
  ) => string;
}

const SectionColorControls: React.FC<SectionColorControlsProps> = ({
  compKey,
  compName,
  content,
  updateComponentColor,
  resetComponentColor,
  getCompColor,
}) => {
  const [activeMode, setActiveMode] = useState<'dark' | 'light'>('dark');
  const [isOpen, setIsOpen] = useState(false);
  const isCustom = Boolean(content.theme?.components?.[compKey]);

  return (
    <div className="mt-4 pt-3 border-t border-slate-800">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <Palette className="w-3.5 h-3.5 text-violet-400" />
          <span>{compName} Custom Colors & Background</span>
          {isCustom ? (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              Customized
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
              Theme Default
            </span>
          )}
          {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>
        {isCustom && (
          <button
            type="button"
            onClick={() => resetComponentColor(compKey)}
            className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
            title="Reset to global theme"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to Theme</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="mt-3 p-3.5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveMode('dark')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeMode === 'dark' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              🌙 Dark Mode
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('light')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeMode === 'light' ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              ☀️ Light Mode
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ColorPicker
              label={`${activeMode === 'dark' ? 'Dark' : 'Light'} Primary Background`}
              value={getCompColor(compKey, activeMode, 'bgPrimary')}
              onChange={(v) => updateComponentColor(compKey, activeMode, 'bgPrimary', v)}
            />
            <ColorPicker
              label={`${activeMode === 'dark' ? 'Dark' : 'Light'} Secondary Background`}
              value={getCompColor(compKey, activeMode, 'bgSecondary')}
              onChange={(v) => updateComponentColor(compKey, activeMode, 'bgSecondary', v)}
            />
            <ColorPicker
              label={`${activeMode === 'dark' ? 'Dark' : 'Light'} Heading / Text`}
              value={getCompColor(compKey, activeMode, 'headingColor')}
              onChange={(v) => updateComponentColor(compKey, activeMode, 'headingColor', v)}
            />
            <ColorPicker
              label={`${activeMode === 'dark' ? 'Dark' : 'Light'} Accent Color`}
              value={getCompColor(compKey, activeMode, 'accentColor')}
              onChange={(v) => updateComponentColor(compKey, activeMode, 'accentColor', v)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── File Upload ────────────────────────────────────────────────────────────

interface FileUploadProps {
  label: string;
  accept: string;
  currentFile?: string;
  onUpload: (data: string, name: string) => void;
  icon: React.ReactNode;
  isLoading?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, accept, currentFile, onUpload, icon, isLoading = false }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const maxDim = 1200;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimized = canvas.toDataURL('image/jpeg', 0.88);
            onUpload(optimized, file.name.replace(/\.[^/.]+$/, "") + ".jpg");
            return;
          }
          onUpload(e.target?.result as string, file.name);
        };
        img.onerror = () => {
          onUpload(e.target?.result as string, file.name);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          onUpload(reader.result as string, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
        {label}
      </label>
      <div
        className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
          isLoading
            ? 'border-violet-500 bg-violet-500/10 pointer-events-none animate-pulse'
            : dragOver
            ? 'border-amber-500 bg-amber-500/10'
            : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
        }`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <div className="flex items-center gap-2 text-slate-400">
          {isLoading ? (
            <div className="w-5 h-5 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
          ) : (
            icon
          )}
          <span className="text-xs font-medium">
            {isLoading ? 'Streaming binary chunks to MongoDB GridFS...' : 'Click or drag to upload from device'}
          </span>
        </div>
        {currentFile && (
          <p className="mt-2 text-[11px] text-amber-400 font-mono truncate max-w-full">
            Active file: {currentFile}
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Main Editor Component ──────────────────────────────────────────────────

export const AdminPortfolioEditor: React.FC = () => {
  const [content, setContent] = useState<PortfolioContent>(DEFAULT_CONTENT);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadPreviewData, setUploadPreviewData] = useState<string | null>(null);
  const [previewLoadState, setPreviewLoadState] = useState<'loading' | 'loaded' | 'error'>('loaded');
  const [previewCacheBuster, setPreviewCacheBuster] = useState<number>(Date.now());
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [themeTab, setThemeTab] = useState<'both' | 'dark' | 'light'>('both');
  const [selectedCompKey, setSelectedCompKey] = useState<string>('hero');
  const [compThemeTab, setCompThemeTab] = useState<'dark' | 'light'>('dark');

  const PORTFOLIO_COMPONENTS = [
    { key: 'hero', name: 'Hero Section', icon: '⚡', desc: 'Typewriter phrases, Subtitle, 3D Canvas' },
    { key: 'about', name: 'About Section', icon: '👤', desc: 'Bio, Hobbies, Journey Timeline & Photo' },
    { key: 'projects', name: 'Projects Section', icon: '💼', desc: 'GitHub Repositories, Star Badges & Cards' },
    { key: 'skills', name: 'Skills Section', icon: '🛠️', desc: 'Skill Badges & GitHub Activity' },
    { key: 'achievements', name: 'Achievements Section', icon: '🏆', desc: 'LeetCode Stats & Credentials' },
    { key: 'contact', name: 'Contact Section', icon: '✉️', desc: 'Interactive Globe & Contact Cards' },
    { key: 'footer', name: 'Footer', icon: '📄', desc: 'Copyright & Decorative Elements' },
    { key: 'navigation', name: 'Navigation Bar', icon: '🧭', desc: 'Top Floating Navigation Dock' },
    { key: 'arcReactor', name: 'Arc Reactor Canvas', icon: '⚛️', desc: 'Center Core & Orbital Particle Backdrop' },
  ];

  // Load from API
  useEffect(() => {
    fetch('/api/portfolio-content', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_CONTENT))
      .then((data) => {
        const merged = deepMergeContent(DEFAULT_CONTENT, data);
        setContent(merged);
      })
      .catch(() => { });
  }, []);

  const deepMergeContent = (defaults: PortfolioContent, partial: Partial<PortfolioContent>): PortfolioContent => {
    const result = { ...defaults } as any;
    for (const key of Object.keys(partial) as (keyof PortfolioContent)[]) {
      const val = (partial as any)[key];
      if (val && typeof val === 'object' && !Array.isArray(val) && (defaults as any)[key] && typeof (defaults as any)[key] === 'object' && !Array.isArray((defaults as any)[key])) {
        result[key] = { ...(defaults as any)[key], ...val };
      } else if (val !== undefined) {
        result[key] = val;
      }
    }

    // Ensure theme dark and light mode structures are fully initialized
    if (!result.theme) result.theme = { ...defaults.theme };
    if (!result.theme.dark) {
      result.theme.dark = {
        headingColor: result.theme.headingColor || defaults.theme.dark.headingColor,
        accentColor: result.theme.accentColor || defaults.theme.dark.accentColor,
        bgPrimary: defaults.theme.dark.bgPrimary || '#07101e',
        bgSecondary: defaults.theme.dark.bgSecondary || '#0c1a2e',
      };
    } else {
      if (!result.theme.dark.bgPrimary) result.theme.dark.bgPrimary = defaults.theme.dark.bgPrimary || '#07101e';
      if (!result.theme.dark.bgSecondary) result.theme.dark.bgSecondary = defaults.theme.dark.bgSecondary || '#0c1a2e';
    }
    if (!result.theme.light) {
      result.theme.light = {
        headingColor: defaults.theme.light.headingColor,
        accentColor: defaults.theme.light.accentColor,
        bgPrimary: defaults.theme.light.bgPrimary || '#e8f4fd',
        bgSecondary: defaults.theme.light.bgSecondary || '#dbeafe',
      };
    } else {
      if (!result.theme.light.bgPrimary) result.theme.light.bgPrimary = defaults.theme.light.bgPrimary || '#e8f4fd';
      if (!result.theme.light.bgSecondary) result.theme.light.bgSecondary = defaults.theme.light.bgSecondary || '#dbeafe';
    }

    return result as PortfolioContent;
  };

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const updateField = <K extends keyof PortfolioContent>(
    section: K,
    field: keyof PortfolioContent[K],
    value: any
  ) => {
    setContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const updateThemeColor = (
    mode: 'dark' | 'light',
    field: 'headingColor' | 'accentColor' | 'bgPrimary' | 'bgSecondary',
    val: string
  ) => {
    setContent((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        [mode]: {
          ...(prev.theme?.[mode] || {}),
          [field]: val,
        },
        ...(mode === 'dark' ? { [field]: val } : {}),
      },
    }));
    setHasChanges(true);
  };

  const updateComponentColor = (
    compKey: string,
    mode: 'dark' | 'light',
    field: 'headingColor' | 'accentColor' | 'bgPrimary' | 'bgSecondary',
    val: string
  ) => {
    setContent((prev) => {
      const existingTheme = prev.theme || {};
      const existingComponents = existingTheme.components || {};
      const existingComp = existingComponents[compKey] || {};
      const existingMode = existingComp[mode] || {};

      return {
        ...prev,
        theme: {
          ...existingTheme,
          components: {
            ...existingComponents,
            [compKey]: {
              ...existingComp,
              [mode]: {
                ...existingMode,
                [field]: val,
              },
            },
          },
        },
      };
    });
    setHasChanges(true);
  };

  const resetComponentColor = (compKey: string) => {
    setContent((prev) => {
      const existingTheme = prev.theme || {};
      const existingComponents = { ...(existingTheme.components || {}) };
      delete existingComponents[compKey];

      return {
        ...prev,
        theme: {
          ...existingTheme,
          components: existingComponents,
        },
      };
    });
    setHasChanges(true);
    showFeedback('success', `Reset ${compKey} colors to global theme defaults.`);
  };

  const getCompColor = (
    compKey: string,
    mode: 'dark' | 'light',
    field: 'headingColor' | 'accentColor' | 'bgPrimary' | 'bgSecondary'
  ) => {
    const compOverride = content.theme?.components?.[compKey]?.[mode]?.[field];
    if (compOverride) return compOverride;

    if (mode === 'dark') {
      const fallback =
        field === 'bgPrimary'
          ? content.theme?.dark?.bgPrimary || content.theme?.bgPrimary || '#07101e'
          : field === 'bgSecondary'
          ? content.theme?.dark?.bgSecondary || content.theme?.bgSecondary || '#0c1a2e'
          : field === 'headingColor'
          ? content.theme?.dark?.headingColor || content.theme?.headingColor || '#D4A853'
          : content.theme?.dark?.accentColor || content.theme?.accentColor || '#34d399';
      return fallback;
    } else {
      const fallback =
        field === 'bgPrimary'
          ? content.theme?.light?.bgPrimary || '#e8f4fd'
          : field === 'bgSecondary'
          ? content.theme?.light?.bgSecondary || '#dbeafe'
          : field === 'headingColor'
          ? content.theme?.light?.headingColor || '#1e293b'
          : content.theme?.light?.accentColor || '#0284c7';
      return fallback;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Always persist to localStorage for instant local availability
    try {
      localStorage.setItem('folio_portfolio_content', JSON.stringify({ data: content, timestamp: Date.now() }));
    } catch { }

    try {
      const res = await fetch('/api/portfolio-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      if (res.ok) {
        showFeedback('success', 'Portfolio content saved successfully! Changes will reflect immediately.');
        setHasChanges(false);
        window.dispatchEvent(new CustomEvent('portfolio-content-updated'));
      } else {
        showFeedback('success', 'Portfolio content saved to browser! Changes active immediately.');
        setHasChanges(false);
        window.dispatchEvent(new CustomEvent('portfolio-content-updated'));
      }
    } catch {
      showFeedback('success', 'Portfolio content saved locally! Changes active immediately.');
      setHasChanges(false);
      window.dispatchEvent(new CustomEvent('portfolio-content-updated'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (data: string, name: string) => {
    setIsUploadingImage(true);
    setUploadPreviewData(data);
    setPreviewLoadState('loading');
    // Set immediate preview in UI for seamless feedback
    updateField('about', 'profileImage', data);

    try {
      const res = await fetch('/api/portfolio-content/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: data, fileName: name }),
      });
      if (res.ok) {
        const result = await res.json();
        const activePath = result.imagePath || data;
        const now = Date.now();
        setPreviewCacheBuster(now);
        updateField('about', 'profileImage', activePath);

        // Invalidate frontend cache so refresh paints new MongoDB image immediately
        try {
          localStorage.removeItem('folio_portfolio_content');
        } catch { }

        // Content is saved permanently to MongoDB on upload!
        setHasChanges(false);
        showFeedback('success', `Profile photo stored in MongoDB GridFS & persisted forever (${result.fileId ? 'ID: ' + String(result.fileId).slice(-6) : 'saved'})`);
        window.dispatchEvent(new CustomEvent('portfolio-content-updated'));
      } else {
        const errorData = await res.json().catch(() => null);
        showFeedback('error', errorData?.error || 'Failed to upload image to MongoDB GridFS.');
        setPreviewLoadState('error');
      }
    } catch (err: any) {
      showFeedback('error', err?.message || 'Error uploading image to server');
      setPreviewLoadState('error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleResumeUpload = async (data: string, name: string) => {
    setIsUploadingResume(true);
    try {
      const res = await fetch('/api/portfolio-content/upload-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileData: data, fileName: name }),
      });
      if (res.ok) {
        const result = await res.json();
        updateField('hero', 'resumeFileName', name);
        showFeedback('success', `Resume uploaded: ${result.resumePath}`);
        window.dispatchEvent(new CustomEvent('portfolio-content-updated'));
      } else {
        showFeedback('error', 'Failed to upload resume.');
      }
    } catch {
      showFeedback('error', 'Server unreachable for resume upload.');
    } finally {
      setIsUploadingResume(false);
    }
  };

  // ── Phrase Management ──
  const addPhrase = () => {
    updateField('hero', 'phrases', [...content.hero.phrases, '']);
  };

  const removePhrase = (index: number) => {
    updateField('hero', 'phrases', content.hero.phrases.filter((_, i) => i !== index));
  };

  const updatePhrase = (index: number, value: string) => {
    const updated = [...content.hero.phrases];
    updated[index] = value;
    updateField('hero', 'phrases', updated);
  };

  // ── Timeline Management ──
  const addTimelineItem = () => {
    updateField('about', 'timeline', [
      ...content.about.timeline,
      { year: '', title: '', description: '' },
    ]);
  };

  const removeTimelineItem = (index: number) => {
    updateField('about', 'timeline', content.about.timeline.filter((_, i) => i !== index));
  };

  const updateTimelineItem = (index: number, field: keyof TimelineItem, value: string) => {
    const updated = [...content.about.timeline];
    updated[index] = { ...updated[index], [field]: value };
    updateField('about', 'timeline', updated);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Palette className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-extrabold text-white">Portfolio Content Editor</h2>
          </div>
          <p className="text-[11px] text-slate-400">
            Edit every section of your portfolio without touching code. Changes persist to{' '}
            <code className="text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded font-mono">
              portfolio_content.json
            </code>
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer ${
            hasChanges
              ? 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-violet-500/20 hover:shadow-violet-500/35'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : hasChanges ? 'Save All Changes' : 'No Changes'}</span>
        </button>
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

      {/* ── Hero Section ── */}
      <SectionPanel
        title="Hero Section"
        icon={<Sparkles className="w-4 h-4 text-amber-400" />}
        color="bg-amber-500/10 border border-amber-500/25"
        defaultOpen={true}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Typewriter Phrases
            </label>
            <button
              onClick={addPhrase}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              Add Phrase
            </button>
          </div>
          <div className="space-y-2">
            {content.hero.phrases.map((phrase, i) => (
              <div key={i} className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-slate-600 shrink-0" />
                <input
                  type="text"
                  value={phrase}
                  onChange={(e) => updatePhrase(i, e.target.value)}
                  placeholder={`Phrase ${i + 1}`}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm outline-none focus:border-amber-500 placeholder-slate-600"
                />
                {content.hero.phrases.length > 1 && (
                  <button
                    onClick={() => removePhrase(i)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <FieldInput
          label="Subtitle"
          value={content.hero.subtitle}
          onChange={(v) => updateField('hero', 'subtitle', v)}
          placeholder="Full Stack Developer | Creative Designer | Tech Enthusiast"
        />

        <FileUpload
          label="Resume PDF"
          accept=".pdf"
          currentFile={content.hero.resumeFileName}
          onUpload={handleResumeUpload}
          icon={<FileText className="w-4 h-4" />}
          isLoading={isUploadingResume}
        />

        <SectionColorControls
          compKey="hero"
          compName="Hero Section"
          content={content}
          updateComponentColor={updateComponentColor}
          resetComponentColor={resetComponentColor}
          getCompColor={getCompColor}
        />
      </SectionPanel>

      {/* ── About Section ── */}
      <SectionPanel
        title="About Section"
        icon={<User className="w-4 h-4 text-cyan-400" />}
        color="bg-cyan-500/10 border border-cyan-500/25"
      >
        <FieldInput
          label="Section Heading"
          value={content.about.heading}
          onChange={(v) => updateField('about', 'heading', v)}
          placeholder="About Me"
        />

        <FieldInput
          label="Bio Paragraph"
          value={content.about.bio}
          onChange={(v) => updateField('about', 'bio', v)}
          placeholder="Hello! I'm..."
          multiline
        />

        <FieldInput
          label="Hobbies & Interests"
          value={content.about.hobbies}
          onChange={(v) => updateField('about', 'hobbies', v)}
          placeholder="When I'm not coding..."
          multiline
        />

        {/* Profile Image Management */}
        <div className="space-y-4 p-4 rounded-xl border border-slate-800 bg-slate-800/30">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Profile Photo</h4>
              <p className="text-[11px] text-slate-400">Upload a portrait photo or specify an image URL</p>
            </div>
            {content.about.profileImage && (
              <button
                type="button"
                onClick={() => {
                  updateField('about', 'profileImage', '');
                  setUploadPreviewData(null);
                  showFeedback('success', 'Profile image removed.');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Image
              </button>
            )}
          </div>

          <FileUpload
            label="Upload Image File (PNG, JPG, WEBP)"
            accept="image/*"
            currentFile={content.about.profileImage || undefined}
            onUpload={handleImageUpload}
            icon={<Image className="w-4 h-4 text-cyan-400" />}
            isLoading={isUploadingImage}
          />

          <FieldInput
            label="Or Image URL / Path"
            value={content.about.profileImage}
            onChange={(v) => {
              updateField('about', 'profileImage', v);
              setPreviewCacheBuster(Date.now());
            }}
            placeholder="/api/images/... or https://images.unsplash.com/..."
          />

          {/* Visual Preview */}
          {(content.about.profileImage || uploadPreviewData) ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Live Display Preview
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {isUploadingImage ? (
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      Streaming to Mongo Chunks...
                    </span>
                  ) : content.about.profileImage.startsWith('/api/images') ? (
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      MongoDB GridFS (Chunks)
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      Custom URL
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Active in About Section
                  </span>
                </div>
              </div>

              <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border-2 border-cyan-500/40 shadow-xl shadow-cyan-950/30 bg-slate-900 group flex items-center justify-center">
                {/* Image element */}
                <img
                  key={`${content.about.profileImage || uploadPreviewData}-${previewCacheBuster}`}
                  src={
                    isUploadingImage && uploadPreviewData
                      ? uploadPreviewData
                      : content.about.profileImage.startsWith('/api/images')
                      ? `${content.about.profileImage}?t=${previewCacheBuster}`
                      : content.about.profileImage
                  }
                  alt="Profile Preview"
                  className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                    previewLoadState === 'loading' && !uploadPreviewData ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={() => {
                    setPreviewLoadState('loaded');
                  }}
                  onError={() => {
                    setPreviewLoadState('error');
                  }}
                />

                {/* Uploading progress overlay */}
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center">
                    <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-2" />
                    <span className="text-xs font-semibold text-cyan-300">Streaming to GridFS</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Uploading chunks to MongoDB...</span>
                  </div>
                )}

                {/* Loading from Mongo Chunks overlay */}
                {!isUploadingImage && previewLoadState === 'loading' && (
                  <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center p-3 text-center">
                    <div className="w-6 h-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-2" />
                    <span className="text-[11px] text-slate-300">Reading Mongo Chunks...</span>
                  </div>
                )}

                {/* Error state */}
                {!isUploadingImage && previewLoadState === 'error' && (
                  <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-3 text-center">
                    <p className="text-xs font-medium text-rose-400 mb-1">Failed to stream from GridFS</p>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewLoadState('loading');
                        setPreviewCacheBuster(Date.now());
                      }}
                      className="mt-1 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 rounded hover:bg-cyan-900/60 transition cursor-pointer"
                    >
                      Retry Mongo Stream
                    </button>
                  </div>
                )}
              </div>

              {/* Status bar under image */}
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[200px] font-mono text-[10px] text-slate-500">
                  {content.about.profileImage}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewLoadState('loading');
                    setPreviewCacheBuster(Date.now());
                  }}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                >
                  Reload from DB
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 text-center">
              <p className="text-xs text-slate-400">
                No profile image selected. The About section will display the placeholder box.
              </p>
            </div>
          )}
        </div>

        {/* Timeline Editor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Journey Timeline
            </label>
            <button
              onClick={addTimelineItem}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              Add Entry
            </button>
          </div>
          <div className="space-y-3">
            {content.about.timeline.map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-slate-800 bg-slate-800/30 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Entry {i + 1}
                  </span>
                  <button
                    onClick={() => removeTimelineItem(i)}
                    className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={item.year}
                    onChange={(e) => updateTimelineItem(i, 'year', e.target.value)}
                    placeholder="Year / Period"
                    className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/60 text-white text-xs outline-none focus:border-cyan-500 placeholder-slate-600"
                  />
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateTimelineItem(i, 'title', e.target.value)}
                    placeholder="Title"
                    className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/60 text-white text-xs outline-none focus:border-cyan-500 placeholder-slate-600"
                  />
                </div>
                <textarea
                  rows={2}
                  value={item.description}
                  onChange={(e) => updateTimelineItem(i, 'description', e.target.value)}
                  placeholder="Description..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/60 text-white text-xs outline-none focus:border-cyan-500 resize-none placeholder-slate-600"
                />
              </div>
            ))}
          </div>
        </div>

        <SectionColorControls
          compKey="about"
          compName="About Section"
          content={content}
          updateComponentColor={updateComponentColor}
          resetComponentColor={resetComponentColor}
          getCompColor={getCompColor}
        />
      </SectionPanel>

      {/* ── Contact Section ── */}
      <SectionPanel
        title="Contact Section"
        icon={<Mail className="w-4 h-4 text-emerald-400" />}
        color="bg-emerald-500/10 border border-emerald-500/25"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldInput
            label="Section Heading"
            value={content.contact.heading}
            onChange={(v) => updateField('contact', 'heading', v)}
            placeholder="Get In Touch"
          />
          <FieldInput
            label="Subtitle"
            value={content.contact.subtitle}
            onChange={(v) => updateField('contact', 'subtitle', v)}
            placeholder="Feel free to reach out..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldInput
            label="Email"
            value={content.contact.email}
            onChange={(v) => updateField('contact', 'email', v)}
            type="email"
            placeholder="your@email.com"
          />
          <FieldInput
            label="Phone"
            value={content.contact.phone}
            onChange={(v) => updateField('contact', 'phone', v)}
            placeholder="+91-..."
          />
        </div>

        <FieldInput
          label="Location"
          value={content.contact.location}
          onChange={(v) => updateField('contact', 'location', v)}
          placeholder="City, State"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldInput
            label="GitHub URL"
            value={content.contact.github}
            onChange={(v) => updateField('contact', 'github', v)}
            type="url"
            placeholder="https://github.com/..."
          />
          <FieldInput
            label="LinkedIn URL"
            value={content.contact.linkedin}
            onChange={(v) => updateField('contact', 'linkedin', v)}
            type="url"
            placeholder="https://linkedin.com/in/..."
          />
        </div>

        <SectionColorControls
          compKey="contact"
          compName="Contact Section"
          content={content}
          updateComponentColor={updateComponentColor}
          resetComponentColor={resetComponentColor}
          getCompColor={getCompColor}
        />
      </SectionPanel>

      {/* ── Projects Section ── */}
      <SectionPanel
        title="Projects Section (Colors & Background)"
        icon={<FolderGit2 className="w-4 h-4 text-sky-400" />}
        color="bg-sky-500/10 border border-sky-500/25"
      >
        <p className="text-xs text-slate-400 mb-2">
          Projects and pinned repositories are fetched dynamically from GitHub. Customize the background gradient, typography, and card accent colors below:
        </p>
        <SectionColorControls
          compKey="projects"
          compName="Projects Section"
          content={content}
          updateComponentColor={updateComponentColor}
          resetComponentColor={resetComponentColor}
          getCompColor={getCompColor}
        />
      </SectionPanel>

      {/* ── Skills Section ── */}
      <SectionPanel
        title="Skills Section (Colors & Background)"
        icon={<Cpu className="w-4 h-4 text-purple-400" />}
        color="bg-purple-500/10 border border-purple-500/25"
      >
        <p className="text-xs text-slate-400 mb-2">
          Interactive skill badges and GitHub activity timeline. Customize the section background and category accent colors below:
        </p>
        <SectionColorControls
          compKey="skills"
          compName="Skills Section"
          content={content}
          updateComponentColor={updateComponentColor}
          resetComponentColor={resetComponentColor}
          getCompColor={getCompColor}
        />
      </SectionPanel>

      {/* ── Achievements Section ── */}
      <SectionPanel
        title="Achievements Section (Colors & Background)"
        icon={<Award className="w-4 h-4 text-amber-400" />}
        color="bg-amber-500/10 border border-amber-500/25"
      >
        <p className="text-xs text-slate-400 mb-2">
          Real-time LeetCode statistics and certifications. Customize the section background and credentials highlight colors below:
        </p>
        <SectionColorControls
          compKey="achievements"
          compName="Achievements Section"
          content={content}
          updateComponentColor={updateComponentColor}
          resetComponentColor={resetComponentColor}
          getCompColor={getCompColor}
        />
      </SectionPanel>

      {/* ── Theme & Colors Section ── */}
      <SectionPanel
        title="Theme & Colors (Backgrounds, Accents & Text)"
        icon={<Palette className="w-4 h-4 text-violet-400" />}
        color="bg-violet-500/10 border border-violet-500/25"
      >
        {/* Preset Palettes */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Quick Preset Palettes (Headings, Accents & Backgrounds)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              {
                name: 'Gold & Emerald (Midnight)',
                darkH: '#D4A853', darkA: '#34d399', darkBgP: '#07101e', darkBgS: '#0c1a2e',
                lightH: '#0f172a', lightA: '#059669', lightBgP: '#e8f4fd', lightBgS: '#dbeafe',
              },
              {
                name: 'Cyber Cyan & Violet (Deep Space)',
                darkH: '#38bdf8', darkA: '#a855f7', darkBgP: '#060b1e', darkBgS: '#110b29',
                lightH: '#0369a1', lightA: '#7c3aed', lightBgP: '#f0f9ff', lightBgS: '#f5f3ff',
              },
              {
                name: 'Royal Purple & Rose (Nebula)',
                darkH: '#c084fc', darkA: '#f43f5e', darkBgP: '#0d081f', darkBgS: '#1a091d',
                lightH: '#581c87', lightA: '#e11d48', lightBgP: '#faf5ff', lightBgS: '#fff1f2',
              },
              {
                name: 'Amber & Crimson (Solar Glow)',
                darkH: '#f59e0b', darkA: '#ec4899', darkBgP: '#120a05', darkBgS: '#1f0c13',
                lightH: '#c2410c', lightA: '#db2777', lightBgP: '#fffbeb', lightBgS: '#fdf2f8',
              },
              {
                name: 'Obsidian & Matrix Teal',
                darkH: '#2dd4bf', darkA: '#818cf8', darkBgP: '#041315', darkBgS: '#091d22',
                lightH: '#0f766e', lightA: '#4338ca', lightBgP: '#f0fdfa', lightBgS: '#e0f2fe',
              },
              {
                name: 'Pure Onyx & Steel Blue',
                darkH: '#60a5fa', darkA: '#38bdf8', darkBgP: '#05070f', darkBgS: '#0d1326',
                lightH: '#1d4ed8', lightA: '#0284c7', lightBgP: '#f8fafc', lightBgS: '#e2e8f0',
              },
            ].map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setContent((prev) => ({
                    ...prev,
                    theme: {
                      ...prev.theme,
                      dark: {
                        headingColor: preset.darkH,
                        accentColor: preset.darkA,
                        bgPrimary: preset.darkBgP,
                        bgSecondary: preset.darkBgS,
                      },
                      light: {
                        headingColor: preset.lightH,
                        accentColor: preset.lightA,
                        bgPrimary: preset.lightBgP,
                        bgSecondary: preset.lightBgS,
                      },
                      headingColor: preset.darkH,
                      accentColor: preset.darkA,
                      bgPrimary: preset.darkBgP,
                      bgSecondary: preset.darkBgS,
                    },
                  }));
                  setHasChanges(true);
                  showFeedback('success', `Applied preset: ${preset.name}`);
                }}
                className="p-2.5 rounded-xl border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 text-left transition-all hover:border-violet-500/50 cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-600" style={{ backgroundColor: preset.darkBgP }} title="Dark Background" />
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.darkH }} title="Dark Heading" />
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.darkA }} title="Dark Accent" />
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-600" style={{ backgroundColor: preset.lightBgP }} title="Light Background" />
                </div>
                <span className="text-[11px] font-semibold text-slate-300 group-hover:text-white block truncate">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setThemeTab('both')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              themeTab === 'both'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Modes
          </button>
          <button
            type="button"
            onClick={() => setThemeTab('dark')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              themeTab === 'dark'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🌙 Dark Mode
          </button>
          <button
            type="button"
            onClick={() => setThemeTab('light')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              themeTab === 'light'
                ? 'bg-amber-500 text-slate-900 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            ☀️ Light Mode
          </button>
        </div>

        {/* Dark Mode Color Controls */}
        {(themeTab === 'both' || themeTab === 'dark') && (
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">🌙</span>
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Dark Mode Colors & Background
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ColorPicker
                label="Dark Heading Color"
                value={content.theme.dark?.headingColor || content.theme.headingColor || '#D4A853'}
                onChange={(v) => updateThemeColor('dark', 'headingColor', v)}
              />
              <ColorPicker
                label="Dark Accent Color"
                value={content.theme.dark?.accentColor || content.theme.accentColor || '#34d399'}
                onChange={(v) => updateThemeColor('dark', 'accentColor', v)}
              />
              <ColorPicker
                label="Dark Primary Background"
                value={content.theme.dark?.bgPrimary || content.theme.bgPrimary || '#07101e'}
                onChange={(v) => updateThemeColor('dark', 'bgPrimary', v)}
              />
              <ColorPicker
                label="Dark Secondary Background (Gradient End)"
                value={content.theme.dark?.bgSecondary || content.theme.bgSecondary || '#0c1a2e'}
                onChange={(v) => updateThemeColor('dark', 'bgSecondary', v)}
              />
            </div>
          </div>
        )}

        {/* Light Mode Color Controls */}
        {(themeTab === 'both' || themeTab === 'light') && (
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">☀️</span>
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Light Mode Colors & Background
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ColorPicker
                label="Light Heading Color"
                value={content.theme.light?.headingColor || '#1e293b'}
                onChange={(v) => updateThemeColor('light', 'headingColor', v)}
              />
              <ColorPicker
                label="Light Accent Color"
                value={content.theme.light?.accentColor || '#0284c7'}
                onChange={(v) => updateThemeColor('light', 'accentColor', v)}
              />
              <ColorPicker
                label="Light Primary Background"
                value={content.theme.light?.bgPrimary || '#e8f4fd'}
                onChange={(v) => updateThemeColor('light', 'bgPrimary', v)}
              />
              <ColorPicker
                label="Light Secondary Background (Gradient End)"
                value={content.theme.light?.bgSecondary || '#dbeafe'}
                onChange={(v) => updateThemeColor('light', 'bgSecondary', v)}
              />
            </div>
          </div>
        )}

        {/* Side-by-Side Live Theme Previews */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Live Preview Comparison (Theme & Background Gradient)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dark Theme Simulation Card */}
            <div
              className="p-5 rounded-2xl border border-slate-700/80 text-slate-200 shadow-xl transition-all duration-500 overflow-hidden relative"
              style={{
                background: `linear-gradient(to bottom, ${content.theme.dark?.bgPrimary || content.theme.bgPrimary || '#07101e'}, ${content.theme.dark?.bgSecondary || content.theme.bgSecondary || '#0c1a2e'})`
              }}
            >
              <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-bold">
                  <span>🌙</span> Dark Background & Theme
                </span>
                <span
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{
                    backgroundColor:
                      content.theme.dark?.accentColor || content.theme.accentColor || '#34d399',
                  }}
                />
              </div>
              <h3
                className="text-xl font-bold mb-1 tracking-tight"
                style={{
                  color:
                    content.theme.dark?.headingColor || content.theme.headingColor || '#D4A853',
                }}
              >
                {content.about.heading || 'About Me'}
              </h3>
              <p className="text-xs text-slate-300 mb-3">
                Full-Stack Developer & Creative Coder
              </p>
              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-900 shadow-sm"
                  style={{
                    backgroundColor:
                      content.theme.dark?.accentColor || content.theme.accentColor || '#34d399',
                  }}
                >
                  Accent Pill
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{
                    color:
                      content.theme.dark?.headingColor || content.theme.headingColor || '#D4A853',
                  }}
                >
                  Featured Text
                </span>
              </div>
            </div>

            {/* Light Theme Simulation Card */}
            <div
              className="p-5 rounded-2xl border border-slate-300 text-slate-800 shadow-xl transition-all duration-500 overflow-hidden relative"
              style={{
                background: `linear-gradient(to bottom, ${content.theme.light?.bgPrimary || '#e8f4fd'}, ${content.theme.light?.bgSecondary || '#dbeafe'})`
              }}
            >
              <div className="flex items-center justify-between mb-3 border-b border-slate-300/80 pb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600 flex items-center gap-1.5 font-bold">
                  <span>☀️</span> Light Background & Theme
                </span>
                <span
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{
                    backgroundColor: content.theme.light?.accentColor || '#0284c7',
                  }}
                />
              </div>
              <h3
                className="text-xl font-bold mb-1 tracking-tight"
                style={{
                  color: content.theme.light?.headingColor || '#1e293b',
                }}
              >
                {content.about.heading || 'About Me'}
              </h3>
              <p className="text-xs text-slate-600 mb-3">
                Full-Stack Developer & Creative Coder
              </p>
              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-white shadow-sm"
                  style={{
                    backgroundColor: content.theme.light?.accentColor || '#0284c7',
                  }}
                >
                  Accent Pill
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{
                    color: content.theme.light?.headingColor || '#1e293b',
                  }}
                >
                  Featured Text
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Component-Specific Colors & Backgrounds (Customize Any Component) ── */}
        <div className="pt-5 border-t border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Select Any Component & Customize Colors
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Customize individual backgrounds, text & accent colors for any component across the portfolio.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCompThemeTab('dark')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  compThemeTab === 'dark'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white bg-slate-800/60'
                }`}
              >
                🌙 Dark Mode
              </button>
              <button
                type="button"
                onClick={() => setCompThemeTab('light')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  compThemeTab === 'light'
                    ? 'bg-amber-500 text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-white bg-slate-800/60'
                }`}
              >
                ☀️ Light Mode
              </button>
            </div>
          </div>

          {/* Component Tabs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {PORTFOLIO_COMPONENTS.map((comp) => {
              const isSelected = selectedCompKey === comp.key;
              const isCustom = Boolean(content.theme?.components?.[comp.key]);
              return (
                <button
                  key={comp.key}
                  type="button"
                  onClick={() => setSelectedCompKey(comp.key)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-500/10 shadow-md shadow-cyan-500/15'
                      : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">{comp.icon}</span>
                    {isCustom ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Customized colors active" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600" title="Using global theme defaults" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-white truncate">{comp.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{isCustom ? 'Customized' : 'Theme Default'}</div>
                </button>
              );
            })}
          </div>

          {/* Active Component Customizer Box */}
          {(() => {
            const activeComp = PORTFOLIO_COMPONENTS.find((c) => c.key === selectedCompKey) || PORTFOLIO_COMPONENTS[0];
            const isCustom = Boolean(content.theme?.components?.[selectedCompKey]);

            return (
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{activeComp.icon}</span>
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{activeComp.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isCustom
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isCustom ? 'Custom Colors Active' : 'Inheriting Global Theme'}
                        </span>
                      </h5>
                      <p className="text-[11px] text-slate-400">{activeComp.desc}</p>
                    </div>
                  </div>

                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => resetComponentColor(selectedCompKey)}
                      className="px-2.5 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Global Theme</span>
                    </button>
                  )}
                </div>

                {/* Color Pickers for Selected Component */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <ColorPicker
                    label={`${compThemeTab === 'dark' ? 'Dark' : 'Light'} Primary Background`}
                    value={getCompColor(selectedCompKey, compThemeTab, 'bgPrimary')}
                    onChange={(v) => updateComponentColor(selectedCompKey, compThemeTab, 'bgPrimary', v)}
                  />
                  <ColorPicker
                    label={`${compThemeTab === 'dark' ? 'Dark' : 'Light'} Secondary Background`}
                    value={getCompColor(selectedCompKey, compThemeTab, 'bgSecondary')}
                    onChange={(v) => updateComponentColor(selectedCompKey, compThemeTab, 'bgSecondary', v)}
                  />
                  <ColorPicker
                    label={`${compThemeTab === 'dark' ? 'Dark' : 'Light'} Heading / Text`}
                    value={getCompColor(selectedCompKey, compThemeTab, 'headingColor')}
                    onChange={(v) => updateComponentColor(selectedCompKey, compThemeTab, 'headingColor', v)}
                  />
                  <ColorPicker
                    label={`${compThemeTab === 'dark' ? 'Dark' : 'Light'} Accent Color`}
                    value={getCompColor(selectedCompKey, compThemeTab, 'accentColor')}
                    onChange={(v) => updateComponentColor(selectedCompKey, compThemeTab, 'accentColor', v)}
                  />
                </div>

                {/* Live Preview for Selected Component */}
                <div
                  className="p-4 rounded-xl border border-white/10 shadow-lg transition-all duration-300 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(to bottom, ${getCompColor(selectedCompKey, compThemeTab, 'bgPrimary')}, ${getCompColor(selectedCompKey, compThemeTab, 'bgSecondary')})`
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[11px] font-mono uppercase tracking-wider font-bold"
                      style={{ color: getCompColor(selectedCompKey, compThemeTab, 'headingColor') }}
                    >
                      {activeComp.name} Preview ({compThemeTab === 'dark' ? '🌙 Dark' : '☀️ Light'})
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm"
                      style={{ backgroundColor: getCompColor(selectedCompKey, compThemeTab, 'accentColor') }}
                    >
                      Accent Badge
                    </span>
                  </div>
                  <h4
                    className="text-base font-extrabold mb-1"
                    style={{ color: getCompColor(selectedCompKey, compThemeTab, 'headingColor') }}
                  >
                    Customized {activeComp.name} Component
                  </h4>
                  <p className={`text-xs ${compThemeTab === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    Background gradient, typography, and accent badges respond live to your selection.
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      </SectionPanel>

      {/* ── Footer Section ── */}
      <SectionPanel
        title="Footer"
        icon={<Type className="w-4 h-4 text-rose-400" />}
        color="bg-rose-500/10 border border-rose-500/25"
      >
        <FieldInput
          label="Copyright Name"
          value={content.footer.text}
          onChange={(v) => updateField('footer', 'text', v)}
          placeholder="Dipayan"
        />
        <div className="p-3 rounded-xl border border-slate-800 bg-slate-800/30">
          <p className="text-xs text-slate-400">
            Preview: © {new Date().getFullYear()}{' '}
            <span className="text-white font-medium">{content.footer.text}</span>. Crafted with
            passion and precision.
          </p>
        </div>

        <SectionColorControls
          compKey="footer"
          compName="Footer"
          content={content}
          updateComponentColor={updateComponentColor}
          resetComponentColor={resetComponentColor}
          getCompColor={getCompColor}
        />
      </SectionPanel>

      {/* Floating Save Button (sticky at bottom when changes exist) */}
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
              className="inline-flex items-center gap-2.5 px-8 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-bold shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:from-violet-600 hover:to-purple-700 transition-all cursor-pointer border border-violet-400/30"
            >
              <Save className="w-4.5 h-4.5" />
              <span>{isSaving ? 'Saving Changes...' : 'Save All Changes'}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
