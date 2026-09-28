# QUIZ//ARENA — Real-Time Multiplayer Quiz Game

QUIZ//ARENA is a high-octane, competitive real-time multiplayer quiz game designed for 2–4 players. Combatants assemble in private arenas using 6-character room codes, choose from 5 curated universes (**Animes**, **Popular Series**, **Popular Movies**, **Chemistry**, and **Physics**), select their franchise or topic, and battle across 10 progressive difficulty tiers.

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

---

## Features

- **Real-Time 2–4 Player Multiplayer**: Private rooms with 6-character codes, dynamic question counts (2p = 10 questions, 3p = 12 questions, 4p = 15 questions).
- **Progressive Difficulty Tiers**: 10 distinct levels per topic, ranging from **Level 01 (Casual)** to **Level 10 (Nightmare)**.
- **Zero Emojis**: Clean visual aesthetics using modern vector icons powered by [Lucide](https://lucide.dev).
- **Dark Mode by Default**: Sleek charcoal & crimson aesthetic with one-click Light Mode toggle and persistent preferences.
- **Server-Authoritative Anti-Cheat**: Client never receives correct answers prior to submission. Scoring combines base points (+1,000 XP) and response-speed bonuses.
- **Simple Authentication**: Username & Password authentication with avatar customization. No email verification required.
- **Settings & Account Management**: Edit username, change password, customize avatars, toggle synthesized Web Audio effects, and permanently delete accounts.
- **Lobby Simulator**: Built-in "Add Rival Bot" option to test multiplayer gameplay on a single device without extra tabs.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Audio**: Native Web Audio API Synthesizer (zero external audio file dependencies)
- **Database / Backend**: Supabase (PostgreSQL, RLS, Stored Functions)

---

## Local Development

### 1. Clone Repository

```bash
git clone https://github.com/collinstheegod376/quiz.git
cd quiz
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Populate `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_DEFAULT_THEME=dark
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port specified in terminal output).

---

## Deployment Guide

### Option 1: Deploy to Vercel (Recommended)

Vercel is the native platform for Next.js and provides zero-config deployments.

1. Push your code to your GitHub repository:
   ```bash
   git push origin main
   ```
2. Go to [Vercel](https://vercel.com) and log in with your GitHub account.
3. Click **"Add New..."** -> **"Project"**.
4. Import your repository: `collinstheegod376/quiz`.
5. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_DEFAULT_THEME` (`dark`)
6. Click **Deploy**. Vercel will build the production bundle and assign a public URL (e.g., `https://quiz-arena.vercel.app`).

---

### Option 2: Deploy to Netlify

1. Log in to [Netlify](https://www.netlify.com).
2. Click **"Add new site"** -> **"Import an existing project"** and select GitHub.
3. Choose the repository `collinstheegod376/quiz`.
4. Netlify will auto-detect Next.js:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. Under **Site configuration** -> **Environment variables**, input your Supabase credentials.
6. Click **Deploy site**.

---

### Option 3: Deploy to a VPS or Docker (Ubuntu/Debian)

To run in a self-hosted environment using PM2 or Docker:

```bash
# 1. Build production bundle
npm run build

# 2. Install PM2 globally
npm install -g pm2

# 3. Start Next.js with PM2
pm2 start npm --name "quiz-arena" -- start

# 4. Save PM2 state for system restarts
pm2 save
pm2 startup
```

---

## Supabase Database Setup

To enable Supabase for real-time multiplayer:

1. Create a free project at [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Execute the migration scripts in order from the `supabase/migrations/` directory:
   - `supabase/migrations/01_schema.sql` (Creates tables, relations, and indexes)
   - `supabase/migrations/02_rls.sql` (Enables Row Level Security and creates secure views)
   - `supabase/migrations/03_functions.sql` (Configures atomic stored procedures for starts and scoring)
4. Copy your project URL and keys from **Settings** -> **API** into `.env.local` or your deployment platform environment variables.

---

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with Auth & Theme providers
│   │   ├── page.tsx           # Dynamic view orchestrator
│   │   ├── not-found.tsx      # Custom 404 page
│   │   └── globals.css        # Base theme tokens & animations
│   ├── components/
│   │   ├── layout/            # Navbar, MobileNav
│   │   ├── modals/            # AuthModal, SettingsModal, GlobalLeaderboardModal
│   │   ├── screens/           # Landing, Category, Topic, Difficulty, Lobby, Question, Reveal, Podium
│   │   └── ui/                # Button, Badge, Skeleton, EmptyState
│   ├── context/
│   │   ├── AuthContext.tsx    # User auth, credentials, stats tracking
│   │   ├── GameContext.tsx    # State machine, room lobby, scoring, cross-tab sync
│   │   └── ThemeContext.tsx   # Dark/Light mode manager
│   ├── data/                  # Categories, topics, questions catalog
│   ├── lib/                   # Sound synthesizer, utils, Supabase client
│   └── types/                 # TypeScript interfaces
├── supabase/
│   └── migrations/            # Complete PostgreSQL SQL schemas & functions
├── .env.example               # Environment variables template
├── .env.local                 # Local environment config
└── README.md                  # Documentation and deployment guide
```

---

## License

MIT License. Built for competitive real-time quiz battles.
