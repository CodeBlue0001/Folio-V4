import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

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


// Use PORT from environment (required by Render/Heroku/Railway) with 3001 as local fallback
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Live Location Database running at http://localhost:${PORT}`);
});
