import { Link } from 'react-router-dom'
import { SignIn } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import { KineticGrid } from '@/components/ui/KineticGrid'

export function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-[#08080a] text-[#F4F2EC] flex flex-col items-center justify-center px-4 py-8 relative font-sans overflow-y-auto select-none">
      <KineticGrid globalColor="monochrome" />
      {/* Ambient background glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Top back navigation */}
      <Link
        to="/"
        className="fixed top-6 left-6 text-xs font-mono text-[#A6A49C] hover:text-[#F4F2EC] transition-colors flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md z-30"
      >
        ← Back to StudySense AI
      </Link>

      {/* Centered Auth Card Container */}
      <div className="w-full max-w-[440px] flex flex-col items-center justify-center relative z-10 my-auto pt-10 sm:pt-0">
        {/* Sleek Mode Switcher Pill */}
        <div className="flex items-center gap-1 mb-4 p-1 border border-white/15 bg-white/5 backdrop-blur-xl rounded-full text-xs font-mono shadow-lg">
          <Link
            to="/login"
            className="px-5 py-1.5 rounded-full bg-[#F4F2EC] text-[#08080a] font-bold shadow-md transition-all"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-1.5 rounded-full text-[#A6A49C] hover:text-[#F4F2EC] font-medium transition-all"
          >
            Sign Up
          </Link>
        </div>

        {/* Perfectly Centered Sign In Box with scroll safety */}
        <SignIn
          path="/login"
          routing="path"
          signUpUrl="/register"
          fallbackRedirectUrl="/dashboard"
          appearance={{
            baseTheme: dark,
            layout: {
              socialButtonsVariant: 'blockButton',
            },
            elements: {
              rootBox: 'w-full flex justify-center items-center',
              cardBox: 'w-full',
              card: 'bg-white/[0.03] border border-white/15 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.8)] rounded-3xl p-5 sm:p-7 w-full my-auto max-h-[85vh] overflow-y-auto',
              headerTitle: 'text-white font-serif text-2xl tracking-tight text-center',
              headerSubtitle: 'text-[#A6A49C] font-mono text-xs text-center',
              socialButtonsBlockButton: 'bg-white/5 border border-white/15 text-[#F4F2EC] hover:bg-white/10 font-mono text-xs rounded-xl h-10 transition-all',
              socialButtonsBlockButtonText: 'text-[#F4F2EC] font-mono text-xs font-medium',
              dividerLine: 'bg-white/10',
              dividerText: 'text-[#726F68] font-mono text-[11px] uppercase tracking-widest',
              formFieldLabel: 'text-[#A6A49C] font-mono text-[11px] uppercase tracking-wider font-medium',
              formFieldInput: 'bg-white/[0.05] border-white/15 text-white font-mono text-sm focus:border-white focus:ring-1 focus:ring-white/40 rounded-xl h-11 placeholder:text-white/20 transition-all',
              formButtonPrimary: 'bg-[#F4F2EC] hover:bg-white text-[#08080a] font-mono text-sm font-semibold rounded-xl h-11 transition-all shadow-md mt-2',
              footerActionText: 'text-[#A6A49C] font-mono text-xs',
              footerActionLink: 'text-white font-mono text-xs font-semibold underline underline-offset-4 hover:text-[#F4F2EC]',
              footer: '!hidden',
              footerPages: '!hidden',
              devModeBadge: '!hidden',
            }
          }}
        />
      </div>
    </div>
  )
}

export default LoginPage
