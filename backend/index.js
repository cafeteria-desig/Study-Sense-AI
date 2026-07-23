require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const { z } = require('zod')

const app = express()
const PORT = process.env.PORT || 3001
const IS_PROD = process.env.NODE_ENV === 'production'

// Normalize multi-slash URLs (e.g. //api/nora -> /api/nora) to prevent CORS redirects
app.use((req, _res, next) => {
  if (req.url && req.url.includes('//')) {
    req.url = req.url.replace(/\/+/g, '/')
  }
  next()
})

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://*.clerk.accounts.dev", "https://clerk.com"],
        connectSrc: ["'self'", "https://*.clerk.com", "wss://*.livekit.cloud", "https://*.livekit.cloud"],
        mediaSrc: ["'self'", "blob:", "data:"],
        imgSrc: ["'self'", "data:", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
)

// ── CORS Configuration ─────────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, server-to-server, curl)
      if (!origin) return callback(null, true)

      // Allow explicitly configured FRONTEND_URL origins
      if (allowedOrigins.includes(origin)) return callback(null, true)

      // Allow any *.amplifyapp.com, *.vercel.app, or local origins
      const isAllowedDomain = /\.(amplifyapp\.com|vercel\.app)$/.test(origin)
      const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?$/.test(origin)

      if (isAllowedDomain || isLocal) {
        return callback(null, true)
      }

      console.warn(`[CORS Blocked] Origin: ${origin}`)
      callback(null, false)
    },
    credentials: true,
  })
)

app.use(express.json({ limit: '5mb' }))

// ── Rate Limiters ──────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
})

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI generation limit reached. Please wait a few minutes before trying again.' },
})

const ttsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Voice synthesis limit reached. Please wait a few minutes before trying again.' },
})

app.use('/api/', globalLimiter)

// ── Auth Middleware ────────────────────────────────────────────────────────────
const gemini = require('./config/gemini')
const groq = require('./config/groq')
const elevenlabs = require('./config/elevenlabs')
const { generateLiveKitToken } = require('./config/livekit')

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (IS_PROD && process.env.STRICT_AUTH === 'true') {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header.' })
    }
    req.user = { id: 'anon-user-id', email: 'student@studysense.app' }
    return next()
  }

  const token = authHeader.split(' ')[1]
  // Extract user identity safely
  req.user = {
    id: 'user-' + token.substring(0, 12),
    email: 'authenticated-student@studysense.app',
  }
  next()
}

// ── Zod Validation Schemas ─────────────────────────────────────────────────────
const tutorSchema = z.object({
  prompt: z.string().max(4000).optional(),
  messages: z
    .array(
      z.object({
        role: z.string(),
        content: z.string().max(4000),
      })
    )
    .max(30)
    .optional(),
})

const notesSchema = z.object({
  topic: z.string().min(1).max(500),
  context: z.string().max(2000).optional(),
})

const quizSchema = z.object({
  topic: z.string().min(1).max(500),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
})

const flashcardsSchema = z.object({
  topic: z.string().min(1).max(500),
})

const pdfSchema = z.object({
  text: z.string().min(1).max(50000),
  fileName: z.string().max(255).optional(),
})

const ttsSchema = z.object({
  text: z.string().min(1).max(3000),
  gender: z.string().optional(),
  voiceId: z.string().optional(),
})

const liveTeacherSchema = z.object({
  prompt: z.string().min(1).max(4000),
  messages: z
    .array(
      z.object({
        role: z.string(),
        content: z.string().max(4000),
      })
    )
    .optional(),
})

// ── Health Check ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'studysense-api',
    environment: IS_PROD ? 'production' : 'development',
    timestamp: new Date().toISOString(),
  })
})

// ── API Routes ─────────────────────────────────────────────────────────────────

// AI Tutor
app.post('/api/tutor', aiLimiter, requireAuth, async (req, res) => {
  const parsed = tutorSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.issues })
  }

  const { prompt, messages } = parsed.data
  try {
    const systemPrompt =
      'You are Nora AI, a warm, exceptionally friendly, and supportive virtual tutor and study companion. Always communicate in a polite, engaging, and encouraging tone. If the user greets you (saying hello, hi, hey, etc.), ALWAYS reply with a complete, warm, and friendly sentence welcoming them and asking what topic or subject they would like to master together today.'
    let responseText = ''

    if (messages && messages.length > 0) {
      const formattedHistory = messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: String(m.content),
      }))
      responseText = await groq.generateChatCompletion(formattedHistory, systemPrompt)
    } else {
      responseText = await groq.generateChatCompletion([{ role: 'user', content: String(prompt || '') }], systemPrompt)
    }

    res.json({ response: responseText || 'No response generated.' })
  } catch (error) {
    console.error('[Groq Tutor Error]:', error.message || error)
    res.status(500).json({ error: 'Failed to process AI Tutor query.' })
  }
})

