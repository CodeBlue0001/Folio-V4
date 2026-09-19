import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Activity,
  LogOut,
  Terminal,
  ExternalLink,
  Palette,
  Sliders
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { isUserAdminAuthenticated, adminLogout } from './adminAuth';
import { AdminLogin } from './AdminLogin';
import { AdminAchievements } from './AdminAchievements';
import { AdminSystemHealth } from './AdminSystemHealth';
import { AdminPortfolioEditor } from './AdminPortfolioEditor';
import { AdminLayoutManager } from './AdminLayoutManager';

type AdminTab = 'achievements' | 'health' | 'editor' | 'layout';

export const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isUserAdminAuthenticated());
  const [activeTab, setActiveTab] = useState<AdminTab>('achievements');

  useEffect(() => {
    setIsAuthenticated(isUserAdminAuthenticated());
  }, []);

  const handleLogout = () => {
    adminLogout();
    setIsAuthenticated(false);
  };

  // If not authenticated, render secure gate
  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-black">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[140px]" />
      </div>

      {/* Admin Navigation Bar */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-xl sticky top-0">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 font-black text-sm">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-wide text-white">Admin Command Center</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Folio-V4 Management Terminal</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-medium transition-colors"
            >
              <span>View Portfolio</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div className="container mx-auto px-4 sm:px-6 flex items-center gap-2 border-t border-slate-800/40 py-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('achievements')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'achievements'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Achievements Database</span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'health'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>System Health & Diagnostics</span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Palette className="w-4 h-4 text-violet-400" />
            <span>Portfolio Editor</span>
          </button>

          <button
            onClick={() => setActiveTab('layout')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'layout'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Layout & Elements</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
        <AnimatePresence mode="wait">
          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AdminAchievements />
            </motion.div>
          )}

          {activeTab === 'health' && (
            <motion.div
              key="health"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AdminSystemHealth />
            </motion.div>
          )}

          {activeTab === 'editor' && (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AdminPortfolioEditor />
            </motion.div>
          )}

          {activeTab === 'layout' && (
            <motion.div
              key="layout"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AdminLayoutManager />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Admin Footer */}
      <footer className="relative z-10 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Protected Administrative Environment • Folio V4</span>
          <span className="font-mono text-[11px] text-slate-600">Database bound to src/data/achievements.json</span>
        </div>
      </footer>
    </div>
  );
};
