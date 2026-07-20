import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  MessageCircle, FileText, CircleHelp, Layers,
  CalendarCheck, FileSearch, LayoutDashboard, Settings, LogOut, Menu, X, History
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/tutor',      icon: MessageCircle,   label: 'AI Tutor' },
  { href: '/notes',      icon: FileText,         label: 'Notes' },
  { href: '/quiz',       icon: CircleHelp,       label: 'Quiz' },
  { href: '/flashcards', icon: Layers,           label: 'Flashcards' },
  { href: '/planner',    icon: CalendarCheck,    label: 'Planner' },
  { href: '/pdf',        icon: FileSearch,       label: 'PDF' },
  { href: '/history',    icon: History,          label: 'History' },
]


interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const NavLink = ({ href, icon: Icon, label }: (typeof navItems)[0]) => {
    const active = location.pathname === href
    return (
      <Link
        to={href}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-150 ${
          active
            ? 'bg-foreground text-background'
            : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
        }`}
      >
        <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
        <span className="font-mono">{label}</span>
      </Link>
    )
  }

  const Sidebar = () => (
    <aside className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-foreground/10 flex-shrink-0">
        <Link to="/" className="flex items-baseline gap-1">
          <span className="text-lg font-display">StudySense</span>
          <span className="text-xs text-muted-foreground font-mono">AI</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-foreground/10 p-2 space-y-0.5">
        <Link
          to="/settings"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-150 ${
            location.pathname === '/settings'
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
          }`}
        >
          <Settings className="w-4 h-4" strokeWidth={1.5} />
          <span className="font-mono">Settings</span>
        </Link>
        <div className="px-3 py-2">
          <p className="text-xs font-mono text-muted-foreground truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
          <span className="font-mono">Sign out</span>
        </button>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col fixed inset-y-0 left-0 z-50 w-60 bg-background border-r border-foreground/10">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-background border-r border-foreground/10 md:hidden transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="md:hidden h-14 border-b border-foreground/10 flex items-center justify-between px-4 flex-shrink-0 bg-background/80 backdrop-blur-md sticky top-0 z-40">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link to="/" className="flex items-baseline gap-1">
            <span className="font-display text-base">StudySense</span>
            <span className="text-xs text-muted-foreground font-mono">AI</span>
          </Link>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
