# Deployment Guide — Folio-v4

This portfolio has **two parts** that deploy separately:

| Part | What | Recommended Host |
|---|---|---|
| **Frontend** | Vite + React SPA | Vercel (free) |
| **Backend** | Express API (viewer locations) | Render (free) |

---

## Prerequisites

1. A GitHub account with this repo pushed
2. A [Vercel](https://vercel.com) account
3. A [Render](https://render.com) account (for the backend)

---

## 1. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Where Used | Required |
|---|---|---|
| `VITE_GITHUB_USERNAME` | Frontend — GitHub Activity widget | ✅ Yes |
| `GITHUB_TOKEN` | `npm run update-skills` script only | Optional |

---

## 2. Deploy the Backend (Express API) → Render

The Express server in `server/index.js` handles the live viewer location map.

### Steps
1. Go to [render.com/new](https://render.com/new) → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `folio-v4-api`
   - **Root Directory**: *(leave blank — uses repo root)*
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
4. Add environment variable: `NODE_ENV=production`
5. Deploy

> ⚠️ **Important**: The viewer data is stored in `server/viewers.json`.
> This file resets every time Render redeploys (free-tier has no persistent disk).
> Seed data (London, Tokyo, New York) will be re-created automatically.
> For persistent storage, migrate to a free DB like MongoDB Atlas or Supabase.

### After deploying, note your API URL:
```
https://folio-v4-api.onrender.com
```

---

## 3. Update Frontend API URL (for production)

In `src/component/hooks/useViewerLocation.ts`, the API URL is hardcoded to `localhost:3001`.

For production, update it to your Render URL:

```ts
// Before (development)
const API_BASE = "http://localhost:3001/api/locations";

// After (production) — replace with your Render URL
const API_BASE = import.meta.env.PROD
  ? "https://folio-v4-api.onrender.com/api/locations"
  : "http://localhost:3001/api/locations";
```

---

## 4. Deploy the Frontend → Vercel

### Steps
1. Go to [vercel.com/new](https://vercel.com/new) → Import your GitHub repo
2. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
3. Add environment variables:
   - `VITE_GITHUB_USERNAME` = your GitHub username
4. Deploy

The `vercel.json` file in the repo root handles SPA routing automatically.

---

## 5. Local Development

Run both parts in separate terminals:

```bash
# Terminal 1 — Frontend (port 5173)
npm run dev

# Terminal 2 — Backend (port 3001)
npm run server:dev
```

The Vite dev server proxies `/api/*` to `localhost:3001` automatically (configured in `vite.config.ts`).

---

## 6. Update GitHub Skills Data

Run this to refresh `src/data/skills.json`, `skill_repos.json`, and `projects.json` from your GitHub:

```bash
npm run update-skills
```

Requires `VITE_GITHUB_USERNAME` in `.env`. Add `GITHUB_TOKEN` to avoid the 60 req/hr rate limit.

---

## File Structure Reference

```
Folio-v4/
├── src/                    # Frontend source (Vite bundles this)
│   ├── component/          # Active React components
│   │   ├── hooks/          # Custom React hooks
│   │   └── ui/             # Minimal UI primitives
│   ├── components/         # Scaffolded shadcn/ui (unused — safe to keep)
│   ├── data/               # JSON data (skills, projects)
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── index.css           # All styles
├── server/                 # Express backend
│   ├── index.js            # API server
│   └── viewers.json        # Live viewer DB (file-based)
├── scripts/
│   └── update-skills.js    # GitHub data fetcher
├── public/                 # Static assets (copied as-is to dist)
├── dist/                   # Build output (gitignored)
├── vercel.json             # Vercel SPA routing + headers
├── render.yaml             # Render backend service definition
├── Procfile                # Heroku/Railway compatibility
├── .env.example            # Environment variable template
└── vite.config.ts          # Vite build + dev proxy config
```

