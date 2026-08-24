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

// ─── LeetCode API (Multi-source: Vercel API + backend proxy) ────────────────

export async function fetchLeetCodeStats(username: string): Promise<LeetCodeFullProfile> {
  let stats: LeetCodeStats | null = null;
  let badges: LeetCodeBadge[] = [];
  let contest: LeetCodeContest = { contestAttend: 0, contestRating: 0, contestGlobalRanking: 0, totalParticipants: 0 };
  let recentSubmissions: LeetCodeSubmission[] = [];
  let profile = { realName: '', aboutMe: '', userAvatar: '', ranking: 0 };

  // ── 1. Primary stats source: Faisal Shohag API (reliable, no CORS issues) ──
  try {
    const res = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${username}`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.totalSolved === 'number') {
        const totalSub = data.matchedUserStats?.totalSubmissionNum?.[0]?.submissions || 0;
        const acSub = data.matchedUserStats?.acSubmissionNum?.[0]?.submissions || 0;
        const totalAttempted = data.matchedUserStats?.totalSubmissionNum?.[0]?.count || 0;
        const totalAcCount = data.matchedUserStats?.acSubmissionNum?.[0]?.count || 0;
        const attempting = Math.max(0, totalAttempted - totalAcCount);

        stats = {
          totalSolved: data.totalSolved,
          totalQuestions: data.totalQuestions || 4018,
          easySolved: data.easySolved || 0,
          easyTotal: data.totalEasy || 958,
          mediumSolved: data.mediumSolved || 0,
          mediumTotal: data.totalMedium || 2098,
          hardSolved: data.hardSolved || 0,
          hardTotal: data.totalHard || 962,
          acceptanceRate: totalSub > 0 ? parseFloat(((acSub / totalSub) * 100).toFixed(1)) : 0,
          ranking: data.ranking || 0,
          reputation: data.reputation || 0,
          contributionPoints: data.contributionPoint || 0,
          attempting: attempting || 39,
        };

        if (Array.isArray(data.recentSubmissions)) {
          recentSubmissions = data.recentSubmissions.map((s: any) => ({
            title: s.title || '',
            titleSlug: s.titleSlug || '',
            timestamp: s.timestamp || '',
            statusDisplay: s.statusDisplay || '',
            lang: s.lang || '',
          }));
        }
      }
    }
  } catch (err: any) {
    console.warn('[LeetCode] Faisal Shohag API failed:', err?.message);
  }

  // ── 2. Backend proxy for profile, badges, contest (avoids CORS) ─────────────
  //    The Express server at /api/leetcode/:username proxies to leetcode.com/graphql
  //    which bypasses browser CORS restrictions.
  try {
    const res = await fetch(`/api/leetcode/${username}`);
    if (res.ok) {
      const data = await res.json();
      const user = data?.matchedUser;
      const contestData = data?.userContestRanking;

      if (user) {
        if (user.profile) {
          profile.realName = user.profile.realName || '';
          profile.aboutMe = user.profile.aboutMe || '';
          profile.userAvatar = user.profile.userAvatar || '';
          profile.ranking = user.profile.ranking || (stats?.ranking ?? 0);
        }

        if (Array.isArray(user.badges)) {
          badges = user.badges.map((b: any) => ({
            id: b.id || '',
            displayName: b.displayName || '',
            icon: b.icon?.startsWith('/') ? `https://leetcode.com${b.icon}` : b.icon || '',
            creationDate: b.creationDate || '',
          }));
        }

        // If we didn't get stats from Faisal Shohag, extract from GraphQL
        if (!stats && user.submitStats?.acSubmissionNum) {
          const ac = user.submitStats.acSubmissionNum;
          const total = user.submitStats.totalSubmissionNum || [];
          const allQuestions = data?.allQuestionsCount || [];

          const getCount = (arr: any[], diff: string) => arr.find((x: any) => x.difficulty === diff)?.count || 0;

          stats = {
            totalSolved: getCount(ac, 'All'),
            totalQuestions: allQuestions.reduce((sum: number, q: any) => sum + (q.count || 0), 0) || 4018,
            easySolved: getCount(ac, 'Easy'),
            easyTotal: getCount(allQuestions, 'Easy') || 958,
            mediumSolved: getCount(ac, 'Medium'),
            mediumTotal: getCount(allQuestions, 'Medium') || 2098,
            hardSolved: getCount(ac, 'Hard'),
            hardTotal: getCount(allQuestions, 'Hard') || 962,
            acceptanceRate: 0,
            ranking: user.profile?.ranking || 0,
            reputation: user.profile?.reputation || 0,
            contributionPoints: 0,
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
    }
  } catch (err: any) {
    console.warn('[LeetCode] Backend proxy failed:', err?.message);

    // ── 3. Fallback: Alfa API (may be rate-limited) ─────────────────────────
    try {
      const [badgesRes, contestRes] = await Promise.allSettled([
        fetch(`https://alfa-leetcode-api.onrender.com/${username}/badges`),
        fetch(`https://alfa-leetcode-api.onrender.com/${username}/contest`),
      ]);

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
    } catch {
      console.warn('[LeetCode] Alfa API fallback also failed');
    }
  }

  // ── Final fallback if all APIs fail ─────────────────────────────────────────
  const finalStats: LeetCodeStats = stats || {
    totalSolved: 0,
    totalQuestions: 0,
    easySolved: 0,
    easyTotal: 0,
    mediumSolved: 0,
    mediumTotal: 0,
    hardSolved: 0,
    hardTotal: 0,
    acceptanceRate: 0,
    ranking: 0,
    reputation: 0,
    contributionPoints: 0,
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

  // Merge live badges with static fallback achievements (deduplicate by title)
  const existingTitles = new Set(liveAchievements.map((a) => a.title.toLowerCase()));
  const staticFeatured = ACHIEVEMENTS_DATA.filter(
    (item) => !existingTitles.has(item.title.toLowerCase())
  );

  return [...liveAchievements, ...staticFeatured];
}

