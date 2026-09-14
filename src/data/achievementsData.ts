import initialAchievementsJson from './achievements.json';

export type BadgeCategory = 'leetcode' | 'google' | 'certification' | 'badge' | 'competition';

export interface Achievement {
  id: string;
  title: string;
  issuer: string;
  category: BadgeCategory;
  date: string;
  description: string;
  badgeImageUrl?: string;
  iconType: 'leetcode' | 'google' | 'hackerrank' | 'coursera' | 'aws' | 'badge' | 'trophy';
  verificationUrl?: string;
  featured: boolean;
  skills: string[];
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Specialist';
}

// ─── Live LeetCode Types ───────────────────────────────────────────────────────

export interface LeetCodeStats {
  totalSolved: number;
  totalQuestions: number;
  easySolved: number;
  easyTotal: number;
  mediumSolved: number;
  mediumTotal: number;
  hardSolved: number;
  hardTotal: number;
  acceptanceRate: number;
  ranking: number;
  reputation: number;
  contributionPoints: number;
  attempting?: number;
}

export interface LeetCodeBadge {
  id: string;
  displayName: string;
  icon: string;
  creationDate: string;
}

export interface LeetCodeContest {
  contestAttend: number;
  contestRating: number;
  contestGlobalRanking: number;
  totalParticipants: number;
}

export interface LeetCodeSubmission {
  title: string;
  titleSlug: string;
  timestamp: string;
  statusDisplay: string;
  lang: string;
}

export interface LeetCodeFullProfile {
  stats: LeetCodeStats;
  badges: LeetCodeBadge[];
  contest: LeetCodeContest;
  recentSubmissions: LeetCodeSubmission[];
  username: string;
  profile: {
    realName: string;
    aboutMe: string;
    userAvatar: string;
    ranking: number;
  };
}

// ─── LeetCode API (Multi-source: Vercel serverless proxy + fallbacks) ──────────

