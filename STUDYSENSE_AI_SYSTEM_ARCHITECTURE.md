# StudySense AI — Complete System Architecture & Developer Context

This document is a comprehensive technical reference for AI assistants, developers, and autonomous coding agents working on the **StudySense AI** codebase.

---

## 1. Executive Summary & Core Mission

**StudySense AI** is a state-of-the-art, dark-themed, AI-powered learning companion platform designed to help students master academic topics, generate high-yield study notes, take interactive quizzes, practice with 3D flashcards, and engage in real-time spoken voice tutoring with **Nora AI** and **Nova Live Teacher**.

- **Frontend Repository URL**: `https://github.com/cafeteria-desig/Study-Sense-AI`
- **Live Frontend (AWS Amplify)**: `https://main.d1ds9e3cmvb7f7.amplifyapp.com`
- **Live Backend API (Vercel)**: `https://study-sense-api.vercel.app`

---

## 2. Technology Stack

### Frontend Stack (`/frontend`)
- **Core Framework**: React 19 (TypeScript) + Vite 8
- **Styling**: Tailwind CSS v4 + Custom Vanilla CSS (Design Tokens, Glassmorphism, Neon Accents)
- **Animation**: Framer Motion 12 + Custom Kinetic Warp Grid Canvas + OGL (3D Shader Canvases)
- **Authentication**: `@clerk/clerk-react` + `@clerk/themes`
- **Database & Sync**: Firebase 12 (Realtime Database + Firestore) via `firebaseClient.ts`
- **Voice & Audio**: Web Speech API (SpeechRecognition + SpeechSynthesis) + LiveKit WebRTC (`livekit-client`, `@livekit/components-react`)
- **UI & Icons**: Lucide React + Radix UI primitives (`@radix-ui/react-avatar`, `@radix-ui/react-dialog`, etc.)

### Backend Stack (`/backend`)
- **Runtime**: Node.js + Express 5 (CommonJS)
- **AI Providers**:
  - **Groq SDK** (`llama-3.3-70b-versatile` / `llama3-70b-8192`): Ultra-fast conversational AI for Nora AI Specialist, AI Tutor, and Nova Teacher.
  - **Google Gemini API** (`gemini-2.5-flash` / `gemini-1.5-flash`): High-yield Markdown notes, JSON quiz generation, flashcard decks, and PDF summarization.
  - **ElevenLabs API**: Human-like Text-To-Speech (TTS) audio synthesis (Adam - Male, Bella - Female).
  - **LiveKit Server SDK**: WebRTC token generation for real-time speech rooms.
- **Security & Middleware**:
  - `@clerk/express` auth verification
  - `cors` with dynamic origin validation (supporting `*.amplifyapp.com`, `*.vercel.app`, `localhost`)
  - `helmet` security headers
  - `express-rate-limit` (AI limiter + TTS limiter)
  - `zod` input payload validation

---

## 3. Directory & File Structure

```text
IBM Project/
├── package.json                   # Root fail-safe build script for monorepo CI/CD
├── amplify.yml                    # AWS Amplify build config (appRoot: frontend)
├── PROJECT_FILE_ARCHITECTURE.md    # Architecture documentation
├── STUDYSENSE_AI_SYSTEM_ARCHITECTURE.md # (This File) System Context for AI Agents
├── backend/
│   ├── index.js                   # Main Express server & API endpoints
│   ├── vercel.json                # Vercel deployment & multi-slash route rewrite config
│   ├── package.json               # Backend dependencies
│   ├── config/
│   │   ├── groq.js                # Groq API client helper
│   │   ├── gemini.js              # Gemini API client helper
│   │   ├── elevenlabs.js          # ElevenLabs TTS audio streaming helper
│   │   └── livekit.js             # LiveKit token generator helper
│   └── .env.example               # Environment variable templates
└── frontend/
    ├── index.html                 # Entry HTML with /favicon.png & /logo.png links
    ├── vite.config.ts             # Vite configuration with tailwindcss & ssl plugins
    ├── vercel.json                # Frontend SPA rewrites & security headers
    ├── amplify.yml                # Subdirectory Amplify fallback config
    ├── package.json               # Frontend dependencies
    ├── public/
    │   ├── logo.png               # Main brand logo (glowing emblem)
    │   ├── logo-icon.png          # Standalone square emblem for navbar header
    │   └── favicon.png           # Browser upper tab icon
    └── src/
        ├── main.tsx               # Application root mount point
        ├── App.tsx                # React Router v7 routes & AuthProvider wrapper
        ├── index.css              # Global styles, fonts (@fontsource), glassmorphism
        ├── components/
        │   ├── landing/           # Landing page sections (Hero, Navigation, Features, Pricing, etc.)
        │   └── ui/                # Reusable UI components
        │       ├── VoiceSelector.tsx     # Male/Female voice selector (exclusive to Nora AI)
        │       ├── VoiceControls.tsx    # Read Aloud (TTS) & Speech-to-Text (STT) button
        │       ├── NoraSpeechRoom.tsx   # Interactive 3D Voice Orb & live voice call with Nora
        │       ├── LiveKitSpeechRoom.tsx# Real-time WebRTC room via LiveKit
        │       ├── GlowingSearchDock.tsx# Bottom expanding search/chat input dock
        │       ├── KineticGrid.tsx      # Interactive background canvas
        │       ├── MarkdownViewer.tsx   # Formatted markdown text renderer
        │       ├── DownloadDropdown.tsx # Export response as MD/PDF/TXT
        │       └── message-scroller.tsx # Auto-scrolling chat message feed
        ├── contexts/
        │   └── AuthContext.tsx    # Auth context combining Clerk & Firebase session state
        ├── services/
        │   └── firebaseClient.ts  # Firebase Realtime Database & Firestore sync helpers
        └── pages/
            ├── LandingPage.tsx    # Marketing & feature showcase page (/)
            ├── DashboardPage.tsx  # Central hub (/dashboard)
            ├── PdfPage.tsx        # Nora AI Specialist page (/pdf)
            ├── NotesPage.tsx      # Notes & Summariser page (/notes)
            ├── QuizPage.tsx       # Quizzes & Flashcards page (/quiz)
            ├── TutorPage.tsx      # AI Tutor chat page (/tutor)
            ├── PlannerPage.tsx    # Nova Live AI Teacher page (/planner)
            ├── LoginPage.tsx      # Clerk SignIn wrapper (/login)
            └── RegisterPage.tsx   # Clerk SignUp wrapper (/register)
```

