const testimonials = [
  {
    quote: 'Generated a full week of revision notes in 10 minutes. I actually feel prepared now.',
    name: 'Amara K.',
    detail: 'A-Level Biology, Grade A',
  },
  {
    quote: 'The AI Tutor explains things better than my teacher. No offence.',
    name: 'Liam T.',
    detail: 'GCSE Physics',
  },
  {
    quote: 'Flashcards that actually know which ones I keep getting wrong. Game changer.',
    name: 'Sofia R.',
    detail: 'Uni — Organic Chemistry',
  },
  {
    quote: 'Uploaded 40 pages of lecture slides. Got a concise summary in 30 seconds.',
    name: 'Dev M.',
    detail: 'MSc Data Science',
  },
  {
    quote: 'The study planner built me a schedule around my part-time job. I was shocked.',
    name: 'Priya N.',
    detail: 'A-Levels, 3 subjects',
  },
  {
    quote: 'Took 8 practice quizzes on electrochemistry. Went from 40% to 85% in a week.',
    name: 'Carlos B.',
    detail: 'IB Chemistry HL',
  },
]

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div className="shrink-0 w-80 border border-foreground/10 p-8 flex flex-col gap-6">
      <p className="text-lg leading-relaxed text-foreground/80">&ldquo;{t.quote}&rdquo;</p>
      <div>
        <p className="font-medium text-sm">{t.name}</p>
        <p className="font-mono text-xs text-muted-foreground mt-1">{t.detail}</p>
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 mb-16">
        <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
          <span className="w-8 h-px bg-foreground/30" />
          Students
        </span>
        <h2 className="text-4xl lg:text-6xl font-display tracking-tight">
          Real results.
          <br />
          <span className="text-muted-foreground">Real students.</span>
        </h2>
      </div>

      {/* Marquee row 1 */}
      <div className="relative overflow-hidden mb-6">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        <div className="flex gap-6 marquee">
          {[...testimonials, ...testimonials].map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </div>
      </div>

      {/* Marquee row 2 — reversed */}
      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        <div className="flex gap-6 marquee-reverse">
          {[...testimonials.slice().reverse(), ...testimonials.slice().reverse()].map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </div>
      </div>
    </section>
  )
}
