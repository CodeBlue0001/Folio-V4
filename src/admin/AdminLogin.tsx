import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ShieldAlert, ArrowLeft, KeyRound, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminLogin } from './adminAuth';

interface AdminLoginProps {
  onSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await adminLogin(password);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Authentication failed');
      }
    } catch {
      setError('Connection error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-950 text-white overflow-hidden selection:bg-amber-500 selection:text-black">
      {/* Background radial glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none" />

      {/* Grid line overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900/60 hover:border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Portfolio</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-amber-400/80 px-2.5 py-1 rounded-full border border-amber-500/20 bg-amber-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            Security Enforced
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-cyan-500" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1.5 flex items-center justify-center gap-2">
              <span>Admin Terminal</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Authenticate to manage portfolio database credentials and examine system health diagnostics.
            </p>
          </div>

          {/* Error notice */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 flex items-center gap-3 text-red-400 text-xs"
            >
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Administrator Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secret key..."
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-800 bg-slate-950/70 text-white placeholder-slate-600 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Unlock Admin Console</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Info Hint */}
          <div className="mt-6 pt-4 border-t border-slate-800/60 text-center">
            <span className="text-[11px] text-slate-500">
              Default development key: <code className="text-amber-400/80 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded">admin2026</code>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
