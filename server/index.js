import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import {
  ImageFile,
  uploadImageToGridFS,
  getImageStream,
  findImage,
  deleteImageFromGridFS,
  listGridFSImages,
  getContentType,
  AdminAuth,
  Viewer,
  Achievement,
  PortfolioContent,
  check_password,
  save_password,
  get_password
} from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Securely load environment variables from .env on the server before connecting
const rootEnvPath = path.join(__dirname, '..', '.env');
const localEnvPath = path.join(__dirname, '.env');

const loadEnvFromDisk = (envFilePath) => {
  try {
    if (fs.existsSync(envFilePath)) {
      const content = fs.readFileSync(envFilePath, 'utf-8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return;
        const [k, ...v] = trimmed.split('=');
        const key = k.trim();
        const val = v.join('=').trim().replace(/^['"]|['";\s]+$/g, '');
        if (key && val) {
          process.env[key] = val;
        }
      });
    }
  } catch { }
};

if (typeof process.loadEnvFile === 'function') {
  try {
    if (fs.existsSync(rootEnvPath)) process.loadEnvFile(rootEnvPath);
    else if (fs.existsSync(localEnvPath)) process.loadEnvFile(localEnvPath);
  } catch { }
}
// Direct parse to guarantee process.env.MONGODB_URI is always updated from disk
loadEnvFromDisk(rootEnvPath);
loadEnvFromDisk(localEnvPath);

// ─── File Paths & Local DB Fallback References ──────────────────────────────
const DB_FILE = path.join(__dirname, 'viewers.json');
const ACHIEVEMENTS_FILE = path.join(__dirname, '../src/data/achievements.json');
const PORTFOLIO_CONTENT_FILE = path.join(__dirname, 'portfolio_content.json');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Helper to read/write portfolio content on disk for fallback backup
const readPortfolioContent = () => {
  try {
    if (fs.existsSync(PORTFOLIO_CONTENT_FILE)) {
      return JSON.parse(fs.readFileSync(PORTFOLIO_CONTENT_FILE, 'utf-8'));
    }
  } catch { }
  return {};
};

const writePortfolioContent = (data) => {
  fs.writeFileSync(PORTFOLIO_CONTENT_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

// Helper to migrate any existing local image to MongoDB GridFS on startup
const migrateExistingImagesToGridFS = async () => {
  try {
    let portfolioContent = null;
    if (mongoose.connection.readyState === 1) {
      const doc = await PortfolioContent.findOne({ identifier: 'main' });
      if (doc && doc.content) portfolioContent = doc.content;
    }
    if (!portfolioContent) {
      portfolioContent = readPortfolioContent();
    }
    const currentProfileImage = portfolioContent?.about?.profileImage;

    if (fs.existsSync(UPLOADS_DIR)) {
      const files = fs.readdirSync(UPLOADS_DIR);
      for (const file of files) {
        if (file.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
          const filePath = path.join(UPLOADS_DIR, file);
          const existingInGrid = await findImage(file);
          if (!existingInGrid) {
            const buffer = fs.readFileSync(filePath);
            const ext = path.extname(file).slice(1).toLowerCase();
            const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
            const uploaded = await uploadImageToGridFS({
              buffer,
              filename: file,
              contentType: mimeType,
              metadata: {
                originalName: file,
                migratedFromLocal: true,
                format: ext,
                isProfilePhoto: true
              }
            });
            console.log(`[GridFS Migration] Migrated local file ${file} -> MongoDB GridFS (${uploaded._id})`);

            if (currentProfileImage && currentProfileImage.includes(file)) {
              portfolioContent.about.profileImage = `/api/images/${uploaded._id}`;
              if (mongoose.connection.readyState === 1) {
                await PortfolioContent.findOneAndUpdate(
                  { identifier: 'main' },
                  { content: portfolioContent, updatedAt: new Date() },
                  { upsert: true }
                );
              }
              writePortfolioContent(portfolioContent);
              console.log(`[GridFS Migration] Updated portfolio profileImage to /api/images/${uploaded._id}`);
            }
          } else if (currentProfileImage && currentProfileImage.includes(file) && !currentProfileImage.startsWith('/api/images/')) {
            portfolioContent.about.profileImage = `/api/images/${existingInGrid._id}`;
            if (mongoose.connection.readyState === 1) {
              await PortfolioContent.findOneAndUpdate(
                { identifier: 'main' },
                { content: portfolioContent, updatedAt: new Date() },
                { upsert: true }
              );
            }
            writePortfolioContent(portfolioContent);
            console.log(`[GridFS Migration] Switched profileImage to GridFS: /api/images/${existingInGrid._id}`);
          }
        }
      }
    }
  } catch (err) {
    console.warn('[GridFS Migration] Migration check:', err.message);
  }
};

// ─── Data Migration & Initialization in MongoDB ─────────────────────────────
const initializeAllMongoData = async () => {
  try {
    // 1. Save and seed Admin Password in MongoDB if not already saved
    try {
      const existingAdmin = await AdminAuth.findOne({ username: 'admin' });
      if (!existingAdmin) {
        const initialPass = (
          process.env.ADMIN_PASSWORD ||
          process.env.VITE_ADMIN_PASSWORD ||
          process.env.DEFAULT_FALLBACK_PASSWORD ||
          'DS2026'
        ).trim();
        await AdminAuth.create({
          username: 'admin',
          password: initialPass,
          updatedAt: new Date()
        });
        console.log('[MongoDB Admin] Administrator password saved into MongoDB collection "admin_credentials"');
      } else {
        console.log('[MongoDB Admin] Administrator password verified in MongoDB collection "admin_credentials"');
      }
    } catch (e) {
      console.warn('[MongoDB Admin] Init check:', e.message);
    }

    // 2. Initialize / Migrate Viewers into MongoDB
    try {
      const viewerCount = await Viewer.countDocuments();
      if (viewerCount === 0 && fs.existsSync(DB_FILE)) {
        const viewers = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
        if (Array.isArray(viewers) && viewers.length > 0) {
          for (const v of viewers) {
            await Viewer.findOneAndUpdate(
              { id: v.id },
              { id: v.id, lat: Number(v.lat), lon: Number(v.lon) },
              { upsert: true }
            );
          }
          console.log(`[MongoDB Viewers] Migrated ${viewers.length} viewers into MongoDB collection`);
        }
      }
    } catch (e) {
      console.warn('[MongoDB Viewers] Migration check:', e.message);
    }

    // 3. Initialize / Migrate Portfolio Content into MongoDB
    try {
      const existingContent = await PortfolioContent.findOne({ identifier: 'main' });
      if (!existingContent && fs.existsSync(PORTFOLIO_CONTENT_FILE)) {
        const content = JSON.parse(fs.readFileSync(PORTFOLIO_CONTENT_FILE, 'utf-8'));
        await PortfolioContent.create({
          identifier: 'main',
          content,
          updatedAt: new Date()
        });
        console.log('[MongoDB PortfolioContent] Migrated portfolio content into MongoDB collection');
      }
    } catch (e) {
      console.warn('[MongoDB PortfolioContent] Migration check:', e.message);
    }

    // 4. Initialize / Migrate Achievements into MongoDB
    try {
      const achCount = await Achievement.countDocuments();
      if (achCount === 0 && fs.existsSync(ACHIEVEMENTS_FILE)) {
        const achs = JSON.parse(fs.readFileSync(ACHIEVEMENTS_FILE, 'utf-8'));
        if (Array.isArray(achs) && achs.length > 0) {
          for (const a of achs) {
            if (a && a.id) {
              await Achievement.findOneAndUpdate({ id: a.id }, a, { upsert: true });
            }
          }
          console.log(`[MongoDB Achievements] Migrated ${achs.length} achievements into MongoDB collection`);
        }
      }
    } catch (e) {
      console.warn('[MongoDB Achievements] Migration check:', e.message);
    }

    // 5. Migrate local images to GridFS
    setTimeout(migrateExistingImagesToGridFS, 1000);
  } catch (err) {
    console.warn('[MongoDB Initializer] General error during initialization:', err.message);
  }
};

// ─── MongoDB Connection ─────────────────────────────────────────────────────
const LOCAL_MONGO_URI = 'mongodb://127.0.0.1:27017/folio';
const configuredUri = (process.env.MONGODB_URI || '').trim();

let normalizedUri = configuredUri || LOCAL_MONGO_URI;
if (normalizedUri.includes('?') && normalizedUri.match(/\?[^/]*\/([a-zA-Z0-9_-]+)/)) {
  const match = normalizedUri.match(/\?[^/]*\/([a-zA-Z0-9_-]+)/);
  const dbName = match[1];
  const [base, query] = normalizedUri.split('?');
  const cleanQuery = query.replace(`/${dbName}`, '');
  const cleanBase = base.endsWith('/') ? `${base}${dbName}` : `${base}/${dbName}`;
  normalizedUri = `${cleanBase}?${cleanQuery}`;
} else {
  // If no db path specified (e.g. mongodb+srv://cluster.net or mongodb+srv://cluster.net/), append /folio
  const [base, query] = normalizedUri.split('?');
  const matchHostEnd = base.match(/(mongodb(?:\+srv)?:\/\/[^/]+)(\/.*)?$/);
  if (matchHostEnd) {
    const hostBase = matchHostEnd[1];
    const pathPart = matchHostEnd[2] || '';
    if (!pathPart || pathPart === '/') {
      normalizedUri = `${hostBase}/folio${query ? '?' + query : ''}`;
    }
  }
}
const MONGODB_URI = normalizedUri;

// Connect to MongoDB
const connectMongoDB = async () => {
  const maskedUri = MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
  console.log(`[MongoDB] Connecting to MONGODB_URI: ${maskedUri}`);

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: 'folio',
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[MongoDB] Successfully connected to database: ${maskedUri}`);
    await initializeAllMongoData();
  } catch (err) {
    console.warn(`[MongoDB] Connection to ${maskedUri} failed: ${err.message}`);

    if (err.message.includes('whitelisted') || err.message.includes('whitelist') || err.message.includes('IP')) {
      console.warn(`[MongoDB Atlas] ⚠️ Your current IP address is not whitelisted in MongoDB Atlas.`);
      console.warn(`[MongoDB Atlas] Please go to Atlas Dashboard -> Security -> Network Access -> Add IP Address (add your IP or 0.0.0.0/0).`);
    }

    if (MONGODB_URI !== LOCAL_MONGO_URI) {
      console.log(`[MongoDB] Using local MongoDB fallback at ${LOCAL_MONGO_URI} to keep server operational...`);
      try {
        await mongoose.connect(LOCAL_MONGO_URI, {
          dbName: 'folio',
          serverSelectionTimeoutMS: 4000
        });
        console.log(`[MongoDB] Connected to local fallback database!`);
        await initializeAllMongoData();
      } catch (localErr) {
        console.error(`[MongoDB] Local fallback error:`, localErr.message);
      }
    }
  }
};
connectMongoDB();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([
    { lat: 51.5074, lon: -0.1278, id: 'london_seed' },
    { lat: 35.6762, lon: 139.6503, id: 'tokyo_seed' },
    { lat: 40.7128, lon: -74.006, id: 'ny_seed' }
  ], null, 2));
}

// Helper to read DB
const readDB = () => {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (e) {
    return [];
  }
};

// Helper to write DB
const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

app.get('/api/locations', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const dbViewers = await Viewer.find({}, { _id: 0, __v: 0 }).lean();
      if (dbViewers && dbViewers.length > 0) {
        return res.json(dbViewers);
      }
    }
  } catch (err) {
    console.warn('[MongoDB Locations] Failed to fetch from DB, falling back to disk:', err.message);
  }
  const viewers = readDB();
  res.json(viewers);
});

app.post('/api/locations', async (req, res) => {
  const { lat, lon, id } = req.body;
  if (lat == null || lon == null) {
    return res.status(400).json({ error: 'Missing lat or lon' });
  }

  const newId = id || `viewer_${Date.now()}`;
  let allViewers = [];

  try {
    if (mongoose.connection.readyState === 1) {
      const existing = await Viewer.findOne({
        $or: [
          { id: newId },
          { lat: { $gte: lat - 0.01, $lte: lat + 0.01 }, lon: { $gte: lon - 0.01, $lte: lon + 0.01 } }
        ]
      });

      if (!existing) {
        await Viewer.create({ id: newId, lat: Number(lat), lon: Number(lon) });
      }
      allViewers = await Viewer.find({}, { _id: 0, __v: 0 }).lean();
    }
  } catch (err) {
    console.warn('[MongoDB Locations] Error updating Viewer in MongoDB:', err.message);
  }

  // Also sync to disk viewers.json as backup
  const viewers = readDB();
  const existsDisk = viewers.find(v => v.id === newId || (Math.abs(v.lat - lat) < 0.01 && Math.abs(v.lon - lon) < 0.01));
  if (!existsDisk) {
    viewers.push({ lat: Number(lat), lon: Number(lon), id: newId });
    writeDB(viewers);
  }

  res.json({ success: true, viewers: allViewers.length > 0 ? allViewers : viewers });
});

// GitHub Repos Proxy & Persistent Cache (supports token & prevents rate limiting)
const GITHUB_CACHE_FILE = path.join(__dirname, 'github_cache.json');
const reposCache = {};
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes in-memory cache

// Load disk cache on boot if available
try {
  if (fs.existsSync(GITHUB_CACHE_FILE)) {
    const diskCache = JSON.parse(fs.readFileSync(GITHUB_CACHE_FILE, 'utf-8'));
    if (diskCache.username && Array.isArray(diskCache.repos)) {
      reposCache[diskCache.username] = { data: diskCache.repos, timestamp: diskCache.timestamp || Date.now() };
    }
  }
} catch {
  // ignore
}

const handleGithubRepos = async (req, res) => {
  const username = req.params.username || req.query.username || process.env.VITE_GITHUB_USERNAME || process.env.GITHUB_USERNAME;
  if (!username) {
    return res.status(400).json({ error: 'GitHub username not configured in environment (VITE_GITHUB_USERNAME)' });
  }
  const now = Date.now();
  const cached = reposCache[username];

  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return res.json({ repos: cached.data, cached: true, lastSynced: cached.timestamp });
  }

  try {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    if (process.env.GITHUB_TOKEN && !process.env.GITHUB_TOKEN.includes('your_personal')) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, { headers });
    if (response.ok) {
      const data = await response.json();
      reposCache[username] = { data, timestamp: now };
      try {
        fs.writeFileSync(GITHUB_CACHE_FILE, JSON.stringify({ username, timestamp: now, repos: data }, null, 2));
      } catch {
        // ignore write error
      }
      return res.json({ repos: data, cached: false, lastSynced: now });
    }

    if (cached) {
      return res.json({ repos: cached.data, cached: true, stale: true, lastSynced: cached.timestamp });
    }

    return res.status(response.status).json({ error: 'GitHub API error', status: response.status });
  } catch (err) {
    if (cached) {
      return res.json({ repos: cached.data, cached: true, stale: true, lastSynced: cached.timestamp });
    }
    return res.status(500).json({ error: 'Failed to fetch GitHub repos', details: err.message });
  }
};

app.get('/api/github/repos', handleGithubRepos);
app.get('/api/github/repos/:username', handleGithubRepos);

// LeetCode GraphQL Proxy
app.get('/api/leetcode/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        query: `query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            profile {
              realName
              userAvatar
              aboutMe
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
          userContestRanking(username: $username) {
            attendedContestsCount
            rating
            globalRanking
            totalParticipants
          }
          recentSubmissionList(username: $username, limit: 10) {
            title
            titleSlug
            timestamp
            statusDisplay
            lang
          }
        }`,
        variables: { username }
      })
    });

    const data = await response.json();
    if (data.errors || !data.data?.matchedUser) {
      return res.status(404).json({ error: 'LeetCode user not found' });
    }
    res.json(data.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch LeetCode stats', details: error.message });
  }
});

// Credly Proxy (Bypasses CORS for live badges & certifications)
app.get('/api/credly/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const response = await fetch(`https://www.credly.com/users/${username}/badges.json`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch Credly badges' });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Credly proxy error', details: error.message });
  }
});

// Google Cloud Skill Boost Scraper Proxy
app.get('/api/gcsb/:profileId', async (req, res) => {
  const { profileId } = req.params;
  try {
    const response = await fetch(`https://www.cloudskillsboost.google/public_profiles/${profileId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch GCSB profile' });
    }
    const html = await response.text();
    // Parse badge cards from public profile HTML
    const badgeRegex = /<div class="public-profile-badge[^"]*">[\s\S]*?<img src="([^"]+)"[\s\S]*?<span class="ql-title-medium[^"]*">\s*([\s\S]*?)\s*<\/span>[\s\S]*?<span class="ql-body-medium[^"]*">\s*Earned\s*([\s\S]*?)\s*<\/span>/g;
    const badges = [];
    let match;
    while ((match = badgeRegex.exec(html)) !== null) {
      badges.push({
        title: match[2].trim(),
        badgeImageUrl: match[1],
        date: match[3].trim(),
        issuer: 'Google Cloud Skill Boost',
        category: 'google',
        iconType: 'google'
      });
    }
    res.json({ badges, total: badges.length });
  } catch (error) {
    res.status(500).json({ error: 'GCSB proxy error', details: error.message });
  }
});


// ─── Achievements Database API (Persisted in MongoDB with disk backup) ───────
app.get('/api/achievements', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const dbAchievements = await Achievement.find({}, { _id: 0, __v: 0 }).sort({ createdAt: -1 }).lean();
      if (dbAchievements && dbAchievements.length > 0) {
        return res.json(dbAchievements);
      }
    }
    if (!fs.existsSync(ACHIEVEMENTS_FILE)) {
      return res.json([]);
    }
    const data = JSON.parse(fs.readFileSync(ACHIEVEMENTS_FILE, 'utf-8'));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read achievements database', details: error.message });
  }
});

app.post('/api/achievements', async (req, res) => {
  try {
    const newAchievement = req.body;
    if (!newAchievement || !newAchievement.title) {
      return res.status(400).json({ error: 'Achievement title is required' });
    }
    const id = newAchievement.id || `ach_${Date.now()}`;
    const payload = { ...newAchievement, id };

    // 1. Store in MongoDB
    if (mongoose.connection.readyState === 1) {
      await Achievement.findOneAndUpdate(
        { id },
        payload,
        { upsert: true, new: true }
      );
    }

    // 2. Sync to disk file for backup
    let data = [];
    if (fs.existsSync(ACHIEVEMENTS_FILE)) {
      try {
        data = JSON.parse(fs.readFileSync(ACHIEVEMENTS_FILE, 'utf-8'));
      } catch { }
    }
    data = [payload, ...data.filter((item) => item.id !== id)];
    fs.writeFileSync(ACHIEVEMENTS_FILE, JSON.stringify(data, null, 2), 'utf-8');

    res.json({ success: true, achievement: payload, total: data.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save achievement', details: error.message });
  }
});

// Update achievement
app.put('/api/achievements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    let updatedResult = null;

    // 1. Update in MongoDB
    if (mongoose.connection.readyState === 1) {
      updatedResult = await Achievement.findOneAndUpdate(
        { id },
        { ...updatedData, id, updatedAt: new Date() },
        { new: true, lean: true }
      );
    }

    // 2. Sync to disk file
    if (fs.existsSync(ACHIEVEMENTS_FILE)) {
      let data = JSON.parse(fs.readFileSync(ACHIEVEMENTS_FILE, 'utf-8'));
      const index = data.findIndex((item) => item.id === id);
      if (index !== -1) {
        data[index] = { ...data[index], ...updatedData, id };
        fs.writeFileSync(ACHIEVEMENTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
        if (!updatedResult) updatedResult = data[index];
      }
    }

    if (!updatedResult) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    res.json({ success: true, achievement: updatedResult });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update achievement', details: error.message });
  }
});

// Delete achievement
app.delete('/api/achievements/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Delete from MongoDB
    if (mongoose.connection.readyState === 1) {
      await Achievement.deleteOne({ id });
    }

    // 2. Sync to disk file
    let remaining = 0;
    if (fs.existsSync(ACHIEVEMENTS_FILE)) {
      let data = JSON.parse(fs.readFileSync(ACHIEVEMENTS_FILE, 'utf-8'));
      data = data.filter((item) => item.id !== id);
      fs.writeFileSync(ACHIEVEMENTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
      remaining = data.length;
    }

    res.json({ success: true, remaining });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete achievement', details: error.message });
  }
});

// ─── Admin Authentication & Password Endpoints (MongoDB Backed) ─────────────

// Admin Authentication (verifies password stored in MongoDB)
app.post('/api/admin/login', async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const isValid = await check_password(password);

  if (isValid) {
    // Generate secure session token
    const token = `admin_tok_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    return res.json({
      success: true,
      token,
      user: 'Administrator',
      source: 'MongoDB Database',
      message: 'Access granted'
    });
  }

  return res.status(401).json({ error: 'Invalid administrator credentials' });
});

// Change/Update Admin Password directly in MongoDB
app.post('/api/admin/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are both required' });
    }

    const isCurrentValid = await check_password(currentPassword);
    if (!isCurrentValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    if (newPassword.trim().length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters long' });
    }

    await save_password(newPassword.trim());
    return res.json({
      success: true,
      message: 'Password successfully updated and stored in MongoDB database'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password in database', details: error.message });
  }
});

