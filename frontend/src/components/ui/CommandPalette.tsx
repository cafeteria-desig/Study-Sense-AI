import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  LayoutDashboard,
  Bot,
  FileText,
  HelpCircle,
  Calendar,
  Home,
  Keyboard,
  ArrowRight,
  X
} from 'lucide-react'

interface ShortcutItem {
  key: string
  label: string
  path: string
  icon: any
}

const SHORTCUTS: ShortcutItem[] = [
  { key: 'Ctrl + D', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'Ctrl + N', label: 'Nora AI Specialist', path: '/pdf', icon: Bot },
  { key: 'Ctrl + S', label: 'Study Notes', path: '/notes', icon: FileText },
  { key: 'Ctrl + Q', label: 'Interactive Quizzes', path: '/quiz', icon: HelpCircle },
  { key: 'Ctrl + P', label: 'Study Planner', path: '/planner', icon: Calendar },
  { key: 'Ctrl + H', label: 'Home Page', path: '/', icon: Home },
]

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable

      // ─── PAGE UP & PAGE DOWN KEY SCROLLING ALL OVER THE WEBPAGE ───
      if (e.key === 'PageUp' || e.key === 'PageDown' || (e.key === 'Home' && !isInput) || (e.key === 'End' && !isInput)) {
        const scrollable =
          document.querySelector<HTMLElement>('.overflow-y-auto') ||
          document.querySelector<HTMLElement>('[role="log"]') ||
          document.documentElement

        const scrollAmount = (scrollable.clientHeight || window.innerHeight) * 0.85

        if (e.key === 'PageUp') {
          e.preventDefault()
          scrollable.scrollBy({ top: -scrollAmount, behavior: 'smooth' })
          return
        } else if (e.key === 'PageDown') {
          e.preventDefault()
          scrollable.scrollBy({ top: scrollAmount, behavior: 'smooth' })
          return
        } else if (e.key === 'Home') {
          e.preventDefault()
          scrollable.scrollTo({ top: 0, behavior: 'smooth' })
          return
        } else if (e.key === 'End') {
          e.preventDefault()
          scrollable.scrollTo({ top: scrollable.scrollHeight, behavior: 'smooth' })
          return
        }
      }

      // Cmd+K or Ctrl+K -> Open/Close Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
        setIsHelpOpen(false)
        return
      }

      // '?' -> Open Keyboard Shortcuts Cheatsheet (when not typing)
      if (e.key === '?' && !isInput) {
        e.preventDefault()
        setIsHelpOpen((prev) => !prev)
        setIsOpen(false)
        return
      }

      // Quick Nav Shortcuts (Ctrl + Key)
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase()
        const target = SHORTCUTS.find((s) => s.key.toLowerCase().endsWith(key))
        if (target) {
          e.preventDefault()
          navigate(target.path)
          setIsOpen(false)
          setIsHelpOpen(false)
          return
        }
      }

      // '/' -> Focus chat input when not typing
      if (e.key === '/' && !isInput) {
        const chatInput = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
          'input[type="text"], input[placeholder*="Ask"], textarea'
        )
        if (chatInput) {
          e.preventDefault()
          chatInput.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  const filteredShortcuts = SHORTCUTS.filter(
    (s) =>
      s.label.toLowerCase().includes(search.toLowerCase()) ||
      s.key.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (path: string) => {
    navigate(path)
    setIsOpen(false)
    setSearch('')
  }

  return (
    <>
      {/* Floating Keyboard Hint Badge (Bottom Right) */}
      <div className="fixed bottom-4 right-4 z-40 hidden sm:flex items-center gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="px-3 py-1.5 rounded-full border border-white/15 bg-[#08080a]/80 backdrop-blur-xl text-xs font-mono text-[#A6A49C] hover:text-[#F4F2EC] hover:border-white/30 transition-all flex items-center gap-2 shadow-xl"
          title="Open Command Palette (Ctrl + K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Cmd/Ctrl + K</span>
        </button>
        <button
          onClick={() => setIsHelpOpen(true)}
          className="w-8 h-8 rounded-full border border-white/15 bg-[#08080a]/80 backdrop-blur-xl text-xs font-mono text-[#A6A49C] hover:text-[#F4F2EC] hover:border-white/30 transition-all flex items-center justify-center shadow-xl"
          title="Keyboard Shortcuts Cheatsheet (?)"
        >
          <Keyboard className="w-4 h-4" />
        </button>
      </div>

      {/* ─── COMMAND PALETTE MODAL (Ctrl + K) ─── */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg rounded-3xl border border-white/20 bg-[#08080a] p-4 shadow-[0_25px_60px_rgba(0,0,0,0.9)] space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Input */}
            <div className="relative flex items-center border-b border-white/10 pb-3">
              <Search className="w-4 h-4 text-white/50 absolute left-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type a command or search page... (e.g. Nora, Quiz)"
                className="w-full pl-9 pr-8 h-10 bg-transparent text-sm font-sans text-[#F4F2EC] placeholder-[#726F68] focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-2 p-1 text-[#A6A49C] hover:text-[#F4F2EC] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-[#726F68]">
                Quick Navigation Shortcuts
              </div>

              {filteredShortcuts.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.path}
                    onClick={() => handleSelect(item.path)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl border border-transparent hover:border-white/15 bg-white/[0.03] hover:bg-white/[0.08] transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-[#A6A49C] group-hover:text-white transition-colors" />
                      <span className="text-xs font-sans font-medium text-[#F4F2EC]">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md border border-white/15 bg-white/5 text-[10px] font-mono text-[#A6A49C]">
                        {item.key}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                )
              })}

              {filteredShortcuts.length === 0 && (
                <div className="p-6 text-center text-xs font-mono text-[#726F68]">
                  No matching page or command found.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#726F68]">
              <span>Press <kbd className="px-1.5 py-0.5 rounded border border-white/20 bg-white/5 text-[#F4F2EC]">PgUp/PgDn</kbd> to scroll</span>
              <span>Press <kbd className="px-1.5 py-0.5 rounded border border-white/20 bg-white/5 text-[#F4F2EC]">/</kbd> to type</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── SHORTCUTS CHEATSHEET MODAL (?) ─── */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-md rounded-3xl border border-white/20 bg-[#08080a] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)] space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-sm font-mono font-semibold text-[#F4F2EC]">
                <Keyboard className="w-4 h-4 text-white" />
                <span>Keyboard Shortcuts Guide</span>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="p-1 text-[#A6A49C] hover:text-[#F4F2EC] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-[#A6A49C]">Scroll Up / Down</span>
                <kbd className="px-2 py-0.5 rounded border border-white/20 bg-white/10 text-white font-bold">PageUp / PageDown</kbd>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-[#A6A49C]">Jump to Top / Bottom</span>
                <kbd className="px-2 py-0.5 rounded border border-white/20 bg-white/10 text-white font-bold">Home / End</kbd>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-[#A6A49C]">Focus Chat Input</span>
                <kbd className="px-2 py-0.5 rounded border border-white/20 bg-white/10 text-white font-bold">/</kbd>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-[#A6A49C]">Open Command Palette</span>
                <kbd className="px-2 py-0.5 rounded border border-white/20 bg-white/10 text-white">Cmd / Ctrl + K</kbd>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-[#A6A49C]">Nora AI Specialist</span>
                <kbd className="px-2 py-0.5 rounded border border-white/20 bg-white/10 text-white">Ctrl + N</kbd>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-[#A6A49C]">Dashboard</span>
                <kbd className="px-2 py-0.5 rounded border border-white/20 bg-white/10 text-white">Ctrl + D</kbd>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-[#A6A49C]">Study Notes</span>
                <kbd className="px-2 py-0.5 rounded border border-white/20 bg-white/10 text-white">Ctrl + S</kbd>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-[#A6A49C]">Shortcuts Cheatsheet</span>
                <kbd className="px-2 py-0.5 rounded border border-white/20 bg-white/10 text-white">?</kbd>
              </div>
            </div>

            <div className="pt-2 text-center text-[11px] font-mono text-[#726F68]">
              Press <kbd className="px-1.5 py-0.5 rounded border border-white/20 bg-white/5 text-[#F4F2EC]">ESC</kbd> to close
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CommandPalette
