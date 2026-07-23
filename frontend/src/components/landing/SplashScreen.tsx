import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TextScramble } from './TextScramble'

type Phase = 'scrambling' | 'scrambled' | 'ascending' | 'complete'

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<Phase>('scrambling')
  const [triggerScramble, setTriggerScramble] = useState(false)
  const [showSubtitles, setShowSubtitles] = useState(false)

  useEffect(() => {
    // Brief pause before scramble starts
    const t1 = setTimeout(() => setTriggerScramble(true), 300)
    return () => clearTimeout(t1)
  }, [])

  const handleScrambleComplete = () => {
    setPhase('scrambled')
    setShowSubtitles(true)

    // Beat 1: Hold text visible under lamp
    setTimeout(() => {
      // Beat 2: Words ascend up into the top white lamp light source
      setPhase('ascending')
    }, 1200)

    // Beat 3: Entire splash overlay slides up (revealing front page underneath)
    setTimeout(() => {
      setPhase('complete')
      onComplete()
    }, 2200)
  }

  if (phase === 'complete') return null

  const isAscending = phase === 'ascending'

  return (
    <motion.div
      aria-hidden="true"
      initial={{ translateY: 0 }}
      animate={{ translateY: isAscending ? '-100vh' : 0 }}
      transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1] as const }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#08080a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* ========================================================================= */}
      {/* BLACK AND WHITE MONOCHROME LAMP EFFECT                                    */}
      {/* ========================================================================= */}
      <div className="absolute top-0 isolate z-0 flex w-screen flex-1 items-start justify-center">
        {/* Main Glow Circle */}
        <div className="absolute inset-auto z-50 h-44 w-[34rem] -translate-y-[-20%] rounded-full bg-white/40 opacity-90 blur-3xl" />

        {/* Lamp Center Core Pulse */}
        <motion.div
          initial={{ width: '8rem' }}
          animate={{ width: '22rem' }}
          transition={{ ease: 'easeInOut', delay: 0.2, duration: 1.0 }}
          className="absolute top-0 z-30 h-40 -translate-y-[20%] rounded-full bg-white/70 blur-2xl shadow-[0_0_50px_#ffffff]"
        />

        {/* Top Horizontal Glowing Line */}
        <motion.div
          initial={{ width: '12rem' }}
          animate={{ width: '38rem' }}
          transition={{ ease: 'easeInOut', delay: 0.2, duration: 1.0 }}
          className="absolute inset-auto z-50 h-0.5 -translate-y-[-10%] bg-white/90 shadow-[0_0_20px_#ffffff]"
        />

        {/* Left Gradient Cone Beam */}
        <motion.div
          initial={{ opacity: 0.4, width: '15rem' }}
          animate={{ opacity: 0.9, width: '36rem' }}
          transition={{ delay: 0.2, duration: 1.0, ease: 'easeInOut' }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto right-1/2 h-64 overflow-visible w-[36rem] bg-gradient-conic from-white/60 via-transparent to-transparent [--conic-position:from_70deg_at_center_top]"
        >
          <div className="absolute w-[100%] left-0 bg-[#08080a] h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute w-40 h-[100%] left-0 bg-[#08080a] bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>

        {/* Right Gradient Cone Beam */}
        <motion.div
          initial={{ opacity: 0.4, width: '15rem' }}
          animate={{ opacity: 0.9, width: '36rem' }}
          transition={{ delay: 0.2, duration: 1.0, ease: 'easeInOut' }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto left-1/2 h-64 w-[36rem] bg-gradient-conic from-transparent via-transparent to-white/60 [--conic-position:from_290deg_at_center_top]"
        >
          <div className="absolute w-40 h-[100%] right-0 bg-[#08080a] bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute w-[100%] right-0 bg-[#08080a] h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>
      </div>

      {/* Subtle Grid Ambient Lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '4rem 4rem',
          pointerEvents: 'none',
        }}
      />

      {/* ========================================================================= */}
      {/* SCRAMBLER TEXT CONTENT                                                    */}
      {/* ========================================================================= */}
      <motion.div
        animate={
          isAscending
            ? { y: -220, opacity: 0, scale: 0.65, filter: 'blur(12px)' }
            : { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }
        }
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
        className="relative z-20 text-center flex flex-col items-center justify-center space-y-0 px-6 max-w-4xl"
      >
        {/* Scrambling Title */}
        <TextScramble
          as="h1"
          trigger={triggerScramble}
          duration={1.4}
          speed={0.035}
          onScrambleComplete={handleScrambleComplete}
          style={{
            fontFamily: '"DotGothic16", "JetBrains Mono", monospace',
            fontSize: 'clamp(3.5rem, 11vw, 8.5rem)',
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: '#F4F2EC',
            margin: 0,
            marginBottom: '2rem',
            lineHeight: 1,
            textShadow: '0 0 40px rgba(255, 255, 255, 0.6), 0 0 15px rgba(255, 255, 255, 0.9)',
          }}
        >
          StudySense
        </TextScramble>

        {/* Clean Hairline Lining Divider & Subtitle Bar */}
        <div
          className="w-full flex items-center justify-center gap-4 transition-all duration-700"
          style={{
            opacity: showSubtitles ? 1 : 0,
            transform: showSubtitles ? 'translateY(0)' : 'translateY(12px)',
          }}
        >
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/30 to-white/60" />
          
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md">
            <span className="relative flex h-2 w-2 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
            </span>
            <span className="font-offbit text-xs sm:text-sm tracking-[0.2em] text-[#F4F2EC] uppercase font-semibold">
              AI STUDY COMPANION
            </span>
          </div>

          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-white/30 to-white/60" />
        </div>

        {/* Tagline */}
        <p
          className="text-base sm:text-lg lg:text-xl text-[#A6A49C] tracking-wide font-sans font-normal transition-all duration-700 delay-150"
          style={{
            opacity: showSubtitles ? 1 : 0,
            transform: showSubtitles ? 'translateY(0)' : 'translateY(12px)',
          }}
        >
          Learn smarter. Study faster.
        </p>
      </motion.div>

      {/* System Status Footnote */}
      <div
        className="absolute bottom-10 font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase transition-opacity duration-700"
        style={{
          opacity: showSubtitles ? 1 : 0,
        }}
      >
        [ SYSTEM INITIALIZING ]
      </div>
    </motion.div>
  )
}

export default SplashScreen
