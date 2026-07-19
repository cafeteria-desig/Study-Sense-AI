import { useEffect, useRef, useState } from 'react'

const features = [
  {
    number: '01',
    title: 'AI Tutor',
    description:
      'Ask anything. Get clear, thorough explanations with real-time streaming answers. Follow-up, dig deeper, quiz yourself—all in one chat.',
    visual: 'tutor',
  },
  {
    number: '02',
    title: 'Smart Notes Generator',
    description:
      'Enter any topic and receive beautifully structured study notes in seconds—complete with key terms, summaries, and exam tips.',
    visual: 'notes',
  },
  {
    number: '03',
    title: 'Quiz Generator',
    description:
      'Auto-generate multiple-choice, short-answer, or mixed quizzes from any topic or uploaded PDF. Instant marking, instant feedback.',
    visual: 'quiz',
  },
  {
    number: '04',
    title: 'Flashcard Decks',
    description:
      '3D-flip flashcards built from your notes. Shuffle, self-rate, and let spaced repetition surface the cards you need most.',
    visual: 'flashcards',
  },
  {
    number: '05',
    title: 'Study Planner',
    description:
      'Tell StudySense your exam date. It builds a day-by-day revision schedule that adapts to your progress and available time.',
    visual: 'planner',
  },
  {
    number: '06',
    title: 'PDF Summariser',
    description:
      'Upload lecture slides, textbook chapters, or past papers. Get key points, a summary, and auto-generated questions in under a minute.',
    visual: 'pdf',
  },
]

// ─── SVG Visuals ──────────────────────────────────────────────────────────────
function TutorVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      {/* Chat bubbles */}
      <rect x="20" y="20" width="120" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
      </rect>
      <rect x="60" y="62" width="120" height="28" rx="4" fill="currentColor" opacity="0.15">
        <animate attributeName="opacity" values="0.15;0.4;0.15" dur="2s" begin="0.5s" repeatCount="indefinite" />
      </rect>
      <rect x="20" y="104" width="90" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin="1s" repeatCount="indefinite" />
      </rect>
      {/* Cursor blink */}
      <rect x="115" y="112" width="6" height="12" fill="currentColor">
        <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
      </rect>
    </svg>
  )
}

function NotesVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <rect x="30" y="15" width="140" height="130" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {[0,1,2,3,4,5].map((i) => (
        <rect key={i} x="44" y={30 + i*18} width={i === 0 ? 80 : 100} height="6" rx="2" fill="currentColor" opacity="0.2">
          <animate attributeName="width" values={`0;${i === 0 ? 80 : 100}`} dur="1.5s" begin={`${i * 0.2}s`} fill="freeze" />
        </rect>
      ))}
    </svg>
  )
}

function QuizVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <rect x="25" y="20" width="150" height="120" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text x="100" y="52" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="currentColor" opacity="0.7">What is photosynthesis?</text>
      {['A', 'B', 'C', 'D'].map((opt, i) => (
        <g key={opt}>
          <rect x="38" y={65 + i*17} width="124" height="13" rx="3" fill="currentColor" opacity={i === 1 ? "0.5" : "0.1"}>
            {i === 1 && <animate attributeName="opacity" values="0.1;0.5;0.1" dur="2s" repeatCount="indefinite" />}
          </rect>
          <text x="47" y={74 + i*17} fontSize="8" fontFamily="monospace" fill="currentColor" opacity="0.8">{opt}</text>
        </g>
      ))}
    </svg>
  )
}

function FlashcardVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      {/* Back card */}
      <rect x="40" y="30" width="130" height="90" rx="4" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      {/* Front card */}
      <rect x="30" y="20" width="130" height="90" rx="4" fill="currentColor" opacity="0.08" stroke="currentColor" strokeWidth="1.5">
        <animate attributeName="opacity" values="0.08;0.18;0.08" dur="3s" repeatCount="indefinite" />
      </rect>
      <text x="95" y="72" textAnchor="middle" fontSize="28" fontFamily="serif" fill="currentColor" opacity="0.8">?</text>
      <text x="95" y="88" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="currentColor" opacity="0.4">tap to flip</text>
    </svg>
  )
}

function PlannerVisual() {
  const days = [4, 7, 5, 8, 3, 6, 2]
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      {days.map((h, i) => (
        <rect key={i} x={22 + i * 24} y={130 - h * 12} width="16" height={h * 12} rx="2" fill="currentColor" opacity="0.2">
          <animate attributeName="height" values={`0;${h * 12}`} dur="1.2s" begin={`${i * 0.1}s`} fill="freeze" />
          <animate attributeName="y" values={`130;${130 - h * 12}`} dur="1.2s" begin={`${i * 0.1}s`} fill="freeze" />
        </rect>
      ))}
      <line x1="22" y1="130" x2="178" y2="130" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    </svg>
  )
}

function PdfVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <rect x="50" y="10" width="100" height="130" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M 120 10 L 150 40" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="120" y="10" width="30" height="30" rx="2" fill="currentColor" opacity="0.1" />
      {/* Scanning line */}
      <line x1="62" y1="50" x2="138" y2="50" stroke="currentColor" strokeWidth="1" opacity="0">
        <animate attributeName="y1" values="50;120;50" dur="3s" repeatCount="indefinite" />
        <animate attributeName="y2" values="50;120;50" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.8;0" dur="3s" repeatCount="indefinite" />
      </line>
      {[0,1,2].map(i => (
        <rect key={i} x="62" y={60 + i*20} width={i === 1 ? 60 : 76} height="5" rx="2" fill="currentColor" opacity="0.15" />
      ))}
    </svg>
  )
}

function FeatureVisual({ type }: { type: string }) {
  switch (type) {
    case 'tutor': return <TutorVisual />
    case 'notes': return <NotesVisual />
    case 'quiz': return <QuizVisual />
    case 'flashcards': return <FlashcardVisual />
    case 'planner': return <PlannerVisual />
    case 'pdf': return <PdfVisual />
    default: return <TutorVisual />
  }
}

function FeatureRow({ feature, index }: { feature: typeof features[0]; index: number }) {
  const [isVisible, setIsVisible] = useState(false)
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.15 }
    )
    if (rowRef.current) observer.observe(rowRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={rowRef}
      className={`group relative transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 py-12 lg:py-20 border-b border-foreground/10">
        <div className="shrink-0 w-8">
          <span className="font-mono text-sm text-muted-foreground">{feature.number}</span>
        </div>
        <div className="flex-1 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-3xl lg:text-4xl font-display mb-4 group-hover:translate-x-2 transition-transform duration-500">
              {feature.title}
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="w-48 h-40 text-foreground">
              <FeatureVisual type={feature.visual} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.05 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" ref={sectionRef} className="relative py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Capabilities
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Everything you need to study smarter.
            <br />
            <span className="text-muted-foreground">Nothing you don&apos;t.</span>
          </h2>
        </div>
        <div>
          {features.map((feature, index) => (
            <FeatureRow key={feature.number} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
