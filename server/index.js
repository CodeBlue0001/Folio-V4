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

// Use PORT from environment (required by Render/Heroku/Railway) with 3001 as local fallback
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Live Location Database running at http://localhost:${PORT}`);
});
