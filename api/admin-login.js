export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  const configuredPassword =
    process.env.ADMIN_PASSWORD ||
    process.env.VITE_ADMIN_PASSWORD ||
    process.env.DEFAULT_FALLBACK_PASSWORD ||
    'DS2026';

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password.trim() === configuredPassword.trim()) {
    const token = `admin_tok_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    return res.status(200).json({
      success: true,
      token,
      user: 'Administrator',
      message: 'Access granted'
    });
  }

  return res.status(401).json({ error: 'Invalid administrator credentials' });
}
