import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

import { VoiceControls } from '@/components/ui/VoiceControls'
import { DownloadDropdown } from '@/components/ui/DownloadDropdown'
import { KineticGrid } from '@/components/ui/KineticGrid'
import { GlowingSearchDock } from '@/components/ui/GlowingSearchDock'

import { syncUserData } from '@/services/firebaseClient'
import { ArrowLeft, Sparkles, AlertCircle, CheckCircle, RefreshCw, ChevronLeft, ChevronRight, CircleHelp, Layers, Search } from 'lucide-react'

interface Question {
  question: string
  options: string[]
  answer: string
  explanation: string
}

interface Flashcard {
  front: string
  back: string
}

export function QuizPage() {
  const { session, user } = useAuth()
  const [activeTab, setActiveTab] = useState<'quiz' | 'flashcards'>('quiz')
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)


  // Quiz states
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)

  // Flashcards states
  const [cards, setCards] = useState<Flashcard[] | null>(null)
  const [currentCardIdx, setCurrentCardIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const handleGenerateQuiz = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!topic.trim() || loading) return

    setLoading(true)
    setQuestions(null)
    setCurrentQuizIdx(0)
    setSelectedOption(null)
    setIsAnswered(false)
    setScore(0)
    setQuizFinished(false)

    try {
      const rawApiUrl = (import.meta.env.VITE_API_URL as string) || ''
      const apiUrl = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl
      const response = await fetch(`${apiUrl}/api/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || 'mock-token'}`
        },
        body: JSON.stringify({ topic, difficulty })
      })

      if (!response.ok) throw new Error('API failure')

      const data = await response.json()
      setQuestions(data.questions)
    } catch (err) {
      console.error(err)
      setQuestions([
        {
          question: 'What is the primary product of photosynthesis?',
          options: ['Glucose', 'Oxygen', 'Carbon Dioxide', 'Water'],
          answer: 'Glucose',
          explanation: 'Glucose is the carbohydrate synthesized by plants to store energy.'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateFlashcards = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!topic.trim() || loading) return

    setLoading(true)
    setCards(null)
    setCurrentCardIdx(0)
    setFlipped(false)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || ''
      const response = await fetch(`${apiUrl}/api/flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || 'mock-token'}`
        },
        body: JSON.stringify({ topic })
      })

      if (!response.ok) throw new Error('API failure')

      const data = await response.json()
      setCards(data.cards)
      if (user?.id) {
        syncUserData(user.id, 'flashcards', { topic, cards: data.cards })
      }
    } catch (err) {
      console.error(err)
      setCards([
        {
          front: 'Mitosis',
          back: 'A type of cell division that results in two daughter cells each having the same number and kind of chromosomes as the parent nucleus.'
        },
        {
          front: 'Prophase',
          back: 'The first stage of cell division, during which the chromosomes become visible as paired chromatids and the nuclear envelope disappears.'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleOptionClick = (option: string) => {
    if (isAnswered) return
    setSelectedOption(option)
  }

  const handleSubmitAnswer = () => {
    if (!selectedOption || isAnswered) return
    setIsAnswered(true)
    const isCorrect = selectedOption.trim() === questions![currentQuizIdx].answer.trim()
    if (isCorrect) setScore((prev) => prev + 1)
  }

  const handleNextQuestion = () => {
    if (currentQuizIdx + 1 < questions!.length) {
      setCurrentQuizIdx((prev) => prev + 1)
      setSelectedOption(null)
      setIsAnswered(false)
    } else {
      setQuizFinished(true)
    }
  }

  const resetAll = () => {
    setQuestions(null)
    setCards(null)
    setTopic('')
    setDifficulty('medium')
  }

  const handlePrevCard = () => {
    if (currentCardIdx > 0) {
      setFlipped(false)
      setTimeout(() => setCurrentCardIdx((prev) => prev - 1), 150)
    }
  }

  const handleNextCard = () => {
    if (cards && currentCardIdx < cards.length - 1) {
      setFlipped(false)
      setTimeout(() => setCurrentCardIdx((prev) => prev + 1), 150)
    }
  }

  const hasGeneratedContent = (activeTab === 'quiz' && questions) || (activeTab === 'flashcards' && cards)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative overflow-x-hidden selection:bg-positive/20">
      <style>{`
        .card-perspective { perspective: 1000px; }
        .card-inner { transform-style: preserve-3d; transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1); }
        .card-flipped { transform: rotateY(180deg); }
        .card-face { backface-visibility: hidden; position: absolute; width: 100%; height: 100%; top: 0; left: 0; }
        .card-back { transform: rotateY(180deg); }
      `}</style>

      {/* Kinetic Warp Grid Background */}
      <KineticGrid globalColor="monochrome" />

      {/* Header Bar */}
      <header className="sticky top-0 z-30 w-full border-b border-foreground/10 bg-background/80 backdrop-blur-xl px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <span className="text-foreground/20 hidden sm:inline">|</span>
          <span className="text-xs font-offbit font-semibold tracking-wider uppercase flex items-center gap-2">
            <CircleHelp className="w-3.5 h-3.5 text-positive" />
            Quizzes & Flashcards
          </span>
        </div>

        <div className="flex items-center gap-3">
          {hasGeneratedContent && (
            <Button
              onClick={resetAll}
              variant="outline"
              size="sm"
              className="rounded-full px-4 font-mono text-xs gap-1.5 border-foreground/15"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              New Topic
            </Button>
          )}
        </div>
      </header>

      {/* Main Centered Middle Canvas */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-between relative z-10">

        {/* ─── INITIAL IDLE STATE: CENTERED SEARCH DASHBOARD ─── */}
        {!hasGeneratedContent && !loading && (
          <div className="w-full max-w-2xl mx-auto my-auto space-y-8 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-positive/20 bg-positive/10 text-positive text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                ACTIVE KNOWLEDGE DRILLS
              </span>
              <h1 className="text-4xl sm:text-5xl font-display tracking-tight leading-tight font-medium">
                Test your knowledge with AI Quizzes & 3D Flashcards
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground font-sans max-w-md mx-auto leading-relaxed">
                Auto-generate multiple-choice evaluation drills or double-sided flashcard decks on any concept.
              </p>
            </div>

            {/* Mode Switcher Pill */}
            <div className="inline-flex p-1 bg-card/60 border border-foreground/15 rounded-full backdrop-blur-md font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('quiz')}
                className={`px-5 py-2 rounded-full flex items-center gap-2 transition-all ${
                  activeTab === 'quiz'
                    ? 'bg-foreground text-background font-semibold shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <CircleHelp className="w-3.5 h-3.5" />
                Quiz Generator
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('flashcards')}
                className={`px-5 py-2 rounded-full flex items-center gap-2 transition-all ${
                  activeTab === 'flashcards'
                    ? 'bg-foreground text-background font-semibold shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                3D Flashcard Deck
              </button>
            </div>

            {/* Glowing Search Dock */}
            <GlowingSearchDock
              value={topic}
              onChange={setTopic}
              onSubmit={(e) => activeTab === 'quiz' ? handleGenerateQuiz(e) : handleGenerateFlashcards(e)}
              placeholder="Enter topic for drill or flashcard deck..."
              loading={loading}
              isInitialState={true}
              isExpanded={isSearchExpanded}
              onExpandChange={setIsSearchExpanded}
            />

            {activeTab === 'quiz' && (
              <div className="flex items-center justify-center gap-2 pt-2 font-mono text-xs">
                <span className="text-[#A6A49C] mr-1">Difficulty:</span>
                {['easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`px-3 py-1 rounded-full border uppercase tracking-wider transition-all ${
                      difficulty === level
                        ? 'border-white bg-white/20 text-white font-semibold shadow-sm'
                        : 'border-white/10 hover:border-white/30 text-[#A6A49C]'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            )}


          </div>
        )}

        {/* ─── LOADING STATE ─── */}
        {loading && (
          <div className="w-full max-w-lg mx-auto my-auto p-10 border border-foreground/15 rounded-3xl bg-card/60 backdrop-blur-2xl text-center space-y-6 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-positive/10 text-positive flex items-center justify-center mx-auto animate-spin">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-medium">
                {activeTab === 'quiz' ? 'Formulating Quiz Questions' : 'Drafting Flashcards'}
              </h3>
              <p className="text-xs font-mono text-muted-foreground">
                Checking distractor options and key conceptual definitions...
              </p>
            </div>
          </div>
        )}

        {/* ─── ACTIVE QUIZ / FLASHCARDS BOARD (CENTERED AND ABOVE) ─── */}
        {hasGeneratedContent && !loading && (
          <div className="w-full space-y-6 animate-in fade-in duration-500">
            {/* Top Status Pill */}
            <div className="p-4 rounded-2xl border border-foreground/10 bg-card/80 backdrop-blur-xl flex items-center justify-between flex-wrap gap-3 shadow-sm">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-positive animate-pulse" />
                <span className="font-semibold text-foreground uppercase tracking-wider">{topic}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground hidden sm:inline">
                  {activeTab === 'quiz' && questions && !quizFinished && (
                    `QUESTION ${currentQuizIdx + 1} OF ${questions.length}`
                  )}
                  {activeTab === 'flashcards' && cards && (
                    `CARD ${currentCardIdx + 1} OF ${cards.length}`
                  )}
                </span>
                <DownloadDropdown
                  title={`${topic} ${activeTab === 'quiz' ? 'Quiz' : 'Flashcards'}`}
                  content={activeTab === 'quiz' ? (questions || []) : (cards || [])}
                  filenamePrefix={activeTab === 'quiz' ? 'quiz' : 'flashcards'}
                />
              </div>
            </div>

            {/* QUIZ BOARD */}
            {activeTab === 'quiz' && questions && (
              <div className="p-6 sm:p-10 border border-foreground/15 rounded-3xl bg-card/70 backdrop-blur-2xl shadow-xl space-y-6">
                {quizFinished ? (
                  <div className="text-center space-y-6 py-6">
                    <h2 className="text-3xl font-silkscreen tracking-tight">Evaluation Complete</h2>
                    <div className="p-8 border border-foreground/10 bg-card/40 rounded-2xl max-w-sm mx-auto">
                      <p className="text-xs font-offbit text-muted-foreground uppercase tracking-widest mb-2 font-bold">SCORE ACHIEVED</p>
                      <p className="text-4xl font-silkscreen text-positive">
                        {score} <span className="text-base font-mono text-muted-foreground/60">/ {questions.length}</span>
                      </p>
                      <p className="text-xs font-offbit text-positive mt-3 font-semibold">
                        {score === questions.length ? '🌟 Perfect Score! Excellent mastery.' : 'Great effort! Review topics and drill again.'}
                      </p>
                    </div>
                    <Button
                      onClick={resetAll}
                      className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 h-12 font-mono text-xs"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Another Topic
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <span className="text-xs font-offbit text-muted-foreground uppercase tracking-wider block font-bold">
                        Question {currentQuizIdx + 1} of {questions.length}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-display leading-tight text-foreground font-medium">
                        {questions[currentQuizIdx].question}
                      </h3>
                    </div>

                    <div className="space-y-3 pt-2">
                      {questions[currentQuizIdx].options.map((option) => {
                        const isSelected = selectedOption === option
                        const isCorrectAnswer = option.trim() === questions[currentQuizIdx].answer.trim()

                        let optionStyle = 'border-foreground/15 hover:border-foreground/40 bg-card/40'
                        if (isSelected && !isAnswered) {
                          optionStyle = 'border-foreground bg-foreground/10 font-semibold'
                        } else if (isAnswered) {
                          if (isCorrectAnswer) {
                            optionStyle = 'border-positive text-positive bg-positive/10 font-semibold'
                          } else if (isSelected) {
                            optionStyle = 'border-destructive text-destructive bg-destructive/10 font-semibold'
                          } else {
                            optionStyle = 'border-foreground/10 opacity-40 bg-transparent'
                          }
                        }

                        return (
                          <button
                            key={option}
                            onClick={() => handleOptionClick(option)}
                            className={`w-full text-left p-4 sm:p-5 text-sm sm:text-base font-sans border rounded-2xl transition-all flex items-center justify-between ${optionStyle}`}
                            disabled={isAnswered}
                          >
                            <span>{option}</span>
                            {isAnswered && isCorrectAnswer && <CheckCircle className="w-5 h-5 text-positive shrink-0" />}
                            {isAnswered && isSelected && !isCorrectAnswer && <AlertCircle className="w-5 h-5 text-destructive shrink-0" />}
                          </button>
                        )
                      })}
                    </div>

                    {isAnswered && (
                      <div className="p-5 border border-foreground/10 bg-muted/20 rounded-2xl space-y-2 animate-in fade-in">
                        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest block">
                          Explanation
                        </span>
                        <p className="text-xs sm:text-sm leading-relaxed font-sans text-muted-foreground">
                          {questions[currentQuizIdx].explanation}
                        </p>
                      </div>
                    )}

                    <div className="pt-4 flex justify-end">
                      {!isAnswered ? (
                        <Button
                          onClick={handleSubmitAnswer}
                          disabled={!selectedOption}
                          className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90 rounded-full font-mono text-xs uppercase tracking-wider font-semibold disabled:opacity-40"
                        >
                          Submit Answer
                        </Button>
                      ) : (
                        <Button
                          onClick={handleNextQuestion}
                          className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90 rounded-full font-mono text-xs uppercase tracking-wider font-semibold"
                        >
                          {currentQuizIdx + 1 === questions.length ? 'Finish Evaluation' : 'Next Question →'}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FLASHCARDS BOARD */}
            {activeTab === 'flashcards' && cards && (
              <div className="w-full max-w-lg mx-auto space-y-6">
                <div
                  onClick={() => setFlipped(!flipped)}
                  className="w-full h-72 sm:h-96 card-perspective cursor-pointer select-none"
                >
                  <div className={`w-full h-full card-inner relative border border-foreground/15 rounded-3xl shadow-xl bg-card/80 backdrop-blur-2xl ${flipped ? 'card-flipped' : ''}`}>
                    <div className="card-face card-front p-8 flex flex-col items-center justify-center text-center bg-card/90 rounded-3xl">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest absolute top-6">
                        CONCEPT / QUESTION
                      </span>
                      <h2 className="text-3xl sm:text-4xl font-display text-foreground leading-snug px-4 font-medium">
                        {cards[currentCardIdx].front}
                      </h2>
                      <span className="text-xs font-offbit text-positive absolute bottom-6 bg-positive/10 border border-positive/20 px-3 py-1 rounded-full font-semibold">
                        Click card to flip ↺
                      </span>
                    </div>

                    <div className="card-face card-back p-8 flex flex-col items-center justify-center text-center bg-muted/40 rounded-3xl">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest absolute top-6">
                        EXPLANATION / ANSWER
                      </span>
                      <p className="text-sm sm:text-base font-sans text-muted-foreground leading-relaxed px-4 max-h-[200px] overflow-y-auto">
                        {cards[currentCardIdx].back}
                      </p>
                      <span className="text-[10px] font-mono text-muted-foreground absolute bottom-6">
                        Click card to show front ↺
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-2">
                  <button
                    onClick={handlePrevCard}
                    disabled={currentCardIdx === 0}
                    className="p-3 border border-foreground/15 hover:border-foreground/40 rounded-full disabled:opacity-30 transition-all bg-card/60"
                    aria-label="Previous card"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => setFlipped(!flipped)}
                      variant="outline"
                      className="rounded-full px-5 h-11 border-foreground/15 font-mono text-xs"
                    >
                      Flip Card ↺
                    </Button>
                  </div>

                  <button
                    onClick={handleNextCard}
                    disabled={currentCardIdx === cards.length - 1}
                    className="p-3 border border-foreground/15 hover:border-foreground/40 rounded-full disabled:opacity-30 transition-all bg-card/60"
                    aria-label="Next card"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* ─── DOCKED BOTTOM SEARCH BAR FOR FOLLOW-UP DRILLS ─── */}
            <div className="sticky bottom-4 z-20 w-full max-w-2xl mx-auto pt-4">
              <form
                onSubmit={activeTab === 'quiz' ? handleGenerateQuiz : handleGenerateFlashcards}
                className="flex items-center gap-2 p-2 bg-background/90 backdrop-blur-2xl border border-foreground/20 rounded-full shadow-2xl focus-within:border-positive/60"
              >
                <Search className="w-4 h-4 ml-3 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={`Generate another ${activeTab === 'quiz' ? 'quiz' : 'flashcard deck'}...`}
                  className="flex-1 h-10 bg-transparent px-2 text-sm font-sans border-none focus:outline-none text-foreground"
                />
                <VoiceControls
                  onSpeechResult={(transcript) => setTopic(transcript)}
                  size="sm"
                />
                <Button
                  type="submit"
                  disabled={!topic.trim()}
                  className="h-10 px-5 bg-foreground text-background hover:bg-foreground/90 rounded-full font-mono text-xs font-semibold shrink-0"
                >
                  Generate
                </Button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
