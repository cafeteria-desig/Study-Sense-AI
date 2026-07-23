import { Link } from 'react-router-dom'

export function FooterSection() {
  return (
    <footer id="footer" className="relative z-10 border-t border-white/[0.09] text-[#A6A49C] text-sm">
      <div className="max-w-[1300px] mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16 items-start">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="font-offbit font-bold text-xl tracking-tight text-[#F4F2EC]">
                StudySense
              </span>
              <span className="font-offbit text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#8CFFB4]/30 bg-[rgba(140,255,180,0.14)] text-[#8CFFB4] uppercase tracking-wider">
                AI
              </span>
            </Link>
            <p className="text-sm text-[#726F68] max-w-xs leading-relaxed font-sans">
              AI-powered learning companion that transforms raw notes and textbooks into total exam mastery.
            </p>
          </div>

          {/* Product Column Only */}
          <div>
            <div className="font-offbit text-xs font-bold uppercase tracking-wider text-[#F4F2EC] mb-4">
              Product
            </div>
            <ul className="space-y-2.5 font-offbit text-xs uppercase tracking-wider">
              <li><a href="#features" className="hover:text-[#F4F2EC] transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-[#F4F2EC] transition-colors">How it works</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.09] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#726F68]">
          <div>© {new Date().getFullYear()} StudySense AI, Inc. All rights reserved.</div>
          <div>Designed with precision for students worldwide.</div>
        </div>
      </div>
    </footer>
  )
}

export default FooterSection
