import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

function AnimatedTetrahedron() {
  return (
    <svg viewBox="0 0 300 300" className="w-full h-full text-foreground">
      {/* Outer tetrahedron edges */}
      <line x1="150" y1="30" x2="270" y2="240" stroke="currentColor" strokeWidth="1" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
      </line>
      <line x1="150" y1="30" x2="30" y2="240" stroke="currentColor" strokeWidth="1" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" begin="0.5s" repeatCount="indefinite" />
      </line>
      <line x1="30" y1="240" x2="270" y2="240" stroke="currentColor" strokeWidth="1" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" begin="1s" repeatCount="indefinite" />
      </line>
      {/* Inner lines (depth) */}
      <line x1="150" y1="30" x2="150" y2="240" stroke="currentColor" strokeWidth="1" opacity="0.15">
        <animate attributeName="opacity" values="0.15;0.4;0.15" dur="2s" repeatCount="indefinite" />
      </line>
      <line x1="30" y1="240" x2="210" y2="135" stroke="currentColor" strokeWidth="1" opacity="0.15">
        <animate attributeName="opacity" values="0.15;0.4;0.15" dur="2s" begin="0.7s" repeatCount="indefinite" />
      </line>
      <line x1="270" y1="240" x2="90" y2="135" stroke="currentColor" strokeWidth="1" opacity="0.15">
        <animate attributeName="opacity" values="0.15;0.4;0.15" dur="2s" begin="1.4s" repeatCount="indefinite" />
      </line>
      {/* Vertices */}
      {[{x:150,y:30},{x:30,y:240},{x:270,y:240},{x:150,y:170}].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="currentColor" opacity="0.6">
          <animate attributeName="r" values="4;7;4" dur="2s" begin={`${i*0.5}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin={`${i*0.5}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {/* Orbiting dot */}
      <circle r="3" fill="currentColor" opacity="0.8">
        <animateMotion dur="4s" repeatCount="indefinite">
          <mpath href="#tetraPath" />
        </animateMotion>
      </circle>
      <path id="tetraPath" d="M 150 30 L 270 240 L 30 240 Z" fill="none" />
    </svg>
  )
}

export function CtaSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div
          className={`relative border border-foreground transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          onMouseMove={handleMouseMove}
        >
          {/* Mouse spotlight */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(500px circle at ${mousePos.x}% ${mousePos.y}%, rgba(0,0,0,0.2), transparent 40%)`,
            }}
          />

          <div className="relative z-10 px-8 lg:px-16 py-16 lg:py-24">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="flex-1">
                <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-8">
                  <span className="w-8 h-px bg-foreground/30" />
                  Get started
                </span>
                <h2 className="text-4xl lg:text-7xl font-display tracking-tight mb-8 leading-[0.95]">
                  Ready to ace
                  <br />
                  your exams?
                </h2>
                <p className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-xl">
                  Join thousands of students studying smarter with StudySense AI.
                  Free to start, no credit card needed.
                </p>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Button
                    size="lg"
                    className="bg-foreground hover:bg-foreground/90 text-background px-8 h-14 text-base rounded-full group"
                    asChild
                  >
                    <Link to="/register">
                      Start Learning Free
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-base rounded-full border-foreground/20 hover:bg-foreground/5"
                    asChild
                  >
                    <Link to="/login">Sign In</Link>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-8 font-mono">
                  Free plan · No credit card · Cancel any time
                </p>
              </div>

              {/* Tetrahedron */}
              <div className="hidden lg:flex items-center justify-center w-[420px] h-[420px] -mr-8">
                <AnimatedTetrahedron />
              </div>
            </div>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-0 right-0 w-32 h-32 border-b border-l border-foreground/10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 border-t border-r border-foreground/10" />
        </div>
      </div>
    </section>
  )
}
