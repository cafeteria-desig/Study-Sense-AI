import { useEffect, useRef, useState } from 'react'

const steps = [
  {
    number: 'I',
    title: 'Enter your topic or upload a file',
    description:
      'Type a subject, paste a textbook section, or upload a PDF. StudySense accepts anything you throw at it.',
    preview: `// StudySense detects your content
studysense.ingest({
  topic: "Photosynthesis",
  level: "A-Level Biology",
  exam_date: "2025-06-12"
})
// → Content parsed in 0.3s`,
  },
  {
    number: 'II',
    title: 'AI generates your study material',
    description:
      'In seconds, receive structured notes, a quiz, flashcard deck, and an exam-ready revision schedule.',
    preview: `// Materials generated
{
  notes: { sections: 6, words: 1240 },
  quiz:  { questions: 10, types: "MCQ" },
  cards: { count: 24 },
  plan:  { days: 14, tasks: 42 }
}`,
  },
  {
    number: 'III',
    title: 'Learn, quiz, track, repeat',
    description:
      'Work through your material with the AI Tutor by your side. Track mastery, reshuffle weak cards, retake quizzes.',
    preview: `// Your progress
studysense.progress("photosynthesis")
// → {
//   mastery: "74%",
//   streak: "3 days",
//   next_review: "tomorrow"
// }`,
  },
]

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-foreground text-background overflow-hidden"
    >
      {/* Diagonal noise pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-45deg, transparent, transparent 40px, currentColor 40px, currentColor 41px)',
        }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-background/50 mb-6">
            <span className="w-8 h-px bg-background/30" />
            Process
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Three steps.
            <br />
            <span className="text-background/50">Your exam sorted.</span>
          </h2>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Steps */}
          <div className="space-y-0">
            {steps.map((step, index) => (
              <button
                key={step.number}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`w-full text-left py-8 border-b border-background/10 transition-all duration-500 group ${
                  activeStep === index ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                }`}
              >
                <div className="flex items-start gap-6">
                  <span className="font-display text-3xl text-background/30">{step.number}</span>
                  <div className="flex-1">
                    <h3 className="text-2xl lg:text-3xl font-display mb-3 group-hover:translate-x-2 transition-transform duration-300">
                      {step.title}
                    </h3>
                    <p className="text-background/60 leading-relaxed">{step.description}</p>
                    {activeStep === index && (
                      <div className="mt-4 h-px bg-background/20 overflow-hidden">
                        <div
                          className="h-full bg-background"
                          style={{ animation: 'progress-bar 5s linear forwards' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Code preview */}
          <div className="lg:sticky lg:top-32 self-start">
            <div className="border border-background/10 overflow-hidden">
              {/* Window chrome */}
              <div className="px-6 py-4 border-b border-background/10 flex items-center justify-between">
                <div className="flex gap-2">
                  {[1, 2, 3].map((d) => (
                    <div key={d} className="w-3 h-3 rounded-full bg-background/20" />
                  ))}
                </div>
                <span className="text-xs font-mono text-background/40">studysense.ts</span>
              </div>

              {/* Code */}
              <div className="p-8 font-mono text-sm min-h-[280px]">
                <pre className="text-background/70 overflow-x-auto">
                  {steps[activeStep].preview.split('\n').map((line, lineIndex) => (
                    <div
                      key={`${activeStep}-${lineIndex}`}
                      className="leading-loose code-line-reveal"
                      style={{ animationDelay: `${lineIndex * 80}ms` }}
                    >
                      <span className="text-background/20 select-none w-8 inline-block">
                        {lineIndex + 1}
                      </span>
                      <span className="inline-flex flex-wrap">
                        {line.split('').map((char, charIndex) => (
                          <span
                            key={`${activeStep}-${lineIndex}-${charIndex}`}
                            className="code-char-reveal"
                            style={{ animationDelay: `${lineIndex * 80 + charIndex * 12}ms` }}
                          >
                            {char === ' ' ? '\u00A0' : char}
                          </span>
                        ))}
                      </span>
                    </div>
                  ))}
                </pre>
              </div>

              {/* Status bar */}
              <div className="px-6 py-4 border-t border-background/10 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-mono text-background/40">Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
