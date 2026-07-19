require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const app = express()
const PORT = process.env.PORT || 3001

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet())
const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
const frontendUrl = rawFrontendUrl.endsWith('/') ? rawFrontendUrl.slice(0, -1) : rawFrontendUrl

app.use(cors({
  origin: frontendUrl,
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', limiter)

// ── Health ─────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'studysense-api', timestamp: new Date().toISOString() })
})

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/tutor',      require('./routes/tutor'))
app.use('/api/notes',      require('./routes/notes'))
app.use('/api/quiz',       require('./routes/quiz'))
app.use('/api/flashcards', require('./routes/flashcards'))
app.use('/api/planner',    require('./routes/planner'))
app.use('/api/pdf',        require('./routes/pdf'))

// ── 404 ────────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }))

// ── Error handler ──────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error.' })
})

app.listen(PORT, () => {
  console.log(`\n  StudySense API running → http://localhost:${PORT}\n  Health: http://localhost:${PORT}/health\n`)
})
