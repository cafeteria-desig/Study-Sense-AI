import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/Eyebrow'

export function PricingSection() {
  return (
    <section id="pricing" className="relative z-10 py-24 lg:py-36 border-t border-white/[0.09]">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 space-y-16">
        {/* Header */}
        <div className="max-w-2xl space-y-4">
          <Eyebrow>TRANSPARENT PRICING</Eyebrow>

          <h2 className="font-serif-italic text-4xl sm:text-6xl text-[#F4F2EC] leading-tight">
            Simple, honest plans.
          </h2>

          <p className="text-[#A6A49C] text-lg leading-relaxed">
            Free forever for basic study needs. Upgrade to Pro when you want unlimited AI generation.
          </p>
        </div>

        {/* 2-Column Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Card */}
          <div className="bg-white/[0.045] border border-white/[0.09] backdrop-blur-xl rounded-[16px] p-8 sm:p-10 flex flex-col justify-between hover:border-white/[0.18] transition-all">
            <div className="space-y-6">
              <div>
                <div className="text-xs uppercase tracking-widest text-[#726F68] font-semibold mb-2">Free Plan</div>
                <div className="font-serif-italic text-5xl text-[#F4F2EC] mb-1">$0</div>
                <div className="text-xs text-[#726F68]">Forever free</div>
              </div>

              <ul className="space-y-4 pt-4 border-t border-white/[0.09] text-sm text-[#A6A49C]">
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#8CFFB4] shrink-0" /> 5 uploads & study kits per month
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#8CFFB4] shrink-0" /> Smart Notes & Summaries
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#8CFFB4] shrink-0" /> Basic Flashcard Generation
                </li>
                <li className="flex items-center gap-3 text-[#726F68]">
                  <span className="w-4 h-4 inline-block text-center">—</span> Standard Generation Speed
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Button
                variant="outline"
                className="w-full h-12 rounded-full border-white/[0.18] hover:bg-white/[0.06] text-[#F4F2EC]"
                asChild
              >
                <Link to="/register">Get Started Free</Link>
              </Button>
            </div>
          </div>

          {/* Pro Card (Featured) */}
          <div className="relative bg-gradient-to-b from-[#8CFFB4]/10 via-white/[0.05] to-white/[0.045] border border-[#8CFFB4]/30 backdrop-blur-xl rounded-[16px] p-8 sm:p-10 flex flex-col justify-between hover:border-[#8CFFB4]/50 transition-all shadow-2xl">
            <div className="absolute -top-3.5 right-8 bg-[#8CFFB4] text-[#08080a] text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full shadow-md">
              Most Popular
            </div>

            <div className="space-y-6">
              <div>
                <div className="text-xs uppercase tracking-widest text-[#8CFFB4] font-semibold mb-2">Pro Plan</div>
                <div className="font-serif-italic text-5xl text-[#F4F2EC] mb-1">$12</div>
                <div className="text-xs text-[#A6A49C]">per month, cancel anytime</div>
              </div>

              <ul className="space-y-4 pt-4 border-t border-white/[0.09] text-sm text-[#F4F2EC]">
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#8CFFB4] shrink-0" /> Unlimited uploads & study kits
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#8CFFB4] shrink-0" /> Smart Notes + Full Summarizer
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#8CFFB4] shrink-0" /> Adaptive Quiz Engine & Scoring
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#8CFFB4] shrink-0" /> Real-time Oral Voice Drills
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#8CFFB4] shrink-0" /> Priority High-Speed AI Processing
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Button
                className="w-full h-12 rounded-full bg-[#F4F2EC] hover:bg-[#F4F2EC]/90 text-[#08080a] font-semibold shadow-lg"
                asChild
              >
                <Link to="/register">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PricingSection
