import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search, ExternalLink, Star, GitFork, FolderGit2,
  RefreshCw, Code2, Globe, Radio, Terminal, Copy, Check,
  X, LayoutGrid, List, Filter, ArrowUpRight, Info, Zap,
  Sun, Moon, ArrowLeft,
} from "lucide-react";
import '../styles/allproject.css';

// ─── GitHub SVG icon ─────────────────────────────────────────────────────────
const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

// ─── Types ───────────────────────────────────────────────────────────────────
interface Repo {
  id: number; name: string; full_name: string; description: string | null;
  html_url: string; homepage: string | null; language: string | null;
  stargazers_count: number; forks_count: number; topics: string[];
  updated_at: string; created_at: string; size: number;
  fork: boolean; archived: boolean; default_branch: string;
  liveUrl?: string | null; gradient?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const GITHUB_USERNAME: string = (import.meta as any).env?.VITE_GITHUB_USERNAME || "";

const LANG_LIGHT: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  TypeScript: { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-100", border: "border-blue-200" },
  JavaScript: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-100", border: "border-amber-200" },
  Python: { dot: "bg-green-600", text: "text-green-700", bg: "bg-green-100", border: "border-green-200" },
  "Jupyter Notebook": { dot: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-100", border: "border-orange-200" },
  HTML: { dot: "bg-rose-500", text: "text-rose-700", bg: "bg-rose-100", border: "border-rose-200" },
  CSS: { dot: "bg-sky-500", text: "text-sky-700", bg: "bg-sky-100", border: "border-sky-200" },
  "C++": { dot: "bg-pink-500", text: "text-pink-700", bg: "bg-pink-100", border: "border-pink-200" },
  C: { dot: "bg-slate-500", text: "text-slate-700", bg: "bg-slate-100", border: "border-slate-200" },
};
const LANG_DARK: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  TypeScript: { dot: "bg-blue-400", text: "text-blue-300", bg: "bg-blue-400/10", border: "border-blue-400/25" },
  JavaScript: { dot: "bg-yellow-400", text: "text-yellow-300", bg: "bg-yellow-400/10", border: "border-yellow-400/25" },
  Python: { dot: "bg-emerald-400", text: "text-emerald-300", bg: "bg-emerald-400/10", border: "border-emerald-400/25" },
  "Jupyter Notebook": { dot: "bg-orange-400", text: "text-orange-300", bg: "bg-orange-400/10", border: "border-orange-400/25" },
  HTML: { dot: "bg-rose-400", text: "text-rose-300", bg: "bg-rose-400/10", border: "border-rose-400/25" },
  CSS: { dot: "bg-sky-400", text: "text-sky-300", bg: "bg-sky-400/10", border: "border-sky-400/25" },
  "C++": { dot: "bg-pink-400", text: "text-pink-300", bg: "bg-pink-400/10", border: "border-pink-400/25" },
  C: { dot: "bg-slate-400", text: "text-slate-300", bg: "bg-slate-400/10", border: "border-slate-400/25" },
};

const LIGHT_GRADIENTS = [
  "from-sky-300/60 via-blue-200/40 to-transparent",
  "from-teal-300/60 via-cyan-200/40 to-transparent",
  "from-amber-300/60 via-orange-200/40 to-transparent",
  "from-violet-300/60 via-purple-200/40 to-transparent",
  "from-emerald-300/60 via-green-200/40 to-transparent",
  "from-rose-300/60 via-pink-200/40 to-transparent",
];
const DARK_GRADIENTS = [
  "from-indigo-700/50 via-blue-800/30 to-transparent",
  "from-violet-700/50 via-purple-800/30 to-transparent",
  "from-slate-600/50 via-slate-700/30 to-transparent",
  "from-teal-700/50 via-cyan-800/30 to-transparent",
  "from-rose-800/50 via-pink-900/30 to-transparent",
  "from-indigo-800/50 via-slate-700/30 to-transparent",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const day = Math.floor(h / 24); if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30); if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

// ─── AnimatedCounter ─────────────────────────────────────────────────────────
const AnimatedCounter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    if (value <= 0) { setCount(value); return; }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / 1100, 1);
          setCount(Math.floor((1 - Math.pow(1 - p, 3)) * value));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);
  return <span ref={ref}>{count.toLocaleString()}</span>;
};

// ─── 3D Wireframe Octahedron SVG ─────────────────────────────────────────────
const Octahedron = ({ color, size = 70, opacity = 0.8 }: { color: string; size?: number; opacity?: number }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" style={{ opacity }}>
    <line x1="40" y1="4" x2="76" y2="40" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <line x1="76" y1="40" x2="40" y2="76" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <line x1="40" y1="76" x2="4" y2="40" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <line x1="4" y1="40" x2="40" y2="4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <line x1="40" y1="4" x2="40" y2="76" stroke={color} strokeWidth="1" opacity="0.6" />
    <line x1="4" y1="40" x2="76" y2="40" stroke={color} strokeWidth="1" opacity="0.6" />
    <line x1="40" y1="4" x2="22" y2="32" stroke={color} strokeWidth="1" opacity="0.45" />
    <line x1="40" y1="4" x2="58" y2="32" stroke={color} strokeWidth="1" opacity="0.45" />
    <line x1="22" y1="32" x2="58" y2="32" stroke={color} strokeWidth="1" opacity="0.45" />
    <line x1="22" y1="32" x2="40" y2="76" stroke={color} strokeWidth="1" opacity="0.45" />
    <line x1="58" y1="32" x2="40" y2="76" stroke={color} strokeWidth="1" opacity="0.45" />
    <circle cx="40" cy="4" r="2.5" fill={color} opacity="0.7" />
    <circle cx="40" cy="76" r="2.5" fill={color} opacity="0.7" />
    <circle cx="4" cy="40" r="2.5" fill={color} opacity="0.7" />
    <circle cx="76" cy="40" r="2.5" fill={color} opacity="0.7" />
  </svg>
);

// ─── Cloud shape (light mode background) ─────────────────────────────────────
const CloudShape = ({ style }: { style: React.CSSProperties }) => (
  <div className="absolute pointer-events-none select-none" style={style}>
    <div className="relative" style={{ width: 140, height: 60 }}>
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-white/60 rounded-full" />
      <div className="absolute bottom-6 left-8  w-20 h-14 bg-white/50 rounded-full" />
      <div className="absolute bottom-8 left-16 w-16 h-12 bg-white/45 rounded-full" />
      <div className="absolute bottom-5 right-8 w-18 h-10 bg-white/50 rounded-full" />
    </div>
  </div>
);

