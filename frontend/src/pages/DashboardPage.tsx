import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/services/supabaseClient'
import {
  MessageCircle, FileText, CircleHelp, Layers,
  CalendarCheck, FileSearch, Settings, LogOut, Menu, X, ArrowUpRight, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const tools = [
  {
    id: 'tutor',
    icon: MessageCircle,
    title: 'AI Tutor',
    description: 'Ask anything. Get clear, real-time explanations.',
    href: '/tutor',
  },
  {
    id: 'notes',
    icon: FileText,
    title: 'Notes Generator',
    description: 'Turn any topic into structured study notes.',
    href: '/notes',
  },
  {
    id: 'quiz',
    icon: CircleHelp,
    title: 'Quiz Generator',
    description: 'Auto-generate and grade quizzes instantly.',
    href: '/quiz',
  },
  {
    id: 'flashcards',
    icon: Layers,
    title: 'Flashcard Decks',
    description: '3D-flip cards with spaced repetition.',
    href: '/flashcards',
  },
  {
    id: 'planner',
    icon: CalendarCheck,
    title: 'Study Planner',
    description: 'AI revision schedule tailored to your exam date.',
    href: '/planner',
  },
  {
    id: 'pdf',
    icon: FileSearch,
    title: 'PDF Summariser',
    description: 'Upload docs → key points and Q&A in seconds.',
    href: '/pdf',
  },
]

const greetings = ['Good morning', 'Good afternoon', 'Good evening']
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return greetings[0]
  if (h < 18) return greetings[1]
  return greetings[2]
}

function timeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getToolIcon(toolName: string) {
  switch (toolName) {
    case 'tutor': return MessageCircle
    case 'notes': return FileText
    case 'quiz': return CircleHelp
    case 'flashcards': return Layers
    case 'planner': return CalendarCheck
    case 'pdf': return FileSearch
    default: return MessageCircle
  }
}

export function DashboardPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cardsVisible, setCardsVisible] = useState(false)
  const [activities, setActivities] = useState<any[]>([])
  const [loadingActivity, setLoadingActivity] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setCardsVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    async function fetchActivities() {
      if (!user) return
      try {
        const { data, error } = await supabase
          .from('activity_log')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
        if (error) console.error('Error fetching activities:', error.message)
        if (data) setActivities(data)
      } catch (err) {
        console.error('Error fetching activities:', err)
      } finally {
        setLoadingActivity(false)
      }
    }
    fetchActivities()
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'Student'

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'top-3 mx-4 rounded-2xl bg-background/80 backdrop-blur-xl border border-foreground/10 shadow-xs'
            : 'bg-transparent border-b border-foreground/10'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-baseline gap-1">
            <span className="text-xl font-display">StudySense</span>
            <span className="text-xs text-muted-foreground font-mono">AI</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/history" className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors">
              History
            </Link>
            <span className="text-sm font-mono text-muted-foreground">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full border-foreground/20"
              asChild
            >
              <Link to="/settings">
                <Settings className="w-3.5 h-3.5 mr-1.5" />
                Settings
              </Link>
            </Button>
          </div>

          {/* Mobile */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background pt-20 px-6">
          <div className="space-y-4 pt-8 border-t border-foreground/10">
            <Link to="/history" className="block text-lg font-mono text-foreground" onClick={() => setMobileOpen(false)}>
              History
            </Link>
            <p className="text-sm font-mono text-muted-foreground">{user?.email}</p>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm text-foreground"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="pt-28 pb-24 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Greeting */}
        <div className="mb-16">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Dashboard
          </span>
          <h1 className="text-4xl lg:text-6xl font-display tracking-tight">
            {getGreeting()},
            <br />
            <span className="text-muted-foreground">{firstName}.</span>
          </h1>
          <p className="text-muted-foreground mt-4 font-mono text-sm">
            What would you like to study today?
          </p>
        </div>

        {/* Tool grid */}
        <div id="tools" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, i) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.id}
                to={tool.href}
                id={`tool-card-${tool.id}`}
                className={`group border border-foreground/10 p-8 hover-lift transition-all duration-700 ${
                  cardsVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${i * 75}ms` }}
              >
                <div className="flex items-start justify-between mb-6">
                  <Icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
                  <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                </div>
                <h2 className="text-xl font-sans font-medium mb-2 group-hover:translate-x-1 transition-transform duration-300">
                  {tool.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tool.description}
                </p>
              </Link>
            )
          })}
        </div>

        {/* Recent activity */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
              <span className="w-8 h-px bg-foreground/30" />
              Recent activity
            </span>
            {activities.length > 0 && (
              <Link to="/history" className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                View full history
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
          <div className="border-t border-foreground/10">
            {loadingActivity ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground font-mono text-sm animate-pulse">Loading activity log…</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground font-mono text-sm">
                  No sessions yet — pick a tool above to get started.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-foreground/10">
                {activities.map((act, i) => {
                  const ToolIcon = getToolIcon(act.tool)
                  return (
                    <div key={act.id} className="flex items-center justify-between py-6">
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-sm text-muted-foreground">0{i + 1}</span>
                        <div className="p-2 border border-foreground/10 bg-foreground/3">
                          <ToolIcon className="w-4 h-4 text-foreground" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="font-mono text-sm font-medium">{act.label}</p>
                          <p className="text-xs font-mono text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {timeAgo(act.created_at)}
                          </p>
                        </div>
                      </div>
                      <Link
                        to={act.tool === 'tutor' ? `/tutor?session=${act.ref_id}` : `/${act.tool}`}
                        className="text-xs font-mono border border-foreground/15 hover:border-foreground/50 px-3 py-1.5 hover:bg-foreground/5 transition-all"
                      >
                        Open
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

