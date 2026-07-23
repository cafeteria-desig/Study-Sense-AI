import { FileText, CircleHelp, Layers, Mic } from 'lucide-react'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef, useState } from 'react'

const features = [
  {
    code: '01 //',
    icon: FileText,
    title: 'Structured notes',
    description: 'Instantly extract key concepts, definitions, and summaries from any document or textbook chapter.',
    accent: '#8CFFB4',
    glow: 'rgba(140,255,180,0.12)',
  },
  {
    code: '02 //',
    icon: CircleHelp,
    title: 'Adaptive quizzes',
    description: 'Personalized quizzes that adjust to your weak spots so you always study what matters most.',
    accent: '#7C3AED',
    glow: 'rgba(124,58,237,0.12)',
  },
  {
    code: '03 //',
    icon: Layers,
    title: 'Flashcard decks',
    description: 'Auto-generated spaced-repetition flashcards to lock knowledge into long-term memory.',
    accent: '#06B6D4',
    glow: 'rgba(6,182,212,0.12)',
  },
  {
    code: '04 //',
    icon: Mic,
    title: 'Oral drills',
    description: 'Practice speaking answers aloud with real-time AI feedback on accuracy and confidence.',
    accent: '#F59E0B',
    glow: 'rgba(245,158,11,0.12)',
  },
]

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0]
  index: number
}) {
  const Icon = feature.icon
  const [hovered, setHovered] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.65,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1] as const,
      }}
      whileHover={shouldReduceMotion ? {} : { y: -6, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const } }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative bg-white/[0.045] border border-white/[0.09] backdrop-blur-xl rounded-[20px] p-7 flex flex-col justify-between cursor-pointer overflow-hidden"
      style={{
        boxShadow: hovered ? `0 20px 60px -10px ${feature.glow}, 0 0 0 1px ${feature.accent}22` : undefined,
        transition: 'box-shadow 0.3s ease',
      }}
    >
      {/* Hover glow background */}
      <motion.div
        className="absolute inset-0 rounded-[20px] pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: `radial-gradient(ellipse at 30% 30%, ${feature.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Animated border on hover */}
      <motion.div
        className="absolute inset-0 rounded-[20px] pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ border: `1px solid ${feature.accent}33` }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <motion.div
            className="w-12 h-12 rounded-xl border border-white/20 flex items-center justify-center"
            style={{ background: `${feature.accent}18` }}
            animate={{ scale: hovered ? 1.12 : 1, rotate: hovered ? 5 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Icon className="w-5 h-5" style={{ color: feature.accent }} />
          </motion.div>
          <span className="font-offbit text-xs font-bold tracking-widest" style={{ color: feature.accent }}>
            {feature.code}
          </span>
        </div>

        <h3 className="font-offbit text-xl font-bold text-[#F4F2EC] tracking-tight mb-3">
          {feature.title}
        </h3>

        <p className="text-sm text-[#A6A49C] leading-relaxed font-sans">
          {feature.description}
        </p>
      </div>

      {/* Hover reveal bottom bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-[20px]"
        style={{ background: `linear-gradient(90deg, transparent, ${feature.accent}, transparent)` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
      />
    </motion.div>
  )
}

export function FeaturesSection() {
  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-80px' })

  return (
    <section id="features" className="relative z-10 py-28 lg:py-40">
      <div className="max-w-[1300px] mx-auto px-6 lg:px-10 space-y-16">
        {/* Header */}
        <div ref={headerRef} className="max-w-2xl space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <Eyebrow>CORE CAPABILITIES</Eyebrow>
          </motion.div>

          <motion.h2
            className="font-serif-italic text-4xl sm:text-6xl text-[#F4F2EC] leading-tight"
            initial={{ opacity: 0, y: 24 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
          >
            Everything you need to study smarter.
          </motion.h2>

          <motion.p
            className="text-[#A6A49C] text-lg leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
          >
            StudySense replaces hours of manual note-taking with intelligent AI synthesis.
          </motion.p>
        </div>

        {/* 4-Column Card Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} feature={feature} index={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
