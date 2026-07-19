import { useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/button'
import { api } from '@/services/api'
import { Check, X, Loader2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/services/supabaseClient'

interface Question {
  question: string
  options: string[]
  correct: number
  explanation: string
}

interface Quiz {
  id?: string
  title: string
  questions: Question[]
}

const COUNT_OPTIONS = [5, 10, 15]

export function QuizPage() {
  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(5)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [selected, setSelected] = useState<(number | null)[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    if (!topic.trim() || loading) return
    setLoading(true)
    setError(null)
    setSubmitted(false)
    setQuiz(null)
    try {
      const res = await api.quiz(topic, count)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setQuiz(data)
      setSelected(new Array(data.questions.length).fill(null))
      toast.success('Quiz generated successfully!')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
      toast.error('Failed to generate quiz.')
    } finally {
      setLoading(false)
    }
  }

  const score = quiz && submitted
    ? quiz.questions.filter((q, i) => selected[i] === q.correct).length
    : null

  const pct = score !== null && quiz ? Math.round((score / quiz.questions.length) * 100) : 0

  const submitQuiz = async () => {
    setSubmitted(true)
    const finalScore = quiz ? quiz.questions.filter((q, i) => selected[i] === q.correct).length : 0
    const finalPct = quiz ? Math.round((finalScore / quiz.questions.length) * 100) : 0
    
    if (quiz?.id) {
      try {
        await supabase
          .from('quizzes')
          .update({
            score: finalPct,
            attempted_at: new Date().toISOString()
          })
          .eq('id', quiz.id)
        toast.success(`Quiz submitted! Score: ${finalPct}%`)
      } catch (err: any) {
        console.error('Error saving score:', err)
        toast.error('Score could not be saved to your profile.')
      }
    }
  }


  const reset = () => {
    setQuiz(null)
    setSubmitted(false)
    setSelected([])
    setTopic('')
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
            <span className="w-8 h-px bg-foreground/30" />
            Quiz Generator
          </span>
          <h1 className="text-4xl font-display tracking-tight">Generate a Quiz</h1>
          <p className="text-muted-foreground font-mono text-sm mt-2">Auto-generate MCQ quizzes and test your understanding.</p>
        </div>

        {/* Form */}
        {!quiz && (
          <div className="border border-foreground/10 p-6 space-y-5 mb-8">
            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Topic</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generate()}
                placeholder="e.g. The French Revolution, Organic Chemistry, Python…"
                className="w-full h-11 bg-input px-4 text-sm font-mono border border-border focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Number of Questions
              </label>
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
                  Generating quiz…
                </span>
              ) : (
                'Generate Quiz'
              )}
            </Button>
          </div>
        )}

        {/* Quiz */}
        {quiz && (
          <div className="space-y-6">
            {/* Score banner */}
            {score !== null && (
              <div
                className={`p-5 border ${
                  pct >= 70
                    ? 'border-positive/30 bg-positive/5'
                    : 'border-destructive/30 bg-destructive/5'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-sm font-medium">
                    {score}/{quiz.questions.length} correct — {pct}%
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {pct >= 70 ? '🎉 Great job!' : '📚 Keep studying!'}
                  </span>
                </div>
                <div className="h-1.5 bg-foreground/10">
                  <div
                    className={`h-full transition-all duration-700 ${pct >= 70 ? 'bg-positive' : 'bg-destructive'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Questions */}
            {quiz.questions.map((q, i) => (
              <div key={i} className="border border-foreground/10 p-6">
                <div className="flex items-start gap-3 mb-5">
                  <span className="font-mono text-xs text-muted-foreground flex-shrink-0 mt-0.5">
                    Q{i + 1}.
                  </span>
                  <p className="font-mono text-sm font-medium leading-relaxed">{q.question}</p>
                </div>
                <div className="space-y-2 pl-6">
                  {q.options.map((opt, j) => {
                    const isSelected = selected[i] === j
                    const isCorrect = q.correct === j
                    let cls =
                      'w-full text-left px-4 py-2.5 text-sm font-mono border transition-all duration-200 flex items-center gap-3 '
                    if (submitted) {
                      if (isCorrect) cls += 'border-positive/50 bg-positive/10'
                      else if (isSelected) cls += 'border-destructive/50 bg-destructive/10'
                      else cls += 'border-foreground/10 text-muted-foreground'
                    } else {
                      cls += isSelected
                        ? 'border-foreground bg-foreground/5 text-foreground'
                        : 'border-foreground/15 hover:border-foreground/40 hover:bg-foreground/3 text-foreground'
                    }
                    return (
                      <button
                        key={j}
                        disabled={submitted}
                        onClick={() => {
                          const next = [...selected]
                          next[i] = j
                          setSelected(next)
                        }}
                        className={cls}
                      >
                        {submitted && isCorrect && (
                          <Check className="w-3.5 h-3.5 text-positive flex-shrink-0" />
                        )}
                        {submitted && isSelected && !isCorrect && (
                          <X className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                        )}
                        {(!submitted || (!isCorrect && !isSelected)) && (
                          <span className="w-3.5 h-3.5 flex-shrink-0" />
                        )}
                        {opt}
                      </button>
                    )
                  })}
                </div>
                {submitted && (
                  <div className="mt-4 pl-6 pt-4 border-t border-foreground/10">
                    <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                      <span className="text-foreground font-medium">Explanation: </span>
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {!submitted ? (
              <Button
                onClick={submitQuiz}
                disabled={selected.some((s) => s === null)}
                className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 rounded-none"
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={reset}
                className="w-full h-11 rounded-none border-foreground/20 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Try Another Quiz
              </Button>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
