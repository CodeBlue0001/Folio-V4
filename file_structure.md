# 📂 Folio-v4 — Project File Structure & File Details

> **Dipayan's Portfolio** — A React + TypeScript + Three.js personal portfolio website built with Vite.  
> Features an Iron-Man / JARVIS–inspired aesthetic with holographic 3D globes, arc-reactor animations, cosmic orbit particles, dark/light theme support, and Framer Motion transitions throughout.

---

## 🗂️ Directory Tree

```
Folio-v4/
├── .gitignore
├── README.md
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
│
├── public/
│   └── vite.svg
│
├── dist/                          # Production build output (git-ignored)
│
└── src/
    ├── main.tsx                   # React DOM entry point
    ├── App.tsx                    # Root application component
    ├── App.css                    # Legacy Vite scaffold styles (unused)
    ├── index.css                  # Tailwind CSS base + utilities (~95 KB)
    ├── Attributions.md            # License attributions (shadcn/ui, Unsplash)
    │
    ├── assets/
    │   └── react.svg              # React logo SVG asset
    │
    ├── guidelines/
    │   └── Guidelines.md          # AI/design-system guidelines template
    │
    ├── styles/
    │   └── globals.css            # CSS custom properties (design tokens, dark mode vars)
    │
    ├── component/                 # ★ Custom app components (sections, UI, hooks)
    │   ├── AboutSection.tsx
    │   ├── ArcReactorBackground.tsx
    │   ├── ContactSection.tsx
    │   ├── CosmicOrbit.tsx
    │   ├── HeroSection.tsx
    │   ├── HoloEarth.tsx
    │   ├── HolographicEarthThree.tsx
    │   ├── Loader3D.tsx
    │   ├── Navigation.tsx
    │   ├── ProjectsSection.tsx
    │   ├── ScrollProgress.tsx
    │   ├── SkillSection.tsx
    │   ├── ThemeToggle.tsx
    │   │
    │   ├── hooks/
    │   │   ├── useScrollSpy.tsx
    │   │   └── useTheme.tsx
    │   │
    │   └── ui/
    │       └── card.tsx
    │
    └── components/                # ★ Shared / library-level components
        ├── ArcJarvisLoader.tsx
        ├── ThreeBackground.tsx
        │
        ├── figma/
        │   └── ImageWithFallback.tsx
        │
        └── ui/                    # shadcn/ui component library (48 files)
            ├── accordion.tsx
            ├── alert-dialog.tsx
            ├── alert.tsx
            ├── aspect-ratio.tsx
            ├── avatar.tsx
            ├── badge.tsx
            ├── breadcrumb.tsx
            ├── button.tsx
            ├── calendar.tsx
            ├── card.tsx
            ├── carousel.tsx
            ├── chart.tsx
            ├── checkbox.tsx
            ├── collapsible.tsx
            ├── command.tsx
            ├── context-menu.tsx
            ├── dialog.tsx
            ├── drawer.tsx
            ├── dropdown-menu.tsx
            ├── form.tsx
            ├── hover-card.tsx
            ├── input-otp.tsx
            ├── input.tsx
            ├── label.tsx
            ├── menubar.tsx
            ├── navigation-menu.tsx
            ├── pagination.tsx
            ├── popover.tsx
            ├── progress.tsx
            ├── radio-group.tsx
            ├── resizable.tsx
            ├── scroll-area.tsx
            ├── select.tsx
            ├── separator.tsx
            ├── sheet.tsx
            ├── sidebar.tsx
            ├── skeleton.tsx
            ├── slider.tsx
            ├── sonner.tsx
            ├── switch.tsx
            ├── table.tsx
            ├── tabs.tsx
            ├── textarea.tsx
            ├── toggle-group.tsx
            ├── toggle.tsx
            ├── tooltip.tsx
            ├── use-mobile.ts
            └── utils.ts
```

---

## 📄 Root-Level Configuration Files

