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
  const { text, fileName } = req.body
  if (!text) return res.status(400).json({ error: 'text content required.' })

  const truncated = text.slice(0, 12000)

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `Analyse the provided document text. Return ONLY valid JSON (no markdown wrappers):
{
  "summary": "A well-structured markdown summary with key points, main arguments, and important details",
  "qa_pairs": [
    { "question": "A meaningful question about the content", "answer": "A clear, complete answer" }
  ]
}
Generate at least 6 Q&A pairs that cover the most important content from the document.`,
        },
        {
          role: 'user',
          content: `Document: ${fileName || 'Uploaded document'}\n\nContent:\n${truncated}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2500,
    })

    const parsed = JSON.parse(completion.choices[0].message.content)

    // Save to Supabase
    let summaryId = null
    try {
      const { data: summaryData } = await supabaseAdmin
        .from('pdf_summaries')
        .insert({
          user_id: req.user.id,
          file_name: fileName || 'document',
          summary: parsed.summary,
          qa_pairs: parsed.qa_pairs,
        })
        .select()
        .single()

      if (summaryData) {
        summaryId = summaryData.id
        await supabaseAdmin.from('activity_log').insert({
          user_id: req.user.id,
          tool: 'pdf',
          ref_id: summaryId,
          label: `PDF Summary: ${fileName || 'document'}`,
        })
      }
    } catch (dbErr) {
      console.error('[pdf-db-save-error]', dbErr.message)
    }

    res.json({
      id: summaryId,
      fileName: fileName || 'document',
      summary: parsed.summary,
      qa_pairs: parsed.qa_pairs,
    })
  } catch (err) {
    console.error('[pdf]', err.message)
    res.status(500).json({ error: 'AI request failed. Please try again.' })
  }
})

module.exports = router

