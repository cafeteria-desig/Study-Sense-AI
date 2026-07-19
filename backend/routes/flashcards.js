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
  const { topic, count = 10 } = req.body
  if (!topic) return res.status(400).json({ error: 'topic required.' })

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `Generate exactly ${count} flashcards about the topic.
Return ONLY valid JSON (no markdown, no extra text):
{
  "flashcards": [
    { "front": "Question or term", "back": "Answer or definition" }
  ]
}
Make the fronts concise questions or key terms. Make the backs clear, complete answers.`,
        },
        {
          role: 'user',
          content: `Topic: ${topic}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    })

    const parsed = JSON.parse(completion.choices[0].message.content)

    // Save to Supabase
    let deckId = null
    let flashcardsData = parsed.flashcards
    try {
      const { data: deckData } = await supabaseAdmin
        .from('flashcard_decks')
        .insert({
          user_id: req.user.id,
          title: topic,
          topic: topic,
        })
        .select()
        .single()

      if (deckData) {
        deckId = deckData.id
        
        // Insert flashcards
        const cardsToInsert = parsed.flashcards.map((c) => ({
          deck_id: deckId,
          front: c.front,
          back: c.back,
        }))
        
        const { data: insertedCards } = await supabaseAdmin
          .from('flashcards')
          .insert(cardsToInsert)
          .select()

        if (insertedCards) {
          flashcardsData = insertedCards
        }

        await supabaseAdmin.from('activity_log').insert({
          user_id: req.user.id,
          tool: 'flashcards',
          ref_id: deckId,
          label: `Generated flashcards: ${topic}`,
        })
      }
    } catch (dbErr) {
      console.error('[flashcards-db-save-error]', dbErr.message)
    }

    res.json({
      id: deckId,
      title: topic,
      flashcards: flashcardsData,
    })

  } catch (err) {
    console.error('[flashcards]', err.message)
    res.status(500).json({ error: 'AI request failed. Please try again.' })
  }
})

module.exports = router