### `package.json`
| Field | Value |
|-------|-------|
| **Name** | `react` |
| **Build Tool** | Vite 7.2 |
| **Framework** | React 19.2 + TypeScript 5.9 |
| **Key Dependencies** | `three`, `@react-three/fiber`, `@react-three/drei`, `framer-motion`, `lucide-react`, `radix-ui`, `recharts`, `tailwind-merge`, `class-variance-authority`, `sonner`, `vaul` |
| **Scripts** | `dev` → `vite`, `build` → `tsc -b && vite build`, `lint` → `eslint .`, `preview` → `vite preview` |

### `vite.config.ts`
- Configures the `@vitejs/plugin-react` plugin.
- Enables **React Compiler** via `babel-plugin-react-compiler`.

### `index.html`
- Standard Vite SPA entry: `<div id="root">` + `<script type="module" src="/src/main.tsx">`.
- Title: `react` (could be updated to portfolio name).
- Favicon: `/vite.svg`.

### `tsconfig.json`
- Project references setup pointing to `tsconfig.app.json` (browser code) and `tsconfig.node.json` (Node/Vite config).

### `eslint.config.js`
- Uses flat ESLint config with `typescript-eslint`, `react-hooks`, and `react-refresh` plugins.
- Ignores `dist/` directory.

### `.gitignore`
- Standard Vite/Node ignore patterns (node_modules, dist, etc.).

---

## 📁 `src/` — Source Code Details

---

### `src/main.tsx` — App Entry Point
| Property | Detail |
|----------|--------|
| **Lines** | 7 |
| **Purpose** | Bootstraps the React app |
| **Imports** | `App.tsx`, `index.css` |
| **Behavior** | Calls `createRoot` on `#root` and renders `<App />` (no `<StrictMode>`) |

---

### `src/App.tsx` — Root Application Component ⭐
| Property | Detail |
|----------|--------|
| **Lines** | 237 |
| **Purpose** | Main orchestrator — renders all sections, manages loading state, theme, scroll |
| **Key State** | `loading` (4s timer), `isDark` (from `useTheme`), `activeSection` (from `useScrollSpy`) |
| **Sections Rendered** | `Loader3D` → `ArcReactorBackground` → `CosmicOrbit` → `ThemeToggle` → `Navigation` → `ScrollProgress` → `HeroSection` → `AboutSection` → `ProjectsSection` → `SkillsSection` → `ContactSection` → Footer |
| **Special Effects** | 50 floating particles (blue/purple/cyan), 20 stardust twinkle effects, pulsing radial gradients, scroll-to-top button |
| **Dependencies** | `framer-motion` (AnimatePresence, motion), all section components, hooks |

---

### `src/App.css` — Legacy Vite Styles
| Property | Detail |
|----------|--------|
| **Lines** | 43 |
| **Purpose** | Default Vite scaffold CSS (logo animations, card padding). Appears to be **unused** by the portfolio. |

---

### `src/index.css` — Tailwind CSS
| Property | Detail |
|----------|--------|
| **Lines** | ~95 KB |
| **Purpose** | Full Tailwind CSS output with all utility classes used by the app. Contains base resets, component styles, and utility classes. |

---

### `src/Attributions.md`
- Credits shadcn/ui (MIT license) and Unsplash photos.

---

### `src/styles/globals.css` — Design Tokens
| Property | Detail |
|----------|--------|
| **Lines** | 214 |
| **Purpose** | CSS custom properties for the design system (colors, spacing, charts, sidebar). |
| **Contents** | `:root` light-mode vars, `.dark` dark-mode overrides. Defines `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--chart-1..5`, `--sidebar-*`, `--radius` tokens. Uses modern `oklch()` color space. |

---

### `src/guidelines/Guidelines.md`
- Template file for AI/design guidelines. Contains commented-out examples for design system rules (buttons, typography, layout patterns).

---

## 📁 `src/component/` — Page Section Components

---

### `component/HeroSection.tsx` — Hero / Landing Section
| Property | Detail |
|----------|--------|
| **Lines** | 124 |
| **Export** | `HeroSection` (named) |
| **Props** | `isDark?: boolean` |
| **Features** | Full-screen hero with `ThreeBackground` behind it, animated gradient title "Dipayan's Portfolio", subtitle "Full Stack Developer | Creative Designer | Tech Enthusiast", two CTA buttons ("View Projects", "Get in Touch"), animated chevron scroll indicator |
| **Dependencies** | `framer-motion`, `ThreeBackground`, `lucide-react` (ChevronDown) |
| **Theme Support** | Dual color themes for Three.js background (dark/light), gradient overlays |

