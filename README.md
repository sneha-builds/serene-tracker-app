<div align="center">
<img width="1200" height="475" alt="Serene Tracker Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

<h1 align="center">Serene Tracker — The Last-Minute Life Saver</h1>

<p align="center">
  <strong>A productivity companion for students and professionals who constantly find themselves scrambling at the last minute.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwindcss" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/Gemini_AI-8E75B2?style=flat&logo=googlegemini" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Electron-47848F?style=flat&logo=electron" alt="Electron" />
  <img src="https://img.shields.io/badge/Express-000000?style=flat&logo=express" alt="Express" />
</p>

---

## Key Features

- **AI-Powered Planning Assistant** — Uses Google Gemini to analyze active tasks, goals, and habits, then returns intelligent priority rankings, scheduling suggestions, and motivational summaries.
- **Habit & Goal Tracking** — Daily habit streaks with completion toggles, and goal tracking with visual progress bars. Synced to Firestore for authenticated users.
- **Pomodoro Focus Timer** — Customizable focus sessions (default 25 min) with break cycles and a credit reward system (5 credits per completed session).
- **Mindful Breathing Exercise** — Guided 4-7-8 breathing technique (inhale 4s, hold 7s, exhale 8s) with visual countdown and phase indicators.
- **Daily Motivation Quotes** — Fetches random motivational quotes with a refresh option and offline fallback.
- **Quick Notes (Scratchpad)** — Auto-save to localStorage with debounced persistence and visual save confirmation.
- **Reminder & Notification System** — Deadline reminders at strategic intervals (60 min to 3 days) and AI-schedule notifications via toast overlays and Firebase Cloud Messaging push notifications.
- **Calendar Sync View** — Upcoming scheduled tasks view with sync status indicator.
- **Performance Metrics Dashboard** — Task completion count, login streak tracking, focus metrics, completion rate, and cloud sync status (ONLINE/OFFLINE).
- **Deep Space Dark Theme** — High-contrast cyberpunk-inspired dark mode with cyan glow effects, togglable via sidebar.
- **Guest & Authenticated Modes** — Anonymous guest access with an upgrade prompt after 5 minutes, or full authenticated experience via Firebase Auth (email/password).
- **Electron Desktop Wrapper** — Native desktop app with a main dashboard window and a transparent always-on-top overlay window for immersive effects.

---

## Tech Stack

| Category | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS 4, Framer Motion / Motion 12, Zustand (state management), Lucide React (icons), Canvas Confetti |
| **Backend** | Node.js, Express 4, tsx, esbuild |
| **Database** | Cloud Firestore (NoSQL), Prisma ORM (client) |
| **AI / ML** | Google Gemini AI (Gemini 2.5 Flash via `@google/genai`) |
| **Desktop** | Electron |
| **Build Tools** | Vite, esbuild, TypeScript 5.8 |
| **Styling** | Tailwind CSS 4 (Vite plugin, no PostCSS config needed) |
| **State Management** | Zustand with `persist` middleware (localStorage) |
| **Other** | dotenv, cors |

---

## Google Technologies Utilized

| Technology | Usage |
|---|---|
| **Firebase Authentication** | Email/password sign-in and anonymous guest mode for user identity management. `onAuthStateChanged` listener drives the entire auth flow. |
| **Cloud Firestore** | Real-time NoSQL database for syncing tasks, habits, goals, and user data across sessions via `onSnapshot` listeners. Data is scoped per user with security rules enforcing `request.auth.uid == user_id`. |
| **Firebase Cloud Messaging (FCM)** | Push notifications for deadline reminders and schedule alerts via service worker (`public/firebase-messaging-sw.js`). |
| **Gemini AI (`@google/genai`)** | AI-powered task planning engine that analyzes user tasks, goals, and habits, returning intelligent priority rankings, scheduling suggestions, and motivational summaries. Uses Gemini 2.5 Flash. |
| **Google APIs (`googleapis`)** | Included for potential integration with additional Google services (Calendar, Drive, etc.). |
| **AI Studio** | Application deployed and runnable as an AI Studio applet. Configured via `metadata.json` with capability `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`. |

---

## Architecture

The application follows a **client-server architecture** with a React SPA frontend and an Express.js backend.

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │   React   │  │  Zustand  │  │   Firebase SDK   │   │
│  │   SPA     │◄─┤  Store   │◄─┤  (Auth, Firestore,│   │
│  │           │  │ (State)  │  │    Messaging)     │   │
│  └──────────┘  └──────────┘  └────────┬─────────┘   │
│        │                               │              │
│        ▼                               ▼              │
│  ┌──────────────────────────────────────────────┐    │
│  │          Express Backend (server.ts)          │    │
│  │  ┌────────────────────────────────────────┐   │    │
│  │  │  POST /api/ai/plan → Gemini AI →       │   │    │
│  │  │  Returns priority/schedule/rationale   │   │    │
│  │  └────────────────────────────────────────┘   │    │
│  └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Data Flow

1. **Guest users** — All data lives in Zustand's in-memory state (partially persisted to localStorage for theme preferences).
2. **Authenticated users** — Data is synced bidirectionally with Cloud Firestore via real-time `onSnapshot` listeners. Writes are optimistic (update Zustand first, then Firestore, with rollback on error).
3. **AI Planning Flow** — Frontend collects active tasks, habits, and goals → sends to backend `/api/ai/plan` → backend calls Gemini 2.5 Flash → returns priorities, scheduled times, and rationales → written to Firestore.

### Auth Flow

