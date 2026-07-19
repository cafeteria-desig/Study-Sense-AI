import { useState, useEffect } from 'react'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/services/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Check, Moon, Sun, LogOut, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    toast.success(`Theme switched to ${next ? 'dark' : 'light'} mode!`)
  }

  const saveProfile = async () => {
    if (saving) return
    setSaving(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } })
    setSaving(false)
    if (error) {
      setError(error.message)
      toast.error('Failed to update profile: ' + error.message)
    } else {
      setSaved(true)
      toast.success('Profile updated successfully!')
      setTimeout(() => setSaved(false), 2500)
    }
  }



  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
            <span className="w-8 h-px bg-foreground/30" />
            Settings
          </span>
          <h1 className="text-4xl font-display tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground font-mono text-sm mt-2">Manage your profile and preferences.</p>
        </div>

        {/* Profile */}
        <section className="border border-foreground/10 p-6 space-y-5 mb-5">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Profile</h2>
          <div className="space-y-2">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Full Name
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveProfile()}
              className="w-full h-11 bg-input px-4 text-sm font-mono border border-border focus:border-foreground focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Email Address
            </label>
            <input
              value={user?.email ?? ''}
              disabled
              className="w-full h-11 bg-input px-4 text-sm font-mono border border-border text-muted-foreground cursor-not-allowed opacity-50"
            />
            <p className="text-xs font-mono text-muted-foreground/60">Email cannot be changed here.</p>
          </div>
          {error && (
            <p className="text-sm font-mono text-destructive bg-destructive/5 border border-destructive/20 px-4 py-3">
              {error}
            </p>
          )}
          <Button
            onClick={saveProfile}
            disabled={saving}
            className="h-11 px-6 bg-foreground text-background hover:bg-foreground/90 rounded-none"
          >
            {saving ? (
              <span className="flex items-center gap-2 font-mono text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </span>
            ) : saved ? (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Saved!
              </span>
            ) : (
              'Save Changes'
            )}
          </Button>
        </section>

        {/* Appearance */}
        <section className="border border-foreground/10 p-6 mb-5">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-5">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm">Theme</p>
              <p className="font-mono text-xs text-muted-foreground mt-0.5">
                Currently: {dark ? 'Dark mode' : 'Light mode'}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="w-11 h-11 border border-foreground/20 flex items-center justify-center hover:bg-foreground/5 transition-colors"
              aria-label="Toggle theme"
            >
              {dark
                ? <Sun className="w-4 h-4" strokeWidth={1.5} />
                : <Moon className="w-4 h-4" strokeWidth={1.5} />
              }
            </button>
          </div>
        </section>

        {/* Account */}
        <section className="border border-foreground/10 p-6">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-5">Account</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span>Signed in as</span>
              <span className="text-foreground">{user?.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors border border-foreground/20 px-4 py-2.5 hover:border-foreground/40"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
              Sign out of StudySense
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
