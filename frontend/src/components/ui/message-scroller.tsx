import * as React from "react"
import { ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface MessageScrollerContextType {
  isAtBottom: boolean
  scrollToBottom: (smooth?: boolean) => void
  viewportRef: React.RefObject<HTMLDivElement | null>
  checkScroll: () => void
}

const MessageScrollerContext = React.createContext<MessageScrollerContextType | null>(null)

export function useMessageScroller() {
  const context = React.useContext(MessageScrollerContext)
  if (!context) {
    throw new Error("useMessageScroller must be used within a MessageScrollerProvider")
  }
  return context
}

export function MessageScrollerProvider({ children }: { children: React.ReactNode }) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = React.useState(true)

  const scrollToBottom = React.useCallback((smooth = true) => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      })
    }
  }, [])

  const checkScroll = React.useCallback(() => {
    if (!viewportRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = viewportRef.current
    const distanceToBottom = scrollHeight - scrollTop - clientHeight
    setIsAtBottom(distanceToBottom < 60)
  }, [])

  return (
    <MessageScrollerContext.Provider value={{ isAtBottom, scrollToBottom, viewportRef, checkScroll }}>
      {children}
    </MessageScrollerContext.Provider>
  )
}

export interface MessageScrollerProps extends React.HTMLAttributes<HTMLDivElement> {
  autoScroll?: boolean
}

export function MessageScroller({ className, children, autoScroll = true, ...props }: MessageScrollerProps) {
  return (
    <MessageScrollerProvider>
      <MessageScrollerInternal autoScroll={autoScroll} className={className} {...props}>
        {children}
      </MessageScrollerInternal>
    </MessageScrollerProvider>
  )
}

function MessageScrollerInternal({
  className,
  children,
  autoScroll = true,
  ...props
}: MessageScrollerProps) {
  const { isAtBottom, scrollToBottom } = useMessageScroller()

  React.useEffect(() => {
    if (autoScroll && isAtBottom) {
      scrollToBottom(false)
    }
  }, [children, autoScroll, isAtBottom, scrollToBottom])

  return (
    <div className={cn("relative flex flex-col min-h-0 w-full flex-1 overflow-hidden", className)} {...props}>
      {children}
    </div>
  )
}

export function MessageScrollerViewport({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { viewportRef, checkScroll } = useMessageScroller()

  return (
    <div
      ref={viewportRef}
      onScroll={checkScroll}
      className={cn("flex-1 overflow-y-auto w-full scroll-smooth custom-scrollbar", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function MessageScrollerContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="log"
      aria-relevant="additions"
      className={cn("flex flex-col w-full min-h-full", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function MessageScrollerButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { isAtBottom, scrollToBottom } = useMessageScroller()

  if (isAtBottom) return null

  return (
    <button
      type="button"
      onClick={() => scrollToBottom(true)}
      className={cn(
        "absolute bottom-4 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-white/20 bg-[#08080a]/90 backdrop-blur-xl text-xs font-mono text-[#F4F2EC] hover:bg-white/10 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 cursor-pointer",
        className
      )}
      {...props}
    >
      {children || (
        <>
          <ArrowDown className="w-3.5 h-3.5 text-white animate-bounce" />
          <span>New Messages</span>
        </>
      )}
    </button>
  )
}