---

### `component/AboutSection.tsx` — About Me Section
| Property | Detail |
|----------|--------|
| **Lines** | 273 |
| **Export** | `AboutSection` (named) |
| **Props** | `isDark?: boolean` |
| **Features** | Two-column layout: left = career timeline (2021–2023), right = profile image placeholder + 4 feature cards (Clean Code, Creative Design, Fast Performance, Modern Stack) |
| **Animations** | Floating background particles (8), timeline dot pulsing, card hover (scale + lift), icon spin on hover |
| **Dependencies** | `framer-motion`, `lucide-react` (Code, Palette, Rocket, Zap), custom `Card` component |

---

### `component/ProjectsSection.tsx` — Featured Projects Section
| Property | Detail |
|----------|--------|
| **Lines** | 325 |
| **Export** | `ProjectsSection` (named) |
| **Props** | `isDark?: boolean` |
| **Projects** | 6 projects: E-Commerce Platform, AI Chat App, Dashboard Analytics, Social Media App, Fitness Tracker, Portfolio Generator |
| **Layout** | **Mobile**: collapsible accordion box with FolderOpen icon; **Desktop**: 3-column grid with hover-lift cards |
| **Card Contents** | Gradient-overlay image, title, description (line-clamp), tech tags, GitHub + Live Demo buttons |
| **Dependencies** | `framer-motion` (AnimatePresence), `lucide-react` (ExternalLink, Github, FolderOpen, ChevronDown) |

---

### `component/SkillSection.tsx` — Skills & Expertise Section
| Property | Detail |
|----------|--------|
| **Lines** | 273 |
| **Export** | `SkillsSection` (named) |
| **Props** | `isDark?: boolean` |
| **Categories** | Frontend (React 95%, TS 90%, Next.js 88%, Tailwind 92%, Three.js 85%, Motion 87%), Backend (Node.js 90%, Python 85%, GraphQL 82%, PostgreSQL 88%, MongoDB 86%, Redis 80%), DevOps (Docker 85%, AWS 82%, Git 93%, CI/CD 80%, Linux 84%, K8s 75%), Design (Figma 88%, UI/UX 85%, Adobe XD 80%, Responsive 95%, A11y 87%, SEO 83%) |
| **Layout** | **Mobile**: collapsible accordion; **Desktop**: 2-column grid with animated progress bars |
| **Animations** | Progress bars animate from 0 → level%, shimmer overlay effect |
| **Dependencies** | `framer-motion` (AnimatePresence), `lucide-react` (ChevronDown, Sparkles) |

---

### `component/ContactSection.tsx` — Contact / Get In Touch Section
| Property | Detail |
|----------|--------|
| **Lines** | 274 |
| **Export** | `ContactSection` (named) |
| **Props** | `isDark?: boolean` |
| **Features** | HoloEarth 3D globe, contact form (name, email, message), contact info cards (email, phone, location), social links (GitHub, LinkedIn, Twitter) |
| **Form** | Controlled inputs with `useState`, `handleSubmit` logs to console + resets form |
| **Dependencies** | `framer-motion`, `lucide-react` (Mail, MapPin, Phone, Send, Github, Linkedin, Twitter), `HoloEarth` |

---

### `component/Navigation.tsx` — Floating Navigation Bar
| Property | Detail |
|----------|--------|
| **Lines** | 112 |
| **Export** | `Navigation` (named) |
| **Props** | `activeSection: string`, `scrollToSection: fn`, `isDark?: boolean` |
| **Desktop** | Centered pill-shaped navbar with 5 items (Home, About, Projects, Skills, Contact). Active item gets blue bg. Glassmorphism backdrop-blur. |
| **Mobile** | Hamburger button (top-left) → slide-in vertical menu |
| **Dependencies** | `framer-motion`, `lucide-react` (Menu, X), `useState` |

