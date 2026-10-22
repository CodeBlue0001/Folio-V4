import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/folio';

let cachedConn = null;
async function connectToMongo() {
  if (cachedConn && mongoose.connection.readyState === 1) {
    return cachedConn;
  }
  cachedConn = await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  return cachedConn;
}

const portfolioContentSchema = new mongoose.Schema(
  {
    identifier: { type: String, default: 'main', unique: true, index: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    updatedAt: { type: Date, default: Date.now }
  },
  { collection: 'portfolio_content', timestamps: true }
);

const PortfolioContent = mongoose.models.PortfolioContent || mongoose.model('PortfolioContent', portfolioContentSchema);

let cachedContent = null;

const getFallbackContent = () => {
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
      dark: { headingColor: "#D4A853", accentColor: "#34d399", bgPrimary: "#07101e", bgSecondary: "#0c1a2e" },
      light: { headingColor: "#1e293b", accentColor: "#0284c7", bgPrimary: "#e8f4fd", bgSecondary: "#dbeafe" },
      headingColor: "#D4A853",
      accentColor: "#34d399",
      bgPrimary: "#07101e",
      bgSecondary: "#0c1a2e"
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

export default async function handler(req, res) {
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

  // Ensure content responses are never cached by edge proxies or browsers
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  let mongoAvailable = false;
  try {
    await connectToMongo();
    mongoAvailable = mongoose.connection.readyState === 1;
  } catch (err) {
    console.warn('[MongoDB PortfolioContent] Connection warning:', err.message);
  }

  if (req.method === 'GET') {
    try {
      if (mongoAvailable) {
        const doc = await PortfolioContent.findOne({ identifier: 'main' }).lean();
        if (doc && doc.content && Object.keys(doc.content).length > 0) {
          cachedContent = doc.content;
          return res.status(200).json(doc.content);
        }
      }

      // If not yet in MongoDB or Mongo unavailable, load fallback and seed MongoDB
      const fallback = getFallbackContent();
      if (mongoAvailable && fallback) {
        try {
          await PortfolioContent.findOneAndUpdate(
            { identifier: 'main' },
            { content: fallback, updatedAt: new Date() },
            { upsert: true }
          );
        } catch { }
      }
      return res.status(200).json(fallback);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to retrieve portfolio content', details: err.message });
    }
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    try {
      const updates = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!updates || typeof updates !== 'object') {
        return res.status(400).json({ error: 'Invalid update body' });
      }

      let current = {};
      if (mongoAvailable) {
        const doc = await PortfolioContent.findOne({ identifier: 'main' }).lean();
        if (doc && doc.content) current = doc.content;
      }
      if (Object.keys(current).length === 0) {
        current = getFallbackContent();
      }

      const merged = deepMerge({ ...current }, updates);
      cachedContent = merged;

      // 1. Persist to MongoDB
      if (mongoAvailable) {
        await PortfolioContent.findOneAndUpdate(
          { identifier: 'main' },
          { content: merged, updatedAt: new Date() },
          { upsert: true, new: true }
        );
      }

      // 2. Persist to disk JSON file if writable
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
