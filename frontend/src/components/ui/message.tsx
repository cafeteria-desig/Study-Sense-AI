import * as React from "react"
import { cn } from "@/lib/utils"

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  role?: "user" | "assistant" | "system"
}

export const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ className, role = "user", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-3 text-sm p-5 rounded-3xl transition-all relative group",
          role === "user"
            ? "bg-white/10 border border-white/25 text-[#F4F2EC] ml-auto max-w-xl rounded-tr-xs shadow-lg"
            : "bg-white/[0.04] border border-white/15 text-[#F4F2EC] max-w-3xl rounded-tl-xs backdrop-blur-2xl shadow-xl",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Message.displayName = "Message"

export function MessageAvatar({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "w-9 h-9 rounded-full border border-white/20 bg-white/10 flex items-center justify-center shrink-0 shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function MessageContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1 space-y-1.5 min-w-0 font-sans leading-relaxed", className)} {...props}>
      {children}
    </div>
  )
}

export default Message
