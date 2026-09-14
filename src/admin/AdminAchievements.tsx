import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCcw,
  Sparkles,
  Calendar
} from 'lucide-react';
import {
  getAchievements,
  addAchievementCard,
  resetAchievements,
  type Achievement,
  type BadgeCategory
} from '../data/achievementsData';

export const AdminAchievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>(() => getAchievements());
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<BadgeCategory | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Achievement | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    issuer: string;
    category: BadgeCategory;
    date: string;
    description: string;
    skills: string;
    iconType: Achievement['iconType'];
    level: NonNullable<Achievement['level']>;
    verificationUrl: string;
    badgeImageUrl: string;
    featured: boolean;
  }>({
    title: '',
    issuer: '',
    category: 'certification',
    date: new Date().getFullYear().toString(),
    description: '',
    skills: '',
    iconType: 'trophy',
    level: 'Specialist',
    verificationUrl: '',
    badgeImageUrl: '',
    featured: true,
  });

  // Load from API on mount
  useEffect(() => {
    fetch('/api/achievements')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAchievements(data);
        }
      })
      .catch(() => { });
  }, []);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const openCreateModal = () => {
    setEditingCard(null);
    setFormData({
      title: '',
      issuer: '',
      category: 'certification',
      date: new Date().getFullYear().toString(),
      description: '',
      skills: '',
      iconType: 'trophy',
      level: 'Specialist',
      verificationUrl: '',
      badgeImageUrl: '',
      featured: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (card: Achievement) => {
    setEditingCard(card);
    setFormData({
      title: card.title,
      issuer: card.issuer,
      category: card.category,
      date: card.date || '',
      description: card.description || '',
      skills: (card.skills || []).join(', '),
      iconType: card.iconType || 'trophy',
      level: card.level || 'Specialist',
      verificationUrl: card.verificationUrl || '',
      badgeImageUrl: card.badgeImageUrl || '',
      featured: card.featured ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.issuer.trim()) {
      showFeedback('error', 'Title and Issuer are required');
      return;
    }

    const skillsArray = formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const cardPayload: Partial<Achievement> = {
      title: formData.title.trim(),
      issuer: formData.issuer.trim(),
      category: formData.category,
      date: formData.date.trim() || new Date().getFullYear().toString(),
      description: formData.description.trim() || 'Verified credential.',
      skills: skillsArray.length > 0 ? skillsArray : ['General Skill'],
      iconType: formData.iconType,
      level: formData.level,
      verificationUrl: formData.verificationUrl.trim() || undefined,
      badgeImageUrl: formData.badgeImageUrl.trim() || undefined,
      featured: formData.featured,
    };

    if (editingCard) {
      // Edit existing
      try {
        const res = await fetch(`/api/achievements/${editingCard.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cardPayload),
        });
        if (res.ok) {
          const resData = await res.json();
          setAchievements((prev) =>
            prev.map((c) => (c.id === editingCard.id ? resData.achievement || { ...c, ...cardPayload } : c))
          );
          showFeedback('success', `Updated "${formData.title}" successfully!`);
        } else {
          // Local fallback
          setAchievements((prev) =>
            prev.map((c) => (c.id === editingCard.id ? { ...c, ...cardPayload } : c))
          );
          showFeedback('success', `Updated "${formData.title}" in local database.`);
        }
      } catch {
        setAchievements((prev) =>
          prev.map((c) => (c.id === editingCard.id ? { ...c, ...cardPayload } : c))
        );
        showFeedback('success', `Updated "${formData.title}" in local database.`);
      }
    } else {
      // Create new
      const updated = addAchievementCard(cardPayload);
      setAchievements(updated);
      showFeedback('success', `Added new achievement "${formData.title}" to database!`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/achievements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAchievements((prev) => prev.filter((c) => c.id !== id));
        showFeedback('success', `Removed "${title}" from achievements database.`);
        return;
      }
    } catch { }

    // Client-side remove
    setAchievements((prev) => prev.filter((c) => c.id !== id));
    showFeedback('success', `Removed "${title}".`);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset all achievements back to the default achievements.json seed?')) {
      const reset = resetAchievements();
      setAchievements(reset);
      showFeedback('success', 'Reset achievements database successfully.');
    }
  };

  const filtered = achievements.filter((a) => {
    const matchCat = filterCat === 'all' || a.category === filterCat;
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.issuer.toLowerCase().includes(q) ||
      (a.skills || []).some((s) => s.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-extrabold text-white">Achievements Database</h2>
          </div>
          <p className="text-xs text-slate-400">
            Manage, edit, or remove achievements stored directly in <code className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-mono">achievements.json</code>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetToDefault}
            title="Reset database to default seed"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Seed</span>
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Achievement</span>
          </button>
        </div>
      </div>

      {/* Feedback alert */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`p-3.5 rounded-2xl border flex items-center gap-3 text-xs font-medium ${feedback.type === 'success'
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

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, issuer, or skill..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-white text-xs outline-none focus:border-amber-500 transition-all placeholder-slate-600"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'certification', 'google', 'leetcode', 'badge', 'competition'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all border ${filterCat === cat
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Table / Cards List */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Database Records ({filtered.length} of {achievements.length})
          </span>
        </div>

        {filtered.length > 0 ? (
          <div className="divide-y divide-slate-800/60">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0 text-amber-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-slate-700 bg-slate-800 text-slate-300">
                        {item.issuer}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400">
                        {item.category}
                      </span>
                      {item.level && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300">
                          {item.level}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 max-w-2xl">{item.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.skills?.map((s) => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300">
                          {s}
                        </span>
                      ))}
                      {item.date && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/40 text-slate-400 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {item.date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {item.verificationUrl && (
                    <a
                      href={item.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-colors"
                      title="Test credential link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-500/40 hover:bg-amber-500/10 transition-colors cursor-pointer"
                    title="Edit achievement"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Delete achievement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Award className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white mb-1">No Achievements Found</h4>
            <p className="text-xs text-slate-500 mb-4">Click below to create your first achievement card.</p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors"
            >
              Add Achievement
            </button>
          </div>
        )}
      </div>

      {/* ─── Add / Edit Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 border border-slate-700 bg-slate-900 text-white shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {editingCard ? 'Edit Achievement' : 'Add New Achievement'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Persists directly into the <code className="text-amber-300 font-mono">achievements.json</code> database
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full border border-slate-700 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. AWS Solutions Architect"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Issuer / Provider *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.issuer}
                      onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                      placeholder="e.g. Amazon Web Services"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as BadgeCategory })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs outline-none"
                    >
                      <option value="certification">Certification</option>
                      <option value="google">Google Cloud</option>
                      <option value="leetcode">LeetCode</option>
                      <option value="badge">Badge</option>
                      <option value="competition">Competition</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Icon Type
                    </label>
                    <select
                      value={formData.iconType}
                      onChange={(e) => setFormData({ ...formData, iconType: e.target.value as Achievement['iconType'] })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs outline-none"
                    >
                      <option value="trophy">Trophy</option>
                      <option value="badge">Badge</option>
                      <option value="google">Google</option>
                      <option value="leetcode">LeetCode</option>
                      <option value="aws">AWS</option>
                      <option value="coursera">Coursera</option>
                      <option value="hackerrank">HackerRank</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Proficiency Level
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value as NonNullable<Achievement['level']> })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs outline-none"
                    >
                      <option value="Specialist">Specialist</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Beginner">Beginner</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Year / Date
                    </label>
                    <input
                      type="text"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      placeholder="e.g. 2024"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Verification URL
                    </label>
                    <input
                      type="url"
                      value={formData.verificationUrl}
                      onChange={(e) => setFormData({ ...formData, verificationUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="e.g. Cloud Architecture, VPC, Docker, CI/CD"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Summary of skills mastered, validation criteria, and scope..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-sm outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                  >
                    {editingCard ? 'Save Changes' : 'Create Achievement'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
