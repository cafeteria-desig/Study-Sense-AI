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
  const { topic, count = 5 } = req.body
  if (!topic) return res.status(400).json({ error: 'topic required.' })

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `Generate exactly ${count} multiple choice questions about the given topic.
Return ONLY valid JSON with this exact structure (no markdown, no extra text):
{
  "questions": [
    {
      "question": "Full question text here?",
      "options": ["A) First option", "B) Second option", "C) Third option", "D) Fourth option"],
      "correct": 0,
      "explanation": "Why this is the correct answer."
    }
  ]
}
The "correct" field is the 0-based index of the correct option.`,
        },
        {
          role: 'user',
          content: `Topic: ${topic}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2500,
    })

    const parsed = JSON.parse(completion.choices[0].message.content)

    // Save to Supabase
    let quizId = null
    try {
      const { data: quizData } = await supabaseAdmin
        .from('quizzes')
        .insert({
          user_id: req.user.id,
          title: topic,
          topic: topic,
          questions: parsed.questions,
          score: null,
        })
        .select()
        .single()

      if (quizData) {
        quizId = quizData.id
        await supabaseAdmin.from('activity_log').insert({
          user_id: req.user.id,
          tool: 'quiz',
          ref_id: quizId,
          label: `Generated quiz: ${topic}`,
        })
      }
    } catch (dbErr) {
      console.error('[quiz-db-save-error]', dbErr.message)
    }

    res.json({
      id: quizId,
      title: topic,
      questions: parsed.questions,
    })
  } catch (err) {
    console.error('[quiz]', err.message)
    res.status(500).json({ error: 'AI request failed. Please try again.' })
  }
})

module.exports = router

