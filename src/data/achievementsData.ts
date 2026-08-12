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

// ─── LeetCode API (alfa-leetcode-api — free, no auth) ──────────────────────────

const LEETCODE_API_BASE = 'https://alfa-leetcode-api.onrender.com';

export async function fetchLeetCodeStats(username: string): Promise<LeetCodeFullProfile> {
  // Fetch multiple endpoints in parallel
  const [profileRes, solvedRes, badgesRes, contestRes, submissionRes] = await Promise.allSettled([
    fetch(`${LEETCODE_API_BASE}/${username}`),
    fetch(`${LEETCODE_API_BASE}/${username}/solved`),
    fetch(`${LEETCODE_API_BASE}/${username}/badges`),
    fetch(`${LEETCODE_API_BASE}/${username}/contest`),
    fetch(`${LEETCODE_API_BASE}/${username}/submission?limit=10`),
  ]);

  // Helper to extract JSON safely
  const getJson = async (result: PromiseSettledResult<Response>) => {
    if (result.status === 'fulfilled' && result.value.ok) {
      return result.value.json();
    }
    return null;
  };

  const [profileData, solvedData, badgesData, contestData, submissionData] = await Promise.all([
    getJson(profileRes),
    getJson(solvedRes),
    getJson(badgesRes),
    getJson(contestRes),
    getJson(submissionRes),
  ]);

  // Parse solved stats
  const stats: LeetCodeStats = {
    totalSolved: solvedData?.solvedProblem ?? 0,
    totalQuestions: solvedData?.totalQuestions ?? 0,
    easySolved: solvedData?.easySolved ?? 0,
    easyTotal: solvedData?.easyTotal ?? 0,
    mediumSolved: solvedData?.mediumSolved ?? 0,
    mediumTotal: solvedData?.mediumTotal ?? 0,
    hardSolved: solvedData?.hardSolved ?? 0,
    hardTotal: solvedData?.hardTotal ?? 0,
    acceptanceRate: parseFloat(profileData?.submitStats?.acSubmissionNum?.[0]?.submissions ?? '0') || 0,
    ranking: profileData?.ranking ?? 0,
    reputation: profileData?.reputation ?? 0,
    contributionPoints: profileData?.contributionPoint ?? 0,
  };

  // Parse badges
  const badges: LeetCodeBadge[] = (badgesData?.badges ?? []).map((b: any) => ({
    id: b.id ?? '',
    displayName: b.displayName ?? b.name ?? '',
    icon: b.icon ?? '',
    creationDate: b.creationDate ?? '',
  }));

  // Parse contest data
  const contest: LeetCodeContest = {
    contestAttend: contestData?.contestAttend ?? 0,
    contestRating: Math.round(contestData?.contestRating ?? 0),
    contestGlobalRanking: contestData?.contestGlobalRanking ?? 0,
    totalParticipants: contestData?.totalParticipants ?? 0,
  };

  // Parse recent submissions
  const recentSubmissions: LeetCodeSubmission[] = (submissionData?.submission ?? []).map((s: any) => ({
    title: s.title ?? '',
    titleSlug: s.titleSlug ?? '',
    timestamp: s.timestamp ?? '',
    statusDisplay: s.statusDisplay ?? '',
    lang: s.lang ?? '',
  }));

  return {
    stats,
    badges,
    contest,
    recentSubmissions,
    username,
    profile: {
      realName: profileData?.name ?? '',
      aboutMe: profileData?.about ?? '',
      userAvatar: profileData?.avatar ?? '',
      ranking: profileData?.ranking ?? 0,
    },
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
