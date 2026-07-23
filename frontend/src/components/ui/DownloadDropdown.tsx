import { useState, useRef, useEffect } from 'react'
import { MoreVertical, FileText, FileCode, FileType, Check, FileDown } from 'lucide-react'

interface DownloadDropdownProps {
  title: string
  content: string | object
  filenamePrefix?: string
}

export function DownloadDropdown({ title, content, filenamePrefix = 'studysense' }: DownloadDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const sanitizeFilename = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || filenamePrefix
  }

  const triggerDownload = (blob: Blob, ext: string) => {
    const url = URL.createObjectURL(blob)
    const element = document.createElement('a')
    element.href = url
    element.download = `${sanitizeFilename(title)}.${ext}`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    URL.revokeObjectURL(url)

    setDownloadedFormat(ext.toUpperCase())
    setIsOpen(false)
    setTimeout(() => setDownloadedFormat(null), 2500)
  }

  const exportAsPdf = () => {
    const textContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2)

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} — StudySense PDF Export</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              padding: 40px;
              color: #111827;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              border-bottom: 2px solid #000;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            .title {
              font-size: 24px;
              font-weight: 700;
              margin: 0 0 8px 0;
              color: #111827;
            }
            .subtitle {
              font-size: 12px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .content {
              white-space: pre-wrap;
              font-size: 14px;
            }
            h1, h2, h3 { color: #111827; margin-top: 24px; }
            code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
            pre { background: #f3f4f6; padding: 16px; border-radius: 8px; overflow-x: auto; }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="subtitle">StudySense AI Export</div>
            <h1 class="title">${title}</h1>
          </div>
          <div class="content">${textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()

    setDownloadedFormat('PDF')
    setIsOpen(false)
    setTimeout(() => setDownloadedFormat(null), 2500)
  }

  const exportAsMarkdown = () => {
    const text = typeof content === 'string' ? content : JSON.stringify(content, null, 2)
    const blob = new Blob([`# ${title}\n\n${text}`], { type: 'text/markdown;charset=utf-8;' })
    triggerDownload(blob, 'md')
  }

  const exportAsText = () => {
    const text = typeof content === 'string' ? content : JSON.stringify(content, null, 2)
    const blob = new Blob([`${title}\n${'='.repeat(title.length)}\n\n${text}`], { type: 'text/plain;charset=utf-8;' })
    triggerDownload(blob, 'txt')
  }

  const exportAsJson = () => {
    const jsonObj = typeof content === 'string' ? { title, content } : content
    const blob = new Blob([JSON.stringify(jsonObj, null, 2)], { type: 'application/json;charset=utf-8;' })
    triggerDownload(blob, 'json')
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Compact Icon Button (Three-Dots) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-7 h-7 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-[#A6A49C] hover:text-[#F4F2EC] flex items-center justify-center transition-all shadow-xs"
        title="Export & Download Options"
        aria-label="Download Options"
      >
        {downloadedFormat ? (
          <Check className="w-3.5 h-3.5 text-white" />
        ) : (
          <MoreVertical className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-[#08080a] border border-white/20 shadow-2xl backdrop-blur-2xl z-[9999] p-1.5 font-mono text-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[10px] text-[#A6A49C] uppercase tracking-wider border-b border-white/10 mb-1 flex items-center justify-between">
            <span>Export Format</span>
            <FileDown className="w-3 h-3 text-white/60" />
          </div>

          <button
            onClick={exportAsPdf}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#F4F2EC] hover:bg-white/10 transition-colors text-left font-medium"
          >
            <FileType className="w-4 h-4 text-white" />
            PDF Document (.pdf)
          </button>

          <button
            onClick={exportAsMarkdown}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#F4F2EC] hover:bg-white/10 transition-colors text-left"
          >
            <FileText className="w-4 h-4 text-[#A6A49C]" />
            Markdown (.md)
          </button>

          <button
            onClick={exportAsText}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#F4F2EC] hover:bg-white/10 transition-colors text-left"
          >
            <FileText className="w-4 h-4 text-[#A6A49C]" />
            Plain Text (.txt)
          </button>

          <button
            onClick={exportAsJson}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#F4F2EC] hover:bg-white/10 transition-colors text-left"
          >
            <FileCode className="w-4 h-4 text-[#A6A49C]" />
            JSON Export (.json)
          </button>
        </div>
      )}
    </div>
  )
}

export default DownloadDropdown
