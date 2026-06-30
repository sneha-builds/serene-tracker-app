<div align="center">
<img width="1200" height="475" alt="Serene Tracker Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

<h1 align="center">Serene Tracker — The Last-Minute Life Saver</h1>

<p align="center">
  <strong>A productivity companion for students and professionals who constantly find themselves scrambling at the last minute.</strong>
</p>

<p align="center">
  <a href="https://ai.studio/apps/d8e323f3-190e-4ac0-967e-b0776d045d9d">View on AI Studio</a>
</p>

---

## Problem Statement

**The Last-Minute Life Saver** — Students and professionals constantly struggle with last-minute scrambling, missed deadlines, and inconsistent habits. The chaos of juggling multiple tasks, goals, and responsibilities leads to stress, burnout, and reduced productivity. Existing tools either lack intelligent prioritization, fail to provide meaningful motivation, or overwhelm users with complexity. Serene Tracker was built to solve this — helping users stay ahead of deadlines, build consistent habits, and reduce stress through intelligent task planning, focus tools, and mindful breaks.

---

## Solution Overview

**Serene Tracker** is a full-stack productivity application that combines task management, habit and goal tracking, a Pomodoro focus timer, mindfulness exercises, and AI-powered intelligent planning into a single unified experience. It uses a gamified **balloon altitude metaphor** — each task is a floating balloon whose altitude drops as its deadline approaches, giving users an intuitive visual sense of urgency. The app features an animated AI companion (the "Serene Guide") that responds to user activity, and a high-contrast "Deep Space" dark theme designed for extended focus sessions.

The application runs as a web app, an AI Studio applet, or an Electron desktop application, with real-time cloud sync via Firebase.

---

## Key Features

- **Task Management with Balloon Visualization** — Tasks are represented as balloons whose altitude (0–100) indicates urgency. Typing pushes the lowest balloon higher, gamifying focused work. Completion triggers confetti celebrations.
- **AI-Powered Planning Assistant** — Uses Google Gemini to analyze active tasks, goals, and habits, then returns intelligent priority rankings, scheduling suggestions, and motivational summaries.
- **Habit & Goal Tracking** — Daily habit streaks with completion toggles, and goal tracking with visual progress bars. Synced to Firestore for authenticated users.
- **Pomodoro Focus Timer** — Customizable focus sessions (default 25 min) with break cycles and a credit reward system (5 credits per completed session).
- **Mindful Breathing Exercise** — Guided 4-7-8 breathing technique (inhale 4s, hold 7s, exhale 8s) with visual countdown and phase indicators.
- **Daily Motivation Quotes** — Fetches random motivational quotes with a refresh option and offline fallback.
- **Animated AI Companion (GuideSprite)** — An SVG character with multiple states (hovering, heavy breathing, spinning, focused) that reacts to user activity.
- **Quick Notes (Scratchpad)** — Auto-save to localStorage with debounced persistence and visual save confirmation.
- **Reminder & Notification System** — Deadline reminders at strategic intervals (60 min to 3 days) and AI-schedule notifications via toast overlays and Firebase Cloud Messaging push notifications.
- **Calendar Sync View** — Upcoming scheduled tasks view with sync status indicator.
- **Performance Metrics Dashboard** — Task completion count, login streak tracking, focus metrics, completion rate, and cloud sync status (ONLINE/OFFLINE).
- **Deep Space Dark Theme** — High-contrast cyberpunk-inspired dark mode with cyan glow effects, togglable via sidebar.
- **Guest & Authenticated Modes** — Anonymous guest access with an upgrade prompt after 5 minutes, or full authenticated experience via Firebase Auth (email/password).
- **Electron Desktop Wrapper** — Native desktop app with a main dashboard window and a transparent always-on-top overlay window for immersive effects.

---

## Technologies Used

| Category | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS 4, Framer Motion / Motion 12, Zustand (state management), Lucide React (icons), Canvas Confetti |
| **Backend** | Node.js, Express 4, tsx, esbuild |
| **Database** | Cloud Firestore (NoSQL), Prisma ORM (client) |
| **AI / ML** | Google Gemini AI (Gemini 2.5 Flash via `@google/genai`) |
| **Desktop** | Electron |
| **Build Tools** | Vite, esbuild, TypeScript 5.8 |
| **Styling** | Tailwind CSS 4 (Vite plugin, no PostCSS config needed) |
| **Other** | dotenv, cors |

## Google Technologies Utilized

| Technology | Usage |
|---|---|
| **Firebase Authentication** | Email/password sign-in and anonymous guest mode for user identity management |
| **Cloud Firestore** | Real-time NoSQL database for syncing tasks, habits, goals, and user data across sessions via `onSnapshot` listeners |
| **Firebase Cloud Messaging (FCM)** | Push notifications for deadline reminders and schedule alerts via service worker |
| **Gemini AI (Google GenAI SDK — `@google/genai`)** | AI-powered task planning engine that analyzes user tasks, goals, and habits, returning intelligent priority rankings, scheduling suggestions, and motivational summaries |
| **Google APIs (`googleapis`)** | Included for potential integration with additional Google services (Calendar, Drive, etc.) |
| **AI Studio** | Application deployed and runnable as an AI Studio applet (configured via metadata.json as `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`) |

---

## Getting Started

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables in `.env.local`:
   - `GEMINI_API_KEY` — Your Google Gemini API key
   - Firebase config variables (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`)

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Start the production server:
   ```bash
   npm start
   ```

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Build frontend (Vite) + bundle backend (esbuild) to `dist/` |
| `npm start` | Run production server from `dist/` |
| `npm run clean` | Remove build artifacts |
| `npm run lint` | TypeScript type-checking (`tsc --noEmit`) |