export async function fetchLeetCodeStats(username: string): Promise<LeetCodeFullProfile> {
  let stats: LeetCodeStats | null = null;
  let badges: LeetCodeBadge[] = [];
  let contest: LeetCodeContest = { contestAttend: 0, contestRating: 0, contestGlobalRanking: 0, totalParticipants: 0 };
  let recentSubmissions: LeetCodeSubmission[] = [];
  let profile = { realName: '', aboutMe: '', userAvatar: '', ranking: 0 };

  // ── 1. Primary: Query /api/leetcode (works seamlessly on Vercel & Vite dev proxy) ──
  try {
    let res = await fetch(`/api/leetcode/${encodeURIComponent(username)}`);
    if (!res.ok) {
      // Fallback query param route
      res = await fetch(`/api/leetcode?username=${encodeURIComponent(username)}`);
    }

    if (res.ok) {
      const data = await res.json();
      const user = data?.matchedUser;
      const contestData = data?.userContestRanking;

      if (user) {
        if (user.profile) {
          profile.realName = user.profile.realName || '';
          profile.aboutMe = user.profile.aboutMe || '';
          profile.userAvatar = user.profile.userAvatar || '';
          profile.ranking = user.profile.ranking || 0;
        }

        if (Array.isArray(user.badges)) {
          badges = user.badges.map((b: any) => ({
            id: b.id || '',
            displayName: b.displayName || '',
            icon: b.icon?.startsWith('/') ? `https://leetcode.com${b.icon}` : b.icon || '',
            creationDate: b.creationDate || '',
          }));
        }

        if (user.submitStats?.acSubmissionNum) {
          const ac = user.submitStats.acSubmissionNum;
          const total = user.submitStats.totalSubmissionNum || [];
          const allQuestions = data?.allQuestionsCount || [];

          const getCount = (arr: any[], diff: string) => arr.find((x: any) => x.difficulty === diff)?.count || 0;
          const getSubmissions = (arr: any[], diff: string) => arr.find((x: any) => x.difficulty === diff)?.submissions || 0;

          const totalSub = getSubmissions(total, 'All');
          const acSub = getSubmissions(ac, 'All');
          const totalAttempted = getCount(total, 'All');
          const totalAcCount = getCount(ac, 'All');
          const attempting = Math.max(0, totalAttempted - totalAcCount);

          stats = {
            totalSolved: getCount(ac, 'All'),
            totalQuestions: allQuestions.reduce((sum: number, q: any) => sum + (q.count || 0), 0) || 4018,
            easySolved: getCount(ac, 'Easy'),
            easyTotal: getCount(allQuestions, 'Easy') || 958,
            mediumSolved: getCount(ac, 'Medium'),
            mediumTotal: getCount(allQuestions, 'Medium') || 2098,
            hardSolved: getCount(ac, 'Hard'),
            hardTotal: getCount(allQuestions, 'Hard') || 962,
            acceptanceRate: totalSub > 0 ? parseFloat(((acSub / totalSub) * 100).toFixed(1)) : 0,
            ranking: user.profile?.ranking || 0,
            reputation: user.profile?.reputation || 0,
            contributionPoints: 0,
            attempting: attempting || 0,
          };
        }
      }

      if (contestData) {
        contest = {
          contestAttend: contestData.attendedContestsCount || 0,
          contestRating: Math.round(contestData.rating || 0),
          contestGlobalRanking: contestData.globalRanking || 0,
          totalParticipants: contestData.totalParticipants || 0,
        };
      }

      if (Array.isArray(data?.recentSubmissionList)) {
        recentSubmissions = data.recentSubmissionList.map((s: any) => ({
          title: s.title || '',
          titleSlug: s.titleSlug || '',
          timestamp: s.timestamp || '',
          statusDisplay: s.statusDisplay || '',
          lang: s.lang || '',
        }));
      }
    }
  } catch (err: any) {
    console.warn('[LeetCode] Serverless /api/leetcode proxy failed:', err?.message);
  }

  // ── 2. Fallback if primary returned no stats: Alfa LeetCode API ─────────────
  if (!stats) {
    try {
      const [statsRes, badgesRes, contestRes] = await Promise.allSettled([
        fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${encodeURIComponent(username)}`),
        fetch(`https://alfa-leetcode-api.onrender.com/${encodeURIComponent(username)}/badges`),
        fetch(`https://alfa-leetcode-api.onrender.com/${encodeURIComponent(username)}/contest`),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const sData = await statsRes.value.json();
        if (sData && typeof sData.totalSolved === 'number') {
          stats = {
            totalSolved: sData.totalSolved,
            totalQuestions: sData.totalQuestions || 4018,
            easySolved: sData.easySolved || 0,
            easyTotal: sData.totalEasy || 958,
            mediumSolved: sData.mediumSolved || 0,
            mediumTotal: sData.totalMedium || 2098,
            hardSolved: sData.hardSolved || 0,
            hardTotal: sData.totalHard || 962,
            acceptanceRate: sData.acceptanceRate ? parseFloat(sData.acceptanceRate) : 0,
            ranking: sData.ranking || 0,
            reputation: sData.reputation || 0,
            contributionPoints: sData.contributionPoint || 0,
            attempting: 0,
          };
        }
      }

      if (badgesRes.status === 'fulfilled' && badgesRes.value.ok) {
        const bData = await badgesRes.value.json();
        if (bData && Array.isArray(bData.badges)) {
          badges = bData.badges.map((b: any) => ({
            id: b.id ?? '',
            displayName: b.displayName ?? b.name ?? '',
            icon: b.icon ?? '',
            creationDate: b.creationDate ?? '',
          }));
        }
      }

      if (contestRes.status === 'fulfilled' && contestRes.value.ok) {
        const cData = await contestRes.value.json();
        if (cData) {
          contest = {
            contestAttend: cData.contestAttend ?? 0,
            contestRating: Math.round(cData.contestRating ?? 0),
            contestGlobalRanking: cData.contestGlobalRanking ?? 0,
            totalParticipants: cData.totalParticipants ?? 0,
          };
        }
      }
    } catch (err: any) {
      console.warn('[LeetCode] Alfa fallback failed:', err?.message);
    }
  }

  // ── 3. Final Fallback: Default data structure (prevents crash) ───────────────
  const finalStats: LeetCodeStats = stats || {
    totalSolved: 229,
    totalQuestions: 4018,
    easySolved: 190,
    easyTotal: 958,
    mediumSolved: 36,
    mediumTotal: 2098,
    hardSolved: 3,
    hardTotal: 962,
    acceptanceRate: 67.5,
    ranking: 711039,
    reputation: 1,
    contributionPoints: 0,
    attempting: 41,
  };

  return {
    stats: finalStats,
    badges,
    contest,
    recentSubmissions,
    username,
    profile,
  };
}

// ─── Live Certifications & Skill Badges Fetcher ────────────────────────────────

export async function fetchCertifications(config?: {
  credlyUsername?: string;
  gcsbProfileId?: string;
}): Promise<Achievement[]> {
  const liveAchievements: Achievement[] = [];

  // 1. Fetch Credly Badges
  if (config?.credlyUsername) {
    try {
      const res = await fetch(`/api/credly/${config.credlyUsername}`);
      if (res.ok) {
        const json = await res.json();
        const credlyItems = json?.data || [];
        credlyItems.forEach((item: any) => {
          const bt = item.badge_template || {};
          const skillsList = (bt.skills || []).map((s: any) => s.name || s);
          liveAchievements.push({
            id: `credly-${item.id || bt.id || Math.random()}`,
            title: bt.name || 'Certified Credential',
            issuer: item.issuer?.summary?.replace('issued by ', '') || bt.issuer?.summary?.replace('issued by ', '') || 'Credly',
            category: 'certification',
            date: item.issued_at_date ? item.issued_at_date.slice(0, 4) : '2024',
            description: bt.description || 'Verified digital badge credential.',
            badgeImageUrl: item.image_url || bt.image_url,
            iconType: 'badge',
            verificationUrl: bt.url || `https://www.credly.com/users/${config.credlyUsername}`,
            featured: true,
            skills: skillsList.length > 0 ? skillsList.slice(0, 5) : ['Cloud', 'Verification'],
            level: (bt.level as any) || 'Specialist',
          });
        });
      }
    } catch (err: any) {
      console.warn('[Certifications] Credly fetch error:', err?.message);
    }
  }

  // 2. Fetch GCSB Badges
  if (config?.gcsbProfileId) {
    try {
      const res = await fetch(`/api/gcsb/${config.gcsbProfileId}`);
      if (res.ok) {
        const json = await res.json();
        (json.badges || []).forEach((b: any, idx: number) => {
          liveAchievements.push({
            id: `gcsb-${idx}`,
            title: b.title,
            issuer: 'Google Cloud Skill Boost',
            category: 'google',
            date: b.date || '2024',
            description: 'Earned Google Cloud Skill Boost badge for hands-on labs and skill validation.',
            badgeImageUrl: b.badgeImageUrl,
            iconType: 'google',
            verificationUrl: `https://www.skills.google/public_profiles/${config.gcsbProfileId}`,
            featured: true,
            skills: ['Google Cloud Platform', 'Hands-on Labs'],
            level: 'Specialist',
          });
        });
      }
    } catch (err: any) {
      console.warn('[Certifications] GCSB fetch error:', err?.message);
    }
  }

  // Merge live badges with fallback achievements from JSON database (deduplicate by title)
  const existingTitles = new Set(liveAchievements.map((a) => a.title.toLowerCase()));
  const staticFeatured = getAchievements().filter(
    (item) => !existingTitles.has(item.title.toLowerCase())
  );

  return [...liveAchievements, ...staticFeatured];
}

// ─── JSON Database & Dynamic Achievement Card Add Management ───────────────────

const ACHIEVEMENTS_STORAGE_KEY = 'folio_achievements_database';

/**
 * Retrieve all achievement cards dynamically.
 * Reads from localStorage cache first (to retain dynamically added cards),
 * falling back to the test achievements JSON database.
 */
export const getAchievements = (): Achievement[] => {
  if (typeof window === 'undefined') {
    return initialAchievementsJson as Achievement[];
  }
  try {
    const cached = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Achievement[];
      }
    }
  } catch (e) {
    console.warn('[Achievements] Failed to parse local storage cache:', e);
  }
  return initialAchievementsJson as Achievement[];
};

