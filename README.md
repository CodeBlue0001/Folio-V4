# Folio-v4 — Dipayan's Portfolio

> An immersive full-stack portfolio built with React, Three.js, Framer Motion, and TypeScript.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| 3D / Animation | Three.js (`@react-three/fiber`), Framer Motion |
| Styling | Vanilla CSS (`index.css`) |
| Backend | Node.js + Express (live viewer location API) |
| Build Tool | Vite 7 + React Compiler |

---

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Edit .env and fill in your VITE_GITHUB_USERNAME
```

### 3. Run frontend + backend

Open two terminals:

```bash
# Terminal 1 — Frontend (http://localhost:5173)
npm run dev

# Terminal 2 — Backend API (http://localhost:3001)
npm run server:dev
```

The Vite dev server automatically proxies `/api/*` requests to the Express backend.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production build locally |
| `npm run start` | Start Express server (production) |
| `npm run server:dev` | Start Express server (development) |
| `npm run update-skills` | Fetch GitHub repos and update skills/projects data |

---

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full step-by-step guide.

**Quick summary:**
- **Frontend** → Deploy to [Vercel](https://vercel.com) (the `vercel.json` is already configured)
- **Backend** → Deploy to [Render](https://render.com) (the `render.yaml` is already configured)

---

## Project Structure

```
Folio-v4/
├── src/
│   ├── component/          # Active React components + hooks
│   ├── components/         # Scaffolded shadcn/ui (unused)
│   ├── data/               # skills.json, projects.json (auto-generated)
│   ├── App.tsx
│   └── index.css           # All styles
├── server/
│   ├── index.js            # Express API server
│   └── viewers.json        # Live viewer DB (file-based)
├── scripts/
│   └── update-skills.js    # GitHub data fetcher
├── vercel.json             # Vercel deployment config
├── render.yaml             # Render deployment config
├── Procfile                # Heroku/Railway compatibility
└── .env.example            # Environment variable template
```

---

## React Compiler

This project uses the React Compiler (`babel-plugin-react-compiler`) for automatic memoization.
See [React Compiler docs](https://react.dev/learn/react-compiler) for more info.