---

## 4. Frontend Application Routes & Key Components

### 1. Landing Page (`/` $\rightarrow$ `LandingPage.tsx`)
- **Navbar ([Navigation.tsx](file:///c:/Projects/IBM%20Project/frontend/src/components/landing/Navigation.tsx))**: Header displaying `logo-icon.png` image, **StudySense** title, **AI** badge, feature links, and Clerk Auth button (`<UserButton />` or `Get Started`).
- **Hero Section ([HeroSection.tsx](file:///c:/Projects/IBM%20Project/frontend/src/components/landing/HeroSection.tsx))**: Dynamic headline with `TextScramble`, spectrum canvas animation, CTA buttons, and proof badges.
- **Interactive Features**: Features grid, How It Works timeline, Pricing table, Pull Quote section, FAQ accordion, and Footer.

### 2. Dashboard Hub (`/dashboard` $\rightarrow$ `DashboardPage.tsx`)
- **Header**: Glass navbar with `logo-icon.png`, StudySense title, AI badge, and Clerk profile control.
- **Active Tools**:
  - **Nora AI Specialist** (`/pdf`): Primary AI study companion with live voice and text chat.
  - **Notes & Summariser** (`/notes`): Structured markdown study notes and document text summaries.
  - **Quizzes & Flashcards** (`/quiz`): Auto-generated MCQs and 3D flip card decks.
- **Upcoming Roadmap**: Audio Podcaster (2-person AI audio drills) & Live Study Squads (collaborative rooms).

### 3. Nora AI Specialist (`/pdf` $\rightarrow$ `PdfPage.tsx`)
- **Header Bar**: Displays `Dashboard` link, `NORA AI` pulsing status badge, `Chat` / `Voice` mode toggle, and the **[VoiceSelector](file:///c:/Projects/IBM%20Project/frontend/src/components/ui/VoiceSelector.tsx)** (`Male` / `Female`).
- **Chat Mode**: Message feed rendered via `MessageScroller` and `MarkdownViewer`. Each assistant reply features:
  - `VoiceControls`: Read aloud in selected male (Adam) or female (Bella) voice.
  - `DownloadDropdown`: Download notes as Markdown/PDF/Text.
  - Copy to clipboard button.
- **Voice Mode**: Switches to **[NoraSpeechRoom](file:///c:/Projects/IBM%20Project/frontend/src/components/ui/NoraSpeechRoom.tsx)** featuring an audio-reactive 3D orb (`VoicePoweredOrb`), real-time speech recognition, and live spoken responses.

### 4. Notes & Summariser (`/notes` $\rightarrow$ `NotesPage.tsx`)
- Allows users to enter a topic or upload `.txt`/`.md`/text content.
- Calls POST `/api/notes` or `/api/pdf` to generate high-yield markdown study notes.
- Features one-click copy, reset, and document download options.

### 5. Quizzes & Flashcards (`/quiz` $\rightarrow$ `QuizPage.tsx`)
- **Quiz Tab**: Generates 5 multiple-choice questions via POST `/api/quiz`. Displays instant answer validation, green/red score feedback, and detailed explanations.
- **Flashcards Tab**: Generates 5 double-sided cards via POST `/api/flashcards`. Features 3D CSS perspective card flips with `card-inner` and `card-flipped` transitions.
- **Firebase Sync**: Automatically syncs quiz results and card decks to Firebase Realtime Database & Firestore via `syncUserData`.

---

## 5. Backend API Specification (`backend/index.js`)

All POST endpoints require JSON payloads and accept an `Authorization: Bearer <token>` header.

### Endpoints

| Endpoint | Method | Provider | Description |
| :--- | :--- | :--- | :--- |
| `/health` | `GET` | System | Health check returning status, service name, and timestamp. |
| `/api/tutor` | `POST` | Groq | Conversational AI tutor endpoint with chat message history. |
| `/api/nora` | `POST` | Groq | Nora AI Specialist endpoint returning short, encouraging study replies. |
| `/api/live-teacher` | `POST` | Groq | Nova Live AI Teacher endpoint. |
| `/api/notes` | `POST` | Gemini | Generates structured Markdown study notes (Key Terms, Summary, Revision Questions). |
| `/api/quiz` | `POST` | Gemini | Generates a 5-question MCQ quiz as a raw JSON array. |
| `/api/flashcards` | `POST` | Gemini | Generates a 5-card front/back flashcard deck as a raw JSON array. |
| `/api/pdf` | `POST` | Gemini | Generates executive summaries & bullet points for uploaded documents. |
| `/api/tts` | `POST` | ElevenLabs | Converts text to MP3 audio stream using selected gender voice (`male` or `female`). |
| `/api/livekit/token` | `POST` | LiveKit | Generates WebRTC room tokens for real-time speech rooms. |

---

## 6. Voice Architecture & Rules

1. **VoiceSelector Scope**:
   - The `VoiceSelector` (Male/Female voice toggle) is **exclusively present on Nora AI Specialist** (`/pdf` and `NoraSpeechRoom.tsx`).
   - It stores the preference in `localStorage.getItem('studysense_voice_gender')` (`'male'` | `'female'`).
   - It fires a `studysense_voice_change` custom event for instant UI sync.

2. **Text-To-Speech (TTS) Pipeline**:
   - When a user clicks "Read Aloud", `VoiceControls.tsx` sends POST `/api/tts` with the text and selected gender.
   - If ElevenLabs API succeeds, it streams MP3 audio directly.
   - If offline or on API limit, it gracefully falls back to browser native `window.speechSynthesis`.

3. **URL Sanitization**:
   - All frontend fetch calls sanitize `VITE_API_URL` to strip trailing slashes:
     ```typescript
     const rawApiUrl = (import.meta.env.VITE_API_URL as string) || ''
     const apiUrl = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl
     ```

---

## 7. Deployment & Infrastructure Setup

### AWS Amplify (Frontend)
- **Build Spec**: Configured in root `amplify.yml` with `appRoot: frontend`:
  ```yaml
  version: 1
  applications:
    - appRoot: frontend
      frontend:
        phases:
          preBuild:
            commands:
              - npm ci
          build:
            commands:
              - npm run build
        artifacts:
          baseDirectory: dist
          files:
            - '**/*'
        cache:
          paths:
            - node_modules/**/*
  ```
- **Required Environment Variables**:
  - `VITE_API_URL`: `https://study-sense-api.vercel.app` (NO trailing slash)
  - `VITE_CLERK_PUBLISHABLE_KEY`: `pk_live_...`

### Vercel (Backend)
- **Deployment Config**: Configured in `backend/vercel.json`:
  ```json
  {
    "version": 2,
    "cleanUrls": false,
    "trailingSlash": false,
    "builds": [{ "src": "index.js", "use": "@vercel/node" }],
    "routes": [{ "src": "/+(.*)", "dest": "index.js" }]
  }
  ```
- **CORS Rule**: Express middleware in `backend/index.js` automatically approves requests from `*.amplifyapp.com`, `*.vercel.app`, and `localhost`, returning HTTP 200/204 preflight responses without 308 redirects.

---

## 8. Guidelines for AI Agents Working on This Repository

1. **Preserve Design System**: Always adhere to the dark monochrome aesthetic (`#08080a` background, `#F4F2EC` text, `#A6A49C` subtle text, glassmorphic borders `border-white/10` or `border-white/15`).
2. **Mobile Responsiveness**: Always include `shrink-0`, `max-w-full`, and flexible padding (`px-3 sm:px-6`) on headers and control bars so elements never overflow off-screen.
3. **VoiceSelector Integrity**: Keep `VoiceSelector` exclusively on Nora AI Specialist (`/pdf`). Do not re-add it to Notes or Quiz pages.
4. **URL Safety**: Always strip trailing slashes from `import.meta.env.VITE_API_URL` to avoid double-slash CORS preflight redirect errors (`//api/...`).
5. **Local Verification**: Always test builds using `npm run build` in `frontend/` before pushing commits to GitHub.
