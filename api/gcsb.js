export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  let profileId = req.query?.profileId;
  if (!profileId && req.url) {
    const parts = req.url.split('?')[0].split('/');
    profileId = parts[parts.length - 1];
  }

  if (!profileId || profileId === 'gcsb') {
    profileId = '5d8b12eb-2182-436e-be69-23c1371f7ebb';
  }

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

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ badges, total: badges.length });
  } catch (error) {
    return res.status(500).json({ error: 'GCSB proxy error', details: error.message });
  }
}
