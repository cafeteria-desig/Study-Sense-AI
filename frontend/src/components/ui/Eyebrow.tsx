import type { ReactNode } from 'react'

export function Eyebrow({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/[0.06] backdrop-blur-md text-[11px] font-offbit tracking-[0.15em] uppercase text-[#F4F2EC] shadow-[0_0_15px_rgba(255,255,255,0.08)] transition-all ${className}`}
    >
      <span className="relative flex h-2 w-2 items-center justify-center">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white shadow-[0_0_8px_#ffffff]" />
      </span>
      <span>{children}</span>
    </div>
  )
}

export default Eyebrow
