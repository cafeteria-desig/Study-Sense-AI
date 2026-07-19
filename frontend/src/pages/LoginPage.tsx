import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Back to home */}
      <Link
        to="/"
        className="absolute top-8 left-8 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
      >
        ← StudySense AI
      </Link>

      <div className="w-full max-w-md">
        {/* Eyebrow */}
        <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-8">
          <span className="w-8 h-px bg-foreground/30" />
          Welcome back
        </span>

        <h1 className="text-4xl font-display tracking-tight mb-2">Sign in</h1>
        <p className="text-muted-foreground mb-10 font-mono text-sm">
          Continue your study session.
        </p>

        {/* Card */}
        <div className="border border-foreground/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Email address
              </label>
              <input
                id="login-email"
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
              <label htmlFor="login-password" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
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

            {/* Error */}
            {error && (
              <p className="text-sm font-mono text-destructive bg-destructive/5 border border-destructive/20 px-4 py-3">
                {error}
              </p>
            )}

            <Button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-foreground hover:bg-foreground/90 text-background rounded-none text-sm group"
            >
              {loading ? (
                <span className="font-mono text-xs">Signing in…</span>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-foreground/10">
            <p className="text-sm text-muted-foreground font-mono text-center">
              No account?{' '}
              <Link to="/register" className="text-foreground hover:underline underline-offset-4">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
