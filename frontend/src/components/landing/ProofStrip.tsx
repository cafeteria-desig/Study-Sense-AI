export function ProofStrip() {
  const stats = [
    { number: '2M+', caption: 'Active learners' },
    { number: '98%', caption: 'Satisfaction rate' },
    { number: '50s', caption: 'Time to first flashcard' },
    { number: '140+', caption: 'Subject categories' },
  ]

  return (
    <section className="relative z-10 border-y border-white/[0.09] bg-white/[0.02] backdrop-blur-xs">
      <div className="max-w-[1300px] mx-auto px-6 lg:px-10 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-white/[0.09]">
          {stats.map((stat, idx) => (
            <div key={idx} className={`text-center ${idx > 0 ? 'pt-6 md:pt-0' : ''}`}>
              <div className="font-serif-italic text-4xl sm:text-5xl text-[#F4F2EC] mb-1">
                {stat.number}
              </div>
              <div className="text-xs sm:text-sm text-[#A6A49C] tracking-wide font-normal">
                {stat.caption}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProofStrip
