import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Copy, Check, Sparkles, Sun, Moon, Sliders, Type, Terminal, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

const SAMPLE_PHRASES = [
  'OffBit Fonts — Welcome To Bitmap World',
  'StudySense AI — Smart Learning Companion',
  'POWER-TYPE™ BITMAP & DISPLAY',
  'Free Font (BitOFF / 05) ☀ ☂ ✔ © (R)',
  '01 02 03 04 05 06 07 08 09 10',
]

const FONT_STYLES = [
  {
    id: 'offbit-dot',
    name: 'OffBit Dot Matrix (DotGothic16)',
    fontClass: 'font-offbit',
    description: 'Circular dot-matrix grid style for retro digital displays and LED counters.',
    sampleText: 'OffBit Fonts — Power-type™ Collection 6 Styles',
  },
  {
    id: 'silkscreen',
    name: 'OffBit Bold Pixel (Silkscreen)',
    fontClass: 'font-silkscreen',
    description: 'Crisp, high-contrast 8-bit bitmap style ideal for UI badges and headers.',
    sampleText: 'WELCOME TO BITMAP WORLD',
  },
  {
    id: 'pixel-arcade',
    name: 'OffBit Arcade (Press Start 2P)',
    fontClass: 'font-pixel-arcade',
    description: 'Classic arcade screen typography with dense pixel geometry.',
    sampleText: 'BITOFF / 05 ☀ ☂ ✔',
  },
]

