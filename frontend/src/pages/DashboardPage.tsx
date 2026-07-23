import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { UserButton } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import { KineticGrid } from '@/components/ui/KineticGrid'
import {
  FileText, CircleHelp,
  Settings, LogOut, Menu, X, Sparkles, ArrowUpRight,
  Zap, Radio, Clock, Lock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text'

const tools = [
  {
    id: 'nora-specialist',
    icon: Sparkles,
    title: 'Nora AI',
    description: 'Ask anything, get instant step-by-step explanations, run active recall drills, or jump into a live voice session.',
    href: '/pdf',
    badge: 'AI SPECIALIST',
    featured: true,
  },
  {
    id: 'notes',
    icon: FileText,
    title: 'Notes & Summariser',
    description: 'Synthesize structured study notes from any topic or summarize PDF textbook chapters in seconds.',
    href: '/notes',
  },
  {
    id: 'quiz',
    icon: CircleHelp,
    title: 'Quizzes & Flashcards',
    description: 'Auto-generate interactive multiple-choice quizzes or 3D double-sided flip flashcard decks.',
    href: '/quiz',
  },
]

const upcomingFeatures = [
  {
    id: 'podcast',
    icon: Radio,
    title: 'AI Audio Podcaster',
    description: 'Transform study notes and PDF documents into 2-person conversational AI podcast audio drills.',
    status: 'In Development',
    tag: 'Q3 RELEASE',
  },
  {
    id: 'multiplayer',
    icon: Zap,
    title: 'Live Study Squads',
    description: 'Real-time collaborative study rooms with shared voice, active recall quizzes, and multiplayer flashcards.',
    status: 'Pipeline',
    tag: 'COMING SOON',
  },
]

export function DashboardPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cardsVisible, setCardsVisible] = useState(false)

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setCardsVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'Student'

  return (
    <div className="min-h-screen bg-[#08080a] text-[#F4F2EC] relative overflow-hidden font-sans selection:bg-white/20 selection:text-[#08080a]">
      {/* Kinetic Warp Grid Background (from another.md) */}
      <KineticGrid globalColor="monochrome" />

      {/* Glass Navigation Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
            ? 'top-3 mx-4 lg:mx-12 rounded-3xl bg-background/70 backdrop-blur-2xl border border-foreground/10 shadow-lg'
            : 'bg-transparent border-b border-foreground/10'
          }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo-icon.png"
              alt="StudySense AI Logo"
              className="h-9 sm:h-10 w-auto object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex items-center gap-2">
              <span className="text-xl font-display font-semibold tracking-tight text-[#F4F2EC] group-hover:opacity-90 transition-opacity">
                StudySense
              </span>
              <span className="text-[11px] font-offbit bg-positive/10 text-positive border border-positive/20 px-2 py-0.5 rounded-full uppercase tracking-widest font-semibold">
                AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-xs font-mono text-muted-foreground mr-1">{user?.email}</span>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                baseTheme: dark,
                elements: {
                  userButtonPopoverFooter: '!hidden',
                  devModeBadge: '!hidden',
                  footer: '!hidden',
                }
              }}
            />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors mr-2 px-3 py-1.5 rounded-full hover:bg-muted/40"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>

            <Button
              size="sm"
              variant="outline"
              className="rounded-full border-foreground/15 bg-background/60 backdrop-blur-md font-mono text-xs hover:bg-muted/50"
              asChild
            >
              <Link to="/settings">
                <Settings className="w-3.5 h-3.5 mr-1.5" />
                Settings
              </Link>
            </Button>
          </div>

          {/* Mobile Actions: Theme Toggle + Menu */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-full border border-foreground/10 bg-background/50 backdrop-blur-md"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Glass Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background/90 backdrop-blur-2xl pt-24 px-6">
          <div className="space-y-6 pt-6 border-t border-foreground/10 font-mono">
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <Link
              to="/settings"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 text-sm text-foreground hover:text-muted-foreground transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings & Engine Status
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 text-sm text-destructive hover:text-destructive/80 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="relative z-10 pt-32 pb-24 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Youthful Welcome Hero */}
        <div className="mb-14 space-y-4">
          <div className="flex justify-start">
            <AnimatedGradientText className="!mx-0 px-4 py-1 border border-foreground/10 bg-card/60 backdrop-blur-xl">
              <span className="w-2 h-2 rounded-full bg-positive animate-pulse mr-2" />
              <span className="font-offbit text-xs uppercase tracking-widest animate-gradient bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent font-bold">
                ALWAYS READY TO HELP
              </span>
            </AnimatedGradientText>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display tracking-tight leading-tight">
            Welcome,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground to-positive">
              {firstName}.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground font-sans max-w-xl leading-relaxed">
            What would be helpful for you today? Select a tool below to jump straight in.
          </p>
        </div>

        {/* Liquid Glass Tool Cards Grid */}
        <div id="tools" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, i) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.id}
                to={tool.href}
                id={`tool-card-${tool.id}`}
                className={`group relative rounded-3xl border p-7 transition-all duration-500 backdrop-blur-xl flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-2xl hover:-translate-y-1 ${tool.featured
                    ? 'border-positive/40 bg-gradient-to-b from-positive/5 via-card/60 to-card/90 hover:border-positive/70'
                    : 'border-foreground/10 bg-card/40 hover:border-foreground/30 hover:bg-card/70'
                  } ${cardsVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                  }`}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                {/* Internal Liquid Hover Glow Effect */}
                <div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-positive/10 via-transparent to-purple-500/10 rounded-3xl" />

                <div className="relative z-10">
                  {/* Card Header: Icon + Badge / Index */}
                  <div className="flex items-center justify-between mb-8">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 ${tool.featured
                        ? 'bg-positive/15 border-positive/30 text-positive shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : 'bg-muted/40 border-foreground/10 text-foreground'
                      }`}>
                      <Icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>

                    {tool.badge ? (
                      <span className="font-offbit text-xs uppercase tracking-wider text-positive border border-positive/30 bg-positive/10 px-3 py-1 rounded-full flex items-center gap-1.5 font-semibold">
                        <Sparkles className="w-3 h-3" />
                        {tool.badge}
                      </span>
                    ) : (
                      <span className="font-offbit text-sm text-muted-foreground/70 font-bold tracking-wider">
                        0{i + 1}
                      </span>
                    )}
                  </div>

                  {/* Card Title & Description */}
                  <h2 className="text-2xl font-offbit font-bold tracking-wide mb-3 group-hover:translate-x-1 transition-transform duration-300 flex items-center justify-between">
                    <span>{tool.title}</span>
                    <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-positive" />
                  </h2>

                  <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                    {tool.description}
                  </p>
                </div>

                {/* Footer Link Label */}
                <div className="relative z-10 mt-8 pt-4 border-t border-foreground/10 flex items-center justify-between font-offbit text-xs text-muted-foreground group-hover:text-foreground transition-colors font-bold tracking-wider">
                  <span>Open Tool</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Next-Gen Feature Pipeline (Coming Soon Block) */}
        <div className="mt-20 pt-16 border-t border-foreground/10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md text-[11px] font-offbit font-semibold tracking-widest uppercase text-purple-300">
                <span className="relative flex h-2 w-2 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-400" />
                </span>
                <span>COMING SOON</span>
              </div>
              <h2 className="text-3xl font-offbit font-bold tracking-tight text-foreground">
                Next-Gen AI Pipeline
              </h2>
              <p className="text-sm text-muted-foreground font-sans max-w-xl">
                We're continuously engineering new study tools to accelerate your learning speed. Here's what's dropping next.
              </p>
            </div>
          </div>

          {/* Coming Soon Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingFeatures.map((feat) => {
              const FeatIcon = feat.icon
              return (
                <div
                  key={feat.id}
                  className="group relative rounded-3xl border border-foreground/10 bg-card/30 hover:border-purple-500/30 hover:bg-card/50 backdrop-blur-xl p-7 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Subtle Shimmer Border Overlay */}
                  <div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 rounded-3xl" />

                  <div className="relative z-10 space-y-6">
                    {/* Header: Icon + Lock/Status Badge */}
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                        <FeatIcon className="w-5 h-5" />
                      </div>

                      <span className="font-offbit text-[11px] uppercase tracking-wider text-purple-300 border border-purple-500/30 bg-purple-500/10 px-3 py-1 rounded-full flex items-center gap-1.5 font-semibold">
                        <Clock className="w-3 h-3" />
                        {feat.tag}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-xl font-offbit font-bold tracking-wide mb-2 text-foreground flex items-center gap-2">
                        <span>{feat.title}</span>
                        <Lock className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                      </h3>

                      <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                        {feat.description}
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator Bar */}
                  <div className="relative z-10 mt-6 pt-4 border-t border-foreground/10 flex items-center justify-between font-offbit text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5 text-purple-300/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      {feat.status}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold">
                      IN PROGRESS
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
