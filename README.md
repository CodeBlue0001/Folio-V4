# Folio-v4 — Next-Gen 3D Interactive Portfolio & Dynamic CMS

<div align="center">

![Portfolio Preview Banner](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-3D%20Globe-black?style=for-the-badge&logo=three.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-GridFS%20Storage-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**An immersive, high-performance 3D developer portfolio and dynamic CMS built with React 19, Three.js, Framer Motion, and MongoDB GridFS.**

[Explore Live Demo](https://dipayan-sardar.vercel.app/) • [Report Bug](https://github.com/CodeBlue0001/Folio-V4/issues) • [Request Feature](https://github.com/CodeBlue0001/Folio-V4/issues)

</div>

---

## 🌟 Key Highlights & Features

### 🌍 Interactive 3D Globe & Visual Experience
- **Interactive WebGL Earth**: Powered by `@react-three/fiber` and `@react-three/drei` with real-time viewer geolocation pins, smooth orbital controls, and atmospheric glow.
- **Dynamic Particle Systems**: Reactive particle backgrounds with customizable density, velocity, and color transitions.
- **Framer Motion Micro-Interactions**: Fluid scroll-triggered entrance animations, hover physics, and page transitions.

### ⚡ Dynamic MongoDB & GridFS Media Engine
- **Full Database Persistence**: Dynamic MongoDB connectivity (`dynamic-db-connect`) storing portfolio content, achievements, live visitor locations, and administrator credentials.
- **GridFS Binary Asset Storage**: Profile photos, project screenshots, and custom media are streamed directly to and from MongoDB GridFS chunks (`images.files` and `images.chunks`), completely eliminating local disk storage limitations on serverless hosts.
- **Resilient Fallback Mode**: Gracefully degrades to local JSON schemas and environment defaults when MongoDB is offline, guaranteeing zero downtime.

### 🛡️ Built-in Admin Dashboard & CMS (`/admin`)
- **Secure Authentication**: Password-protected admin access stored securely in MongoDB with automatic setup and password rotation.
- **Visual Portfolio Editor**: Update hero headlines, about narratives, social handles, and upload updated resumes with live PDF streaming.
- **Granular Layout & Visibility Manager**: Toggle any section, stat badge, or interactive element on or off in real-time without touching a line of code.
- **Dual Light/Dark Theme Customizer**: Real-time CSS color token editor and preset palette switcher with immediate live preview.
- **Live System Health Monitor**: Real-time MongoDB connection state, database latency ping, storage memory usage, and server uptime diagnostics.

### 📊 Live Stats & Integrations
- **Live LeetCode Tracker**: Real-time problem solving statistics, acceptance rate, and contest rankings fetched via Vercel serverless proxy functions.
- **Certifications & Badges**: Showcase verifiable credentials from Google Cloud Skills Boost, Credly, and HackerRank.
- **Live Visitor Map**: Real-time visitor geolocation detection with dynamic globe coordinates.
- **GitHub Sync Script**: Automate skill and project repository updates directly from GitHub's GraphQL/REST APIs.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend Core** | React 19, TypeScript 5.9, Vite 7, React Compiler (`babel-plugin-react-compiler`) |
| **3D & Animation** | Three.js, `@react-three/fiber`, `@react-three/drei`, Framer Motion |
| **Styling & UI** | Vanilla CSS Design Tokens (`index.css`), Tailwind CSS v4, Lucide Icons, FontAwesome |
| **Database & Media** | MongoDB, Mongoose 9, GridFS Bucket Stream Engine |
| **Backend & APIs** | Node.js, Express 5, Vercel Serverless Functions (`/api/*`) |
| **Data Viz & Charts**| Recharts, Embla Carousel |

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB** *(Optional for local dev)*: Local MongoDB instance or free [MongoDB Atlas](https://www.mongodb.com/atlas) URI

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/CodeBlue0001/Folio-V4.git
cd Folio-V4
npm install
```

### 3. Configure Environment Variables
Copy the sample environment file:
```bash
cp .env.example .env
```

Open `.env` and configure your credentials:
```env
# ─── Frontend Config ──────────────────────────────────────────
VITE_GITHUB_USERNAME=your_github_username
VITE_LEETCODE_USERNAME=your_leetcode_username
VITE_GCSB_PROFILE_ID=your_gcsb_profile_id
VITE_CREDLY_USERNAME=your_credly_username
VITE_HACKERRANK_USERNAME=your_hackerrank_username

# ─── Admin Console ───────────────────────────────────────────
VITE_ADMIN_PASSWORD=your_secure_admin_password
ADMIN_PASSWORD=your_secure_admin_password

# ─── Database & GridFS ───────────────────────────────────────
MONGODB_URI=mongodb://127.0.0.1:27017/folio

# ─── GitHub API Token (Optional, avoids rate limits) ─────────
GITHUB_TOKEN=your_personal_access_token
```

### 4. Run Development Server
Run frontend and backend simultaneously with one unified command:
```bash
npm run dev
```

- **Frontend App**: `http://localhost:5173`
- **Admin Dashboard**: `http://localhost:5173/admin`
- **Backend API Server**: `http://localhost:3001`

*(Vite automatically proxies all `/api/*` network requests to `http://localhost:3001` in development mode).*

---

## 📁 Project Structure

```
Folio-v4/
├── api/                           # Vercel Serverless Functions
│   ├── admin-login.js             # Admin authentication endpoint
│   ├── credly.js                  # Credly badge sync proxy
│   ├── gcsb.js                    # Google Cloud Skill Boost proxy
│   ├── images.js                  # GridFS binary image streaming endpoint
│   ├── leetcode.js                # LeetCode GraphQL stats API proxy
│   ├── locations.js               # Visitor location recorder & fetcher
│   ├── portfolio-content.js       # CMS content reader & updater
│   ├── portfolio-content-upload-image.js  # Direct image upload to GridFS
│   └── portfolio-content-upload-resume.js # Resume upload endpoint
├── public/                        # Static public assets & documents
├── scripts/                       # Automation scripts
│   ├── test-admin-api.mjs         # Admin API end-to-end test suite
│   └── update-skills.js           # Automated GitHub repository scraper
├── server/                        # Node.js + Express backend service
│   ├── index.js                   # Express server & API routes
│   ├── schema.js                  # Mongoose models & GridFS upload/download engine
│   ├── portfolio_content.json     # CMS local fallback store
│   └── viewers.json               # Viewer location local fallback store
├── src/
│   ├── admin/                     # Admin Management Suite
│   │   ├── AdminDashboard.tsx     # Central admin control navigation
│   │   ├── AdminLogin.tsx         # Password authentication screen
│   │   ├── AdminPortfolioEditor.tsx # Live CMS text & media editor
│   │   ├── AdminLayoutManager.tsx # Granular section & element visibility
│   │   ├── AdminAchievements.tsx  # Badges & certification manager
│   │   └── AdminSystemHealth.tsx  # MongoDB telemetry & system diagnostics
│   ├── component/                 # Portfolio components (3D Globe, Hero, Projects, etc.)
│   ├── data/                      # Auto-generated & curated data stores
│   ├── App.tsx                    # Root application component & routing
│   ├── main.tsx                   # Client entrypoint
│   └── index.css                  # Design tokens, variables & base styles
├── vercel.json                    # Vercel serverless routing & header rules
├── render.yaml                    # Render.com deployment manifest
├── package.json                   # Project manifest & dependencies
└── vite.config.ts                 # Vite build configuration & API proxy
```

---

## 📜 Available NPM Scripts

| Command | Action |
|---|---|
| `npm run dev` | Runs both Vite dev server and Express API server concurrently |
| `npm run build` | Compiles TypeScript and builds optimized production bundle to `/dist` |
| `npm run preview` | Starts a local web server to preview the production build |
| `npm run server:dev` | Runs the Express backend server standalone |
| `npm run start` | Runs Express backend server in production mode |
| `npm run update-skills` | Refreshes skills and repository data from the GitHub API |
| `npm run lint` | Runs ESLint to check for code quality and syntax errors |

---

## 🚢 Deployment

Detailed instructions can be found in **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

### Quick Deployment Overview:
1. **Frontend & Serverless Functions** → Deploy directly to [Vercel](https://vercel.com).
   - The included `vercel.json` and `api/` directory provide out-of-the-box serverless handlers for stats, location tracking, and CMS endpoints.
2. **Database & Storage** → Connect a free cluster from [MongoDB Atlas](https://www.mongodb.com/atlas).
   - Set `MONGODB_URI` in your Vercel project environment variables.
   - GridFS will automatically manage all image and resume storage in your cloud database.
3. **Optional Standalone Backend** → Deploy `server/index.js` to [Render](https://render.com) using the provided `render.yaml`.

---

## 👤 Author

**Dipayan Sardar**
- **Website**: [dipayan-sardar.vercel.app](https://dipayan-sardar.vercel.app/)
- **GitHub**: [@CodeBlue0001](https://github.com/CodeBlue0001)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