---

### `component/Loader3D.tsx` — Loading Screen
| Property | Detail |
|----------|--------|
| **Lines** | 70 |
| **Export** | `Loader3D` (named) |
| **Purpose** | Full-screen black loading overlay shown for 4 seconds on initial load |
| **Features** | `ArcJarvisLoader` (JARVIS-style 3D sphere animation), progress bar (0→100% over 4s), "Initializing System..." text, shimmer effect on progress bar |
| **Dependencies** | `framer-motion`, `ArcJarvisLoader`, `useState`, `useEffect` |

---

### `component/ThemeToggle.tsx` — Dark/Light Theme Toggle
| Property | Detail |
|----------|--------|
| **Lines** | 35 |
| **Export** | `ThemeToggle` (named) |
| **Props** | `isDark: boolean`, `toggle: () => void` |
| **UI** | Fixed top-right circular button, glassmorphism backdrop-blur, Sun/Moon icons with 180° rotation animation |
| **Dependencies** | `framer-motion`, `lucide-react` (Moon, Sun) |

---

### `component/ScrollProgress.tsx` — Scroll Progress Bar
| Property | Detail |
|----------|--------|
| **Lines** | 13 |
| **Export** | `ScrollProgress` (named) |
| **UI** | Fixed top-0 1px gradient bar (blue→purple→pink) that scales with `scrollYProgress` |
| **Dependencies** | `framer-motion` (motion, useScroll) |

---

### `component/CosmicOrbit.tsx` — Cosmic Orbit Background Effect
| Property | Detail |
|----------|--------|
| **Lines** | 103 |
| **Export** | `CosmicOrbit` (named) |
| **Props** | `isDark: boolean` |
| **Features** | 3 concentric orbital rings (rotating in alternating directions), 8 orbiting particles with glow effects (blue/purple/cyan), central radial glow. All fixed-position behind content. |
| **Dependencies** | `framer-motion` |

---

### `component/ArcReactorBackground.tsx` — Iron Man Arc Reactor Background
| Property | Detail |
|----------|--------|
| **Lines** | 134 |
| **Export** | `ArcReactorBackground` (named) |
| **Props** | `isDark: boolean` |
| **Features** | Gradient background, animated CSS grid pattern, 5 rotating arc-reactor concentric rings (scaling + pulsing opacity), 20 floating energy particles (blue/cyan/purple), central radial glow, CRT scan-line effect |
| **Dependencies** | `framer-motion` |

---

### `component/HoloEarth.tsx` — Holographic Earth Globe (GeoJSON Version) ⭐
| Property | Detail |
|----------|--------|
| **Lines** | 648 |
| **Export** | `HoloEarth` (named + default) |
| **Props** | `isDark?: boolean` |
| **3D Engine** | `@react-three/fiber` Canvas with raw Three.js |
| **Features** | • Fetches real country outlines from Natural Earth GeoJSON (110m) <br> • Wireframe icosahedron globe base <br> • GeoJSON country borders rendered as THREE.Line on sphere surface <br> • 15 city location markers (London, Tokyo, Sydney, New York, Mumbai, São Paulo, Paris, Moscow, Beijing, Johannesburg, San Francisco, Singapore, Dubai, Buenos Aires, Lagos) <br> • User geolocation marker (green, pulsing) with Kolkata fallback <br> • Geodesic arc connections between nearest-neighbour nodes <br> • 800-particle starfield <br> • Atmospheric glow layers <br> • HUD overlay: "YOU", "LIVE NODES" counter (simulated), "GLOBAL NETWORK" |
| **Sub-components** | `Starfield`, `GlobeWireframe`, `CountryOutlines`, `LocationMarker`, `SurfaceArc`, `SceneSetup`, `RotatingGlobe` |
| **Dependencies** | `@react-three/fiber`, `three` |

---

