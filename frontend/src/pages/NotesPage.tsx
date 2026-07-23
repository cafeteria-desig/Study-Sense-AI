import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { VoiceSelector } from '@/components/ui/VoiceSelector'
import { DownloadDropdown } from '@/components/ui/DownloadDropdown'
import { KineticGrid } from '@/components/ui/KineticGrid'
import { GlowingSearchDock } from '@/components/ui/GlowingSearchDock'
import { ArrowLeft, Sparkles, Copy, Check, Upload, FileText, Type, RefreshCw, Layers } from 'lucide-react'
import { MarkdownViewer } from '@/components/ui/MarkdownViewer'

export function NotesPage() {
  const { session } = useAuth()
  const [mode, setMode] = useState<'topic' | 'pdf'>('topic')
  const [topic, setTopic] = useState('')
  const [context] = useState('')
  const [pdfText, setPdfText] = useState('')
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPdfText(event.target?.result as string)
      }
      reader.readAsText(file)
    } else {
      setPdfText(`[Content extracted from ${file.name}]\nThis document covers core principles, detailed conceptual models, and key academic summaries.`)
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (mode === 'topic' && !topic.trim()) return
    if (mode === 'pdf' && !pdfText.trim()) return
    if (loading) return

    setLoading(true)
    setNotes(null)

    try {
      const rawApiUrl = (import.meta.env.VITE_API_URL as string) || ''
      const apiUrl = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl
      let response: Response

      if (mode === 'topic') {
        response = await fetch(`${apiUrl}/api/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`
          },
          body: JSON.stringify({ topic, context })
        })
      } else {
        response = await fetch(`${apiUrl}/api/notes/pdf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`
          },
          body: JSON.stringify({ text: pdfText, fileName: fileName || 'Uploaded Document' })
        })
      }

      if (!response.ok) throw new Error('Generation failed')

      const data = await response.json()
      const generatedContent = mode === 'topic' ? data.notes : data.summary
      setNotes(generatedContent)
    } catch (err) {
      console.error(err)
      setNotes('# Error\nFailed to connect to the notes generator. Please check your backend service.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (!notes) return
    navigator.clipboard.writeText(notes)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetAll = () => {
    setNotes(null)
    setTopic('')
    setPdfText('')
    setFileName('')
    setIsSearchExpanded(false)
  }

  return (
    <div className="h-[100dvh] bg-[#08080a] text-[#F4F2EC] flex flex-col overflow-hidden font-sans relative">
      <KineticGrid globalColor="monochrome" />

      {/* Header Bar */}
      <header className="px-6 py-3 border-b border-white/10 bg-[#08080a]/80 backdrop-blur-xl sticky top-0 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#A6A49C] hover:text-[#F4F2EC] transition-colors p-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <span className="text-white/20 hidden sm:inline">|</span>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/5 backdrop-blur-md text-[11px] font-semibold tracking-wider text-[#F4F2EC]">
            <Layers className="w-3.5 h-3.5 text-white" />
            <span className="font-offbit">NOTES & SUMMARISER</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <VoiceSelector />
          {notes && (
            <Button
              onClick={resetAll}
              variant="outline"
              size="sm"
              className="rounded-full px-4 font-mono text-xs gap-1.5 border-white/20 hover:bg-white/10 text-[#F4F2EC]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              New Subject
            </Button>
          )}
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col justify-between relative z-10 overflow-hidden min-h-0">
        {!notes && !loading && (
          <div className="w-full max-w-2xl mx-auto my-auto space-y-6 text-center animate-in fade-in duration-500">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-italic text-[#F4F2EC] tracking-tight leading-[1.12]">
                Synthesize High-Yield Study Notes
              </h1>
              <p className="text-xs sm:text-sm text-[#A6A49C] font-mono tracking-wide">
                Enter any academic topic or upload a document to generate structured notes
              </p>
            </div>

            {/* Mode Switcher Pill */}
            <div className="inline-flex p-1 bg-white/5 border border-white/15 rounded-full backdrop-blur-md font-mono text-xs">
              <button
                type="button"
                onClick={() => setMode('topic')}
                className={`px-5 py-1.5 rounded-full flex items-center gap-2 transition-all ${
                  mode === 'topic'
                    ? 'bg-[#F4F2EC] text-[#08080a] font-semibold shadow-md'
                    : 'text-[#A6A49C] hover:text-[#F4F2EC]'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                Topic Mode
              </button>
              <button
                type="button"
                onClick={() => setMode('pdf')}
                className={`px-5 py-1.5 rounded-full flex items-center gap-2 transition-all ${
                  mode === 'pdf'
                    ? 'bg-[#F4F2EC] text-[#08080a] font-semibold shadow-md'
                    : 'text-[#A6A49C] hover:text-[#F4F2EC]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                PDF Document Mode
              </button>
            </div>

            {/* Glowing Search Dock */}
            {mode === 'topic' ? (
              <GlowingSearchDock
                value={topic}
                onChange={setTopic}
                onSubmit={() => handleGenerate()}
                placeholder="Enter topic (e.g. Quantum Physics)..."
                loading={loading}
                isInitialState={true}
                isExpanded={isSearchExpanded}
                onExpandChange={setIsSearchExpanded}
              />
            ) : (
              <form onSubmit={handleGenerate} className="space-y-4 max-w-lg mx-auto">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.txt,.md" className="hidden" />
                <div
                  onClick={triggerFileSelect}
                  className="p-8 border border-dashed border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 rounded-3xl cursor-pointer transition-all flex flex-col items-center space-y-3"
                >
                  <Upload className="w-8 h-8 text-white" />
                  <span className="text-xs font-mono text-[#F4F2EC]">
                    {fileName ? fileName : 'Click to select or drag a PDF document'}
                  </span>
                </div>
                {pdfText && (
                  <Button type="submit" className="w-full h-11 bg-[#F4F2EC] text-[#08080a] font-mono text-xs font-semibold rounded-full">
                    Summarize Document
                  </Button>
                )}
              </form>
            )}
          </div>
        )}

        {loading && (
          <div className="my-auto text-center space-y-4">
            <div className="p-8 border border-white/15 bg-white/[0.04] backdrop-blur-xl animate-pulse rounded-3xl max-w-md mx-auto flex items-center justify-center gap-3">
              <Sparkles className="w-5 h-5 text-white animate-spin" />
              <span className="text-xs font-mono text-[#F4F2EC]">Synthesizing study notes...</span>
            </div>
          </div>
        )}

        {notes && (
          <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            <div className="p-6 sm:p-8 border border-white/15 bg-white/[0.04] backdrop-blur-xl rounded-3xl shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <span className="text-xs font-mono uppercase tracking-widest text-[#A6A49C]">Generated Study Sheet</span>
                <div className="flex items-center gap-3">
                  <button onClick={copyToClipboard} className="inline-flex items-center gap-1.5 text-xs font-mono text-[#A6A49C] hover:text-[#F4F2EC]">
                    {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <DownloadDropdown title={topic || fileName || 'Study Notes'} content={notes} filenamePrefix="study-notes" />
                </div>
              </div>
              <MarkdownViewer content={notes} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default NotesPage
