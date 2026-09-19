import { useState, useEffect, useCallback } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

export interface ColorPair {
  headingColor: string;
  accentColor: string;
}

export interface PortfolioTheme {
  dark: ColorPair;
  light: ColorPair;
  headingColor?: string;
  accentColor?: string;
}

export interface PortfolioContent {
  hero: {
    phrases: string[];
    subtitle: string;
    resumeFileName: string;
  };
  about: {
    heading: string;
    bio: string;
    hobbies: string;
    profileImage: string;
    timeline: TimelineItem[];
  };
  contact: {
    heading: string;
    subtitle: string;
    email: string;
    phone: string;
    location: string;
    github: string;
    linkedin: string;
  };
  theme: PortfolioTheme;
  footer: {
    text: string;
  };
}

// ─── Defaults (fallback when API is unreachable) ────────────────────────────

export const DEFAULT_CONTENT: PortfolioContent = {
  hero: {
    phrases: ['Hi, I am Dipayan Sardar', 'Welcome to my Portfolio!'],
    subtitle: 'Full Stack Developer | Creative Designer | Tech Enthusiast',
    resumeFileName: 'Dipayan_Sardar_Resume_2026_sept.pdf',
  },
  about: {
    heading: 'About Me',
    bio: "Hello! I'm Dipayan Sardar, a B.Tech CSE student, Web Developer, and Vibe Coder. I love creating exceptional digital experiences that combine beautiful design with powerful functionality.",
    hobbies: "When I'm not coding, you'll find me playing chess, listening to music & audio stories, or reading books.",
    profileImage: '',
    timeline: [
      { year: '2025 - Present', title: 'B.Tech CSE Student', description: 'Pursuing Computer Science at Narula Institute of Technology, Kolkata.' },
      { year: '2025', title: 'Diploma in CS', description: 'Graduated from Central Calcutta Polytechnic with 86.6%.' },
      { year: 'Experience', title: 'Web Dev & AI/ML Intern', description: 'Interned at YCSAS Pvt. Ltd. (Web) and Codsoft Pvt. Ltd. (AI & ML).' },
    ],
  },
  contact: {
    heading: 'Get In Touch',
    subtitle: 'Feel free to reach out directly through email, phone, or social profiles!',
    email: 'dipayansardar477@gmail.com',
    phone: '+91- 9875357834',
    location: 'Kolkata, West Bengal',
    github: 'https://github.com/CodeBlue0001',
    linkedin: 'https://www.linkedin.com/in/dipayan-sardar-321594307/',
  },
  theme: {
    dark: {
      headingColor: '#D4A853',
      accentColor: '#34d399',
    },
    light: {
      headingColor: '#1e293b',
      accentColor: '#0284c7',
    },
    headingColor: '#D4A853',
    accentColor: '#34d399',
  },
  footer: {
    text: 'Dipayan',
  },
};

const CACHE_KEY = 'folio_portfolio_content';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ─── Deep merge utility ─────────────────────────────────────────────────────

function deepMerge<T extends Record<string, any>>(defaults: T, partial: Partial<T>): T {
  const result = { ...defaults };
  for (const key of Object.keys(partial) as (keyof T)[]) {
    const val = partial[key];
    if (
      val &&
      typeof val === 'object' &&
      !Array.isArray(val) &&
      defaults[key] &&
      typeof defaults[key] === 'object' &&
      !Array.isArray(defaults[key])
    ) {
      result[key] = deepMerge(defaults[key] as any, val as any);
    } else if (val !== undefined) {
      result[key] = val as T[keyof T];
    }
  }
  return result;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function usePortfolioContent() {
  const [content, setContent] = useState<PortfolioContent>(() => {
    // Try to load from localStorage cache first for instant paint
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.data && parsed.timestamp && Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          return deepMerge(DEFAULT_CONTENT, parsed.data);
        }
      }
    } catch { }
    return DEFAULT_CONTENT;
  });

  const [isLoading, setIsLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch('/api/portfolio-content');
      if (res.ok) {
        const data = await res.json();
        const merged = deepMerge(DEFAULT_CONTENT, data);
        setContent(merged);
        // Cache to localStorage
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
        } catch { }
      }
    } catch {
      // API unreachable — use defaults or cached content
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Listen for content updates from admin (custom event)
  useEffect(() => {
    const handler = () => {
      fetchContent();
    };
    window.addEventListener('portfolio-content-updated', handler);
    return () => window.removeEventListener('portfolio-content-updated', handler);
  }, [fetchContent]);

  const getColors = useCallback((isDarkMode: boolean) => {
    return getThemeColors(content, isDarkMode);
  }, [content]);

  return { content, isLoading, refetch: fetchContent, getThemeColors: getColors };
}

export function getThemeColors(content: PortfolioContent, isDark: boolean): ColorPair {
  if (!content || !content.theme) {
    return isDark
      ? { headingColor: '#D4A853', accentColor: '#34d399' }
      : { headingColor: '#1e293b', accentColor: '#0284c7' };
  }

  if (isDark) {
    return {
      headingColor: content.theme.dark?.headingColor || content.theme.headingColor || '#D4A853',
      accentColor: content.theme.dark?.accentColor || content.theme.accentColor || '#34d399',
    };
  } else {
    return {
      headingColor: content.theme.light?.headingColor || '#1e293b',
      accentColor: content.theme.light?.accentColor || '#0284c7',
    };
  }
}
