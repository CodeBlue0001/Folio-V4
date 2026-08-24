// In-memory / seed storage for viewer locations on Vercel Serverless
let viewersMemory = [
  { lat: 51.5074, lon: -0.1278, id: 'london_seed' },
  { lat: 35.6762, lon: 139.6503, id: 'tokyo_seed' },
  { lat: 40.7128, lon: -74.006, id: 'ny_seed' },
  { lat: 22.5726, lon: 88.3639, id: 'kolkata_seed' }
];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const { lat, lon, id } = req.body || {};
    if (lat != null && lon != null) {
      const newId = id || `viewer_${Date.now()}`;
      const exists = viewersMemory.find(
        (v) => v.id === newId || (Math.abs(v.lat - lat) < 0.01 && Math.abs(v.lon - lon) < 0.01)
      );
      if (!exists) {
        viewersMemory.push({ lat, lon, id: newId });
      }
    }
    return res.status(200).json({ success: true, viewers: viewersMemory });
  }

  return res.status(200).json(viewersMemory);
}
