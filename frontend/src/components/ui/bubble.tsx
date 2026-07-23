import * as React from "react"
import { cn } from "@/lib/utils"

export interface BubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "user" | "ai"
}

export const Bubble = React.forwardRef<HTMLDivElement, BubbleProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-block rounded-2xl px-4 py-2.5 text-sm transition-all",
          variant === "user" && "bg-white/10 border border-white/20 text-[#F4F2EC]",
          variant === "ai" && "bg-white/[0.04] border border-white/10 text-[#F4F2EC] backdrop-blur-xl",
          variant === "default" && "bg-white/5 border border-white/10 text-[#F4F2EC]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Bubble.displayName = "Bubble"

export function BubbleContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("leading-relaxed font-sans", className)} {...props}>
      {children}
    </div>
  )
}

export default Bubble
