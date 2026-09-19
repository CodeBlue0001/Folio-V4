import fs from 'fs';
import path from 'path';

// In-memory content cache for Vercel serverless functions
let cachedContent = null;

const getInitialContent = () => {
  if (cachedContent) return cachedContent;

  try {
    const filePath = path.join(process.cwd(), 'server', 'portfolio_content.json');
    if (fs.existsSync(filePath)) {
      cachedContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return cachedContent;
    }
  } catch { }

  cachedContent = {
    hero: {
      phrases: ["Hi, I am Dipayan Sardar", "Welcome to my Portfolio!"],
      subtitle: "Full Stack Developer | Creative Designer | Tech Enthusiast",
      resumeFileName: "Dipayan_Sardar_Resume_2026_sept.pdf"
    },
    about: {
      heading: "About Me",
      bio: "Hello! I'm Dipayan Sardar, a B.Tech CSE student, Web Developer, and Vibe Coder. I love creating exceptional digital experiences that combine beautiful design with powerful functionality.",
      hobbies: "When I'm not coding, you'll find me playing chess, listening to music & audio stories, or reading books.",
      profileImage: "",
      timeline: [
        { year: "2025 - Present", title: "B.Tech CSE Student", description: "Pursuing Computer Science at Narula Institute of Technology, Kolkata." },
        { year: "2025", title: "Diploma in CS", description: "Graduated from Central Calcutta Polytechnic with 86.6%." },
        { year: "Experience", title: "Web Dev & AI/ML Intern", description: "Interned at YCSAS Pvt. Ltd. (Web) and Codsoft Pvt. Ltd. (AI & ML)." }
      ]
    },
    contact: {
      heading: "Get In Touch",
      subtitle: "Feel free to reach out directly through email, phone, or social profiles!",
      email: "dipayansardar477@gmail.com",
      phone: "+91- 9875357834",
      location: "Kolkata, West Bengal",
      github: "https://github.com/CodeBlue0001",
      linkedin: "https://www.linkedin.com/in/dipayan-sardar-321594307/"
    },
    theme: {
      dark: { headingColor: "#D4A853", accentColor: "#34d399" },
      light: { headingColor: "#1e293b", accentColor: "#0284c7" },
      headingColor: "#D4A853",
      accentColor: "#34d399"
    },
    footer: {
      text: "Dipayan Sardar"
    }
  };
  return cachedContent;
};

const deepMerge = (target, source) => {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const current = getInitialContent();

  if (req.method === 'GET') {
    return res.status(200).json(current);
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    try {
      const updates = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!updates || typeof updates !== 'object') {
        return res.status(400).json({ error: 'Invalid update body' });
      }

      const merged = deepMerge({ ...current }, updates);
      cachedContent = merged;

      try {
        const filePath = path.join(process.cwd(), 'server', 'portfolio_content.json');
        fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf-8');
      } catch { }

      return res.status(200).json({ success: true, content: merged });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update portfolio content', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
