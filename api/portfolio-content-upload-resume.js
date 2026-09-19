export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
};

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

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { fileName } = body || {};
    const safeName = fileName ? fileName.replace(/[^a-zA-Z0-9_.-]/g, '_') : 'resume.pdf';

    return res.status(200).json({ success: true, resumePath: `/${safeName}` });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to upload resume', details: err.message });
  }
}