// ─── Floating 3D shapes config ────────────────────────────────────────────────
const LIGHT_SHAPES = [
  { x: "8%", y: "12%", size: 60, color: "#0d9488", rot: 12, delay: 0, duration: 7 },
  { x: "82%", y: "8%", size: 48, color: "#f97316", rot: -20, delay: 1.5, duration: 9 },
  { x: "72%", y: "35%", size: 70, color: "#0d9488", rot: 8, delay: 0.8, duration: 8 },
  { x: "15%", y: "45%", size: 42, color: "#f97316", rot: -15, delay: 2.2, duration: 11 },
  { x: "55%", y: "70%", size: 55, color: "#0d9488", rot: 25, delay: 3, duration: 10 },
  { x: "88%", y: "65%", size: 38, color: "#f97316", rot: -8, delay: 0.5, duration: 8.5 },
  { x: "35%", y: "15%", size: 44, color: "#f97316", rot: 18, delay: 1.8, duration: 9.5 },
  { x: "5%", y: "75%", size: 50, color: "#0d9488", rot: -22, delay: 4, duration: 12 },
];
const DARK_SHAPES = [
  { x: "8%", y: "12%", size: 60, color: "#818cf8", rot: 12, delay: 0, duration: 7 },
  { x: "82%", y: "8%", size: 48, color: "#94a3b8", rot: -20, delay: 1.5, duration: 9 },
  { x: "72%", y: "35%", size: 70, color: "#6366f1", rot: 8, delay: 0.8, duration: 8 },
  { x: "15%", y: "45%", size: 42, color: "#cbd5e1", rot: -15, delay: 2.2, duration: 11 },
  { x: "55%", y: "70%", size: 55, color: "#818cf8", rot: 25, delay: 3, duration: 10 },
  { x: "88%", y: "65%", size: 38, color: "#94a3b8", rot: -8, delay: 0.5, duration: 8.5 },
  { x: "35%", y: "15%", size: 44, color: "#6366f1", rot: 18, delay: 1.8, duration: 9.5 },
  { x: "5%", y: "75%", size: 50, color: "#818cf8", rot: -22, delay: 4, duration: 12 },
];

// ─── Sunny Sky Background ─────────────────────────────────────────────────────
const SkyBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden" style={{
    background: "linear-gradient(175deg, #cce9f5 0%, #d4edf9 25%, #ddf1f9 55%, #e8f6fb 80%, #f0f9ff 100%)"
  }}>
    {/* Grid */}
    <div className="absolute inset-0" style={{
      backgroundImage: "linear-gradient(rgba(13,148,136,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(13,148,136,0.08) 1px,transparent 1px)",
      backgroundSize: "55px 55px",
    }} />

    {/* Concentric rings — teal */}
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      {[500, 400, 310, 230, 160, 100, 55].map((r, i) => (
        <div key={r} className="absolute rounded-full border border-teal-400/18"
          style={{
            width: r, height: r, top: -r / 2, left: -r / 2,
            animation: `pulse-ring ${3.5 + i * 0.7}s ease-in-out infinite`,
            animationDelay: `${i * 0.45}s`
          }} />
      ))}
      {/* Spinning dashed ring — orange */}
      <div className="absolute rounded-full border-2 border-dashed border-orange-400/30"
        style={{
          width: 370, height: 370, top: -185, left: -185,
          animation: "spin-3d 22s linear infinite"
        }} />
      <div className="absolute rounded-full border border-dashed border-teal-400/25"
        style={{
          width: 270, height: 270, top: -135, left: -135,
          animation: "spin-3d-rev 16s linear infinite"
        }} />
    </div>

    {/* Sun */}
    <div className="absolute top-10 right-16 pointer-events-none" style={{ animation: "sun-pulse 4s ease-in-out infinite" }}>
      <div className="relative w-20 h-20">
        {/* Rays */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
          <div key={deg} className="absolute inset-0 flex items-center justify-center" style={{ transform: `rotate(${deg}deg)` }}>
            <div className="absolute bg-amber-300/60 rounded-full" style={{ width: 3, height: 18, top: -22 }} />
          </div>
        ))}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.8),0_0_60px_rgba(251,191,36,0.4)]" />
      </div>
    </div>

    {/* Floating clouds */}
    {[
      { style: { top: "6%", left: "18%", animation: "cloud-bob 7s ease-in-out infinite", opacity: 0.85 } },
      { style: { top: "14%", right: "25%", animation: "cloud-bob 9s ease-in-out infinite 1.5s", opacity: 0.7, transform: "scale(1.4)" } },
      { style: { top: "28%", left: "60%", animation: "cloud-bob 8s ease-in-out infinite 3s", opacity: 0.65, transform: "scale(0.8)" } },
      { style: { bottom: "20%", left: "8%", animation: "cloud-bob 11s ease-in-out infinite 0.8s", opacity: 0.6, transform: "scale(1.2)" } },
      { style: { bottom: "12%", right: "10%", animation: "cloud-bob 10s ease-in-out infinite 2s", opacity: 0.7 } },
    ].map((c, i) => <CloudShape key={i} style={c.style as React.CSSProperties} />)}

    {/* Floating 3D shapes */}
    {LIGHT_SHAPES.map((s, i) => (
      <div key={i} className="absolute pointer-events-none select-none"
        style={{
          left: s.x, top: s.y,
          animation: `float ${s.duration}s ease-in-out infinite`,
          animationDelay: `${s.delay}s`,
          transform: `rotate(${s.rot}deg)`
        }}>
        <Octahedron color={s.color} size={s.size} opacity={0.75} />
      </div>
    ))}

    {/* Soft vignette bottom */}
    <div className="absolute inset-0 pointer-events-none"
      style={{ background: "radial-gradient(ellipse 110% 70% at 50% 50%, transparent 30%, rgba(204,233,245,0.3) 70%, rgba(204,233,245,0.6) 100%)" }} />
  </div>
);