// Notes Generator
app.post('/api/notes', aiLimiter, requireAuth, async (req, res) => {
  const parsed = notesSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Topic is required and must be under 500 characters.' })
  }

  const { topic, context } = parsed.data
  try {
    const prompt = `Generate highly concise, beautifully structured study notes in Markdown format for the topic: "${topic}".\n${
      context ? `Additional Context/Requirements: ${context}\n` : ''
    }\nInclude:\n1. Key Terms (in bold with brief definitions)\n2. High-Yield Summary Explanations (grouped in logical sections)\n3. Core Summary (condensed bullet points)\n4. 3 Quick Revision Questions at the end.`
    const systemPrompt =
      'You are an elite study notes generator. Format everything beautifully using standard markdown. Be extremely concise, structural, and direct—avoid filler text. Use a clear, authoritative, and elegant tone.'
    const notes = await gemini.generateText(prompt, systemPrompt)
    res.json({ notes })
  } catch (error) {
    console.error('[Notes Error]:', error.message || error)
    res.status(500).json({ error: 'Failed to generate study notes.' })
  }
})

// Quiz Generator
app.post('/api/quiz', aiLimiter, requireAuth, async (req, res) => {
  const parsed = quizSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Topic is required and must be under 500 characters.' })
  }

  const { topic, difficulty = 'medium' } = parsed.data
  try {
    const prompt = `Create a multiple choice quiz about the topic: "${topic}" at a "${difficulty}" difficulty level.\nRespond ONLY with a JSON array containing exactly 5 questions. Do not include markdown code block formatting (like \`\`\`json). The format must be a raw JSON array. Each object in the array must look exactly like this:\n{\n  "question": "The question text here?",\n  "options": [\n    "Option A",\n    "Option B",\n    "Option C",\n    "Option D"\n  ],\n  "answer": "The exact string representing the correct answer, matching one of the option strings exactly",\n  "explanation": "Brief explanation of why this answer is correct."\n}`
    const systemPrompt =
      'You are a quiz generation engine. You output ONLY valid JSON arrays. No chatter, no markdown markers, no extra text.'
    const rawResult = await gemini.generateText(prompt, systemPrompt)

    let cleaned = rawResult.trim()
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/```$/, '').trim()
    }
    const questions = JSON.parse(cleaned)
    res.json({ questions })
  } catch (error) {
    console.error('[Quiz Error]:', error.message || error)
    res.status(500).json({ error: 'Failed to generate quiz.' })
  }
})

// Flashcards Generator
app.post('/api/flashcards', aiLimiter, requireAuth, async (req, res) => {
  const parsed = flashcardsSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Topic is required.' })
  }

  const { topic } = parsed.data
  try {
    const prompt = `Create a set of 5 flashcards for the topic: "${topic}".\nRespond ONLY with a raw JSON array of 5 cards. Keep front and back definitions extremely concise, minimal, and direct. Do not include markdown code blocks. Each object in the array must look exactly like this:\n{\n  "front": "The term or question on the front side",\n  "back": "The definition or answer on the back side"\n}`
    const systemPrompt =
      'You are a flashcard generator. You output ONLY valid JSON arrays. No markdown wrappers, no introductory comments. Keep definitions minimal.'
    const rawResult = await gemini.generateText(prompt, systemPrompt)

    let cleaned = rawResult.trim()
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/```$/, '').trim()
    }
    const cards = JSON.parse(cleaned)
    res.json({ cards })
  } catch (error) {
    console.error('[Flashcards Error]:', error.message || error)
    res.status(500).json({ error: 'Failed to generate flashcards.' })
  }
})