// Check Admin DB Status
app.get('/api/admin/status', async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let passwordInDb = false;
    if (isDbConnected) {
      const doc = await AdminAuth.findOne({ username: 'admin' });
      passwordInDb = Boolean(doc && doc.password);
    }
    res.json({
      databaseConnected: isDbConnected,
      passwordStoredInDb: passwordInDb,
      storageEngine: isDbConnected ? 'MongoDB' : 'Local Fallback'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── MongoDB GridFS Image Serving Endpoints ─────────────────────────────────

// Serve images directly from MongoDB GridFS by ObjectId or filename
app.get('/api/images/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getImageStream(id);
    if (!result) {
      return res.status(404).json({ error: 'Image not found in MongoDB GridFS' });
    }

    const { stream, file } = result;

    res.setHeader('Content-Type', getContentType(file));
    if (file.length) {
      res.setHeader('Content-Length', file.length);
    }
    // High performance cache header: 24hr cache with background revalidation
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');

    stream.on('error', (err) => {
      console.error('[MongoDB GridFS] Stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming image from GridFS' });
      }
    });

    stream.pipe(res);
  } catch (error) {
    console.error('[MongoDB GridFS] Retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve image from GridFS', details: error.message });
  }
});

// List all stored images in MongoDB GridFS
app.get('/api/images', async (req, res) => {
  try {
    const images = await listGridFSImages();
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list GridFS images', details: error.message });
  }
});

