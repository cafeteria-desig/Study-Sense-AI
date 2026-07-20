import { useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/button'
import { api } from '@/services/api'
import { Loader2, CalendarCheck, Check, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/services/supabaseClient'

interface PlanItem {
  date: string
  topic: string
  duration_mins: number
  done: boolean
}

interface Plan {
  id?: string
  title: string
  examDate: string
  schedule: PlanItem[]
}

export function PlannerPage() {
  const [subject, setSubject] = useState('')
  const [examDate, setExamDate] = useState('')
  const [dailyHours, setDailyHours] = useState(2)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [done, setDone] = useState<boolean[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const generate = async () => {
    if (!subject.trim() || !examDate || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.planner(subject, examDate, dailyHours)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPlan(data)
      setDone(new Array(data.schedule.length).fill(false))
      toast.success('Study plan generated successfully!')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
      toast.error('Failed to generate study plan.')
    } finally {
      setLoading(false)
    }
  }

  const toggle = async (i: number) => {
    const next = [...done]
    next[i] = !next[i]
    setDone(next)

    if (plan?.id) {
      const updatedSchedule = plan.schedule.map((item, idx) => ({
        ...item,
        done: idx === i ? next[idx] : item.done
      }))
      
      try {
        await supabase
          .from('study_plans')
          .update({ schedule: updatedSchedule })
          .eq('id', plan.id)
      } catch (err) {
        console.error('Error saving study plan progress:', err)
      }
    }
  }

  const completedCount = done.filter(Boolean).length
  const progress = done.length > 0 ? (completedCount / done.length) * 100 : 0

  const daysLeft = plan
    ? Math.ceil((new Date(plan.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null


  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Header */}
        <div className="mb-10">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
            <span className="w-8 h-px bg-foreground/30" />
            Study Planner
          </span>
          <h1 className="text-4xl font-display tracking-tight">AI Revision Schedule</h1>
          <p className="text-muted-foreground font-mono text-sm mt-2">
            Get a personalised day-by-day study plan tailored to your exam.
          </p>
        </div>

        {/* Form */}
        {!plan && (
          <div className="border border-foreground/10 p-4 md:p-6 space-y-5 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Subject</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Mathematics, History…"
                  className="w-full h-11 bg-input px-4 text-sm font-mono border border-border focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  min={today}
                  className="w-full h-11 bg-input px-4 text-sm font-mono border border-border focus:border-foreground focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Daily Study Hours
                </label>
                <span className="font-mono text-sm font-medium">{dailyHours}h / day</span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                step={0.5}
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full accent-foreground h-1"
              />
              <div className="flex justify-between text-xs font-mono text-muted-foreground">
                <span>1h</span>
                <span>8h</span>
              </div>
            </div>

            {error && (
              <p className="text-sm font-mono text-destructive bg-destructive/5 border border-destructive/20 px-4 py-3">
                {error}
              </p>
            )}

            <Button
              onClick={generate}
              disabled={!subject.trim() || !examDate || loading}
              className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 rounded-none"
            >
              {loading ? (
                <span className="flex items-center gap-2 font-mono text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Building your plan…
                </span>
              ) : (
                'Generate Study Plan'
              )}
            </Button>
          </div>
        )}

        {/* Plan */}
        {plan && (
          <div className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="border border-foreground/10 p-3 md:p-4 text-center">
                <p className="font-display text-2xl">{completedCount}</p>
                <p className="font-mono text-xs text-muted-foreground mt-1">Sessions done</p>
              </div>
              <div className="border border-foreground/10 p-3 md:p-4 text-center">
                <p className="font-display text-2xl">{plan.schedule.length - completedCount}</p>
                <p className="font-mono text-xs text-muted-foreground mt-1">Remaining</p>
              </div>
              <div className="border border-foreground/10 p-3 md:p-4 text-center">
                <p className={`font-display text-2xl ${daysLeft !== null && daysLeft <= 3 ? 'text-destructive' : ''}`}>
                  {daysLeft !== null ? (daysLeft <= 0 ? '!' : daysLeft) : '—'}
                </p>
                <p className="font-mono text-xs text-muted-foreground mt-1">Days left</p>
              </div>
            </div>

            {/* Progress */}
            <div className="border border-foreground/10 p-3 md:p-4">
              <div className="flex justify-between font-mono text-xs text-muted-foreground mb-2">
                <span>{plan.title}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <div className="h-1.5 bg-foreground/10">
                <div
                  className="h-full bg-foreground transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Schedule list */}
            <div className="border border-foreground/10">
              <div className="px-4 md:px-5 py-3 border-b border-foreground/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Schedule</span>
                </div>
                <button
                  onClick={() => { setPlan(null); setDone([]) }}
                  className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  New plan
                </button>
              </div>
              <div className="divide-y divide-foreground/10">
                {plan.schedule.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 transition-opacity ${done[i] ? 'opacity-40' : ''}`}
                  >
                    <button
                      onClick={() => toggle(i)}
                      className={`w-5 h-5 border flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                        done[i]
                          ? 'border-foreground bg-foreground'
                          : 'border-foreground/30 hover:border-foreground'
                      }`}
                    >
                      {done[i] && <Check className="w-3 h-3 text-background" strokeWidth={2.5} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-mono ${
                          done[i] ? 'line-through text-muted-foreground' : 'text-foreground'
                        }`}
                      >
                        {item.topic}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs font-mono text-muted-foreground">
                        {new Date(item.date + 'T12:00:00').toLocaleDateString('en', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground/60">{item.duration_mins} min</p>
                    </div>
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
