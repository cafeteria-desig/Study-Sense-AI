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
  const { messages, sessionId: clientSessionId } = req.body
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required.' })
  }

  try {
    const userMessage = messages[messages.length - 1]
    let sessionId = clientSessionId

    // Create session immediately if not provided
    if (!sessionId) {
      const title = userMessage.content.slice(0, 40) + (userMessage.content.length > 40 ? '...' : '')
      const { data: newSession, error: createErr } = await supabaseAdmin
        .from('tutor_sessions')
        .insert({
          user_id: req.user.id,
          title: title || 'New Chat Session',
        })
        .select()
        .single()
      
      if (createErr) throw createErr
      if (newSession) {
        sessionId = newSession.id
        await supabaseAdmin.from('activity_log').insert({
          user_id: req.user.id,
          tool: 'tutor',
          ref_id: sessionId,
          label: `Tutor Chat: ${title}`,
        })
      }
    }

    const stream = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are StudySense, a highly formal and professional expert AI academic advisor and tutor. ' +
            'You must always maintain an exceptionally formal, polite, academic, and respectful tone. ' +
            'Address the student formally. Avoid informal phrasing, slang, contractions, or overly casual expressions. ' +
            'Provide precise, clear, and comprehensive academic explanations using structured arguments, examples, ' +
            'analogies, and professional vocabulary. Format your responses in structured markdown (headings, bold text, bullet points, code blocks).',
        },
        ...messages,
      ],
      max_tokens: 1500,
      stream: true,
    })

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    })

    // Write the sessionId to the stream first so the client can sync their state
    res.write(`data: ${JSON.stringify({ sessionId })}\n\n`)

    let aiContent = ''
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || ''
      aiContent += text
      res.write(`data: ${JSON.stringify({ text })}\n\n`)
    }

    res.write('data: [DONE]\n\n')
    res.end()

    // Persist to Supabase in background
    try {
      if (sessionId) {
        const msgsToInsert = [
          { session_id: sessionId, role: 'user', content: userMessage.content },
          { session_id: sessionId, role: 'assistant', content: aiContent }
        ]
        
        await supabaseAdmin.from('tutor_messages').insert(msgsToInsert)
        
        // Update session timestamp
        await supabaseAdmin
          .from('tutor_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', sessionId)
      }
    } catch (dbErr) {
      console.error('[tutor-db-save-error]', dbErr.message)
    }

  } catch (err) {
    console.error('[tutor]', err.message)
    res.status(500).json({ error: 'AI request failed. Please try again.' })
  }
})


module.exports = router