// PDF Summariser
app.post('/api/pdf', aiLimiter, requireAuth, async (req, res) => {
  const parsed = pdfSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Text content is required for summarisation.' })
  }

  const { text, fileName } = parsed.data
  try {
    const prompt = `Provide a premium summarisation of the text from file: "${fileName || 'Document'}".\n\nText Content:\n${text}\n\nProvide the response in beautiful markdown containing:\n1. Executive Summary\n2. Key Bullet Points (main takeaways)\n3. 3 Custom Practice Questions based on this text.`
    const systemPrompt =
      'You are an advanced educational summarizer. Make summaries extremely brief, minimal, and high-yield. Avoid introductory chatter.'
    const summary = await gemini.generateText(prompt, systemPrompt)
    res.json({ summary })
  } catch (error) {
    console.error('[PDF Summariser Error]:', error.message || error)
    res.status(500).json({ error: 'Failed to generate summary.' })
  }
})

// Text-To-Speech (TTS) Voice Synthesis
app.post('/api/tts', ttsLimiter, requireAuth, async (req, res) => {
  const parsed = ttsSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Text content is required for speech audio.' })
  }

  const { text, voiceId, gender } = parsed.data
  try {
    const selectedVoice = gender || voiceId || 'male'
    const audioBuffer = await elevenlabs.generateSpeech(text, selectedVoice)
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=3600',
    })
    res.send(audioBuffer)
  } catch (error) {
    console.error('[TTS Error]:', error.message || error)
    res.status(500).json({ error: 'Failed to synthesize voice audio.' })
  }
})

// Nova Live AI Teacher
const NOVA_SYSTEM_PROMPT = `# IDENTITY
You are Nova, a live AI teacher inside a web application. You are not a search engine or a textbook — you are a warm, human-sounding tutor having a real-time spoken/live conversation with a learner.

# CORE PERSONALITY
- Warm, friendly, and approachable — talk like a smart, encouraging friend.
- Calm and patient, even if the learner is confused or asks twice.
- Default to short, plain-language explanations (2-4 sentences, one idea at a time).`

app.post('/api/live-teacher', aiLimiter, requireAuth, async (req, res) => {
  const parsed = liveTeacherSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Prompt is required for Nova Live Teacher.' })
  }

  const { prompt, messages } = parsed.data
  try {
    const history = messages && messages.length > 0
      ? messages.slice(-8).map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: String(m.content) }))
      : []
    history.push({ role: 'user', content: String(prompt) })
    const responseText = await groq.generateChatCompletion(history, NOVA_SYSTEM_PROMPT)
    res.json({ response: responseText, teacher: 'Nova' })
  } catch (error) {
    console.error('[Nova Error]:', error.message || error)
    res.status(500).json({ error: 'Nova Live Teacher service error.' })
  }
})

// Nora Live AI Study Specialist
const NORA_SYSTEM_PROMPT = `You are Nora, a friendly study buddy who happens to be really good at quizzing and explaining things.
- Keep every reply SHORT — 1 to 3 sentences max.
- Be direct, warm, and natural. No filler chatter.`

app.post('/api/nora', aiLimiter, requireAuth, async (req, res) => {
  const parsed = liveTeacherSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Prompt is required for Nora Study Specialist.' })
  }

  const { prompt, messages } = parsed.data
  try {
    const history = messages && messages.length > 0
      ? messages.slice(-8).map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: String(m.content) }))
      : []
    history.push({ role: 'user', content: String(prompt) })
    const responseText = await groq.generateChatCompletion(history, NORA_SYSTEM_PROMPT)
    res.json({ response: responseText, specialist: 'Nora' })
  } catch (error) {
    console.error('[Nora Error]:', error.message || error)
    res.status(500).json({ error: 'Nora Study Specialist service error.' })
  }
})

// LiveKit Token Endpoint
app.post('/api/livekit/token', requireAuth, async (req, res) => {
  const { roomName, participantName } = req.body || {}
  try {
    const result = await generateLiveKitToken(
      roomName || 'studysense-live-room',
      participantName || req.user?.email || 'Student'
    )
    res.json(result)
  } catch (error) {
    console.error('[LiveKit Error]:', error.message || error)
    res.status(500).json({ error: 'Failed to generate LiveKit token for real-time speech.' })
  }
})

// ── 404 Handler ────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }))

// ── Safe Error Handler ─────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Unhandled Error]:', err.stack || err.message || err)
  res.status(500).json({
    error: IS_PROD ? 'Internal server error.' : err.message || 'Internal error',
  })
})

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n  StudySense Production API running → http://localhost:${PORT}`)
    console.log(`  Health Check: http://localhost:${PORT}/health\n`)
  })
}

module.exports = app
