import { Navigation } from '@/components/landing/Navigation'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { CtaSection } from '@/components/landing/CtaSection'
import { FooterSection } from '@/components/landing/FooterSection'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <FooterSection />
    </div>
  )
}