### `component/HolographicEarthThree.tsx` — Holographic Earth Globe (Particle Cloud Version) ⭐
| Property | Detail |
|----------|--------|
| **Lines** | 590 |
| **Export** | `HolographicEarthThree` (named + default) |
| **Props** | `isDark?: boolean` |
| **Purpose** | Alternative (possibly unused) Earth component using a **point-cloud** approach instead of GeoJSON |
| **Features** | • ~15,000 particles forming continental shapes via bounding-box `isOnLand()` function <br> • Lat/lon grid lines for holographic effect <br> • Animated orbital rings (solid lines + dotted particles, multi-axis tilts) <br> • Through-globe chord lines for network topology visualization <br> • Location markers, surface arcs, atmospheric glow (same as HoloEarth) <br> • Same HUD overlay with live node count |
| **Sub-components** | `StarField`, `EarthParticles`, `LatLonGrid`, `GlobeCore`, `Atmosphere`, `LocationMarker`, `SurfaceArc`, `ChordLine`, `OrbitalRing`, `OrbitalDots`, `RotatingGlobe` |
| **Dependencies** | `@react-three/fiber`, `three`, `framer-motion` |
| **Note** | Not imported by any component currently — may be a backup/alternative to `HoloEarth.tsx` |

---

## 📁 `src/component/hooks/` — Custom React Hooks

---

### `hooks/useScrollSpy.tsx` — Scroll Position Tracker
| Property | Detail |
|----------|--------|
| **Lines** | 38 |
| **Export** | `useScrollSpy` (named) |
| **Params** | `sectionIds: string[]` |
| **Returns** | `{ activeSection: string, scrollToSection: (id: string) => void }` |
| **Logic** | Listens to `window.scroll`, determines which section is in the top 1/3 of viewport, returns active section ID. `scrollToSection` does smooth `scrollIntoView`. |

---

### `hooks/useTheme.tsx` — Dark/Light Theme Manager
| Property | Detail |
|----------|--------|
| **Lines** | 33 |
| **Export** | `useTheme` (named) |
| **Returns** | `{ isDark: boolean, toggle: () => void }` |
| **Logic** | Reads from `localStorage('theme')` or falls back to `prefers-color-scheme`. Toggles `.dark` class on `<html>` and persists preference. |

---

## 📁 `src/component/ui/` — Custom UI Primitives

---

### `ui/card.tsx` — Simple Card Wrapper
| Property | Detail |
|----------|--------|
| **Lines** | 17 |
| **Export** | `Card` (named) |
| **Impl** | `forwardRef` div with `rounded-lg border` + className merge. Used by `AboutSection` for the timeline card. |

---

## 📁 `src/components/` — Shared / Library Components

---

### `components/ArcJarvisLoader.tsx` — JARVIS-Style 3D Loading Animation ⭐
| Property | Detail |
|----------|--------|
| **Lines** | 288 |
| **Export** | `ArcJarvisLoader` (default) |
| **3D Engine** | Raw Three.js (no R3F) — creates its own `Scene`, `Camera`, `WebGLRenderer` |
| **Visuals** | • Outer wireframe sphere (EdgesGeometry) rotating clockwise <br> • Inner white wireframe sphere rotating counter-clockwise <br> • Orange wireframe half-torus ring (Iron Man arc-reactor style) <br> • Random lightning strikes from ring → inner sphere vertices <br> • Vertex color flashing on strike impact (yellow → pulsing HSL glow) |
| **Responsiveness** | Adapts scale factor for mobile (0.6×), tablet (0.8×), desktop (1.0×). Handles window resize. |
| **Cleanup** | Full geometry/material disposal + DOM node removal. |

---

### `components/ThreeBackground.tsx` — Hero Section Three.js Background
| Property | Detail |
|----------|--------|
| **Lines** | 282 |
| **Export** | `ThreeBackground` (named) |
| **Props** | `theme: { background, primary, secondary, tertiary }` |
| **3D Engine** | Raw Three.js (Scene, Camera, Renderer, requestAnimationFrame) |
| **Visuals** | • 8 concentric circles rotating at varying speeds <br> • 24 radial lines rotating slowly <br> • 15 wireframe cubes pulsing and rotating <br> • Background grid plane (100×100) <br> • Central wireframe sphere pulsing <br> • Subtle camera orbit |
| **Theme Reactivity** | Second `useEffect` updates all material colors when `theme` prop changes |
| **Cleanup** | Cancels animation frame, removes renderer DOM element, disposes renderer. |

