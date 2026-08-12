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

// ─── LeetCode API (Multi-tier: Backend proxy -> Public CORS Proxies -> Alfa API -> Cached Fallback) ───────

const LEETCODE_GRAPHQL_QUERY = `
query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile {
      realName
      userAvatar
      ranking
      reputation
    }
    submitStats: submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
        submissions
      }
      totalSubmissionNum {
        difficulty
        count
        submissions
      }
    }
    badges {
      id
      displayName
      icon
      creationDate
    }
    userCalendar {
      streak
      totalActiveDays
    }
  }
  allQuestionsCount {
    difficulty
    count
  }
}
`;

function parseGraphQLData(graphqlData: any, username: string): LeetCodeFullProfile {
  const matchedUser = graphqlData?.matchedUser || {};
  const allQuestions = graphqlData?.allQuestionsCount || [];
  const acSubmissions = matchedUser.submitStats?.acSubmissionNum || [];

  const findCount = (diff: string) => acSubmissions.find((s: any) => s.difficulty === diff)?.count || 0;
  const findTotal = (diff: string) => allQuestions.find((q: any) => q.difficulty === diff)?.count || 0;

  const easySolved = findCount('Easy');
  const mediumSolved = findCount('Medium');
  const hardSolved = findCount('Hard');
  const totalSolved = findCount('All') || (easySolved + mediumSolved + hardSolved);

  const easyTotal = findTotal('Easy') || 958;
  const mediumTotal = findTotal('Medium') || 2098;
  const hardTotal = findTotal('Hard') || 962;
  const totalQuestions = findTotal('All') || (easyTotal + mediumTotal + hardTotal);

  const stats: LeetCodeStats = {
    totalSolved,
    totalQuestions,
    easySolved,
    easyTotal,
    mediumSolved,
    mediumTotal,
    hardSolved,
    hardTotal,
    acceptanceRate: 67.2,
    ranking: matchedUser.profile?.ranking || 716178,
    reputation: matchedUser.profile?.reputation || 1,
    contributionPoints: 0,
  };

  const badges: LeetCodeBadge[] = (matchedUser.badges || []).map((b: any) => ({
    id: b.id || '',
    displayName: b.displayName || b.name || '',
    icon: b.icon || '',
    creationDate: b.creationDate || '',
  }));

  return {
    stats,
    badges,
    contest: {
      contestAttend: 0,
      contestRating: 0,
      contestGlobalRanking: 0,
      totalParticipants: 0,
    },
    recentSubmissions: [],
    username,
    profile: {
      realName: matchedUser.profile?.realName || 'Dipayan Sardar',
      aboutMe: '',
      userAvatar: matchedUser.profile?.userAvatar || 'https://assets.leetcode.com/users/Dipayan_Sardar/avatar_1712842299.png',
      ranking: matchedUser.profile?.ranking || 716178,
    },
  };
}

export async function fetchLeetCodeStats(username: string): Promise<LeetCodeFullProfile> {
  // Strategy 1: Local Express server / Vite proxy endpoint
  try {
    const res = await fetch(`/api/leetcode/${username}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.matchedUser) {
        return parseGraphQLData(data, username);
      }
    }
  } catch (e) {
    // Continue to proxy strategy
  }

  // Strategy 2: Public CORS Proxies querying LeetCode GraphQL
  const proxies = [
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://thingproxy.freeboard.io/fetch/',
  ];

  for (const proxy of proxies) {
    try {
      const targetUrl = 'https://leetcode.com/graphql';
      const fullUrl = `${proxy}${encodeURIComponent(targetUrl)}`;
      const res = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: LEETCODE_GRAPHQL_QUERY,
          variables: { username }
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.matchedUser) {
          return parseGraphQLData(json.data, username);
        }
      }
    } catch (e) {
      // Continue to next proxy
    }
  }

  // Strategy 3: Alfa LeetCode API fallback
  try {
    const res = await fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${username}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.totalSolved !== undefined) {
        return {
          stats: {
            totalSolved: data.totalSolved || 226,
            totalQuestions: data.totalQuestions || 4018,
            easySolved: data.easySolved || 187,
            easyTotal: data.easyTotal || 958,
            mediumSolved: data.mediumSolved || 36,
            mediumTotal: data.mediumTotal || 2098,
            hardSolved: data.hardSolved || 3,
            hardTotal: data.hardTotal || 962,
            acceptanceRate: data.acceptanceRate || 67.2,
            ranking: data.ranking || 716178,
            reputation: data.reputation || 1,
            contributionPoints: 0,
          },
          badges: (data.badges || []).map((b: any) => ({
            id: b.id || '',
            displayName: b.displayName || b.name || '',
            icon: b.icon || '',
            creationDate: b.creationDate || '',
          })),
          contest: { contestAttend: 0, contestRating: 0, contestGlobalRanking: 0, totalParticipants: 0 },
          recentSubmissions: [],
          username,
          profile: {
            realName: data.name || 'Dipayan Sardar',
            aboutMe: data.about || '',
            userAvatar: data.avatar || 'https://assets.leetcode.com/users/Dipayan_Sardar/avatar_1712842299.png',
            ranking: data.ranking || 716178,
          }
        };
      }
    }
  } catch (e) {
    // Fallback
  }

  // Strategy 4: Cached profile fallback for @Dipayan_Sardar so UI is robust
  return {
    stats: {
      totalSolved: 226,
      totalQuestions: 4018,
      easySolved: 187,
      easyTotal: 958,
      mediumSolved: 36,
      mediumTotal: 2098,
      hardSolved: 3,
      hardTotal: 962,
      acceptanceRate: 67.2,
      ranking: 716178,
      reputation: 1,
      contributionPoints: 0,
    },
    badges: [
      { id: '10519354', displayName: '100 Days Badge 2026', icon: 'https://assets.leetcode.com/static_assets/others/100_1080_1080.png', creationDate: '2026-07-14' },
      { id: '10256168', displayName: '50 Days Badge 2026', icon: 'https://assets.leetcode.com/static_assets/others/50_1080_1080.png', creationDate: '2026-05-04' },
      { id: '8875988', displayName: '50 Days Badge 2025', icon: 'https://assets.leetcode.com/static_assets/others/lg2550.png', creationDate: '2025-12-09' },
      { id: '10567236', displayName: 'Introduction to Pandas', icon: 'https://assets.leetcode.com/static_assets/others/Introduction_to_Pandas_Badge.png', creationDate: '2026-07-26' }
    ],
    contest: { contestAttend: 0, contestRating: 0, contestGlobalRanking: 0, totalParticipants: 0 },
    recentSubmissions: [],
    username,
    profile: {
      realName: 'Dipayan Sardar',
      aboutMe: '',
      userAvatar: 'https://assets.leetcode.com/users/Dipayan_Sardar/avatar_1712842299.png',
      ranking: 716178,
    }
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
