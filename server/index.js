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
  getContentType
} from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Securely load environment variables from .env on the server before connecting
const rootEnvPath = path.join(__dirname, '..', '.env');
const localEnvPath = path.join(__dirname, '.env');
if (typeof process.loadEnvFile === 'function') {
  try {
    if (fs.existsSync(rootEnvPath)) {
      process.loadEnvFile(rootEnvPath);
    } else if (fs.existsSync(localEnvPath)) {
      process.loadEnvFile(localEnvPath);
    }
  } catch {
    // .env not present or running in cloud environment
  }
}

// Connect to MongoDB (for GridFS image storage)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/folio';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log(`[MongoDB GridFS] Connected to database at ${MONGODB_URI}`);
    // Run background migration if local images exist
    setTimeout(migrateExistingImagesToGridFS, 1500);
  })
  .catch((err) => {
    console.error('[MongoDB GridFS] Connection error:', err.message);
  });

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const DB_FILE = path.join(__dirname, 'viewers.json');

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

app.get('/api/locations', (req, res) => {
  const viewers = readDB();
  res.json(viewers);
});

app.post('/api/locations', (req, res) => {
  const { lat, lon, id } = req.body;
  if (lat == null || lon == null) {
    return res.status(400).json({ error: 'Missing lat or lon' });
  }

  const viewers = readDB();
  const newId = id || `viewer_${Date.now()}`;

  // Check if viewer already exists (rough location match or exact id)
  const exists = viewers.find(v => v.id === newId || (Math.abs(v.lat - lat) < 0.01 && Math.abs(v.lon - lon) < 0.01));

  if (!exists) {
    viewers.push({ lat, lon, id: newId });
    writeDB(viewers);
  }

  res.json({ success: true, viewers });
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


// Achievements JSON Database API (serves and persists to src/data/achievements.json)
const ACHIEVEMENTS_FILE = path.join(__dirname, '../src/data/achievements.json');

app.get('/api/achievements', (req, res) => {
  try {
    if (!fs.existsSync(ACHIEVEMENTS_FILE)) {
      return res.json([]);
    }
    const data = JSON.parse(fs.readFileSync(ACHIEVEMENTS_FILE, 'utf-8'));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read achievements database', details: error.message });
  }
});

app.post('/api/achievements', (req, res) => {
  try {
    const newAchievement = req.body;
    if (!newAchievement || !newAchievement.title) {
      return res.status(400).json({ error: 'Achievement title is required' });
    }
    let data = [];
    if (fs.existsSync(ACHIEVEMENTS_FILE)) {
      data = JSON.parse(fs.readFileSync(ACHIEVEMENTS_FILE, 'utf-8'));
    }
    // Prepend new achievement
    data = [newAchievement, ...data];
    fs.writeFileSync(ACHIEVEMENTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    res.json({ success: true, achievement: newAchievement, total: data.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save achievement', details: error.message });
  }
});

// Update achievement
app.put('/api/achievements/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    if (!fs.existsSync(ACHIEVEMENTS_FILE)) {
      return res.status(404).json({ error: 'Database not found' });
    }
    let data = JSON.parse(fs.readFileSync(ACHIEVEMENTS_FILE, 'utf-8'));
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Achievement not found' });
    }
    data[index] = { ...data[index], ...updatedData, id };
    fs.writeFileSync(ACHIEVEMENTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    res.json({ success: true, achievement: data[index] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update achievement', details: error.message });
  }
});

// Delete achievement
app.delete('/api/achievements/:id', (req, res) => {
  try {
    const { id } = req.params;
    if (!fs.existsSync(ACHIEVEMENTS_FILE)) {
      return res.status(404).json({ error: 'Database not found' });
    }
    let data = JSON.parse(fs.readFileSync(ACHIEVEMENTS_FILE, 'utf-8'));
    const initialLen = data.length;
    data = data.filter((item) => item.id !== id);
    if (data.length === initialLen) {
      return res.status(404).json({ error: 'Achievement not found' });
    }
    fs.writeFileSync(ACHIEVEMENTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    res.json({ success: true, remaining: data.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete achievement', details: error.message });
  }
});

// Admin Authentication
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  let diskEnvPassword = '';
  try {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const envLines = fs.readFileSync(envPath, 'utf-8').split('\n');
      for (const line of envLines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || !trimmed.includes('=')) continue;
        const [k, ...v] = trimmed.split('=');
        const key = k.trim();
        const val = v.join('=').trim().replace(/^['"]|['";\s]+$/g, '');
        if (key === 'ADMIN_PASSWORD' || key === 'VITE_ADMIN_PASSWORD' || key === 'DEFAULT_FALLBACK_PASSWORD') {
          diskEnvPassword = val;
          break;
        }
      }
    }
  } catch { }

  const rawPassword =
    diskEnvPassword ||
    process.env.ADMIN_PASSWORD ||
    process.env.VITE_ADMIN_PASSWORD ||
    process.env.DEFAULT_FALLBACK_PASSWORD ||
    '';
  const configuredPassword = rawPassword
    ? String(rawPassword).trim().replace(/^['"]|['";\s]+$/g, '')
    : 'DS2026';

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password.trim() === configuredPassword) {
    // Generate secure session token
    const token = `admin_tok_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    return res.json({
      success: true,
      token,
      user: 'Administrator',
      message: 'Access granted'
    });
  }

  return res.status(401).json({ error: 'Invalid administrator credentials' });
});

// ─── Portfolio Content CMS API ──────────────────────────────────────────────
const PORTFOLIO_CONTENT_FILE = path.join(__dirname, 'portfolio_content.json');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Helper to migrate any existing local image to MongoDB GridFS on startup
const migrateExistingImagesToGridFS = async () => {
  try {
    const portfolioContent = readPortfolioContent();
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

            // If current profileImage references this filename, update to GridFS URL
            if (currentProfileImage && currentProfileImage.includes(file)) {
              portfolioContent.about.profileImage = `/api/images/${uploaded._id}`;
              writePortfolioContent(portfolioContent);
              console.log(`[GridFS Migration] Updated portfolio profileImage to /api/images/${uploaded._id}`);
            }
          } else if (currentProfileImage && currentProfileImage.includes(file) && !currentProfileImage.startsWith('/api/images/')) {
            portfolioContent.about.profileImage = `/api/images/${existingInGrid._id}`;
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

// Get all portfolio content
app.get('/api/portfolio-content', (req, res) => {
  try {
    const content = readPortfolioContent();
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read portfolio content', details: error.message });
  }
});

// Update portfolio content (deep merge)
app.put('/api/portfolio-content', (req, res) => {
  try {
    const existing = readPortfolioContent();
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

    const merged = deepMerge({ ...existing }, updates);
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

    // Update content DB with the GridFS image path
    const content = readPortfolioContent();
    if (!content.about) content.about = {};
    content.about.profileImage = imagePath;
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
app.post('/api/portfolio-content/upload-resume', (req, res) => {
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

    // Update content DB
    const content = readPortfolioContent();
    if (!content.hero) content.hero = {};
    content.hero.resumeFileName = targetName;
    writePortfolioContent(content);

    res.json({ success: true, resumePath: `/${targetName}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload resume', details: error.message });
  }
});

// System Diagnostics & Health Status API
app.get('/api/system/health', (req, res) => {
  try {
    let achieveCount = 0;
    if (fs.existsSync(ACHIEVEMENTS_FILE)) {
      try {
        const achs = JSON.parse(fs.readFileSync(ACHIEVEMENTS_FILE, 'utf-8'));
        achieveCount = Array.isArray(achs) ? achs.length : 0;
      } catch { }
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
        adminPasswordCustomized: Boolean(process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || process.env.DEFAULT_FALLBACK_PASSWORD),
        port: PORT
      },
      database: {
        achievementsCount: achieveCount,
        viewersDatabaseExists: fs.existsSync(DB_FILE)
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