---

### `components/figma/ImageWithFallback.tsx` — Image Error Fallback
| Property | Detail |
|----------|--------|
| **Lines** | 28 |
| **Export** | `ImageWithFallback` (named) |
| **Purpose** | Wraps `<img>` and shows a base64-encoded placeholder SVG if the image fails to load. |

---

## 📁 `src/components/ui/` — shadcn/ui Component Library

This directory contains **48 files** — the full [shadcn/ui](https://ui.shadcn.com/) component library. These are pre-built, customizable Radix UI–based primitives. Most are **not directly used** by the portfolio sections but available for expansion.

| Component | File | Size | Based On |
|-----------|------|------|----------|
| Accordion | `accordion.tsx` | 2.0 KB | Radix Accordion |
| Alert Dialog | `alert-dialog.tsx` | 3.9 KB | Radix AlertDialog |
| Alert | `alert.tsx` | 1.6 KB | Custom |
| Aspect Ratio | `aspect-ratio.tsx` | 284 B | Radix AspectRatio |
| Avatar | `avatar.tsx` | 1.1 KB | Radix Avatar |
| Badge | `badge.tsx` | 1.6 KB | CVA variants |
| Breadcrumb | `breadcrumb.tsx` | 2.4 KB | Custom |
| Button | `button.tsx` | 2.1 KB | CVA variants |
| Calendar | `calendar.tsx` | 2.9 KB | react-day-picker |
| Card | `card.tsx` | 2.0 KB | Custom |
| Carousel | `carousel.tsx` | 5.6 KB | embla-carousel |
| Chart | `chart.tsx` | 10.1 KB | recharts |
| Checkbox | `checkbox.tsx` | 1.2 KB | Radix Checkbox |
| Collapsible | `collapsible.tsx` | 806 B | Radix Collapsible |
| Command | `command.tsx` | 4.7 KB | cmdk |
| Context Menu | `context-menu.tsx` | 8.3 KB | Radix ContextMenu |
| Dialog | `dialog.tsx` | 3.8 KB | Radix Dialog |
| Drawer | `drawer.tsx` | 4.1 KB | vaul |
| Dropdown Menu | `dropdown-menu.tsx` | 8.3 KB | Radix DropdownMenu |
| Form | `form.tsx` | 3.8 KB | react-hook-form |
| Hover Card | `hover-card.tsx` | 1.5 KB | Radix HoverCard |
| Input OTP | `input-otp.tsx` | 2.3 KB | input-otp |
| Input | `input.tsx` | 963 B | Custom |
| Label | `label.tsx` | 614 B | Radix Label |
| Menubar | `menubar.tsx` | 8.4 KB | Radix Menubar |
| Navigation Menu | `navigation-menu.tsx` | 6.7 KB | Radix NavigationMenu |
| Pagination | `pagination.tsx` | 2.7 KB | Custom |
| Popover | `popover.tsx` | 1.6 KB | Radix Popover |
| Progress | `progress.tsx` | 743 B | Radix Progress |
| Radio Group | `radio-group.tsx` | 1.5 KB | Radix RadioGroup |
| Resizable | `resizable.tsx` | 2.0 KB | react-resizable-panels |
| Scroll Area | `scroll-area.tsx` | 1.6 KB | Radix ScrollArea |
| Select | `select.tsx` | 6.3 KB | Radix Select |
| Separator | `separator.tsx` | 707 B | Radix Separator |
| Sheet | `sheet.tsx` | 4.1 KB | Radix Dialog |
| Sidebar | `sidebar.tsx` | 21.7 KB | Custom (complex) |
| Skeleton | `skeleton.tsx` | 275 B | Custom |
| Slider | `slider.tsx` | 2.0 KB | Radix Slider |
| Sonner | `sonner.tsx` | 576 B | sonner |
| Switch | `switch.tsx` | 1.2 KB | Radix Switch |
| Table | `table.tsx` | 2.5 KB | Custom |
| Tabs | `tabs.tsx` | 1.9 KB | Radix Tabs |
| Textarea | `textarea.tsx` | 767 B | Custom |
| Toggle Group | `toggle-group.tsx` | 1.9 KB | Radix ToggleGroup |
| Toggle | `toggle.tsx` | 1.6 KB | Radix Toggle |
| Tooltip | `tooltip.tsx` | 1.9 KB | Radix Tooltip |

### Utility Files in `components/ui/`

| File | Purpose |
|------|---------|
| `use-mobile.ts` | Hook that returns `true` when viewport < 768px (uses `matchMedia`) |
| `utils.ts` | `cn()` utility — merges Tailwind classes via `clsx` + `tailwind-merge` |

---

## 🏗️ Architecture Overview

```
                    ┌──────────────┐
                    │  index.html  │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   main.tsx   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   App.tsx    │  ← manages loading, theme, scroll, layout
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────────┐
          │                │                    │
    ┌─────▼─────┐   ┌─────▼──────┐    ┌───────▼────────┐
    │ Loader3D  │   │ Background │    │  Page Sections  │
    │           │   │  Effects   │    │                 │
    │ ArcJarvis │   │            │    │ • HeroSection   │
    │ Loader    │   │ • ArcReact │    │ • AboutSection  │
    └───────────┘   │ • CosmicOr │    │ • ProjectsSect  │
                    │ • Particles│    │ • SkillsSection │
                    └────────────┘    │ • ContactSect   │
                                      │   └─ HoloEarth  │
                                      └─────────────────┘
                                              │
                                    ┌─────────┼──────────┐
                                    │         │          │
                              ┌─────▼──┐  ┌───▼───┐  ┌──▼───┐
                              │ Hooks  │  │  UI   │  │Three │
                              │        │  │       │  │ .js  │
                              │useTheme│  │ Card  │  │Backg │
                              │useScrSp│  │shadcn │  │round │
                              └────────┘  └───────┘  └──────┘
```

---

## 📦 Key Dependency Map

| Package | Version | Used By |
|---------|---------|---------|
| `react` / `react-dom` | 19.2.7 | Everything |
| `three` | 0.181.2 | `HoloEarth`, `HolographicEarthThree`, `ArcJarvisLoader`, `ThreeBackground` |
| `@react-three/fiber` | 9.4.0 | `HoloEarth`, `HolographicEarthThree` |
| `@react-three/drei` | 10.7.7 | Available (not directly imported in current code) |
| `framer-motion` | 12.23.24 | All sections, App.tsx, CosmicOrbit, ArcReactorBackground, HolographicEarthThree |
| `lucide-react` | 0.554.0 | Navigation, sections (icons throughout) |
| `radix-ui` | 1.4.3 | shadcn/ui components |
| `tailwind-merge` | 3.6.0 | `cn()` utility |
| `class-variance-authority` | 0.7.1 | shadcn/ui button, badge, toggle variants |
| `recharts` | 3.5.0 | `chart.tsx` component (available, not used in sections) |
| `sonner` | 2.0.7 | Toast notifications (available) |

---

## 🔍 Notes & Observations

1. **Dual component directories**: `src/component/` (custom app code) vs `src/components/` (shared/library). This is an intentional split — custom sections live in `component/`, while shadcn/ui and reusable Three.js components live in `components/`.

2. **Two Earth implementations**: `HoloEarth.tsx` (GeoJSON-based, currently used in ContactSection) and `HolographicEarthThree.tsx` (particle-cloud–based, not imported anywhere). The latter appears to be an unused alternative implementation.

3. **Large shadcn/ui library**: 48 UI components installed but most are unused. Only `Card` from `component/ui/card.tsx` is actively imported. The full library is available for future expansion.

4. **React Compiler enabled**: `babel-plugin-react-compiler` is active in `vite.config.ts`, providing automatic memoization.

5. **No routing**: Single-page application with scroll-based navigation. No `react-router` or equivalent.

6. **Theme system**: Uses a custom `useTheme` hook (localStorage + `prefers-color-scheme`) combined with Tailwind's dark mode classes and manual `isDark` prop drilling to all components.