// Delete an image from MongoDB GridFS
app.delete('/api/images/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteImageFromGridFS(id);
    res.json({ success: true, message: 'Image deleted from MongoDB GridFS' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete image from GridFS', details: error.message });
  }
});

// Backward compatibility: serve /api/uploads/:filename from GridFS first
app.get('/api/uploads/:filename', async (req, res, next) => {
  try {
    const { filename } = req.params;
    const result = await getImageStream(filename);
    if (result) {
      res.setHeader('Content-Type', getContentType(result.file));
      if (result.file.length) res.setHeader('Content-Length', result.file.length);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return result.stream.pipe(res);
    }
    next();
  } catch {
    next();
  }
});

// ─── Portfolio Content CMS API (MongoDB Backed with disk backup) ───────────

// Get all portfolio content from MongoDB
app.get('/api/portfolio-content', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const doc = await PortfolioContent.findOne({ identifier: 'main' }).lean();
      if (doc && doc.content) {
        return res.json(doc.content);
      }
    }
    const content = readPortfolioContent();
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read portfolio content', details: error.message });
  }
});

// Update portfolio content (deep merge & persist to MongoDB + disk)
app.put('/api/portfolio-content', async (req, res) => {
  try {
    let current = {};
    if (mongoose.connection.readyState === 1) {
      const doc = await PortfolioContent.findOne({ identifier: 'main' }).lean();
      if (doc && doc.content) current = doc.content;
    }
    if (Object.keys(current).length === 0) {
      current = readPortfolioContent();
    }

    const updates = req.body;

    // Deep merge: update only provided keys
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

    const merged = deepMerge({ ...current }, updates);

    // 1. Save to MongoDB
    if (mongoose.connection.readyState === 1) {
      await PortfolioContent.findOneAndUpdate(
        { identifier: 'main' },
        { content: merged, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    }

    // 2. Persist to disk backup
    writePortfolioContent(merged);

    res.json({ success: true, content: merged });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update portfolio content', details: error.message });
  }
});

// Upload profile image directly to MongoDB GridFS (NO LOCAL DISK STORAGE)
app.post('/api/portfolio-content/upload-image', async (req, res) => {
  try {
    const { imageData, fileName } = req.body;
    if (!imageData) {
      return res.status(400).json({ error: 'imageData is required' });
    }

    // Robust Base64 extraction
    const commaIndex = imageData.indexOf(',');
    const rawBase64 = commaIndex !== -1 ? imageData.slice(commaIndex + 1) : imageData;
    const cleanBase64 = rawBase64.replace(/[^A-Za-z0-9+/=]/g, '');
    const imageBuffer = Buffer.from(cleanBase64, 'base64');

    // Determine extension and MIME type
    let ext = 'jpg';
    let mimeType = 'image/jpeg';
    const mimeMatch = imageData.match(/^data:image\/([a-zA-Z0-9+.-]+);/);
    if (mimeMatch) {
      const mime = mimeMatch[1].toLowerCase();
      if (mime.includes('png')) {
        ext = 'png';
        mimeType = 'image/png';
      } else if (mime.includes('webp')) {
        ext = 'webp';
        mimeType = 'image/webp';
      } else if (mime.includes('svg')) {
        ext = 'svg';
        mimeType = 'image/svg+xml';
      } else if (mime.includes('gif')) {
        ext = 'gif';
        mimeType = 'image/gif';
      } else {
        ext = 'jpg';
        mimeType = 'image/jpeg';
      }
    }

    const timestamp = Date.now();
    const safeName = fileName
      ? fileName.replace(/[^a-zA-Z0-9_.-]/g, '_')
      : `profile_${timestamp}.${ext}`;
    const targetFileName = safeName.endsWith(`.${ext}`) ? safeName : `${safeName}.${ext}`;

    // Upload directly to MongoDB GridFS (no local disk writes)
    const storedFile = await uploadImageToGridFS({
      buffer: imageBuffer,
      filename: targetFileName,
      contentType: mimeType,
      metadata: {
        originalName: fileName || targetFileName,
        format: ext,
        size: imageBuffer.length,
        isProfilePhoto: true,
        uploadedAt: new Date()
      }
    });

    // The image path points to the GridFS streaming endpoint
    const imagePath = `/api/images/${storedFile._id}`;

    // Update MongoDB & Disk content with the GridFS image path
    let content = {};
    if (mongoose.connection.readyState === 1) {
      const doc = await PortfolioContent.findOne({ identifier: 'main' }).lean();
      if (doc && doc.content) content = doc.content;
    }
    if (Object.keys(content).length === 0) {
      content = readPortfolioContent();
    }
    if (!content.about) content.about = {};
    content.about.profileImage = imagePath;

    if (mongoose.connection.readyState === 1) {
      await PortfolioContent.findOneAndUpdate(
        { identifier: 'main' },
        { content, updatedAt: new Date() },
        { upsert: true }
      );
    }
    writePortfolioContent(content);

    console.log(`[MongoDB GridFS] Image stored successfully: ID=${storedFile._id}, Name=${targetFileName}, Size=${imageBuffer.length} bytes`);

    res.json({
      success: true,
      imagePath,
      fileId: storedFile._id,
      filename: targetFileName,
      contentType: mimeType,
      storage: 'MongoDB GridFS'
    });
  } catch (error) {
    console.error('[MongoDB GridFS] Failed to upload image:', error);
    res.status(500).json({ error: 'Failed to upload image to MongoDB GridFS', details: error.message });
  }
});

// Upload resume PDF (Base64)
app.post('/api/portfolio-content/upload-resume', async (req, res) => {
  try {
    const { fileData, fileName } = req.body;
    if (!fileData) {
      return res.status(400).json({ error: 'fileData is required' });
    }

    const commaIndex = fileData.indexOf(',');
    const rawBase64 = commaIndex !== -1 ? fileData.slice(commaIndex + 1) : fileData;
    const cleanBase64 = rawBase64.replace(/[^A-Za-z0-9+/=]/g, '');

    const safeName = fileName ? fileName.replace(/[^a-zA-Z0-9_.-]/g, '_') : 'resume.pdf';
    const targetName = safeName.endsWith('.pdf') ? safeName : `${safeName}.pdf`;
    const targetPath = path.join(PUBLIC_DIR, targetName);
    const pdfBuffer = Buffer.from(cleanBase64, 'base64');

    fs.writeFileSync(targetPath, pdfBuffer);

    // Also copy to resume.pdf for the generic link
    const genericPath = path.join(PUBLIC_DIR, 'resume.pdf');
    if (targetName !== 'resume.pdf') {
      fs.copyFileSync(targetPath, genericPath);
    }

    // Update MongoDB & Disk content
    let content = {};
    if (mongoose.connection.readyState === 1) {
      const doc = await PortfolioContent.findOne({ identifier: 'main' }).lean();
      if (doc && doc.content) content = doc.content;
    }
    if (Object.keys(content).length === 0) {
      content = readPortfolioContent();
    }
    if (!content.hero) content.hero = {};
    content.hero.resumeFileName = targetName;

    if (mongoose.connection.readyState === 1) {
      await PortfolioContent.findOneAndUpdate(
        { identifier: 'main' },
        { content, updatedAt: new Date() },
        { upsert: true }
      );
    }
    writePortfolioContent(content);

    res.json({ success: true, resumePath: `/${targetName}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload resume', details: error.message });
  }
});

// System Diagnostics & Health Status API
app.get('/api/system/health', async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let achieveCount = 0;
    let viewersCount = 0;
    let imagesCount = 0;
    let passwordInDb = false;
    let portfolioInDb = false;

    if (isDbConnected) {
      try {
        achieveCount = await Achievement.countDocuments();
        viewersCount = await Viewer.countDocuments();
        imagesCount = await ImageFile.countDocuments();
        const adminDoc = await AdminAuth.findOne({ username: 'admin' });
        passwordInDb = Boolean(adminDoc && adminDoc.password);
        const pDoc = await PortfolioContent.findOne({ identifier: 'main' });
        portfolioInDb = Boolean(pDoc && pDoc.content);
      } catch (dbErr) {
        console.warn('[System Health] DB count error:', dbErr.message);
      }
    } else {
      if (fs.existsSync(ACHIEVEMENTS_FILE)) {
        try {
          const achs = JSON.parse(fs.readFileSync(ACHIEVEMENTS_FILE, 'utf-8'));
          achieveCount = Array.isArray(achs) ? achs.length : 0;
        } catch { }
      }
      const viewers = readDB();
      viewersCount = viewers.length;
    }

    const mem = process.memoryUsage();
    res.json({
      status: 'operational',
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
        rssMB: Math.round(mem.rss / 1024 / 1024)
      },
      envStatus: {
        githubConfigured: Boolean(process.env.VITE_GITHUB_USERNAME || process.env.GITHUB_USERNAME),
        leetcodeConfigured: Boolean(process.env.VITE_LEETCODE_USERNAME || process.env.LEETCODE_USERNAME),
        credlyConfigured: Boolean(process.env.VITE_CREDLY_USERNAME),
        gcsbConfigured: Boolean(process.env.VITE_GCSB_PROFILE_ID),
        port: PORT
      },
      database: {
        status: isDbConnected ? 'connected' : 'disconnected',
        provider: 'MongoDB',
        host: mongoose.connection?.host || 'localhost',
        name: mongoose.connection?.name || 'folio',
        passwordStoredInDb: passwordInDb,
        portfolioStoredInDb: portfolioInDb,
        achievementsCount: achieveCount,
        viewersCount: viewersCount,
        gridFSImagesCount: imagesCount
      },
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({ status: 'degraded', error: error.message });
  }
});


// Use PORT from environment (required by Render/Heroku/Railway) with 3001 as local fallback
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Live Location Database running at http://localhost:${PORT}`);
});

