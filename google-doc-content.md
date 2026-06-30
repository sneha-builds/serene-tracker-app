# Serene Tracker — Google Doc Content

## Problem Statement
**The Last-Minute Life Saver** — A productivity companion for students and professionals who constantly find themselves scrambling at the last minute. Serene Tracker helps users stay ahead of deadlines, build consistent habits, and reduce stress through intelligent task planning, focus tools, and mindful breaks.

---

## Solution Overview

Serene Tracker is a full-stack productivity application that combines task management, habit and goal tracking, a Pomodoro focus timer, mindfulness exercises, and AI-powered intelligent planning into a single unified experience. It uses a gamified **balloon altitude metaphor** — each task is a floating balloon whose altitude drops as its deadline approaches, giving users an intuitive visual sense of urgency. The app features an animated AI companion (the "Serene Guide") that responds to user activity, and a high-contrast "Deep Space" dark theme designed for extended focus sessions.

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
- **Quick Notes** — Scratchpad with auto-save to localStorage and debounced persistence.
- **Reminder & Notification System** — Deadline reminders at strategic intervals (60 min to 3 days) and AI-schedule notifications via toast overlays and Firebase Cloud Messaging push notifications.
- **Calendar Sync View** — Upcoming scheduled tasks view with sync status indicator.
- **Performance Metrics Dashboard** — Task completion count, login streak tracking, focus metrics, completion rate, and cloud sync status.
- **Deep Space Dark Theme** — High-contrast cyberpunk-inspired dark mode with cyan glow effects, togglable via sidebar.
- **Guest & Authenticated Modes** — Anonymous guest access with upgrade prompt, or full authenticated experience via Firebase Auth.
- **Electron Desktop Wrapper** — Native desktop app with a main dashboard window and a transparent always-on-top overlay window.

---

## Technologies Used

| Category | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS 4, Framer Motion / Motion 12, Zustand (state management), Lucide React (icons), Canvas Confetti |
| **Backend** | Node.js, Express 4, tsx, esbuild |
| **Database** | Cloud Firestore (NoSQL), Prisma ORM (client) |
| **AI / ML** | Google Gemini AI (Gemini 2.5 Flash via `@google/genai`) |
| **Desktop** | Electron |
| **Build Tools** | Vite, esbuild, TypeScript |
| **Styling** | Tailwind CSS 4 (no PostCSS config needed) |
| **Other** | dotenv, cors |

---

## Google Technologies Utilized

| Technology | Usage |
|---|---|
| **Firebase Authentication** | Email/password sign-in and anonymous guest mode for user identity management |
| **Cloud Firestore** | Real-time NoSQL database for syncing tasks, habits, goals, and user data across sessions |
| **Firebase Cloud Messaging (FCM)** | Push notifications for deadline reminders and schedule alerts via service worker |
| **Gemini AI (Google GenAI SDK — `@google/genai`)** | AI-powered task planning and scheduling engine that analyzes user tasks and returns intelligent prioritization |
| **Google APIs (`googleapis`)** | Included for potential integration with additional Google services |
| **AI Studio** | Application deployed and runnable as an AI Studio applet (via metadata configuration) |