// ─── Moonlit Night Background ─────────────────────────────────────────────────
const NightBackground = () => {
  const stars = useMemo(() => Array.from({ length: 80 }, () => ({
    x: Math.random() * 100, y: Math.random() * 100,
    r: 0.8 + Math.random() * 1.8,
    delay: Math.random() * 5, dur: 2 + Math.random() * 4,
  })), []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" style={{
      background: "linear-gradient(175deg,#060b1a 0%,#0c1330 30%,#0f172a 60%,#0a1628 100%)"
    }}>
      {/* Stars */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {stars.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white"
            style={{ animation: `twinkle ${s.dur}s ease-in-out infinite`, animationDelay: `${s.delay}s` }} />
        ))}
      </svg>

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.035]" style={{
        backgroundImage: "linear-gradient(rgba(129,140,248,1) 1px,transparent 1px),linear-gradient(90deg,rgba(129,140,248,1) 1px,transparent 1px)",
        backgroundSize: "55px 55px",
      }} />

      {/* Concentric rings — indigo */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {[500, 400, 310, 230, 160, 100, 55].map((r, i) => (
          <div key={r} className="absolute rounded-full border border-indigo-500/12"
            style={{
              width: r, height: r, top: -r / 2, left: -r / 2,
              animation: `pulse-ring ${4 + i * 0.8}s ease-in-out infinite`, animationDelay: `${i * 0.5}s`
            }} />
        ))}
        <div className="absolute rounded-full border border-dashed border-indigo-400/20"
          style={{ width: 370, height: 370, top: -185, left: -185, animation: "spin-3d 28s linear infinite" }} />
        <div className="absolute rounded-full border border-dashed border-slate-400/15"
          style={{ width: 270, height: 270, top: -135, left: -135, animation: "spin-3d-rev 20s linear infinite" }} />
      </div>

      {/* Moon */}
      <div className="absolute top-8 right-14 pointer-events-none">
        <div className="relative w-16 h-16">
          <div className="absolute -inset-4 rounded-full bg-sky-200/5" style={{ animation: "moon-halo 5s ease-in-out infinite" }} />
          <div className="absolute -inset-2 rounded-full bg-sky-100/8 blur-sm" />
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-300 shadow-[0_0_40px_rgba(186,230,253,0.35)]" />
          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-slate-300/40" />
          <div className="absolute top-6 left-3 w-3 h-3 rounded-full bg-slate-300/30" />
          <div className="absolute bottom-4 right-5 w-2 h-2 rounded-full bg-slate-300/35" />
        </div>
      </div>

      {/* Aurora bands */}
      {[
        { top: "30%", w: "60%", color: "rgba(99,102,241,0.07)", delay: 0 },
        { top: "50%", w: "45%", color: "rgba(139,92,246,0.05)", delay: 2 },
        { top: "65%", w: "55%", color: "rgba(59,130,246,0.06)", delay: 1 },
      ].map((a, i) => (
        <div key={i} className="absolute left-0 rounded-full blur-3xl pointer-events-none"
          style={{
            top: a.top, width: a.w, height: 120, background: a.color,
            animation: `aurora 8s ease-in-out infinite`, animationDelay: `${a.delay}s`
          }} />
      ))}

      {/* Floating 3D shapes */}
      {DARK_SHAPES.map((s, i) => (
        <div key={i} className="absolute pointer-events-none select-none"
          style={{
            left: s.x, top: s.y,
            animation: `float ${s.duration}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
            transform: `rotate(${s.rot}deg)`
          }}>
          <Octahedron color={s.color} size={s.size} opacity={0.65} />
        </div>
      ))}
    </div>
  );
};

// ─── Toast ───────────────────────────────────────────────────────────────────
interface ToastMsg { id: number; text: string; type: "success" | "error" | "info" }
let _tid = 0;
let _setToasts: React.Dispatch<React.SetStateAction<ToastMsg[]>> | null = null;
function showToast(text: string, type: ToastMsg["type"] = "success") {
  const id = ++_tid;
  _setToasts?.((p) => [...p.slice(-2), { id, text, type }]);
  setTimeout(() => _setToasts?.((p) => p.filter((t) => t.id !== id)), 3200);
}
const Toaster = ({ isDark }: { isDark: boolean }) => {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  _setToasts = setToasts;
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
            className={`text-xs px-4 py-2.5 rounded-2xl border backdrop-blur-xl shadow-2xl max-w-xs font-medium ${isDark
                ? t.type === "success" ? "bg-emerald-950/90 border-emerald-400/30 text-emerald-200"
                  : t.type === "error" ? "bg-rose-950/90 border-rose-400/30 text-rose-200"
                    : "bg-slate-900/90 border-slate-600 text-slate-200"
                : t.type === "success" ? "bg-green-50 border-green-200 text-green-800 shadow-green-100"
                  : t.type === "error" ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-sky-50 border-sky-200 text-sky-800"
              }`}>{t.text}</motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, value, label, loading, isDark, accentClass }: {
  icon: React.ComponentType<{ className?: string }>; value: number; label: string; loading: boolean; isDark: boolean; accentClass: string;
}) => (
  <motion.div whileHover={{ scale: 1.04, y: -3 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
    className={`relative group p-5 rounded-3xl border transition-all cursor-default overflow-hidden ${isDark
        ? "bg-slate-900/70 border-indigo-500/15 backdrop-blur-xl hover:border-indigo-400/30 hover:shadow-[0_0_25px_rgba(99,102,241,0.2)]"
        : "bg-white/75 border-sky-200/60 shadow-[0_4px_20px_rgba(186,230,253,0.35)] hover:shadow-[0_6px_32px_rgba(251,191,36,0.35)] hover:border-amber-300/50 backdrop-blur-xl"
      }`}>
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? "bg-gradient-to-br from-indigo-500/5 to-transparent" : "bg-gradient-to-br from-amber-100/40 to-transparent"}`} />
    <div className={`flex items-center gap-2.5 mb-2 ${accentClass}`}>
      <Icon className="w-4 h-4" />
      <span className="font-mono text-2xl font-bold tracking-tight">
        {loading ? <span className={`animate-pulse ${isDark ? "text-white/20" : "text-slate-300"}`}>—</span> : <AnimatedCounter value={value} />}
      </span>
    </div>
    <p className={`text-[10px] uppercase tracking-widest font-semibold ${isDark ? "text-white/30" : "text-slate-400"}`}>{label}</p>
  </motion.div>
);

// ─── Language Badge ───────────────────────────────────────────────────────────
const LangBadge = ({ lang, isDark }: { lang: string; isDark: boolean }) => {
  const c = (isDark ? LANG_DARK : LANG_LIGHT)[lang];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${c?.bg ?? (isDark ? "bg-white/5" : "bg-slate-100")} ${c?.text ?? (isDark ? "text-white/60" : "text-slate-600")} ${c?.border ?? (isDark ? "border-white/10" : "border-slate-200")}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c?.dot ?? "bg-slate-400"}`} />
      {lang}
    </span>
  );
};

// ─── Repo Card (Grid) ─────────────────────────────────────────────────────────
const RepoCard = ({ repo, idx, onSelect, isDark }: { repo: Repo; idx: number; onSelect: (r: Repo) => void; isDark: boolean }) => (
  <motion.article
    initial={{ opacity: 0, y: 28 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.5) }}
    whileHover={{ y: -6, scale: 1.01 }}
    className={`group relative flex flex-col rounded-3xl overflow-hidden border transition-all duration-300 cursor-pointer ${isDark
        ? "bg-slate-900/75 border-indigo-500/15 backdrop-blur-xl hover:border-indigo-400/30 hover:shadow-[0_8px_40px_rgba(99,102,241,0.25),0_0_0_1px_rgba(99,102,241,0.1)]"
        : "bg-white/80 border-sky-200/70 shadow-[0_4px_24px_rgba(186,230,253,0.4)] backdrop-blur-xl hover:shadow-[0_12px_50px_rgba(251,191,36,0.4),0_4px_20px_rgba(251,191,36,0.2)] hover:border-amber-300/60"
      }`}
  >
    {/* Banner */}
    <div className={`relative h-24 bg-gradient-to-br ${repo.gradient} overflow-hidden`}>
      <div className={`absolute inset-0 ${isDark ? "bg-slate-950/50" : "bg-white/20"}`} />
      <div className="relative z-10 h-full p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          {repo.liveUrl ? (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${isDark ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-200" : "bg-emerald-100 border-emerald-300 text-emerald-700"}`}>
              <span className="relative flex w-1.5 h-1.5">
                <span className="animate-[live-ping_1.2s_ease-out_infinite] absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </span>
              LIVE
            </span>
          ) : (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${isDark ? "bg-white/5 border-white/10 text-white/50" : "bg-white/60 border-sky-200 text-sky-600"}`}>
              <Code2 className="w-3 h-3" /> REPO
            </span>
          )}
          <button onClick={(e) => { e.stopPropagation(); onSelect(repo); }}
            className={`p-1.5 rounded-xl transition-all ${isDark ? "bg-black/40 text-white/50 hover:text-white hover:bg-black/60" : "bg-white/60 text-slate-500 hover:text-slate-900 hover:bg-white/90 shadow-sm"}`}>
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          {repo.language && <LangBadge lang={repo.language} isDark={isDark} />}
          <span className={`text-[10px] ml-auto ${isDark ? "text-white/40" : "text-slate-500"}`}>{timeAgo(repo.updated_at)}</span>
        </div>
      </div>
    </div>

    {/* Body */}
    <div className="flex-1 flex flex-col p-5">
      <h3 onClick={() => onSelect(repo)}
        className={`text-base font-bold mb-2 line-clamp-1 transition-colors ${isDark ? "text-white/90 group-hover:text-indigo-300" : "text-slate-800 group-hover:text-amber-600"}`}>
        {repo.name}
      </h3>
      <p className={`text-sm leading-relaxed line-clamp-2 mb-4 flex-1 ${isDark ? "text-white/40" : "text-slate-500"}`}>
        {repo.description || "No description provided."}
      </p>

      {repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {repo.topics.slice(0, 3).map((t) => (
            <span key={t} className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium ${isDark ? "bg-indigo-500/10 border-indigo-400/20 text-indigo-300" : "bg-sky-50 border-sky-200 text-sky-600"}`}>#{t}</span>
          ))}
          {repo.topics.length > 3 && <span className={`text-[10px] ${isDark ? "text-white/25" : "text-slate-400"}`}>+{repo.topics.length - 3}</span>}
        </div>
      )}

      <div className={`pt-3 border-t ${isDark ? "border-white/5" : "border-sky-100"}`}>
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className={`flex items-center gap-3 ${isDark ? "text-white/35" : "text-slate-400"}`}>
            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{repo.stargazers_count}</span>
            <span className="flex items-center gap-1"><GitFork className="w-3 h-3 text-teal-400" />{repo.forks_count}</span>
          </div>
          <span className={`text-[10px] ${isDark ? "text-white/20" : "text-slate-300"}`}>{(repo.size / 1024).toFixed(1)} MB</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <a href={repo.html_url} target="_blank" rel="noreferrer"
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-all ${isDark
                ? "bg-white/[0.04] border-white/10 text-white/55 hover:text-white hover:border-white/25 hover:shadow-[0_0_15px_rgba(148,163,184,0.2)]"
                : "bg-sky-50 border-sky-200 text-sky-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)]"
              }`}>
            <GithubIcon className="w-3.5 h-3.5" /> Code
          </a>
          {repo.liveUrl ? (
            <a href={repo.liveUrl} target="_blank" rel="noreferrer"
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all ${isDark
                  ? "bg-emerald-500/15 border-emerald-400/25 text-emerald-200 hover:bg-emerald-500/28 hover:shadow-[0_0_18px_rgba(52,211,153,0.3)]"
                  : "bg-teal-500 border-teal-600 text-white hover:bg-amber-500 hover:border-amber-600 hover:shadow-[0_0_24px_rgba(251,191,36,0.55)] transition-all"
                }`}>
              <ExternalLink className="w-3.5 h-3.5" /> Demo
            </a>
          ) : (
            <button onClick={() => onSelect(repo)}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-all ${isDark
                  ? "bg-white/[0.03] border-white/8 text-white/35 hover:text-indigo-300 hover:border-indigo-400/25"
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 hover:shadow-[0_0_16px_rgba(251,191,36,0.35)]"
                }`}>
              <Info className="w-3.5 h-3.5" /> Details
            </button>
          )}
        </div>
      </div>
    </div>
  </motion.article>
);

// ─── Repo Row (List) ──────────────────────────────────────────────────────────
const RepoRow = ({ repo, idx, onSelect, isDark }: { repo: Repo; idx: number; onSelect: (r: Repo) => void; isDark: boolean }) => (
  <motion.div
    initial={{ opacity: 0, x: -14 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.28, delay: Math.min(idx * 0.03, 0.4) }}
    className={`group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all ${isDark
        ? "bg-slate-900/65 border-indigo-500/12 backdrop-blur-xl hover:border-indigo-400/25 hover:bg-slate-900/85 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
        : "bg-white/75 border-sky-200/60 shadow-[0_2px_14px_rgba(186,230,253,0.3)] backdrop-blur-xl hover:border-amber-300/50 hover:shadow-[0_6px_30px_rgba(251,191,36,0.3)]"
      }`}
  >
    <div className="flex-1 min-w-0">
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <h3 onClick={() => onSelect(repo)}
          className={`text-sm font-bold cursor-pointer transition-colors ${isDark ? "text-white/85 hover:text-indigo-300" : "text-slate-800 hover:text-amber-600"}`}>
          {repo.name}
        </h3>
        {repo.liveUrl && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${isDark ? "bg-emerald-500/15 border-emerald-400/25 text-emerald-200" : "bg-emerald-100 border-emerald-300 text-emerald-700"}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
          </span>
        )}
        {repo.language && <LangBadge lang={repo.language} isDark={isDark} />}
      </div>
      <p className={`text-xs line-clamp-1 mb-1.5 ${isDark ? "text-white/35" : "text-slate-400"}`}>{repo.description || "No description."}</p>
      <div className={`flex items-center gap-4 text-[11px] ${isDark ? "text-white/30" : "text-slate-400"}`}>
        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{repo.stargazers_count}</span>
        <span className="flex items-center gap-1"><GitFork className="w-3 h-3 text-teal-400" />{repo.forks_count}</span>
        <span>Updated {timeAgo(repo.updated_at)}</span>
      </div>
    </div>
    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
      <a href={repo.html_url} target="_blank" rel="noreferrer"
        className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-medium border transition-all ${isDark ? "bg-white/[0.04] border-white/10 text-white/50 hover:text-white hover:border-white/22 hover:shadow-[0_0_12px_rgba(148,163,184,0.2)]"
            : "bg-sky-50 border-sky-200 text-sky-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 hover:shadow-[0_0_18px_rgba(251,191,36,0.4)]"
          }`}>
        <GithubIcon className="w-3.5 h-3.5" /> Code
      </a>
      {repo.liveUrl && (
        <a href={repo.liveUrl} target="_blank" rel="noreferrer"
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold border transition-all ${isDark ? "bg-emerald-500/15 border-emerald-400/25 text-emerald-200 hover:bg-emerald-500/25 hover:shadow-[0_0_18px_rgba(52,211,153,0.3)]"
              : "bg-teal-500 border-teal-600 text-white hover:bg-amber-500 hover:border-amber-600 hover:shadow-[0_0_22px_rgba(251,191,36,0.5)]"
            }`}>
          <ExternalLink className="w-3.5 h-3.5" /> Demo
        </a>
      )}
      <button onClick={() => onSelect(repo)}
        className={`p-2 rounded-xl border transition-all ${isDark ? "bg-white/[0.03] border-white/8 text-white/35 hover:text-indigo-300 hover:border-indigo-400/25" : "bg-sky-50 border-sky-200 text-sky-400 hover:text-amber-500 hover:border-amber-300 hover:shadow-[0_0_14px_rgba(251,191,36,0.35)]"}`}>
        <Info className="w-4 h-4" />
      </button>
    </div>
  </motion.div>
);

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const RepoModal = ({ repo, onClose, isDark }: { repo: Repo; onClose: () => void; isDark: boolean }) => {
  const [copied, setCopied] = useState(false);
  const cloneCmd = `git clone ${repo.html_url}.git`;
  const handleCopy = () => {
    navigator.clipboard.writeText(cloneCmd);
    setCopied(true);
    showToast("Clone command copied!", "success");
    setTimeout(() => setCopied(false), 2000);
  };
  const lang = repo.language ? (isDark ? LANG_DARK : LANG_LIGHT)[repo.language] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className={`absolute inset-0 backdrop-blur-md ${isDark ? "bg-slate-950/75" : "bg-sky-900/30"}`} />
      <motion.div initial={{ opacity: 0, scale: 0.93, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 18 }}
        className={`relative w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden z-10 ${isDark ? "bg-slate-900/97 border-indigo-500/20 shadow-indigo-500/10" : "bg-white/97 border-sky-200 shadow-sky-300/30"
          }`}>
        {/* Gradient stripe */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${isDark ? repo.gradient?.replace("to-transparent", "to-indigo-400/80") : repo.gradient?.replace("to-transparent", "to-amber-400/80")}`} />

        <div className={`p-6 border-b flex items-start justify-between ${isDark ? "border-white/5" : "border-sky-100"}`}>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className={`p-2 rounded-xl border ${isDark ? "bg-indigo-500/10 border-indigo-400/20 text-indigo-300" : "bg-amber-100 border-amber-300 text-amber-600"}`}>
                <FolderGit2 className="w-4 h-4" />
              </span>
              <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-800"}`}>{repo.name}</h2>
            </div>
            <p className={`text-[11px] ml-11 ${isDark ? "text-white/30" : "text-slate-400"}`}>{repo.full_name}</p>
          </div>
          <button onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${isDark ? "bg-white/5 text-white/40 hover:text-white hover:bg-white/10" : "bg-sky-100 text-slate-400 hover:text-slate-900 hover:bg-sky-200"}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          <div>
            <h4 className={`text-[10px] uppercase tracking-widest font-semibold mb-2 ${isDark ? "text-white/30" : "text-slate-400"}`}>About</h4>
            <p className={`text-sm leading-relaxed ${isDark ? "text-white/65" : "text-slate-600"}`}>{repo.description || "No description provided."}</p>
          </div>
          <div>
            <h4 className={`text-[10px] uppercase tracking-widest font-semibold mb-2 flex items-center justify-between ${isDark ? "text-white/30" : "text-slate-400"}`}>
              Clone <span className={isDark ? "text-indigo-400/70" : "text-amber-500"}>HTTPS</span>
            </h4>
            <div className={`flex items-center justify-between p-3 rounded-xl border font-mono text-xs ${isDark ? "border-white/8 bg-black/30" : "border-sky-200 bg-sky-50"}`}>
              <div className="flex items-center gap-2 overflow-hidden">
                <Terminal className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-emerald-400" : "text-teal-600"}`} />
                <code className={`truncate ${isDark ? "text-white/55" : "text-slate-600"}`}>{cloneCmd}</code>
              </div>
              <button onClick={handleCopy}
                className={`p-1.5 rounded-lg ml-2 shrink-0 transition-all ${copied ? "bg-emerald-500/20 border border-emerald-400/30 text-emerald-400"
                    : isDark ? "bg-white/5 hover:bg-white/10 text-white/40 hover:text-white"
                      : "bg-sky-100 hover:bg-amber-100 text-slate-500 hover:text-amber-600 hover:shadow-[0_0_14px_rgba(251,191,36,0.4)]"
                  }`}>
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Language", value: repo.language || "Multi", color: lang?.text || (isDark ? "text-white/60" : "text-slate-600") },
              { label: "Stars", value: String(repo.stargazers_count), color: "text-amber-500" },
              { label: "Forks", value: String(repo.forks_count), color: isDark ? "text-indigo-300" : "text-teal-600" },
              { label: "Branch", value: repo.default_branch || "main", color: isDark ? "text-white/65" : "text-slate-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`p-3 rounded-xl border ${isDark ? "bg-white/[0.02] border-white/5" : "bg-sky-50 border-sky-200"}`}>
                <span className={`text-[9px] uppercase tracking-widest font-semibold block mb-1 ${isDark ? "text-white/25" : "text-slate-400"}`}>{label}</span>
                <span className={`text-sm font-bold font-mono ${color}`}>{value}</span>
              </div>
            ))}
          </div>
          {repo.topics.length > 0 && (
            <div>
              <h4 className={`text-[10px] uppercase tracking-widest font-semibold mb-2 ${isDark ? "text-white/30" : "text-slate-400"}`}>Topics</h4>
              <div className="flex flex-wrap gap-2">
                {repo.topics.map((t) => (
                  <span key={t} className={`text-[11px] px-3 py-1 rounded-full border font-medium ${isDark ? "bg-indigo-500/10 border-indigo-400/20 text-indigo-300" : "bg-sky-100 border-sky-200 text-sky-700"}`}>#{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={`p-6 border-t flex items-center justify-end gap-3 ${isDark ? "border-white/5" : "border-sky-100"}`}>
          <a href={repo.html_url} target="_blank" rel="noreferrer"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${isDark ? "bg-white/[0.04] border-white/10 text-white/70 hover:text-white hover:bg-white/8 hover:shadow-[0_0_16px_rgba(148,163,184,0.2)]"
                : "bg-sky-50 border-sky-200 text-sky-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 hover:shadow-[0_0_22px_rgba(251,191,36,0.45)]"
              }`}>
            <GithubIcon className="w-4 h-4" /> GitHub
          </a>
          {repo.liveUrl && (
            <a href={repo.liveUrl} target="_blank" rel="noreferrer"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${isDark ? "bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/30 shadow-emerald-500/10"
                  : "bg-teal-500 text-white hover:bg-amber-500 hover:shadow-[0_0_28px_rgba(251,191,36,0.6)]"
                }`}>
              <ExternalLink className="w-4 h-4" /> Launch App
            </a>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Theme Toggle Button ──────────────────────────────────────────────────────
const ThemeToggle = ({ isDark, toggle }: { isDark: boolean; toggle: () => void }) => (
  <motion.button
    onClick={toggle}
    whileHover={{ scale: 1.08 }}
    whileTap={{ scale: 0.94 }}
    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${isDark
        ? "bg-slate-800/80 border-indigo-400/25 text-slate-200 hover:border-indigo-300/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] backdrop-blur-xl"
        : "bg-white/80 border-amber-300/60 text-slate-700 hover:border-amber-400 hover:shadow-[0_0_24px_rgba(251,191,36,0.55)] backdrop-blur-xl"
      }`}
    title={isDark ? "Switch to Day Mode" : "Switch to Night Mode"}
  >
    <AnimatePresence mode="wait">
      {isDark ? (
        <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.25 }} className="flex items-center gap-1.5 text-amber-300">
          <Sun className="w-4 h-4" /> Day
        </motion.span>
      ) : (
        <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.25 }} className="flex items-center gap-1.5 text-indigo-600">
          <Moon className="w-4 h-4" /> Night
        </motion.span>
      )}
    </AnimatePresence>
  </motion.button>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GitHubProjects() {
  const [isDark, setIsDark] = useState(() => {
    try { const s = localStorage.getItem("theme"); if (s) return s === "dark"; } catch { }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Sync theme with global document class for consistent dark/light mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggle = () => setIsDark((d) => {
    const next = !d;
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch { }
    return next;
  });

  const [repos, setRepos] = useState<Repo[]>(() => {
    try {
      const cached = localStorage.getItem("_gh_repos");
      if (cached) {
        const p = JSON.parse(cached);
        if (p?.d?.length) return p.d;
      }
    } catch { }
    return [];
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem("_gh_repos");
      if (cached) {
        const p = JSON.parse(cached);
        if (p?.d?.length) return false;
      }
    } catch { }
    return true;
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(() => {
    try {
      const cached = localStorage.getItem("_gh_repos");
      if (cached) {
        const p = JSON.parse(cached);
        if (p?.t) return new Date(p.t);
      }
    } catch { }
    return null;
  });
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("all");
  const [liveOnly, setLiveOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"updated" | "stars" | "name">("updated");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<Repo | null>(null);

  const GRADIENTS = isDark ? DARK_GRADIENTS : LIGHT_GRADIENTS;

  const fetchRepos = useCallback(async (announce = false) => {
    try {
      setIsRefreshing(true);
      let rawRepos: any[] = [];

      // 1. Try local backend proxy with server-side caching & rate-limit bypass
      try {
        const proxyUrl = GITHUB_USERNAME ? `/api/github/repos/${encodeURIComponent(GITHUB_USERNAME)}` : '/api/github/repos';
        const proxyRes = await fetch(proxyUrl);
        if (proxyRes.ok) {
          const json = await proxyRes.json();
          if (Array.isArray(json.repos) && json.repos.length > 0) {
            rawRepos = json.repos;
          }
        }
      } catch {
        // Backend not available; fallback to direct GitHub API
      }

      // 2. Direct GitHub API fallback
      if (!rawRepos.length && GITHUB_USERNAME) {
        const directRes = await fetch(
          `https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}/repos?sort=updated&per_page=100`,
          { headers: { Accept: "application/vnd.github.v3+json" } }
        );
        if (directRes.ok) {
          rawRepos = await directRes.json();
        }
      }

      const augmented: Repo[] = rawRepos.map((r, i) => ({
        ...r,
        liveUrl: r.homepage && !(GITHUB_USERNAME && r.homepage.includes(`github.com/${GITHUB_USERNAME}/${r.name}`)) ? r.homepage : null,
        gradient: GRADIENTS[i % GRADIENTS.length],
      }));

      setRepos(augmented);
      const now = new Date();
      setLastSynced(now);
      try { localStorage.setItem("_gh_repos", JSON.stringify({ d: augmented, t: now.getTime() })); } catch { }
      if (announce) showToast(`Synced ${augmented.length} repositories from GitHub`, "success");
    } catch (err: any) {
      try {
        const cached = localStorage.getItem("_gh_repos");
        if (cached) {
          const p = JSON.parse(cached);
          if (p?.d?.length) { 
            setRepos(p.d); 
            setLastSynced(new Date(p.t)); 
            if (announce) showToast("Showing cached repositories", "info"); 
            return; 
          }
        }
      } catch { }
      if (announce) showToast(`Sync failed: ${err.message}`, "error");
    } finally { 
      setLoading(false); 
      setIsRefreshing(false); 
    }
  }, [GRADIENTS]);

  // Initial fetch and automatic background polling every 60s
  useEffect(() => { 
    fetchRepos(); 
    const id = setInterval(() => fetchRepos(), 60000); 
    return () => clearInterval(id); 
  }, [fetchRepos]);

  const langs = useMemo(() => {
    const s = new Set<string>();
    repos.forEach((r) => r.language && s.add(r.language));
    return ["all", ...Array.from(s).sort()];
  }, [repos]);

  const filtered = useMemo(() => repos.filter((r) => {
    if (langFilter !== "all" && r.language !== langFilter) return false;
    if (liveOnly && !r.liveUrl) return false;
    const q = search.toLowerCase().trim();
    return !q || r.name.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      (r.language && r.language.toLowerCase().includes(q)) ||
      r.topics.some((t) => t.toLowerCase().includes(q));
  }).sort((a, b) =>
    sortBy === "updated" ? new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      : sortBy === "stars" ? b.stargazers_count - a.stargazers_count
        : a.name.localeCompare(b.name)
  ), [repos, langFilter, liveOnly, search, sortBy]);

  const liveCount = useMemo(() => repos.filter((r) => !!r.liveUrl).length, [repos]);
  const totalStars = useMemo(() => repos.reduce((s, r) => s + r.stargazers_count, 0), [repos]);

  // card / surface classes
  const surface = isDark ? "bg-slate-900/70 border-indigo-500/15 backdrop-blur-xl" : "bg-white/80 border-sky-200/60 shadow-[0_4px_20px_rgba(186,230,253,0.35)] backdrop-blur-xl";
  const navCls = isDark ? "bg-slate-950/88 border-slate-800/60 backdrop-blur-xl" : "bg-white/85 border-sky-200/50 shadow-sm backdrop-blur-xl";
  const textPri = isDark ? "text-white" : "text-slate-800";
  const textMut = isDark ? "text-white/40" : "text-slate-400";
  const inputCls = isDark
    ? "bg-black/30 border-white/10 text-white/80 placeholder-white/20 focus:border-indigo-400/40 focus:ring-1 focus:ring-indigo-400/15"
    : "bg-sky-50/80 border-sky-200 text-slate-700 placeholder-slate-400 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20";

  return (
    <div className={`min-h-screen relative overflow-x-hidden font-sans transition-colors duration-700`}>
      {isDark ? <NightBackground /> : <SkyBackground />}
      <Toaster isDark={isDark} />

      {/* ─── Nav ─────────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-40 border-b transition-all duration-500 ${navCls}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${isDark ? "border-white/10 bg-white/[0.03] text-white/60 hover:text-white hover:border-white/20" : "border-sky-200 bg-sky-50 text-sky-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 hover:shadow-[0_0_16px_rgba(251,191,36,0.4)]"}`}>
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Portfolio
            </Link>
            <div className={`w-9 h-9 rounded-full border flex items-center justify-center ${isDark ? "border-indigo-400/30 bg-indigo-500/10" : "border-amber-300/60 bg-amber-100 shadow-[0_0_14px_rgba(251,191,36,0.4)]"}`}>
              <Zap className={`w-4 h-4 ${isDark ? "text-indigo-300" : "text-amber-500"}`} />
            </div>
            <div>
              <span className={`text-xs font-bold block leading-none ${textPri}`}>{GITHUB_USERNAME || "GitHub"}</span>
              <span className={`text-[10px] uppercase tracking-widest ${textMut}`}>Repositories</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {GITHUB_USERNAME && (
              <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer"
                className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${isDark ? "border-white/10 bg-white/[0.03] text-white/50 hover:text-white hover:border-white/20"
                    : "border-sky-200 bg-sky-50 text-sky-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 hover:shadow-[0_0_16px_rgba(251,191,36,0.4)]"
                  }`}>
                <GithubIcon className="w-3.5 h-3.5" /> @{GITHUB_USERNAME}
              </a>
            )}
            <button onClick={() => fetchRepos(true)} disabled={isRefreshing}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${isRefreshing ? "opacity-60 cursor-wait" : ""
                } ${isDark
                  ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 hover:border-emerald-400/40"
                  : "border-teal-300 bg-teal-50 text-teal-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 hover:shadow-[0_0_18px_rgba(251,191,36,0.45)]"
                }`}>
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Syncing…" : "Sync"}
            </button>
            <ThemeToggle isDark={isDark} toggle={toggle} />
          </div>
        </div>
      </nav>

      {/* ─── Main ────────────────────────────────────────────────────────── */}
      <main className="relative z-10 pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="text-center mb-12">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[11px] font-medium uppercase tracking-widest mb-5 ${isDark ? "border-indigo-400/20 bg-indigo-500/8 text-indigo-300" : "border-amber-300/60 bg-amber-50 text-amber-600 shadow-[0_0_14px_rgba(251,191,36,0.3)]"
            }`}>
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
            </span>
            Live GitHub Repositories
          </div>

          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight mb-4 ${textPri}`}>
            All Projects &amp;{" "}
            <span className={`text-transparent bg-clip-text ${isDark ? "bg-gradient-to-r from-indigo-400 to-violet-400" : "bg-gradient-to-r from-amber-500 to-orange-500"}`}>
              Repositories
            </span>
          </h1>

          <p className={`text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-10 ${textMut}`}>
            Open-source projects, machine learning models, web apps, and live deployments — fetched live from GitHub.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            <StatCard icon={FolderGit2} value={repos.length} label="Repositories" loading={loading} isDark={isDark} accentClass={isDark ? "text-indigo-300" : "text-amber-500"} />
            <StatCard icon={Globe} value={liveCount} label="Live Demos" loading={loading} isDark={isDark} accentClass="text-emerald-500" />
            <StatCard icon={Code2} value={langs.length - 1} label="Tech Stacks" loading={loading} isDark={isDark} accentClass={isDark ? "text-violet-300" : "text-teal-600"} />
            <StatCard icon={Star} value={totalStars} label="GitHub Stars" loading={loading} isDark={isDark} accentClass="text-amber-400" />
          </div>
        </motion.div>

        {/* ─── Filters ──────────────────────────────────────────────────── */}
        <div className={`rounded-3xl border p-4 sm:p-5 mb-8 transition-all duration-500 ${surface}`}>
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-white/25" : "text-slate-400"}`} />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, description, language, topic…"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm border outline-none transition-all ${inputCls}`} />
              {search && (
                <button onClick={() => setSearch("")}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors ${isDark ? "text-white/30 hover:text-white" : "text-slate-400 hover:text-slate-900"}`}>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => setLiveOnly(!liveOnly)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${liveOnly
                    ? isDark ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-200 shadow-[0_0_14px_rgba(52,211,153,0.2)]"
                      : "bg-teal-50 border-teal-300 text-teal-700 shadow-[0_0_14px_rgba(20,184,166,0.35)]"
                    : isDark ? "bg-white/[0.03] border-white/8 text-white/40 hover:text-white hover:border-white/15"
                      : "bg-sky-50 border-sky-200 text-slate-500 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 hover:shadow-[0_0_14px_rgba(251,191,36,0.35)]"
                  }`}>
                <Radio className={`w-3.5 h-3.5 ${liveOnly ? "text-emerald-400 animate-pulse" : ""}`} />
                Live Only ({liveCount})
              </motion.button>

              <select value={sortBy} onChange={(e: any) => setSortBy(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border outline-none cursor-pointer transition-all ${isDark ? "bg-slate-950/70 border-white/10 text-white/50 hover:border-white/20"
                    : "bg-sky-50 border-sky-200 text-slate-600 hover:border-amber-300"
                  }`}>
                <option value="updated">Recently Updated</option>
                <option value="stars">Most Stars</option>
                <option value="name">Alphabetical</option>
              </select>

              <div className={`flex items-center p-1 rounded-xl border ${isDark ? "bg-slate-950/60 border-white/5" : "bg-sky-100/60 border-sky-200"}`}>
                {(["grid", "list"] as const).map((v) => (
                  <button key={v} onClick={() => setView(v)}
                    className={`p-1.5 rounded-lg transition-all ${view === v
                        ? isDark ? "bg-indigo-500/20 text-indigo-300 shadow-sm" : "bg-white text-amber-500 shadow-sm shadow-amber-100"
                        : isDark ? "text-white/25 hover:text-white/60" : "text-slate-400 hover:text-slate-700"
                      }`}>
                    {v === "grid" ? <LayoutGrid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Language pills */}
          <div className={`flex items-center gap-2 overflow-x-auto pt-3.5 mt-3.5 border-t ${isDark ? "border-white/5" : "border-sky-100"}`}>
            <span className={`text-[10px] uppercase tracking-widest font-semibold flex items-center gap-1.5 shrink-0 ${textMut}`}>
              <Filter className="w-3 h-3" /> Lang
            </span>
            {langs.map((l) => {
              const active = langFilter === l;
              const count = l === "all" ? repos.length : repos.filter((r) => r.language === l).length;
              const c = (isDark ? LANG_DARK : LANG_LIGHT)[l];
              return (
                <motion.button key={l} onClick={() => setLangFilter(l)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border whitespace-nowrap transition-all ${active
                      ? isDark ? "bg-indigo-500/15 border-indigo-400/35 text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                        : "bg-amber-100 border-amber-300 text-amber-700 shadow-[0_0_12px_rgba(251,191,36,0.4)]"
                      : isDark ? "bg-white/[0.02] border-white/5 text-white/35 hover:text-white/60 hover:border-white/12"
                        : "bg-white/70 border-sky-200 text-slate-500 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600"
                    }`}>
                  {c?.dot && <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />}
                  {l === "all" ? "All" : l}
                  <span className={`ml-0.5 ${isDark ? "opacity-50" : "text-slate-400"}`}>{count}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ─── Results ──────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className={`w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mb-4 ${isDark ? "border-indigo-400" : "border-amber-400"}`} />
            <p className={`text-sm animate-pulse ${textMut}`}>Fetching repositories from GitHub…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={`text-center py-20 px-4 rounded-3xl border ${surface}`}>
            <FolderGit2 className={`w-10 h-10 mx-auto mb-3 ${isDark ? "text-white/15" : "text-sky-300"}`} />
            <h3 className={`text-lg font-bold mb-1 ${textPri}`}>No results found</h3>
            <p className={`text-sm max-w-sm mx-auto mb-5 ${textMut}`}>Try adjusting your filters or clearing the search query.</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              onClick={() => { setSearch(""); setLangFilter("all"); setLiveOnly(false); }}
              className={`px-5 py-2 rounded-xl text-xs font-semibold border transition-all ${isDark ? "bg-indigo-500/10 border-indigo-400/25 text-indigo-300 hover:bg-indigo-500/20"
                  : "bg-amber-100 border-amber-300 text-amber-700 hover:bg-amber-200 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)]"
                }`}>Reset Filters</motion.button>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((r, i) => <RepoCard key={r.id} repo={r} idx={i} onSelect={setSelected} isDark={isDark} />)}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r, i) => <RepoRow key={r.id} repo={r} idx={i} onSelect={setSelected} isDark={isDark} />)}
          </div>
        )}

        {/* Footer */}
        <div className={`mt-16 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] ${isDark ? "border-white/5 text-white/25" : "border-sky-200 text-slate-400"}`}>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            GitHub API · Last synced: {lastSynced ? lastSynced.toLocaleTimeString() : "—"}
          </div>
          <a href={`https://github.com/${GITHUB_USERNAME}?tab=repositories`} target="_blank" rel="noreferrer"
            className={`flex items-center gap-1 transition-colors ${isDark ? "text-white/25 hover:text-indigo-300" : "text-slate-400 hover:text-amber-600"}`}>
            View profile on GitHub <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </main>

      <AnimatePresence>
        {selected && <RepoModal repo={selected} onClose={() => setSelected(null)} isDark={isDark} />}
      </AnimatePresence>
    </div>
  );
}