// ─── Static Achievements (Google Cloud, HackerRank, Coursera, AWS) ─────────────

export const ACHIEVEMENTS_DATA: Achievement[] = [
  {
    id: 'gcp-foundations',
    title: 'Google Cloud Computing Foundations',
    issuer: 'Google Cloud Skill Boost',
    category: 'google',
    date: '2024',
    description: 'Demonstrated expertise in cloud infrastructure, compute engine, and storage management.',
    iconType: 'google',
    verificationUrl: 'https://www.cloudskillsboost.google',
    featured: true,
    skills: ['Google Cloud Platform', 'Cloud Infrastructure', 'Networking'],
    level: 'Specialist',
  },
  {
    id: 'gcp-genai',
    title: 'Generative AI Fundamentals',
    issuer: 'Google Cloud',
    category: 'google',
    date: '2024',
    description: 'Completed Google Cloud Skill Boost pathway covering LLMs, Prompt Engineering, and Vertex AI.',
    iconType: 'google',
    verificationUrl: 'https://www.cloudskillsboost.google',
    featured: true,
    skills: ['Generative AI', 'Prompt Engineering', 'Vertex AI', 'LLMs'],
    level: 'Specialist',
  },
  {
    id: 'hackerrank-problem-solving',
    title: '5★ Problem Solving',
    issuer: 'HackerRank',
    category: 'certification',
    date: '2024',
    description: 'Achieved 5 Stars in Problem Solving, demonstrating strong proficiency in advanced algorithms.',
    iconType: 'hackerrank',
    verificationUrl: 'https://www.hackerrank.com',
    featured: true,
    skills: ['Data Structures', 'C++', 'Java', 'Algorithms'],
    level: 'Expert',
  },
  {
    id: 'gcp-bigdata-ml',
    title: 'Perform Foundational Data & ML Tasks',
    issuer: 'Google Cloud',
    category: 'google',
    date: '2024',
    description: 'Hands-on laboratory badge for data pipelines, BigQuery analysis, and machine learning models.',
    iconType: 'google',
    verificationUrl: 'https://www.cloudskillsboost.google',
    featured: false,
    skills: ['BigQuery', 'Machine Learning', 'Data Pipelines'],
    level: 'Intermediate',
  },
  {
    id: 'coursera-fullstack',
    title: 'Full-Stack Web Development Specialization',
    issuer: 'Coursera',
    category: 'certification',
    date: '2023',
    description: 'Certified specialization covering modern frontend frameworks, RESTful APIs, and cloud deployments.',
    iconType: 'coursera',
    verificationUrl: 'https://www.coursera.org',
    featured: true,
    skills: ['React', 'Node.js', 'Express', 'MongoDB'],
    level: 'Advanced',
  },
  {
    id: 'aws-cloud-quest',
    title: 'AWS Cloud Quest: Cloud Practitioner',
    issuer: 'Amazon Web Services',
    category: 'certification',
    date: '2024',
    description: 'Completed 3D role-playing learning game solving cloud challenges on AWS architecture.',
    iconType: 'aws',
    verificationUrl: 'https://aws.amazon.com',
    featured: false,
    skills: ['AWS EC2', 'AWS S3', 'Cloud Architecture'],
    level: 'Intermediate',
  },
];

export const getFeaturedAchievements = (): Achievement[] => {
  return ACHIEVEMENTS_DATA.filter((item) => item.featured);
};
