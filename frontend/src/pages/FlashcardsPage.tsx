import { useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/button'
import { api } from '@/services/api'
import { Loader2, ChevronLeft, ChevronRight, RotateCcw, Shuffle } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/services/supabaseClient'

interface Flashcard {
  id?: string
  front: string
  back: string
  difficulty?: string
}

interface Deck {
  id?: string
  title: string
  flashcards: Flashcard[]
}

const COUNT_OPTIONS = [5, 10, 20]

export function FlashcardsPage() {
  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(10)
  const [deck, setDeck] = useState<Deck | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [studied, setStudied] = useState<Set<number>>(new Set())

  const generate = async () => {
    if (!topic.trim() || loading) return
    setLoading(true)
    setError(null)
    setCurrent(0)
    setFlipped(false)
    setStudied(new Set())
    try {
      const res = await api.flashcards(topic, count)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setDeck(data)
      toast.success('Flashcard deck generated!')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
      toast.error('Failed to generate flashcards.')
    } finally {
      setLoading(false)
    }
  }

  const goTo = (idx: number) => {
    setFlipped(false)
    setTimeout(() => setCurrent(idx), 200)
  }

  const prev = () => current > 0 && goTo(current - 1)
  const next = () => deck && current < deck.flashcards.length - 1 && goTo(current + 1)

  const markStudied = async () => {
    const nextSet = new Set(studied)
    nextSet.add(current)
    setStudied(nextSet)
    
    // Write difficulty to Supabase
    if (deck?.flashcards[current]?.id) {
      try {
        await supabase
          .from('flashcards')
          .update({ difficulty: 'easy' })
          .eq('id', deck.flashcards[current].id)
      } catch (err) {
        console.error('Error updating flashcard status:', err)
      }
    }

    if (deck && current < deck.flashcards.length - 1) goTo(current + 1)
  }


  const shuffle = () => {
    if (!deck) return
    const shuffled = [...deck.flashcards].sort(() => Math.random() - 0.5)
    setDeck({ ...deck, flashcards: shuffled })
    setCurrent(0)
    setFlipped(false)
    setStudied(new Set())
  }

  const progress = deck ? (studied.size / deck.flashcards.length) * 100 : 0

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
            <span className="w-8 h-px bg-foreground/30" />
            Flashcard Decks
          </span>
          <h1 className="text-4xl font-display tracking-tight">Study with Flashcards</h1>
          <p className="text-muted-foreground font-mono text-sm mt-2">
            Click a card to flip. Mark cards as studied to track progress.
          </p>
        </div>

        {/* Form */}
        {!deck && (
          <div className="border border-foreground/10 p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Topic</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generate()}
                placeholder="e.g. Human Anatomy, React Hooks, Spanish Vocabulary…"
                className="w-full h-11 bg-input px-4 text-sm font-mono border border-border focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Cards</label>
              <div className="flex gap-2">
                {COUNT_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={`px-5 py-1.5 text-xs font-mono border transition-colors ${
                      count === n
                        ? 'bg-foreground text-background border-foreground'
                        : 'border-foreground/20 text-muted-foreground hover:text-foreground hover:border-foreground/40'
                    }`}
                  >
                    {n}
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
              onClick={generate}
              disabled={!topic.trim() || loading}
              className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 rounded-none"
            >
              {loading ? (
                <span className="flex items-center gap-2 font-mono text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating cards…
                </span>
              ) : (
                'Generate Flashcards'
              )}
            </Button>
          </div>
        )}

        {/* Deck */}
        {deck && (
          <div className="space-y-6">
            {/* Stats row */}
            <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
              <span>{deck.title}</span>
              <div className="flex items-center gap-4">
                <span>{studied.size}/{deck.flashcards.length} studied</span>
                <button onClick={shuffle} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <Shuffle className="w-3.5 h-3.5" />
                  Shuffle
                </button>
                <button
                  onClick={() => { setDeck(null); setTopic('') }}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  New deck
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-px bg-foreground/10 relative">
              <div
                className="absolute left-0 top-0 h-full bg-foreground transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Card counter */}
            <div className="text-center font-mono text-xs text-muted-foreground">
              {current + 1} / {deck.flashcards.length}
            </div>

            {/* Flip card */}
            <div
              className="cursor-pointer select-none"
              onClick={() => setFlipped((f) => !f)}
              style={{ perspective: '1200px' }}
            >
              <div
                style={{
                  height: '300px',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  position: 'relative',
                }}
              >
                {/* Front */}
                <div
                  className={`absolute inset-0 border flex flex-col items-center justify-center p-8 text-center bg-background ${
                    studied.has(current) ? 'border-positive/30' : 'border-foreground/10'
                  }`}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className="text-xs font-mono text-muted-foreground mb-5 uppercase tracking-wider">
                    Question
                  </span>
                  <p className="text-xl font-display leading-relaxed">{deck.flashcards[current].front}</p>
                  <span className="text-xs font-mono text-muted-foreground/50 mt-6 absolute bottom-5">
                    tap to flip
                  </span>
                </div>
                {/* Back */}
                <div
                  className="absolute inset-0 border border-foreground/20 bg-foreground flex flex-col items-center justify-center p-8 text-center"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <span className="text-xs font-mono text-background/60 mb-5 uppercase tracking-wider">
                    Answer
                  </span>
                  <p className="text-xl font-display leading-relaxed text-background">
                    {deck.flashcards[current].back}
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={prev}
                disabled={current === 0}
                className="h-11 px-4 rounded-none border-foreground/20"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={markStudied}
                disabled={studied.has(current)}
                className={`flex-1 h-11 rounded-none text-sm font-mono ${
                  studied.has(current)
                    ? 'bg-foreground/10 text-muted-foreground cursor-not-allowed'
                    : 'bg-foreground text-background hover:bg-foreground/90'
                }`}
              >
                {studied.has(current) ? '✓ Studied' : 'Mark as Studied'}
              </Button>
              <Button
                variant="outline"
                onClick={next}
                disabled={current === deck.flashcards.length - 1}
                className="h-11 px-4 rounded-none border-foreground/20"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-1 flex-wrap">
              {deck.flashcards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-1 flex-1 min-w-4 transition-all duration-200 ${
                    i === current
                      ? 'bg-foreground'
                      : studied.has(i)
                      ? 'bg-foreground/30'
                      : 'bg-foreground/10'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
