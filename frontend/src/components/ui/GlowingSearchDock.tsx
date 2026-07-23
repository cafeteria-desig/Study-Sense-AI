import React, { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, X, Search } from 'lucide-react'
import { VoiceControls } from '@/components/ui/VoiceControls'
import { Button } from '@/components/ui/button'

interface GlowingSearchDockProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e?: React.FormEvent) => void
  placeholder?: string
  loading?: boolean
  onSpeechResult?: (transcript: string) => void
  isInitialState?: boolean
  isExpanded?: boolean
  onExpandChange?: (expanded: boolean) => void
}

export function GlowingSearchDock({
  value,
  onChange,
  onSubmit,
  placeholder = "Search or ask anything...",
  loading = false,
  onSpeechResult,
  isInitialState = true,
  isExpanded = false,
  onExpandChange
}: GlowingSearchDockProps) {
  const localInputRef = useRef<HTMLInputElement>(null)

  const handleExpand = () => {
    onExpandChange?.(true)
    setTimeout(() => localInputRef.current?.focus(), 50)
  }

  const handleCollapse = () => {
    onExpandChange?.(false)
  }

  return (
    <div className="relative flex items-center justify-center w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {isInitialState && !isExpanded ? (
          <motion.button
            key="collapsed-dock"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExpand}
            className="relative group p-[2px] rounded-full overflow-hidden transition-all shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(255,255,255,0.35)]"
          >
            {/* High-Intensity Moving Line of Light (Border Beam) */}
            <div className="absolute inset-[-200%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_240deg,#ffffff_360deg)] opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="relative flex items-center gap-3 px-7 py-3.5 rounded-full bg-[#08080a] backdrop-blur-2xl text-sm font-sans text-[#F4F2EC] z-10">
              <Sparkles className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span className="font-medium tracking-wide">{placeholder}</span>
              <Search className="w-4 h-4 text-white/70 ml-2" />
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="expanded-form"
            initial={{ width: isInitialState ? 220 : '100%', opacity: 0 }}
            animate={{ width: '100%', opacity: 1 }}
            exit={{ width: 220, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full group p-[2px] rounded-full overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_30px_rgba(255,255,255,0.15)]"
          >
            {/* High-Intensity Moving Line of Light (Border Beam) */}
            <div className="absolute inset-[-200%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_240deg,#ffffff_360deg)] group-focus-within:bg-[conic-gradient(from_0deg,transparent_0_200deg,#ffffff_360deg)] opacity-85 group-focus-within:opacity-100 transition-opacity pointer-events-none" />

            <form
              onSubmit={(e) => {
                e.preventDefault()
                onSubmit(e)
              }}
              className="relative flex items-center gap-2 p-2 bg-[#08080a] backdrop-blur-2xl rounded-full z-10 transition-all"
            >
              <div className="pl-3 pr-1 text-white/80 flex items-center shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>

              <input
                ref={localInputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1 min-w-0 h-10 bg-transparent px-1 text-sm font-sans border-none focus:outline-none text-[#F4F2EC] placeholder-[#726F68]"
                disabled={loading}
                required
                autoFocus
              />

              {isInitialState && (
                <button
                  type="button"
                  onClick={handleCollapse}
                  className="p-1.5 text-[#A6A49C] hover:text-[#F4F2EC] transition-colors rounded-full hover:bg-white/10 shrink-0"
                  title="Collapse Search Bar"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {onSpeechResult && (
                <div className="shrink-0">
                  <VoiceControls
                    onSpeechResult={(transcript) => {
                      onSpeechResult(transcript)
                      setTimeout(() => localInputRef.current?.focus(), 50)
                    }}
                    size="md"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !value.trim()}
                className="h-10 w-10 min-w-[40px] bg-[#F4F2EC] text-[#08080a] flex items-center justify-center hover:bg-white rounded-full shrink-0 transition-all hover:scale-105 active:scale-95 shadow-lg font-semibold"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GlowingSearchDock
