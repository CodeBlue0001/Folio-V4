import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Basic dot env parser since we don't know if dotenv is installed
const parseEnv = (filePath) => {
  try {
    const envContent = fs.readFileSync(filePath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        value = value.trim().replace(/^['"](.*)['"]$/, '$1'); // remove quotes
        process.env[key] = value;
      }
    });
  } catch (err) {
    console.log('.env file not found or could not be read, continuing with existing env vars.');
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
parseEnv(path.join(__dirname, '..', '.env'));

const username = process.env.VITE_GITHUB_USERNAME || process.env.GITHUB_USERNAME;
const token = process.env.GITHUB_TOKEN;

if (!username) {
  console.error("Error: VITE_GITHUB_USERNAME must be set in .env file.");
  process.exit(1);
}

const GITHUB_API = 'https://api.github.com';
const headers = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'Folio-Updater-Script'
};

// Only add Authorization if token is provided and not the placeholder
if (token && token !== 'your_personal_access_token_here') {
  headers['Authorization'] = `token ${token}`;
} else {
  console.warn("Warning: Running without GITHUB_TOKEN. Unauthenticated requests are limited to 60/hr.");
}

async function fetchAllRepos() {
  let repos = [];
  let page = 1;
  while (true) {
    const url = token && token !== 'your_personal_access_token_here'
      ? `${GITHUB_API}/user/repos?per_page=100&page=${page}&affiliation=owner,collaborator`
      : `${GITHUB_API}/users/${username}/repos?per_page=100&page=${page}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.length === 0) break;
    repos = repos.concat(data);
    page++;
  }
  return repos;
}

async function processRepos(repos) {
  const languageStats = {};
  const skillRepos = {};
  
  for (const repo of repos) {
    console.log(`Fetching languages for ${repo.name}...`);
    try {
      const response = await fetch(repo.languages_url, { headers });
      if (response.ok) {
        const langs = await response.json();
        for (const [lang, bytes] of Object.entries(langs)) {
          // Add to global stats
          languageStats[lang] = (languageStats[lang] || 0) + bytes;
          
          // Add to skill -> repos mapping
          if (!skillRepos[lang]) skillRepos[lang] = [];
          skillRepos[lang].push({
            name: repo.name,
            description: repo.description,
            url: repo.html_url,
            stars: repo.stargazers_count,
            language: repo.language
          });
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch languages for ${repo.name}:`, err.message);
    }
  }
  
  return { languageStats, skillRepos };
}

function categorizeSkills(languageStats) {
  const sortedLangs = Object.entries(languageStats).sort((a, b) => b[1] - a[1]);
  
  const categories = {
    expert: [],
    proficient: [],
    familiar: []
  };
  
  const totalLangs = sortedLangs.length;
  if (totalLangs === 0) return categories;
  
  const expertCount = Math.max(1, Math.ceil(totalLangs * 0.25));
  const proficientCount = Math.max(1, Math.ceil(totalLangs * 0.50));
  
  sortedLangs.forEach((entry, index) => {
    const lang = entry[0];
    if (index < expertCount) {
      categories.expert.push(lang);
    } else if (index < expertCount + proficientCount) {
      categories.proficient.push(lang);
    } else {
      categories.familiar.push(lang);
    }
  });
  
  return categories;
}

function extractTopProjects(repos) {
  const nonForks = repos.filter(repo => !repo.fork);
  
  // Sort by stars descending, then by recency
  nonForks.sort((a, b) => {
    if (b.stargazers_count !== a.stargazers_count) {
      return b.stargazers_count - a.stargazers_count;
    }
    return new Date(b.pushed_at) - new Date(a.pushed_at);
  });
  
  const topRepos = nonForks.slice(0, 6);
  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-orange-500 to-red-500',
    'from-green-500 to-teal-500',
    'from-yellow-500 to-orange-500',
    'from-indigo-500 to-purple-500'
  ];

  return topRepos.map((repo, idx) => ({
    title: repo.name,
    description: repo.description || 'No description provided.',
    tags: [repo.language].filter(Boolean),
    url: repo.html_url,
    demoUrl: repo.homepage || '',
    stars: repo.stargazers_count,
    gradient: gradients[idx % gradients.length]
  }));
}

async function main() {
  try {
    console.log('Fetching repositories...');
    const repos = await fetchAllRepos();
    console.log(`Found ${repos.length} repositories.`);
    
    console.log('Analyzing language usage and skill mapping...');
    const { languageStats, skillRepos } = await processRepos(repos);
    
    const categories = categorizeSkills(languageStats);
    const projects = extractTopProjects(repos);
    
    const dataDir = path.join(__dirname, '..', 'src', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(dataDir, 'skills.json'), JSON.stringify(categories, null, 2));
    fs.writeFileSync(path.join(dataDir, 'skill_repos.json'), JSON.stringify(skillRepos, null, 2));
    fs.writeFileSync(path.join(dataDir, 'projects.json'), JSON.stringify(projects, null, 2));
    
    console.log('Data successfully updated at', dataDir);
    console.log(`Generated skills.json, skill_repos.json, projects.json`);
    
  } catch (err) {
    console.error('An error occurred during update:', err);
    process.exit(1);
  }
}

main();
