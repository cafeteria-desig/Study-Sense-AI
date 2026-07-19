const router = require('express').Router()
const OpenAI = require('openai')
const requireAuth = require('../middleware/auth')
const supabaseAdmin = require('../config/supabase')

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
})

const MODEL = 'llama-3.3-70b-versatile'

router.post('/', requireAuth, async (req, res) => {
  const { topic, style = 'comprehensive' } = req.body
  if (!topic) return res.status(400).json({ error: 'topic required.' })

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert educator. Generate well-structured, detailed study notes in markdown format. ' +
            'Use # headings, ## subheadings, **bold** key terms, bullet points, numbered lists, and concrete examples. ' +
            'Make the notes genuinely useful for exam preparation.',
        },
        {
          role: 'user',
          content: `Generate ${style} study notes on: ${topic}`,
        },
      ],
      max_tokens: 2500,
    })

    const noteContent = completion.choices[0].message.content

    // Save to Supabase
    let noteId = null
    try {
      const { data: noteData } = await supabaseAdmin
        .from('notes')
        .insert({
          user_id: req.user.id,
          title: topic,
          topic: topic,
          content: noteContent,
        })
        .select()
        .single()

      if (noteData) {
        noteId = noteData.id
        await supabaseAdmin.from('activity_log').insert({
          user_id: req.user.id,
          tool: 'notes',
          ref_id: noteId,
          label: `Generated notes: ${topic}`,
        })
      }
    } catch (dbErr) {
      console.error('[notes-db-save-error]', dbErr.message)
    }

    res.json({
      id: noteId,
      title: topic,
      content: noteContent,
    })
  } catch (err) {
    console.error('[notes]', err.message)
    res.status(500).json({ error: 'AI request failed. Please try again.' })
  }
})

module.exports = router

