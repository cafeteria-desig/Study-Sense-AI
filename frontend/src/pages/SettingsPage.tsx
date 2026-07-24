import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield, User, Check, Sparkles, Clock, Play, RotateCcw } from 'lucide-react'
import { KineticGrid } from '@/components/ui/KineticGrid'

const SPLASH_LAST_SHOWN_KEY = 'studysense_splash_last_shown'
const SPLASH_MODE_KEY = 'studysense_splash_mode'

export function SettingsPage() {
  const { user, signOut, updateUsername } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Landing page splash mode settings
  const [splashMode, setSplashMode] = useState<string>(() => {
    return localStorage.getItem(SPLASH_MODE_KEY) || '15min'
  })
  const [splashResetMsg, setSplashResetMsg] = useState(false)

  const handleSplashModeChange = (mode: string) => {
    setSplashMode(mode)
    try {
      localStorage.setItem(SPLASH_MODE_KEY, mode)
    } catch (e) {}
  }

  const handleResetSplashTimer = () => {
    try {
      localStorage.removeItem(SPLASH_LAST_SHOWN_KEY)
      setSplashResetMsg(true)
      setTimeout(() => setSplashResetMsg(false), 3000)
    } catch (e) {}
  }

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setErrorMsg('Name cannot be empty')
      return
    }
    setErrorMsg('')
    setSaving(true)
    const { error } = await updateUsername(fullName.trim())
    setSaving(false)

    if (error) {
      setErrorMsg(error.message || 'Failed to update username')
    } else {
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-positive/20 relative">
      <KineticGrid globalColor="monochrome" />
      <main className="max-w-2xl mx-auto px-6 py-20 relative z-10">
        {/* Back navigation */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-foreground mb-12 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-12">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
            <span className="w-8 h-px bg-foreground/30" />
            PREFERENCES & ACCOUNT
          </span>
          <h1 className="text-4xl lg:text-5xl font-display tracking-tight">Settings</h1>
        </div>

        {/* Sections list with hairline dividers */}
        <div className="space-y-12">
          {/* Section 1: User Profile & Name Change */}
          <div className="pt-8 border-t border-foreground/10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-display font-medium flex items-center gap-2">
                  <User className="w-5 h-5 text-positive" />
                  Account Identity
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Change your display username across StudySense and Nora AI.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveName} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Full Name / Username
                </label>
                <div className="flex gap-3 flex-col sm:flex-row">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="flex-1 bg-card/40 border border-foreground/15 rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-positive/50 transition-colors backdrop-blur-md"
                  />
                  <Button
                    type="submit"
                    disabled={saving || !fullName.trim()}
                    className="bg-foreground text-background hover:bg-foreground/90 rounded-2xl px-6 h-11 font-mono text-xs font-semibold shrink-0"
                  >
                    {saving ? (
                      'Saving...'
                    ) : savedSuccess ? (
                      <>
                        <Check className="w-4 h-4 mr-1.5 text-positive" />
                        Saved!
                      </>
                    ) : (
                      'Update Name'
                    )}
                  </Button>
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs font-mono text-destructive">{errorMsg}</p>
              )}

              {savedSuccess && (
                <div className="inline-flex items-center gap-2 text-xs font-mono text-positive bg-positive/10 border border-positive/20 px-3 py-1.5 rounded-full animate-in fade-in">
                  <Sparkles className="w-3.5 h-3.5" />
                  Username updated successfully! Dashboard greeting updated.
                </div>
              )}

              <div className="grid grid-cols-3 py-3 border-b border-foreground/5 font-mono text-xs">
                <span className="text-muted-foreground">Registered Email:</span>
                <span className="col-span-2 text-foreground font-mono">{user?.email}</span>
              </div>
            </form>
          </div>

          {/* Section 2: Text Scrambler Splash Preferences */}
          <div className="pt-8 border-t border-foreground/10 space-y-4">
            <h2 className="text-xl font-display font-medium flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Landing Page Scrambler Intro
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Control how frequently the Text Scrambler intro splash screen plays when visiting or refreshing the front page.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSplashModeChange('15min')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  splashMode === '15min'
                    ? 'border-positive bg-positive/10 text-foreground font-semibold shadow-md'
                    : 'border-foreground/15 bg-card/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="font-mono text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  15-Min Timer
                </div>
                <p className="text-xs font-mono opacity-80 font-normal">
                  Plays once every 15 minutes. Skipped on frequent refreshes.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSplashModeChange('always')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  splashMode === 'always'
                    ? 'border-positive bg-positive/10 text-foreground font-semibold shadow-md'
                    : 'border-foreground/15 bg-card/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="font-mono text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-cyan-400" />
                  Every Visit
                </div>
                <p className="text-xs font-mono opacity-80 font-normal">
                  Always play text scrambler on every refresh or visit.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSplashModeChange('never')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  splashMode === 'never'
                    ? 'border-positive bg-positive/10 text-foreground font-semibold shadow-md'
                    : 'border-foreground/15 bg-card/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="font-mono text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                  Never
                </div>
                <p className="text-xs font-mono opacity-80 font-normal">
                  Always skip text scrambler and go straight to landing page.
                </p>
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetSplashTimer}
                className="rounded-2xl border-foreground/15 font-mono text-xs h-9 px-4 hover:bg-muted/50"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                Reset Timer Now
              </Button>
              {splashResetMsg && (
                <span className="text-xs font-mono text-positive animate-in fade-in">
                  Timer reset! Scrambler will play on next visit.
                </span>
              )}
            </div>
          </div>

          {/* Section 3: AI Provider & Engine */}
          <div className="pt-8 border-t border-foreground/10">
            <h2 className="text-lg font-sans font-medium mb-4">AI Model Status</h2>
            <div className="flex items-start gap-4 p-5 bg-card/40 border border-foreground/10 rounded-2xl backdrop-blur-md">
              <Shield className="w-5 h-5 mt-0.5 text-positive" />
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-wide text-foreground">
                  AI Engine Status: Active & Operational
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  The application is configured to route all tutor, quiz, study plan, and notes generation tasks through the secure backend AI proxy.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Account Actions */}
          <div className="pt-8 border-t border-foreground/10">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive px-6 h-11 text-xs font-mono"
            >
              Sign out of account
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SettingsPage
