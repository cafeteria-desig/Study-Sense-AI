import { Eyebrow } from '@/components/ui/Eyebrow'
import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Upload, BookOpen, Layers, Target } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Upload anything',
    description: 'Paste a topic, drop a PDF, or type a textbook chapter. Nora handles any document or input format seamlessly.',
    icon: Upload,
    accent: '#8CFFB4',
  },
  {
    number: '02',
    title: 'Nora reads it',
    description: 'Our AI companion Nora reads and synthesizes your material, extracting key definitions, core concepts, and formulas.',
    icon: BookOpen,
    accent: '#7C3AED',
  },
  {
    number: '03',
    title: 'Your study kit builds itself',
    description: 'In seconds, structured notes, spaced-repetition flashcards, practice quizzes, and oral voice drills generate automatically.',
    icon: Layers,
    accent: '#06B6D4',
  },
  {
    number: '04',
    title: 'Practice until it sticks',
    description: 'Run targeted active-recall sessions that adapt to your weak spots until you enter your exam with total confidence.',
    icon: Target,
    accent: '#F59E0B',
  },
]

function StepRow({
  step,
  index,
  isLast,
}: {
  step: (typeof steps)[0]
  index: number
  isLast: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const Icon = step.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] as const }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`relative py-10 sm:py-12 grid md:grid-cols-12 gap-4 md:gap-8 items-center px-6 -mx-6 rounded-xl cursor-default ${!isLast ? 'border-b border-white/[0.09]' : ''}`}
      style={{
        background: hovered ? 'rgba(255,255,255,0.025)' : 'transparent',
        transition: 'background 0.3s ease',
      }}
    >
      {/* Animated accent line on left */}
      <motion.div
        className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
        style={{ background: step.accent }}
        initial={{ scaleY: 0, originY: 0 }}
        animate={inView ? { scaleY: 1 } : {}}
        transition={{ duration: 0.5, delay: index * 0.12 + 0.3, ease: [0.16, 1, 0.3, 1] as const }}
      />

      {/* Number + Icon */}
      <div className="md:col-span-2 flex items-center gap-4">
        <motion.span
          className="font-offbit text-4xl sm:text-6xl font-bold tracking-wider"
          style={{ color: step.accent }}
          animate={{ x: hovered ? 4 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {step.number}
        </motion.span>
        <motion.div
          className="hidden sm:flex w-10 h-10 rounded-xl items-center justify-center border border-white/10"
          style={{ background: `${step.accent}15` }}
          animate={{ scale: hovered ? 1.1 : 1, rotate: hovered ? 8 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Icon className="w-4 h-4" style={{ color: step.accent }} />
        </motion.div>
      </div>

      {/* Title */}
      <motion.div
        className="md:col-span-4 font-offbit text-xl sm:text-2xl font-bold text-[#F4F2EC] tracking-tight"
        animate={{ x: hovered ? 4 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.02 }}
      >
        {step.title}
      </motion.div>

      {/* Description */}
      <div className="md:col-span-6 text-[#A6A49C] text-base leading-relaxed font-sans">
        {step.description}
      </div>
    </motion.div>
  )
}

export function HowItWorksSection() {
  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-80px' })

  return (
    <section id="how-it-works" className="relative z-10 py-28 lg:py-40 border-t border-white/[0.09]">
      <div className="max-w-[1300px] mx-auto px-6 lg:px-10 space-y-16">
        {/* Header */}
        <div ref={headerRef} className="max-w-2xl space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <Eyebrow>FOUR-STEP PROCESS</Eyebrow>
          </motion.div>
          <motion.h2
            className="font-serif-italic text-4xl sm:text-6xl text-[#F4F2EC] leading-tight"
            initial={{ opacity: 0, y: 24 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
          >
            How StudySense works.
          </motion.h2>
          <motion.p
            className="text-[#A6A49C] text-lg leading-relaxed font-sans"
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            From raw notes to exam mastery in four effortless steps.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="border-t border-white/[0.09]">
          {steps.map((step, idx) => (
            <StepRow key={step.number} step={step} index={idx} isLast={idx === steps.length - 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
