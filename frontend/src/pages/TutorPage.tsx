import { useState, useRef, useEffect } from 'react'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/button'
import { api } from '@/services/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Send, Bot, User, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const STARTERS = [
  'Explain photosynthesis simply',
  'How does TCP/IP work?',
  'What is the quadratic formula?',
  'Summarise the French Revolution',
]

export function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text?: string) => {
    const content = text ?? input
    if (!content.trim() || loading) return
    const userMsg: Message = { role: 'user', content }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const res = await api.tutor(next)
      if (!res.body) throw new Error('No response body')
      
      // Pre-insert a blank assistant message that we will stream into
      const assistantMsg: Message = { role: 'assistant', content: '' }
      setMessages([...next, assistantMsg])

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunkText = decoder.decode(value)
        const lines = chunkText.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim()
            if (dataStr === '[DONE]') continue

            try {
              const parsed = JSON.parse(dataStr)
              if (parsed.error) {
                accumulated = 'Something went wrong. Please try again.'
                break
              }
              if (parsed.text) {
                accumulated += parsed.text
                setMessages((prev) => {
                  const updated = [...prev]
                  if (updated.length > 0) {
                    updated[updated.length - 1] = { role: 'assistant', content: accumulated }
                  }
                  return updated
                })
              }
            } catch (jsonErr) {
              // Skip incomplete chunks
            }
          }
        }
      }
    } catch (err: any) {
      console.error('[tutor-stream-error]', err)
      toast.error('AI response failed. Please try again.')
      setMessages([...next, { role: 'assistant', content: 'AI Tutor is currently unavailable. Please try again shortly.' }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }


  return (
    <AppShell>
      <div className="flex flex-col" style={{ height: 'calc(100vh - 3.5rem)', maxHeight: '100dvh' }}>
        {/* Header */}
        <div className="border-b border-foreground/10 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <span className="inline-flex items-center gap-3 text-xs font-mono text-muted-foreground mb-1">
              <span className="w-6 h-px bg-foreground/30" />
              AI Tutor
            </span>
            <h1 className="text-2xl font-display">Ask me anything</h1>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-12">
              <div className="w-12 h-12 border border-foreground/15 flex items-center justify-center">
                <Bot className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-display text-2xl mb-2">Your AI Study Tutor</p>
                <p className="text-muted-foreground font-mono text-sm">Ask any question and get a clear explanation.</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs font-mono px-3 py-2 border border-foreground/15 hover:border-foreground/50 hover:bg-foreground/5 transition-all duration-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 border border-foreground/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" strokeWidth={1.5} />
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-foreground text-background font-mono'
                    : 'bg-muted border border-foreground/10'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none font-mono [&_pre]:bg-foreground/5 [&_pre]:p-3 [&_pre]:text-xs [&_code]:text-xs [&_h1]:font-display [&_h2]:font-display [&_h3]:font-display">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 bg-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-background" strokeWidth={1.5} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 border border-foreground/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5" strokeWidth={1.5} />
              </div>
              <div className="bg-muted border border-foreground/10 px-4 py-3.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-foreground/10 px-6 py-4 flex-shrink-0">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Ask anything… (Enter to send)"
              className="flex-1 h-11 bg-input px-4 text-sm font-mono border border-border focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/50"
            />
            <Button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="h-11 px-4 bg-foreground text-background hover:bg-foreground/90 rounded-none"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