export function FontTestPage() {
  const [customText, setCustomText] = useState('OffBit Fonts — Welcome To Bitmap World')
  const [fontSize, setFontSize] = useState(48)
  const [letterSpacing, setLetterSpacing] = useState(2)
  const [lineHeight] = useState(1.2)
  const [glowEffect, setGlowEffect] = useState(false)
  const [gridOverlay, setGridOverlay] = useState(true)
  const [selectedFontFamily, setSelectedFontFamily] = useState<'offbit' | 'silkscreen' | 'arcade'>('offbit')

  // Scramble test state
  const [scrambleOutput, setScrambleOutput] = useState('STUDYSENSE AI')
  const [isScrambling, setIsScrambling] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    document.documentElement.classList.add('dark')
    setDarkMode(true)
  }, [])

  const toggleTheme = () => {
    const isDark = !darkMode
    setDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const runScrambleTest = () => {
    if (isScrambling) return
    setIsScrambling(true)
    const target = 'STUDYSENSE AI POWER-TYPE'
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789☀☂✔©'
    let step = 0
    const totalSteps = 25

    const interval = setInterval(() => {
      step++
      const progress = step / totalSteps
      let current = ''

      for (let i = 0; i < target.length; i++) {
        if (target[i] === ' ') {
          current += ' '
        } else if (progress * target.length > i) {
          current += target[i]
        } else {
          current += chars[Math.floor(Math.random() * chars.length)]
        }
      }

      setScrambleOutput(current)

      if (step >= totalSteps) {
        clearInterval(interval)
        setScrambleOutput(target)
        setIsScrambling(false)
      }
    }, 50)
  }

  const copyCssSnippet = () => {
    const code = `.font-offbit {\n  font-family: 'DotGothic16', 'JetBrains Mono', monospace;\n  letter-spacing: 0.08em;\n}`
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const getFontFamilyClass = () => {
    if (selectedFontFamily === 'silkscreen') return 'font-silkscreen'
    if (selectedFontFamily === 'arcade') return 'font-pixel-arcade'
    return 'font-offbit'
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-positive/20 relative pb-24">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <span className="w-px h-4 bg-foreground/20" />
          <span className="font-offbit text-sm tracking-wider text-positive uppercase flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            OFFBIT FONT LAB
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 border border-foreground/15 bg-background/60 backdrop-blur-md rounded-full hover:bg-muted/50 transition-all text-foreground"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1400px] mx-auto px-6 py-10 space-y-12">
        {/* Header Hero Title */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-positive/30 bg-positive/10 text-positive text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-positive animate-pulse" />
            <span>BITMAP & DISPLAY FONT SPECIMEN</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-offbit tracking-tight leading-tight">
            OffBit Font Testing Lab
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm sm:text-base font-sans">
            A dedicated playground for testing the OffBit dot-matrix bitmap typeface collection, typography scaling, scramblers, and custom UI components.
          </p>
        </div>

        {/* ── SECTION 1: Interactive Live Playground ──────────────────────────── */}
        <section className="border border-foreground/15 rounded-3xl p-6 lg:p-8 bg-card/40 backdrop-blur-xl shadow-lg space-y-8">
          <div className="flex items-center justify-between border-b border-foreground/10 pb-4 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Type className="w-5 h-5 text-positive" />
              <h2 className="text-xl font-offbit font-semibold tracking-wide">Interactive Typography Tester</h2>
            </div>
            <div className="flex items-center gap-2">
              {SAMPLE_PHRASES.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => setCustomText(phrase)}
                  className="px-2.5 py-1 text-[11px] font-mono border border-foreground/15 rounded-md hover:bg-muted/50 transition-colors"
                >
                  Sample {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-muted/20 p-5 rounded-2xl border border-foreground/10 font-mono text-xs">
            {/* Font Family Selector */}
            <div className="space-y-2">
              <label className="text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Font Variant
              </label>
              <select
                value={selectedFontFamily}
                onChange={(e) => setSelectedFontFamily(e.target.value as any)}
                className="w-full bg-input px-3 py-2 border border-border rounded-lg text-foreground focus:outline-none"
              >
                <option value="offbit">OffBit Dot Matrix (DotGothic16)</option>
                <option value="silkscreen">OffBit Bold Pixel (Silkscreen)</option>
                <option value="arcade">OffBit Arcade (Press Start 2P)</option>
              </select>
            </div>

            {/* Font Size Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-muted-foreground uppercase tracking-wider">Font Size</label>
                <span>{fontSize}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="100"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-positive"
              />
            </div>

            {/* Letter Spacing Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-muted-foreground uppercase tracking-wider">Letter Spacing</label>
                <span>{letterSpacing}px</span>
              </div>
              <input
                type="range"
                min="-2"
                max="12"
                value={letterSpacing}
                onChange={(e) => setLetterSpacing(Number(e.target.value))}
                className="w-full accent-positive"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-2 flex flex-col justify-end">
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={glowEffect}
                    onChange={(e) => setGlowEffect(e.target.checked)}
                    className="accent-positive"
                  />
                  <span>Matrix Glow</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gridOverlay}
                    onChange={(e) => setGridOverlay(e.target.checked)}
                    className="accent-positive"
                  />
                  <span>Dot Grid BG</span>
                </label>
              </div>
            </div>
          </div>

          {/* Custom Text Input */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Type Your Custom Text:</label>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Type anything here..."
              className="w-full bg-input px-4 py-3 text-base font-mono border border-border rounded-xl focus:border-foreground focus:outline-none transition-colors"
            />
          </div>

          {/* Live Preview Canvas */}
          <div
            className={`relative p-10 min-h-[220px] rounded-2xl border border-foreground/20 flex items-center justify-center overflow-hidden transition-all ${
              darkMode ? 'bg-black text-white' : 'bg-slate-900 text-white'
            }`}
          >
            {/* Grid Pattern Overlay */}
            {gridOverlay && (
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
                  backgroundSize: '12px 12px',
                }}
              />
            )}

            <p
              className={`${getFontFamilyClass()} ${glowEffect ? 'dot-matrix-glow text-positive' : ''} transition-all text-center break-words max-w-full z-10`}
              style={{
                fontSize: `${fontSize}px`,
                letterSpacing: `${letterSpacing}px`,
                lineHeight: lineHeight,
              }}
            >
              {customText || 'Type something above...'}
            </p>
          </div>
        </section>

        {/* ── SECTION 2: Poster Artwork & Specimen Showcase (Matching Image Aesthetic) ── */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
            <h2 className="text-2xl font-offbit font-semibold tracking-wide flex items-center gap-2">
              <span>Specimen Showcase</span>
              <span className="text-xs font-mono bg-positive/10 text-positive px-2.5 py-0.5 rounded-full border border-positive/30">
                OFFBIT COLLECTION
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Poster Specimen Card (Recreating Image Poster Aesthetic) */}
            <div className="relative rounded-3xl border border-foreground/20 bg-black text-white p-8 overflow-hidden shadow-2xl space-y-8 min-h-[440px] flex flex-col justify-between">
              {/* Background grid */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle, #fff 1.5px, transparent 1.5px)',
                  backgroundSize: '16px 16px',
                }}
              />

              {/* Top Row: Free Font Header */}
              <div className="flex items-center justify-between z-10">
                <span className="font-offbit text-5xl sm:text-6xl tracking-tight text-white dot-matrix-glow">
                  Free Font
                </span>
                <span className="font-offbit text-xs border border-white/30 px-3 py-1 rounded-full text-white/80">
                  Power-type™
                </span>
              </div>

              {/* Middle Section: Center Artwork Representation + Welcome Badge */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                {/* Simulated Icon Grid */}
                <div className="space-y-3 font-offbit">
                  <div className="text-3xl tracking-widest text-positive flex items-center gap-3">
                    <span>©</span>
                    <span>(R)</span>
                    <span>☀</span>
                    <span>☂</span>
                    <span>✔</span>
                  </div>
                  <p className="text-xs font-mono text-white/60 leading-relaxed">
                    Measured according to the (Bit)<br />without coercion and worry.
                  </p>
                </div>

                {/* Welcome Card Badge */}
                <div className="border border-white/20 bg-white/5 backdrop-blur-md p-5 rounded-2xl space-y-2">
                  <span className="font-offbit text-xl block leading-tight text-white">
                    Welcome To<br />Bitmap World<br />Power-type™
                  </span>
                </div>
              </div>

              {/* Main OffBit Title */}
              <div className="z-10 space-y-2 border-t border-white/20 pt-6">
                <span className="font-offbit text-4xl sm:text-6xl font-bold tracking-tight block text-white">
                  OffBit Fonts
                </span>
                <div className="flex items-center justify-between font-mono text-xs text-white/70">
                  <span className="font-offbit text-sm text-positive">OffBit Collection 6 Styles</span>
                  <span className="border border-red-500/50 bg-red-500/20 text-red-400 px-3 py-0.5 rounded-full flex items-center gap-1.5 font-bold">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    Bitmap & Display
                  </span>
                </div>
              </div>
            </div>

            {/* 3 Font Styles Comparison List */}
            <div className="space-y-4">
              {FONT_STYLES.map((style) => (
                <div
                  key={style.id}
                  className="rounded-2xl border border-foreground/15 bg-card/40 backdrop-blur-md p-6 space-y-4 hover:border-foreground/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-sm font-semibold text-foreground">{style.name}</h3>
                    <span className="text-[10px] font-mono text-muted-foreground border border-foreground/10 px-2 py-0.5 rounded">
                      CSS Class: .{style.fontClass}
                    </span>
                  </div>

                  <p className={`text-2xl sm:text-3xl ${style.fontClass} tracking-wide text-foreground`}>
                    {style.sampleText}
                  </p>

                  <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                    {style.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 3: Live Component Demos in OffBit Font ───────────────────── */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
            <h2 className="text-2xl font-offbit font-semibold tracking-wide flex items-center gap-2">
              <Terminal className="w-5 h-5 text-positive" />
              <span>Interactive Component Applications</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Demo 1: Scrambler Test */}
            <div className="rounded-2xl border border-foreground/15 bg-card/40 backdrop-blur-md p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">01 // OffBit Text Scrambler</span>
                <Button
                  size="sm"
                  onClick={runScrambleTest}
                  disabled={isScrambling}
                  className="bg-foreground text-background font-mono text-xs rounded-full"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isScrambling ? 'animate-spin' : ''}`} />
                  Trigger Scramble
                </Button>
              </div>

              <div className="bg-black p-6 rounded-xl border border-white/10 text-center">
                <span className="font-offbit text-3xl sm:text-4xl text-positive tracking-widest dot-matrix-glow">
                  {scrambleOutput}
                </span>
              </div>
            </div>

            {/* Demo 2: Flashcard Counter / Scoreboard */}
            <div className="rounded-2xl border border-foreground/15 bg-card/40 backdrop-blur-md p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">02 // Digital Study Meter</span>
                <span className="font-offbit text-xs text-positive border border-positive/30 bg-positive/10 px-2.5 py-0.5 rounded-full">
                  LIVE STATUS
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 font-offbit text-center">
                <div className="bg-muted/30 border border-foreground/10 p-3 rounded-xl">
                  <span className="text-2xl text-foreground block">84%</span>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">ACCURACY</span>
                </div>
                <div className="bg-muted/30 border border-foreground/10 p-3 rounded-xl">
                  <span className="text-2xl text-positive block">15/20</span>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">CARDS</span>
                </div>
                <div className="bg-muted/30 border border-foreground/10 p-3 rounded-xl">
                  <span className="text-2xl text-amber-400 block">BitOFF</span>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">STYLE</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: CSS Integration Code Snippet ───────────────────────── */}
        <section className="rounded-2xl border border-foreground/15 bg-card/40 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              CSS Integration Snippet
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={copyCssSnippet}
              className="font-mono text-xs rounded-full"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 mr-1 text-positive" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copiedCode ? 'Copied!' : 'Copy CSS'}
            </Button>
          </div>

          <pre className="bg-black text-green-400 font-mono text-xs p-4 rounded-xl border border-white/10 overflow-x-auto leading-relaxed">
{`/* Import in index.css */
@import url('https://fonts.googleapis.com/css2?family=DotGothic16&family=Silkscreen:wght@400;700&display=swap');

/* Apply OffBit Dot Matrix Font */
.font-offbit {
  font-family: 'DotGothic16', 'JetBrains Mono', monospace;
  letter-spacing: 0.08em;
}`}
          </pre>
        </section>
      </main>
    </div>
  )
}
