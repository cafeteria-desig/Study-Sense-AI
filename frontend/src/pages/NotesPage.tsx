import { useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/button'
import { api } from '@/services/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FileText, Copy, Check, Loader2, Download } from 'lucide-react'
import { toast } from 'sonner'

type Style = 'concise' | 'comprehensive' | 'bullet points'

const STYLES: Style[] = ['concise', 'comprehensive', 'bullet points']
const SUGGESTIONS = ['Photosynthesis', 'World War II', 'Linear Algebra', 'Machine Learning', 'Human Anatomy']

export function NotesPage() {
  const [topic, setTopic] = useState('')
  const [style, setStyle] = useState<Style>('comprehensive')
  const [notes, setNotes] = useState<{ title: string; content: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const generate = async (t = topic) => {
    if (!t.trim() || loading) return
    setTopic(t)
    setLoading(true)
    setError(null)
    setNotes(null)
    try {
      const res = await api.notes(t, style)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setNotes(data)
      toast.success('Notes generated successfully!')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
      toast.error('Failed to generate notes.')
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    if (!notes) return
    navigator.clipboard.writeText(notes.content)
    setCopied(true)
    toast.success('Notes copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }


  const download = () => {
    if (!notes) return
    const blob = new Blob([notes.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${notes.title.replace(/\s+/g, '-').toLowerCase()}-notes.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Header */}
        <div className="mb-10">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
            <span className="w-8 h-px bg-foreground/30" />
            Notes Generator
          </span>
          <h1 className="text-4xl font-display tracking-tight">Generate Study Notes</h1>
          <p className="text-muted-foreground font-mono text-sm mt-2">Turn any topic into structured, exam-ready notes.</p>
        </div>

        {/* Form */}
        <div className="border border-foreground/10 p-4 md:p-6 space-y-5 mb-8">
          <div className="space-y-2">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Topic</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generate()}
              placeholder="e.g. Photosynthesis, World War II, Linear Algebra…"
              className="w-full h-11 bg-input px-4 text-sm font-mono border border-border focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/50"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => generate(s)}
                  className="text-xs font-mono px-2.5 py-1 border border-foreground/15 text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Style</label>
            <div className="flex gap-2 flex-wrap">
              {STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-3 py-1.5 text-xs font-mono border transition-colors capitalize ${
                    style === s
                      ? 'bg-foreground text-background border-foreground'
                      : 'border-foreground/20 text-muted-foreground hover:text-foreground hover:border-foreground/40'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm font-mono text-destructive bg-destructive/5 border border-destructive/20 px-4 py-3">
              {error}
            </p>
          )}

          <Button
            onClick={() => generate()}
            disabled={!topic.trim() || loading}
            className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 rounded-none"
          >
            {loading ? (
              <span className="flex items-center gap-2 font-mono text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating notes…
              </span>
            ) : (
              'Generate Notes'
            )}
          </Button>
        </div>

        {/* Result */}
        {notes && (
          <div className="border border-foreground/10">
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-foreground/10">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <span className="font-mono text-sm font-medium">{notes.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={download}
                  className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  .md
                </button>
                <button
                  onClick={copy}
                  className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
            </div>
            <div className="px-4 py-5 md:px-6 md:py-6 prose prose-sm max-w-none font-mono text-sm [&_h1]:font-display [&_h2]:font-display [&_h3]:font-display [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-base [&_strong]:font-semibold [&_code]:bg-foreground/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_pre]:bg-foreground/5 [&_pre]:p-4 [&_pre]:text-xs [&_li]:my-0.5">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes.content}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