/**
 * Dynamic Achievement Card Add Function.
 * Adds a new achievement card to the database, persisting to both
 * localStorage and attempting to POST to the backend API (/api/achievements)
 * which writes directly to src/data/achievements.json on disk.
 */
export const addAchievementCard = (newCard: Partial<Achievement>): Achievement[] => {
  const current = getAchievements();
  const id = newCard.id || `achieve-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  
  const createdAchievement: Achievement = {
    id,
    title: newCard.title || 'Untitled Achievement',
    issuer: newCard.issuer || 'Self-Paced / Verified',
    category: newCard.category || 'certification',
    date: newCard.date || new Date().getFullYear().toString(),
    description: newCard.description || 'Achievement successfully verified.',
    badgeImageUrl: newCard.badgeImageUrl || '',
    iconType: newCard.iconType || 'trophy',
    verificationUrl: newCard.verificationUrl || '',
    featured: newCard.featured ?? true,
    skills: Array.isArray(newCard.skills) && newCard.skills.length > 0 ? newCard.skills : ['General Skill'],
    level: newCard.level || 'Specialist',
  };

  const updated = [createdAchievement, ...current];

  // Save to client-side localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[Achievements] Error saving achievement to storage:', e);
    }
  }

  // Attempt to persist to server/json disk database via API
  fetch('/api/achievements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(createdAchievement),
  }).catch(() => {
    // Gracefully handle static preview/client-only environment
  });

  return updated;
};

/**
 * Reset achievements database back to initial test data in achievements.json
 */
export const resetAchievements = (): Achievement[] => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(ACHIEVEMENTS_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  return initialAchievementsJson as Achievement[];
};

/**
 * Exported JSON database reference for backwards compatibility
 */
export const ACHIEVEMENTS_DATA: Achievement[] = initialAchievementsJson as Achievement[];

export const getFeaturedAchievements = (): Achievement[] => {
  return getAchievements().filter((item) => item.featured);
};