- User opens app → immediately signed in as anonymous guest
- Guest mode allows full usage with local-only storage
- After 5 minutes of guest usage, an upgrade prompt appears
- On sign-up/sign-in, data transitions to Firestore-backed real-time sync
- `onAuthStateChanged` listener handles all auth state transitions

---

## Firestore Data Model

### Collections

#### `users`
| Field | Type | Description |
|---|---|---|
| `email` | string | User's email address |
| `loginStreak` | number | Consecutive days logged in |
| `createdAt` | timestamp | Account creation date |

#### `tasks`
| Field | Type | Description |
|---|---|---|
| `user_id` | string | Firebase UID (owner) |
| `title` | string | Task name |
| `description` | string | Task details |
| `deadline_adjusted` | ISO datetime | Due date/time |
| `status` | `ACTIVE \| COMPLETED \| EXPIRED` | Current state |
| `altitude` | number (0–100) | Urgency indicator (lower = more urgent) |
| `priority` | `CRITICAL \| HIGH \| NORMAL` | Priority level |
| `ai_scheduled_time` | ISO datetime | AI-recommended time |
| `ai_rationale` | string | AI's reasoning |

#### `habits`
| Field | Type | Description |
|---|---|---|
| `user_id` | string | Firebase UID (owner) |
| `title` | string | Habit name |
| `frequency` | `DAILY` | Repetition interval |
| `streak` | number | Current streak count |
| `last_completed` | ISO datetime | Last completion date |

#### `goals`
| Field | Type | Description |
|---|---|---|
| `user_id` | string | Firebase UID (owner) |
| `title` | string | Goal name |
| `progress` | number (0–100) | Completion percentage |

### Security Rules

Each collection enforces that `request.auth.uid` matches the `user_id` field on documents. Users can only read/write their own data.

---

## API Documentation

### `POST /api/ai/plan`

Generates AI-powered task prioritization and scheduling using Google Gemini.

**Request Body:**
```json
{
  "tasks": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "deadline_adjusted": "ISO datetime",
      "status": "ACTIVE | COMPLETED | EXPIRED",
      "altitude": 0,
      "priority": "CRITICAL | HIGH | NORMAL"
    }
  ],
  "habits": [
    {
      "title": "string",
      "streak": 0,
      "last_completed": "ISO datetime"
    }
  ],
  "goals": [
    {
      "title": "string",
      "progress": 0
    }
  ]
}
```

**Response:**
```json
{
  "priorities": [
    {
      "taskId": "string",
      "priority": "HIGH | MEDIUM | LOW",
      "rationale": "string"
    }
  ],
  "schedule": [
    {
      "taskId": "string",
      "suggestedTime": "ISO datetime",
      "reason": "string"
    }
  ],
  "summary": "Motivational message from AI"
}
```

**Error Response:** `500 Internal Server Error` with error message.

---

## Getting Started

**Prerequisites:** Node.js

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd serene-tracker-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set environment variables** in `.env.local`:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

6. **Start the production server:**
   ```bash
   npm start
   ```

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with HMR (Vite middleware + Express) |
| `npm run build` | Build frontend (Vite) + bundle backend (esbuild) to `dist/` |
| `npm start` | Run production server from `dist/` |
| `npm run clean` | Remove all build artifacts |
| `npm run lint` | TypeScript type-checking (`tsc --noEmit`) |

---

## Project Structure

```
serene-tracker-app/
├── index.html                    # SPA entry point
├── server.ts                     # Express server (Vite dev middleware / static prod)
├── vite.config.ts                # Vite config (React + Tailwind plugins)
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
├── metadata.json                 # AI Studio app metadata
├── firebase-applet-config.json   # Firebase config template
├── firebase-blueprint.json       # Firestore security blueprint
├── firestore.rules               # Firestore security rules
├── .env.local                    # Environment variables (not committed)
│
├── src/                          # Frontend source
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Root component (layout, auth, routing)
│   ├── index.css                 # Tailwind imports + Deep Space theme
│   ├── lib/
│   │   └── firebase.ts           # Firebase init (app, auth, db, messaging)
│   ├── store/
│   │   └── useStore.ts           # Zustand store (persisted to localStorage)
│   ├── hooks/
│   │   └── useFocusTracking.ts   # Keystroke tracking, balloon raising
│   └── components/
│       ├── AuthOverlay.tsx       # Sign-in/Sign-up modal
│       ├── BreathingExercise.tsx # Guided 4-7-8 breathing
│       ├── DailyQuote.tsx        # Motivational quote fetcher
│       ├── GoalHabitTracker.tsx  # Habits & goals CRUD
│       ├── GuideSprite.tsx       # Animated AI companion SVG
│       ├── MockCalendar.tsx      # Upcoming schedule view
│       ├── PomodoroTimer.tsx     # Focus timer with rewards
│       ├── QuickNotes.tsx        # Scratchpad auto-save
│       ├── ReminderOverlay.tsx   # Deadline toast notifications
│       └── TaskBoard.tsx         # Task list with AI Planner button
│
├── backend/                      # Backend API
│   └── src/
│       ├── index.ts              # API router (/api/ai)
│       └── controllers/
│           └── ai.ts             # POST /api/ai/plan handler
│
├── electron/                     # Desktop wrapper
│   ├── main.ts                   # Electron main process (2 windows, IPC)
│   └── preload.ts                # Context bridge (keystroke, altitude)
│
├── public/
│   └── firebase-messaging-sw.js  # FCM service worker
│
└── assets/
    └── .aistudio/
        └── .gitignore
```
