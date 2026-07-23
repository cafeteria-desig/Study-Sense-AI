import { ArrowRight, LayoutDashboard, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'

export function CtaSection() {
  const { user } = useAuth()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const shouldReduceMotion = useReducedMotion()

  return (
    <section
      id="cta-band"
      ref={ref}
      className="relative z-10 py-28 lg:py-40 border-t border-white/[0.09] overflow-hidden"
    >
      {/* Animated background pulse */}
      {!shouldReduceMotion && (
        <>
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(140,255,180,0.07) 0%, transparent 70%)',
            }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 40% 30% at 50% 50%, rgba(124,58,237,0.06) 0%, transparent 70%)',
            }}
            animate={{ opacity: [1, 0.4, 1], scale: [1, 1.05, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
        </>
      )}

      <div className="max-w-[900px] mx-auto px-6 lg:px-10 text-center space-y-8 relative">
        {/* Sparkle icon */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#8CFFB4]/10 border border-[#8CFFB4]/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[#8CFFB4]" />
          </div>
        </motion.div>

        <motion.h2
          className="font-serif-italic text-5xl sm:text-7xl lg:text-8xl text-[#F4F2EC] leading-[1.05] tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] as const }}
        >
          Start learning smarter today.
        </motion.h2>

        <motion.p
          className="text-[#A6A49C] text-lg sm:text-xl leading-relaxed max-w-xl mx-auto font-normal font-sans"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
        >
          Join thousands of students who already study with Nora AI. Free forever, upgrade when you&apos;re ready.
        </motion.p>

        <motion.div
          className="flex items-center justify-center pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
        >
          {user ? (
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button
                size="lg"
                className="bg-[#F4F2EC] hover:bg-[#F4F2EC]/90 text-[#08080a] font-offbit text-sm font-bold uppercase tracking-wider px-9 h-13 rounded-full group shadow-xl transition-colors flex items-center gap-2"
                asChild
              >
                <Link to="/dashboard">
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
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button
                size="lg"
                className="bg-[#F4F2EC] hover:bg-[#F4F2EC]/90 text-[#08080a] font-offbit text-sm font-bold uppercase tracking-wider px-9 h-13 rounded-full group shadow-xl transition-colors"
                asChild
              >
                <Link to="/register">
                  Start Learning Free
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
          )}
        </motion.div>

        {/* Trust badges */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-[#726F68] font-sans"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {['No credit card required', 'Free forever plan', '2,400+ students enrolled'].map((text, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="text-[#8CFFB4]">✓</span> {text}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default CtaSection
