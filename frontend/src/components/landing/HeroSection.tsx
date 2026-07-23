import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ArrowRight, LayoutDashboard } from 'lucide-react'
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
  useReducedMotion,
} from 'framer-motion'
import { useState } from 'react'

const words = ['learn', 'revise', 'master', 'ace']

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
}

const charVariants = {
  hidden: { opacity: 0, y: 20, rotateX: -40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  }),
  exit: (i: number) => ({
    opacity: 0,
    y: -16,
    transition: { delay: i * 0.02, duration: 0.25, ease: [0.4, 0, 1, 1] as const },
  }),
}

export function HeroSection() {
  const { user } = useAuth()
  const [wordIndex, setWordIndex] = useState(0)
  const shouldReduceMotion = useReducedMotion()
  const btnRef = useRef<HTMLAnchorElement>(null)

  // Magnetic button effect
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const springX = useSpring(mx, { stiffness: 200, damping: 20 })
  const springY = useSpring(my, { stiffness: 200, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (shouldReduceMotion || !btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    mx.set(dx * 0.25)
    my.set(dy * 0.25)
  }
  const handleMouseLeave = () => { mx.set(0); my.set(0) }

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  const currentWord = words[wordIndex]

  return (
    <section
      id="hero"
      className="relative min-h-[90vh] flex flex-col justify-center pt-36 pb-28 lg:pt-44 lg:pb-36 overflow-hidden"
    >
      {/* Ambient glow orbs */}
      {!shouldReduceMotion && (
        <>
          <motion.div
            className="pointer-events-none absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(140,255,180,0.08) 0%, transparent 70%)',
            }}
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="pointer-events-none absolute bottom-0 right-0 w-[360px] h-[360px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
            }}
            animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </>
      )}

      <div className="max-w-[1300px] mx-auto px-6 lg:px-10 w-full z-10">
        <motion.div
          className="max-w-3xl space-y-9"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow */}
          <motion.div variants={itemVariants}>
            <Eyebrow>THE AI STUDY COMPANION</Eyebrow>
          </motion.div>

          {/* Headline */}
          <motion.div variants={itemVariants}>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif-italic text-[#F4F2EC] leading-[1.1] tracking-tight">
              <span className="block">The smarter way</span>
              <span className="block mt-2">
                to{' '}
                <span className="relative inline-flex items-center overflow-visible pr-6 pb-2">
                  <span className="inline-flex font-offbit font-bold uppercase text-[#8CFFB4] tracking-wider overflow-visible pr-4 py-1" style={{ perspective: 600 }}>
                    <AnimatePresence mode="wait">
                      <motion.span key={wordIndex} className="inline-flex">
                        {currentWord.split('').map((char, i) => (
                          <motion.span
                            key={`${wordIndex}-${i}`}
                            className="inline-block"
                            custom={i}
                            variants={charVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                          >
                            {char}
                          </motion.span>
                        ))}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <motion.span
                    className="absolute bottom-0 left-0 right-2 h-1.5 bg-[#8CFFB4] shadow-[0_0_15px_#8CFFB4] rounded-full origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
                  />
                </span>
              </span>
            </h1>
          </motion.div>

          {/* Paragraph */}
          <motion.p
            className="text-lg sm:text-xl lg:text-2xl text-[#A6A49C] leading-relaxed max-w-xl font-normal"
            variants={itemVariants}
          >
            Upload a topic, PDF, or textbook chapter. Our AI companion Nora will do the rest — generating notes, quizzes, flashcards, and oral drills instantly.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-wrap items-center gap-3 pt-3"
            variants={itemVariants}
          >
            {user ? (
              <motion.div
                style={{ x: springX, y: springY }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <Button
                  size="lg"
                  className="bg-[#F4F2EC] hover:bg-[#F4F2EC]/90 text-[#08080a] font-offbit text-sm font-bold uppercase tracking-wider px-9 h-13 rounded-full group shadow-xl transition-colors flex items-center gap-2"
                  asChild
                >
                  <Link to="/dashboard" ref={btnRef}>
                    <LayoutDashboard className="w-5 h-5 text-[#08080a]" />
                    Open Dashboard
                    <motion.span
                      className="inline-flex"
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </motion.span>
                  </Link>
                </Button>
              </motion.div>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    className="bg-[#F4F2EC] hover:bg-[#F4F2EC]/90 text-[#08080a] font-offbit text-sm font-bold uppercase tracking-wider px-9 h-13 rounded-full shadow-xl transition-colors"
                    asChild
                  >
                    <Link to="/register">
                      Get Started Free
                      <motion.span
                        className="inline-flex ml-2"
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.span>
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    className="bg-transparent border border-[#F4F2EC]/30 hover:border-[#F4F2EC]/70 text-[#F4F2EC] font-offbit text-sm font-bold uppercase tracking-wider px-9 h-13 rounded-full shadow-xl transition-colors"
                    asChild
                  >
                    <Link to="/login">
                      Sign In
                    </Link>
                  </Button>
                </motion.div>
              </>
            )}
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
