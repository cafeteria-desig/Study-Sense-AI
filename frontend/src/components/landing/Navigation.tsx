import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { UserButton } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import { Button } from '@/components/ui/button'
import { ArrowRight, Menu, X, LayoutDashboard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function Navigation() {
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#08080a]/75 backdrop-blur-[14px] border-b border-white/[0.09]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-[1300px] mx-auto px-6 lg:px-10 flex items-center justify-between h-20">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="StudySense AI"
            className="h-9 sm:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </Link>

        {/* Center Navigation Links in Offbit Font */}
        <div className="hidden md:flex items-center gap-8 text-xs font-offbit tracking-wider uppercase text-[#A6A49C] absolute left-1/2 -translate-x-1/2">
          <a href="#features" className="hover:text-[#F4F2EC] transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-[#F4F2EC] transition-colors">
            How it Works
          </a>
        </div>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
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
              <Button
                size="sm"
                className="bg-[#F4F2EC] hover:bg-[#F4F2EC]/90 text-[#08080a] font-offbit text-xs font-bold px-5 h-10 rounded-full group shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-2 tracking-wide uppercase"
                asChild
              >
                <Link to="/dashboard">
                  <LayoutDashboard className="w-4 h-4 text-[#08080a]" />
                  Open Dashboard
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-offbit uppercase tracking-wider text-[#A6A49C] hover:text-[#F4F2EC] transition-colors px-3 py-1.5"
              >
                Sign In
              </Link>
              <Button
                size="sm"
                className="bg-[#F4F2EC] hover:bg-[#F4F2EC]/90 text-[#08080a] font-offbit text-xs font-bold px-5 h-10 rounded-full group shadow-md transition-all hover:-translate-y-0.5 uppercase tracking-wide"
                asChild
              >
                <Link to="/register">
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#F4F2EC]"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
            className="md:hidden overflow-hidden bg-[#08080a]/95 backdrop-blur-xl border-b border-white/[0.09] font-offbit"
          >
            <motion.div
              className="px-6 py-6 space-y-4"
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1, duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
            >
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm uppercase tracking-wider text-[#A6A49C] hover:text-[#F4F2EC]"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm uppercase tracking-wider text-[#A6A49C] hover:text-[#F4F2EC]"
          >
            How it Works
          </a>
          <div className="pt-4 border-t border-white/[0.09] flex flex-col gap-3">
            {user ? (
              <Button
                className="w-full justify-center bg-[#F4F2EC] text-[#08080a] font-offbit text-xs font-bold uppercase tracking-wide h-11 rounded-full flex items-center gap-2"
                asChild
              >
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <LayoutDashboard className="w-4 h-4" />
                  Open Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-xs font-offbit uppercase tracking-wider text-[#A6A49C] py-2"
                >
                  Sign In
                </Link>
                <Button
                  className="w-full justify-center bg-[#F4F2EC] text-[#08080a] font-semibold h-11 rounded-full"
                  asChild
                >
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    Get Started Free <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </Button>
              </>
            )}
          </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navigation
