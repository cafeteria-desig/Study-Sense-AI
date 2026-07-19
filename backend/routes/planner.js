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
  const { subject, examDate, dailyHours = 2 } = req.body
  if (!subject || !examDate) {
    return res.status(400).json({ error: 'subject and examDate required.' })
  }

  const today = new Date().toISOString().split('T')[0]

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `Create a day-by-day study plan from today (${today}) until the exam date.
Return ONLY valid JSON (no markdown):
{
  "plan": [
    { "date": "YYYY-MM-DD", "topic": "Specific topic to study", "duration_mins": 90, "done": false }
  ]
}
Space topics logically, include revision days near the exam. Keep duration_mins between 30 and ${dailyHours * 60}.`,
        },
        {
          role: 'user',
          content: `Subject: ${subject}\nExam Date: ${examDate}\nDaily study hours: ${dailyHours}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2500,
    })

    const parsed = JSON.parse(completion.choices[0].message.content)

    // Save to Supabase
    let planId = null
    try {
      const { data: planData } = await supabaseAdmin
        .from('study_plans')
        .insert({
          user_id: req.user.id,
          title: `${subject} Study Plan`,
          subject: subject,
          exam_date: examDate,
          schedule: parsed.plan,
        })
        .select()
        .single()

      if (planData) {
        planId = planData.id
        await supabaseAdmin.from('activity_log').insert({
          user_id: req.user.id,
          tool: 'planner',
          ref_id: planId,
          label: `Created study plan: ${subject}`,
        })
      }
    } catch (dbErr) {
      console.error('[planner-db-save-error]', dbErr.message)
    }

    res.json({
      id: planId,
      title: `${subject} Study Plan`,
      examDate,
      schedule: parsed.plan,
    })
  } catch (err) {
    console.error('[planner]', err.message)
    res.status(500).json({ error: 'AI request failed. Please try again.' })
  }
})

module.exports = router

