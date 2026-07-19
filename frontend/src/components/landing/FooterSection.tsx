import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

const footerLinks = {
  Product: [
    { name: 'AI Tutor', href: '#features' },
    { name: 'Notes Generator', href: '#features' },
    { name: 'Quiz Generator', href: '#features' },
    { name: 'Flashcards', href: '#features' },
    { name: 'Study Planner', href: '#features' },
    { name: 'PDF Summariser', href: '#features' },
  ],
  Company: [
    { name: 'About', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Careers', href: '#', badge: 'Hiring' },
    { name: 'Contact', href: '#' },
  ],
  Legal: [
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Cookie Settings', href: '#' },
  ],
}

const socials = [
  { name: 'Twitter', href: '#' },
  { name: 'GitHub', href: '#' },
  { name: 'Discord', href: '#' },
]

function AnimatedWave() {
  return (
    <svg viewBox="0 0 1400 200" className="w-full h-full" preserveAspectRatio="none">
      <path
        d="M0,100 C200,20 400,180 700,100 C1000,20 1200,180 1400,100 L1400,200 L0,200 Z"
        fill="currentColor"
        opacity="0.05"
      >
        <animate
          attributeName="d"
          values="M0,100 C200,20 400,180 700,100 C1000,20 1200,180 1400,100 L1400,200 L0,200 Z;M0,80 C200,160 400,40 700,120 C1000,200 1200,60 1400,80 L1400,200 L0,200 Z;M0,100 C200,20 400,180 700,100 C1000,20 1200,180 1400,100 L1400,200 L0,200 Z"
          dur="8s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  )
}

export function FooterSection() {
  return (
    <footer className="relative border-t border-foreground/10">
      {/* Animated wave background */}
      <div className="absolute inset-0 h-48 opacity-30 pointer-events-none overflow-hidden text-foreground">
        <AnimatedWave />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="py-16 lg:py-24">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 lg:gap-8">
            {/* Brand */}
            <div className="col-span-2">
              <Link to="/" className="inline-flex items-baseline gap-1 mb-6">
                <span className="text-2xl font-display">StudySense</span>
                <span className="text-xs text-muted-foreground font-mono">AI</span>
              </Link>
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-xs">
                The AI study companion for students who want real results. Notes, quizzes,
                flashcards, and personalised revision—in seconds.
              </p>
              <div className="flex gap-6">
                {socials.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-medium mb-6">{title}</h3>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                      >
                        {link.name}
                        {'badge' in link && link.badge && (
                          <span className="text-xs px-2 py-0.5 bg-foreground text-background rounded-full">
                            {link.badge}
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-8 border-t border-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground font-mono">
            © 2025 StudySense AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
