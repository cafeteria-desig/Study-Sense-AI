import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

export function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await signUp(email, password, fullName)
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 1500)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 md:px-6">
      <Link
        to="/"
        className="absolute top-8 left-8 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
      >
        ← StudySense AI
      </Link>

      <div className="w-full max-w-md">
        <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-8">
          <span className="w-8 h-px bg-foreground/30" />
          Get started
        </span>

        <h1 className="text-4xl font-display tracking-tight mb-2">Create your account</h1>
        <p className="text-muted-foreground mb-10 font-mono text-sm">
          Free plan · No credit card · Cancel any time.
        </p>

        <div className="border border-foreground/10 p-6 md:p-8">
          {success ? (
            <div className="text-center py-8">
              <p className="text-2xl font-display mb-3">You&apos;re in.</p>
              <p className="text-sm font-mono text-muted-foreground">
                Redirecting to your dashboard…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full name */}
              <div className="space-y-2">
                <label htmlFor="reg-name" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Full name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Ada Lovelace"
                  className="w-full h-11 bg-input px-4 text-sm font-mono border border-border focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="reg-email" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Email address
                </label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full h-11 bg-input px-4 text-sm font-mono border border-border focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="reg-password" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Password <span className="normal-case">(min 8 chars)</span>
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full h-11 bg-input px-4 pr-12 text-sm font-mono border border-border focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm font-mono text-destructive bg-destructive/5 border border-destructive/20 px-4 py-3">
                  {error}
                </p>
              )}

              <Button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-foreground hover:bg-foreground/90 text-background rounded-none text-sm group"
              >
                {loading ? (
                  <span className="font-mono text-xs">Creating account…</span>
                ) : (
                  <>
                    Create free account
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground font-mono text-center leading-relaxed">
                By creating an account you agree to our{' '}
                <a href="#" className="underline underline-offset-4 hover:text-foreground">Terms</a>{' '}
                and{' '}
                <a href="#" className="underline underline-offset-4 hover:text-foreground">Privacy Policy</a>.
              </p>
            </form>
          )}

          {!success && (
            <div className="mt-8 pt-8 border-t border-foreground/10">
              <p className="text-sm text-muted-foreground font-mono text-center">
                Already have an account?{' '}
                <Link to="/login" className="text-foreground hover:underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
