import { useState } from 'react'
import { SplashScreen } from '@/components/landing/SplashScreen'
import { KineticGrid } from '@/components/ui/KineticGrid'
import { Navigation } from '@/components/landing/Navigation'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { CtaSection } from '@/components/landing/CtaSection'
import { FooterSection } from '@/components/landing/FooterSection'

const SPLASH_LAST_SHOWN_KEY = 'studysense_splash_last_shown'
const SPLASH_MODE_KEY = 'studysense_splash_mode'
const FIFTEEN_MINUTES_MS = 15 * 60 * 1000 // 15 minutes in milliseconds

function checkShouldShowSplash(): boolean {
  try {
    const mode = localStorage.getItem(SPLASH_MODE_KEY) || '15min'
    if (mode === 'never') return false
    if (mode === 'always') return true

    const lastShown = localStorage.getItem(SPLASH_LAST_SHOWN_KEY)
    if (!lastShown) return true

    const elapsed = Date.now() - parseInt(lastShown, 10)
    return elapsed >= FIFTEEN_MINUTES_MS
  } catch (e) {
    return true
  }
}

export function LandingPage() {
  const [shouldShow] = useState(() => checkShouldShowSplash())
  const [splashDone, setSplashDone] = useState(() => !checkShouldShowSplash())

  const handleSplashComplete = () => {
    try {
      localStorage.setItem(SPLASH_LAST_SHOWN_KEY, Date.now().toString())
    } catch (e) {}
    setSplashDone(true)
  }

  return (
    <>
      {/* Smart Intro text scrambler with 15-minute timer & mode preferences */}
      {shouldShow && !splashDone && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}

      {/* Main Page Layout */}
      <div className="min-h-screen bg-[#08080a] text-[#F4F2EC] relative font-sans selection:bg-white/20 selection:text-[#08080a]">
        {/* Kinetic Warp Grid Background */}
        <KineticGrid globalColor="monochrome" />

        {/* Page Content Layers */}
        <div className="relative z-10">
          <Navigation />
          <main>
            <HeroSection />
            <FeaturesSection />
            <HowItWorksSection />
            <CtaSection />
          </main>
          <FooterSection />
        </div>
      </div>
    </>
  )
}

export default LandingPage
