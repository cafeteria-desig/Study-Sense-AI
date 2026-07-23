export function PullQuoteSection() {
  return (
    <section className="relative z-10 py-28 lg:py-40">
      <div className="max-w-[1000px] mx-auto px-6 lg:px-10 text-center space-y-8">
        <blockquote className="font-serif-italic text-3xl sm:text-5xl lg:text-6xl text-[#F4F2EC] leading-[1.2]">
          “I went from a C to an A in organic chemistry in one semester. Nora's oral drills made me actually understand the material instead of just memorising it.”
        </blockquote>

        <div className="space-y-1">
          <div className="text-sm font-semibold text-[#F4F2EC] tracking-wide">
            Priya Sharma
          </div>
          <div className="text-xs text-[#726F68] font-mono uppercase tracking-widest">
            Pre-Med Student, University of Pennsylvania
          </div>
        </div>
      </div>
    </section>
  )
}

export default PullQuoteSection
