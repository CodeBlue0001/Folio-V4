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

// ─── LeetCode API (Multi-endpoint fallback engine) ──────────────────────────

export async function fetchLeetCodeStats(username: string): Promise<LeetCodeFullProfile> {
  let stats: LeetCodeStats | null = null;
  let badges: LeetCodeBadge[] = [];
  let contest: LeetCodeContest = { contestAttend: 0, contestRating: 0, contestGlobalRanking: 0, totalParticipants: 0 };
  let recentSubmissions: LeetCodeSubmission[] = [];
  let profile = { realName: '', aboutMe: '', userAvatar: '', ranking: 0 };

  // 1. Primary Source: Faisal Shohag API for solved stats & recent submissions
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
    console.warn('FaisalShohag API failed:', err?.message);
  }

  // 2. Direct LeetCode GraphQL for real profile, badges, and contest details
  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
      },
      body: JSON.stringify({
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              profile {
                realName
                userAvatar
                aboutMe
                ranking
                reputation
              }
              badges {
                id
                displayName
                icon
                creationDate
              }
            }
            userContestRanking(username: $username) {
              attendedContestsCount
              rating
              globalRanking
              totalParticipants
            }
          }
        `,
        variables: { username },
      }),
    });

    if (res.ok) {
      const gqlData = await res.json();
      const user = gqlData?.data?.matchedUser;
      const contestData = gqlData?.data?.userContestRanking;

      if (user) {
        if (user.profile) {
          profile.realName = user.profile.realName || profile.realName;
          profile.aboutMe = user.profile.aboutMe || profile.aboutMe;
          profile.userAvatar = user.profile.userAvatar || profile.userAvatar;
          if (user.profile.ranking) profile.ranking = user.profile.ranking;
        }

        if (Array.isArray(user.badges)) {
          badges = user.badges.map((b: any) => ({
            id: b.id || '',
            displayName: b.displayName || '',
            icon: b.icon?.startsWith('/') ? `https://leetcode.com${b.icon}` : b.icon || '',
            creationDate: b.creationDate || '',
          }));
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
    console.warn('LeetCode GraphQL query failed:', err?.message);
  }

  // 3. Secondary Fallback: Alfa API if primary stats still missing
  if (!stats) {
    try {
      const res = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/solved`);
      if (res.ok) {
        const solvedData = await res.json();
        if (solvedData) {
          stats = {
            totalSolved: solvedData.solvedProblem ?? 0,
            totalQuestions: solvedData.totalQuestions ?? 4018,
            easySolved: solvedData.easySolved ?? 0,
            easyTotal: solvedData.easyTotal ?? 958,
            mediumSolved: solvedData.mediumSolved ?? 0,
            mediumTotal: solvedData.mediumTotal ?? 2098,
            hardSolved: solvedData.hardSolved ?? 0,
            hardTotal: solvedData.hardTotal ?? 962,
            acceptanceRate: 0,
            ranking: profile.ranking || 0,
            reputation: 0,
            contributionPoints: 0,
            attempting: 39,
          };
        }
      }
    } catch (err: any) {
      console.warn('Alfa API fallback failed:', err?.message);
    }
  }

  // Final fallback values if all external APIs fail
  const finalStats: LeetCodeStats = stats || {
    totalSolved: 226,
    totalQuestions: 4018,
    easySolved: 187,
    easyTotal: 958,
    mediumSolved: 36,
    mediumTotal: 2098,
    hardSolved: 3,
    hardTotal: 962,
    acceptanceRate: 44.2,
    ranking: profile.ranking || 716178,
    reputation: 1,
    contributionPoints: 1895,
    attempting: 39,
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
