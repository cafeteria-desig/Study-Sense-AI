# StudySense AI — Comprehensive File Architecture & Documentation

This document provides a complete technical map of every non-markdown code, configuration, style, asset, and environment file in the **StudySense AI** web application codebase, explaining the role and importance of each file.

---

## Table of Contents
1. [Backend Services & AI Engine (`/backend`)](#1-backend-services--ai-engine-backend)
2. [Frontend Core & Configuration (`/frontend`)](#2-frontend-core--configuration-frontend)
3. [State, Auth & External Integrations (`/frontend/src`)](#3-state-auth--external-integrations-frontend-src)
4. [Application Pages (`/frontend/src/pages`)](#4-application-pages-frontend-src-pages)
5. [Landing Page & Shader Components (`/frontend/src/components/landing`)](#5-landing-page--shader-components-frontend-src-components-landing)
6. [Reusable UI & Voice Components (`/frontend/src/components/ui`)](#6-reusable-ui--voice-components-frontend-src-components-ui)
7. [Assets & Tooling Config](#7-assets--tooling-config)

---

## 1. Backend Services & AI Engine (`/backend`)

The backend is an Express Node.js application responsible for orchestrating LLM APIs, WebSockets, ElevenLabs text-to-speech generation, LiveKit real-time voice rooms, and PDF content extraction.

* **[`backend/index.js`](file:///d:/New%20folder/IBM%20Project/backend/index.js)**  
  **Importance**: The primary server entry point. Sets up CORS, JSON middleware, HTTP server, WebSockets, multer file uploading, and API endpoints (`/api/ai/generate-notes`, `/api/ai/generate-quiz`, `/api/ai/speech-token`, `/api/voice/livekit-token`, etc.).

* **[`backend/config/groq.js`](file:///d:/New%20folder/IBM%20Project/backend/config/groq.js)**  
  **Importance**: Configures the Groq SDK client using ultra-low-latency Llama 3 models for fast AI response generation.

* **[`backend/config/gemini.js`](file:///d:/New%20folder/IBM%20Project/backend/config/gemini.js)**  
  **Importance**: Integrates Google Gemini 1.5 Pro / Flash models for processing large PDF context documents and high-capacity reasoning tasks.

* **[`backend/config/elevenlabs.js`](file:///d:/New%20folder/IBM%20Project/backend/config/elevenlabs.js)**  
  **Importance**: Handles ElevenLabs Text-to-Speech (TTS) API calls, streaming natural human voice audio responses to Nora AI voice interactions.

* **[`backend/config/livekit.js`](file:///d:/New%20folder/IBM%20Project/backend/config/livekit.js)**  
  **Importance**: Generates WebRTC access tokens for LiveKit real-time speech rooms to enable low-latency, bidirectional audio streaming.

* **[`backend/package.json`](file:///d:/New%20folder/IBM%20Project/backend/package.json)**  
  **Importance**: Defines backend Node.js dependencies (`express`, `@google/generative-ai`, `groq-sdk`, `elevenlabs`, `livekit-server-sdk`, `pdf-parse`, `cors`, `dotenv`).

* **[`backend/package-lock.json`](file:///d:/New%20folder/IBM%20Project/backend/package-lock.json)**  
  **Importance**: Lockfile pinning exact dependency versions for reproducible backend builds.

* **[`backend/.env`](file:///d:/New%20folder/IBM%20Project/backend/.env)**  
  **Importance**: Environment configuration file holding secret API keys (`GROQ_API_KEY`, `GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `PORT`).

* **[`backend/.env.example`](file:///d:/New%20folder/IBM%20Project/backend/.env.example)**  
  **Importance**: Environment template listing mandatory environment variables without committing secret keys to git.

---

## 2. Frontend Core & Configuration (`/frontend`)

The frontend is a Vite + React + TypeScript web application built with Tailwind CSS, WebGL shaders, Lucide Icons, and Framer Motion animations.

* **[`frontend/index.html`](file:///d:/New%20folder/IBM%20Project/frontend/index.html)**  
  **Importance**: Main HTML document template. Sets site metadata, viewport scaling, favicons, font preloads, and mounts the React root `<div id="root">`.

* **[`frontend/vite.config.ts`](file:///d:/New%20folder/IBM%20Project/frontend/vite.config.ts)**  
  **Importance**: Vite build tool configuration. Configures `@tailwindcss/vite` plugin, path aliases (`@` mapping to `./src`), and dev server options.

* **[`frontend/package.json`](file:///d:/New%20folder/IBM%20Project/frontend/package.json)**  
  **Importance**: Defines frontend NPM dependencies (`react`, `react-router-dom`, `tailwindcss`, `lucide-react`, `framer-motion`, `@fontsource/instrument-sans`, `@fontsource/jetbrains-mono`, `livekit-client`, `firebase`).

* **[`frontend/package-lock.json`](file:///d:/New%20folder/IBM%20Project/frontend/package-lock.json)**  
  **Importance**: Frontend dependency lockfile ensuring identical installs across development and production environments.

* **[`frontend/tsconfig.json`](file:///d:/New%20folder/IBM%20Project/frontend/tsconfig.json)**  
  **Importance**: Root TypeScript configuration file referencing application and node tsconfig files.

* **[`frontend/tsconfig.app.json`](file:///d:/New%20folder/IBM%20Project/frontend/tsconfig.app.json)**  
  **Importance**: TypeScript configuration for application code (`src/`), enforcing strict mode, React JSX transformation, and module resolution.

* **[`frontend/tsconfig.node.json`](file:///d:/New%20folder/IBM%20Project/frontend/tsconfig.node.json)**  
  **Importance**: TypeScript configuration for Vite build configuration files running in Node.js environment.

* **[`frontend/.oxlintrc.json`](file:///d:/New%20folder/IBM%20Project/frontend/.oxlintrc.json)**  
  **Importance**: Oxlint code linter configuration enforcing code quality rules and syntax standards.

* **[`frontend/.env`](file:///d:/New%20folder/IBM%20Project/frontend/.env)**  
  **Importance**: Frontend environment file containing public variables (`VITE_API_URL`, Firebase client keys).

* **[`frontend/.env.example`](file:///d:/New%20folder/IBM%20Project/frontend/.env.example)**  
  **Importance**: Example frontend environment variables template for new developer setups.

* **[`frontend/.gitignore`](file:///d:/New%20folder/IBM%20Project/frontend/.gitignore)**  
  **Importance**: Ignores `node_modules`, `dist/`, build artifacts, and secret `.env` files from version control.

---

## 3. State, Auth & External Integrations (`/frontend/src`)

* **[`frontend/src/main.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/main.tsx)**  
  **Importance**: Application bootstrap script. Mounts the `<App />` component into the DOM tree with `<React.StrictMode>`.

* **[`frontend/src/App.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/App.tsx)**  
  **Importance**: Root application Router component. Manages URL routing (`/`, `/login`, `/register`, `/dashboard`, `/notes`, `/quiz`, `/pdf`, `/tutor`, `/planner`, `/settings`, `/font-test`), wrapped in `<AuthProvider>`.

* **[`frontend/src/App.css`](file:///d:/New%20folder/IBM%20Project/frontend/src/App.css)**  
  **Importance**: Application-level styles and custom animation rules.

* **[`frontend/src/index.css`](file:///d:/New%20folder/IBM%20Project/frontend/src/index.css)**  
  **Importance**: Global design token stylesheet. Configures `@import "tailwindcss"`, Google Fonts (DotGothic16, Silkscreen, Instrument Serif, Inter, JetBrains Mono), `@keyframes` gradient animations, and font utility classes (`.font-serif-italic`, `.font-offbit`, `.font-silkscreen`).

* **[`frontend/src/lib/utils.ts`](file:///d:/New%20folder/IBM%20Project/frontend/src/lib/utils.ts)**  
  **Importance**: Classname utility helper (`cn()`) combining `clsx` and `tailwind-merge` for safe conditional Tailwind CSS class merging.

* **[`frontend/src/contexts/AuthContext.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/contexts/AuthContext.tsx)**  
  **Importance**: React Context provider managing user authentication state, login, registration, logout, and session persistence via Firebase / backend API.

* **[`frontend/src/services/firebaseClient.ts`](file:///d:/New%20folder/IBM%20Project/frontend/src/services/firebaseClient.ts)**  
  **Importance**: Initializes Firebase SDK client for user authentication services and database connectivity.

---

## 4. Application Pages (`/frontend/src/pages`)

* **[`frontend/src/pages/LandingPage.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/pages/LandingPage.tsx)**  
  **Importance**: Main marketing homepage composing `SplashScreen`, `SpectrumShaderCanvas`, `Navigation`, `HeroSection`, `FeaturesSection`, `HowItWorksSection`, `CtaSection`, and `FooterSection`.

* **[`frontend/src/pages/DashboardPage.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/pages/DashboardPage.tsx)**  
  **Importance**: Student command center dashboard featuring tool launcher cards (Nora AI, Notes, Quizzes, Font Lab), user greeting, and the Next-Gen AI Pipeline (Coming Soon) feature block.

* **[`frontend/src/pages/NotesPage.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/pages/NotesPage.tsx)**  
  **Importance**: Notes & Summariser tool page. Converts study topics or uploaded files into markdown notes, summaries, audio voice synthesis, and downloadable study kits.

* **[`frontend/src/pages/QuizPage.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/pages/QuizPage.tsx)**  
  **Importance**: Interactive Quizzes & Flashcards page. Generates multiple-choice quiz questions with instant feedback and 3D double-sided flip flashcards.

* **[`frontend/src/pages/PdfPage.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/pages/PdfPage.tsx)**  
  **Importance**: PDF Lab workspace. Enables PDF file upload, text extraction, chapter analysis, and AI Q&A interaction.

* **[`frontend/src/pages/TutorPage.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/pages/TutorPage.tsx)**  
  **Importance**: Nora AI Oral Drills workspace. Runs live voice and text interactive active-recall study sessions with Nora.

* **[`frontend/src/pages/PlannerPage.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/pages/PlannerPage.tsx)**  
  **Importance**: AI Study Planner tool. Creates automated study schedules, task roadmaps, and topic review milestones.

* **[`frontend/src/pages/LoginPage.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/pages/LoginPage.tsx)**  
  **Importance**: User authentication sign-in page with dark glass styling and error handling.

* **[`frontend/src/pages/RegisterPage.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/pages/RegisterPage.tsx)**  
  **Importance**: New user account creation page with password validation and instant login redirect.

* **[`frontend/src/pages/SettingsPage.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/pages/SettingsPage.tsx)**  
  **Importance**: User profile settings page for updating preferences, voice engines, and API status diagnostic checks.

* **[`frontend/src/pages/FontTestPage.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/pages/FontTestPage.tsx)**  
  **Importance**: OffBit Font Lab testing playground showcasing bitmap typography specimens, scaling sliders, scramble animations, and dot-matrix poster designs.

* **[`frontend/src/pages/FlashcardsPage.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/pages/FlashcardsPage.tsx)**  
  **Importance**: Dedicated route wrapper for standalone flashcard review sessions.

---

## 5. Landing Page & Shader Components (`/frontend/src/components/landing`)

* **[`frontend/src/components/landing/SpectrumShaderCanvas.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/components/landing/SpectrumShaderCanvas.tsx)**  
  **Importance**: High-performance WebGL fragment shader canvas rendering ~130 vertical frequency spectrum bars driven by 4-octave FBM noise, blue-to-amber prism gradient, scroll progress tracking uniform (`uScroll`), and device pixel ratio capping.

* **[`frontend/src/components/landing/ShaderAnimation.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/components/landing/ShaderAnimation.tsx)**  
  **Importance**: Concentric ring mosaic wave WebGL shader background component for alternative visual modes.

* **[`frontend/src/components/landing/SplashScreen.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/components/landing/SplashScreen.tsx)**  
  **Importance**: Full-screen intro splash overlay featuring matrix text scrambler animation and smooth fade-out into the homepage.

* **[`frontend/src/components/landing/TextScramble.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/components/landing/TextScramble.tsx)**  
  **Importance**: Reusable character scrambling text effect component simulating matrix code decoding.

* **[`frontend/src/components/landing/Navigation.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/components/landing/Navigation.tsx)**  
  **Importance**: Sticky glass header navbar with StudySense logo, mint `AI` pill, centered navigation links (*Features*, *How it Works*), Sign In link, and Get Started CTA button.

* **[`frontend/src/components/landing/HeroSection.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/components/landing/HeroSection.tsx)**  
  **Importance**: Hero section containing eyebrow pill, Instrument Serif italic title with dynamic 2-second word switcher (*learn*, *revise*, *master*, *ace*), animated mint underline accent, description copy, and dual CTAs.

* **[`frontend/src/components/landing/FeaturesSection.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/components/landing/FeaturesSection.tsx)**  
  **Importance**: Core capabilities grid presenting glass cards for Structured Notes, Adaptive Quizzes, Flashcard Decks, and Oral Drills.

* **[`frontend/src/components/landing/HowItWorksSection.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/components/landing/HowItWorksSection.tsx)**  
  **Importance**: 4-step process sequence (*Upload*, *Nora Reads*, *Kit Builds*, *Practice*) with large Instrument Serif numerals and hairline dividers.

* **[`frontend/src/components/landing/CtaSection.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/components/landing/CtaSection.tsx)**  
  **Importance**: Bottom call-to-action band with Instrument Serif title (*"Start learning smarter today"*) and action buttons.

* **[`frontend/src/components/landing/FooterSection.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/components/landing/FooterSection.tsx)**  
  **Importance**: Minimalist footer component containing StudySense branding, Product navigation links, and copyright bar sitting over the WebGL shader.

* **[`frontend/src/components/landing/ProofStrip.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/components/landing/ProofStrip.tsx)**  
  **Importance**: Stat counter strip component for metrics presentation.

* **[`frontend/src/components/landing/PullQuoteSection.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/components/landing/PullQuoteSection.tsx)**  
  **Importance**: Student testimonial pull-quote presentation component.

* **[`frontend/src/components/landing/PricingSection.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/components/landing/PricingSection.tsx)**  
  **Importance**: Free vs Pro pricing grid card component.

* **[`frontend/src/components/landing/FaqSection.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/components/landing/FaqSection.tsx)**  
  **Importance**: Expandable Q&A accordion section component.

---

## 6. Reusable UI & Voice Components (`/frontend/src/components/ui`)

* **[`frontend/src/components/ui/Eyebrow.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/components/ui/Eyebrow.tsx)**  
  **Importance**: All-caps pill badge component featuring a 6px mint green dot with soft pulsing animation.

* **[`frontend/src/components/ui/animated-gradient-text.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/components/ui/animated-gradient-text.tsx)**  
  **Importance**: Animated gradient border and shimmering text badge component.

* **[`frontend/src/components/ui/button.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/components/ui/button.tsx)**  
  **Importance**: Primary design system Button component supporting variants (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`) and sizes.

* **[`frontend/src/components/ui/CosmicShaderBackground.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/components/ui/CosmicShaderBackground.tsx)**  
  **Importance**: Alternative liquid cosmic WebGL shader background component.

* **[`frontend/src/components/ui/DownloadDropdown.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/components/ui/DownloadDropdown.tsx)**  
  **Importance**: Download export menu allowing users to export notes and study kits as PDF, Markdown, TXT, or JSON.

* **[`frontend/src/components/ui/MarkdownViewer.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/components/ui/MarkdownViewer.tsx)**  
  **Importance**: Rich markdown rendering component supporting code syntax blocks, tables, lists, and formatted AI output.

* **[`frontend/src/components/ui/NoraSpeechRoom.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/components/ui/NoraSpeechRoom.tsx)**  
  **Importance**: Comprehensive voice conversation room component for real-time speech interaction with Nora AI.

* **[`frontend/src/components/ui/LiveKitSpeechRoom.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/components/ui/LiveKitSpeechRoom.tsx)**  
  **Importance**: WebRTC speech room component using LiveKit SDK for low-latency bidirectional voice streams.

* **[`frontend/src/components/ui/VoiceControls.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/components/ui/VoiceControls.tsx)**  
  **Importance**: Audio playback bar component for playing synthesized AI voice notes with play/pause, scrubbers, and rate controls.

* **[`frontend/src/components/ui/VoiceSelector.tsx`](file:///d:/New%20folder/IBM%20Project/frontend/src/components/ui/VoiceSelector.tsx)**  
  **Importance**: Voice selection dropdown component for choosing ElevenLabs AI voice personas (Rachel, Adam, Domi, Bella, etc.).

---

## 7. Assets & Tooling Config

* **[`frontend/src/assets/hero.png`](file:///d:/New%20folder/IBM%20Project/frontend/src/assets/hero.png)**  
  **Importance**: Static image asset used for hero previews and fallback displays.

* **[`frontend/src/assets/react.svg`](file:///d:/New%20folder/IBM%20Project/frontend/src/assets/react.svg)**  
  **Importance**: Vector SVG logo asset for React framework branding.

* **[`frontend/src/assets/vite.svg`](file:///d:/New%20folder/IBM%20Project/frontend/src/assets/vite.svg)**  
  **Importance**: Vector SVG logo asset for Vite build tool branding.

* **[`.gitignore`](file:///d:/New%20folder/IBM%20Project/.gitignore)**  
  **Importance**: Workspace-level git ignore rules excluding node modules, logs, build outputs, and environment files.

* **[`.vscode/launch.json`](file:///d:/New%20folder/IBM%20Project/.vscode/launch.json)**  
  **Importance**: VS Code debugging configuration for launching and debugging Node.js backend processes and Chrome frontend instances.

---
*Created for StudySense AI Architecture Reference.*
