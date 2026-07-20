import { useState, useRef } from 'react'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/button'
import { api } from '@/services/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Upload, ChevronDown, ChevronUp, Loader2, FileText, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

interface QAPair {
  question: string
  answer: string
}

interface PdfResult {
  fileName: string
  summary: string
  qa_pairs: QAPair[]
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist')
  // Use CDN worker so we don't need to configure bundler
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(pdfjsLib as any).GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  let text = ''
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    text += content.items.map((item: any) => item.str).join(' ') + '\n'
  }
  return text.trim()
}

export function PdfPage() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [result, setResult] = useState<PdfResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file.')
      toast.error('Only PDF files are supported.')
      return
    }
    setFile(f)
    setError(null)
    setResult(null)
    toast.success(`Loaded PDF: ${f.name}`)
  }

  const analyse = async () => {
    if (!file || loading || extracting) return
    setExtracting(true)
    setError(null)
    try {
      const text = await extractPdfText(file)
      if (!text) throw new Error('Could not extract text. Make sure the PDF contains selectable text.')
      setExtracting(false)
      setLoading(true)
      const res = await api.pdf(text, file.name)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
      toast.success('Document analysed successfully!')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
      toast.error('Failed to analyse document.')
    } finally {
      setExtracting(false)
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setResult(null)
    setError(null)
    setExpanded(null)
    toast.info('Ready for new file upload.')
  }


  const statusLabel = extracting
    ? 'Extracting text…'
    : loading
    ? 'Analysing with AI…'
    : 'Analyse PDF'

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Header */}
        <div className="mb-10">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
            <span className="w-8 h-px bg-foreground/30" />
            PDF Summariser
          </span>
          <h1 className="text-4xl font-display tracking-tight">Summarise Any Document</h1>
          <p className="text-muted-foreground font-mono text-sm mt-2">
            Upload a PDF → get key points and Q&amp;A in seconds.
          </p>
        </div>

        {/* Drop zone */}
        {!result && (
          <>
            <div
              className={`border-2 border-dashed p-6 md:p-14 text-center transition-all duration-200 cursor-pointer mb-5 ${
                dragging
                  ? 'border-foreground bg-foreground/5'
                  : file
                  ? 'border-foreground/40'
                  : 'border-foreground/20 hover:border-foreground/40 hover:bg-foreground/3'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                const f = e.dataTransfer.files[0]
                if (f) handleFile(f)
              }}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
              />

              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border border-foreground/20 flex items-center justify-center">
                    <FileText className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-medium">{file.name}</p>
                    <p className="font-mono text-xs text-muted-foreground mt-0.5">
                      {(file.size / 1024).toFixed(1)} KB — click to change
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="w-8 h-8 text-muted-foreground/50" strokeWidth={1} />
                  <div>
                    <p className="font-mono text-sm text-muted-foreground">Drop a PDF here or click to browse</p>
                    <p className="font-mono text-xs text-muted-foreground/50 mt-1">
                      Text-based PDFs only (not scanned images)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm font-mono text-destructive bg-destructive/5 border border-destructive/20 px-4 py-3 mb-5">
                {error}
              </p>
            )}

            {file && (
              <Button
                onClick={analyse}
                disabled={loading || extracting}
                className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 rounded-none"
              >
                {(extracting || loading) ? (
                  <span className="flex items-center gap-2 font-mono text-xs">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {statusLabel}
                  </span>
                ) : (
                  'Analyse PDF'
                )}
              </Button>
            )}
          </>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="border border-foreground/10">
              <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-foreground/10">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  <span className="font-mono text-sm text-muted-foreground">{result.fileName}</span>
                </div>
                <button
                  onClick={reset}
                  className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  New file
                </button>
              </div>
              <div className="px-4 py-5 md:px-6 md:py-6 prose prose-sm max-w-none font-mono text-sm [&_h1]:font-display [&_h2]:font-display [&_strong]:font-semibold [&_li]:my-0.5">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.summary}</ReactMarkdown>
              </div>
            </div>

            {/* Q&A */}
            <div className="border border-foreground/10">
              <div className="px-6 py-4 border-b border-foreground/10">
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Q&amp;A Pairs ({result.qa_pairs.length})
                </p>
              </div>
              <div className="divide-y divide-foreground/10">
                {result.qa_pairs.map((qa, i) => (
                  <div key={i}>
                    <button
                      onClick={() => setExpanded(expanded === i ? null : i)}
                      className="w-full text-left px-4 md:px-6 py-4 flex items-start gap-4 hover:bg-foreground/3 transition-colors"
                    >
                      <span className="font-mono text-xs text-muted-foreground flex-shrink-0 mt-0.5">
                        Q{i + 1}
                      </span>
                      <span className="font-mono text-sm flex-1 text-left">{qa.question}</span>
                      {expanded === i
                        ? <ChevronUp className="w-4 h-4 flex-shrink-0 text-muted-foreground mt-0.5" />
                        : <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground mt-0.5" />
                      }
                    </button>
                    {expanded === i && (
                      <div className="px-4 md:px-6 pb-5 pl-10 md:pl-14">
                        <p className="font-mono text-sm text-muted-foreground leading-relaxed">{qa.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
