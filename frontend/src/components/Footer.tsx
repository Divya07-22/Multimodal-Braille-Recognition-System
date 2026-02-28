
import { Github, Linkedin, Mail, Heart, Globe, Zap, ArrowUpRight } from 'lucide-react'
import { useAccessibility } from '../context/useAccessibility'
import { Link } from 'react-router-dom'

function Footer() {
  const { settings } = useAccessibility()
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: 'Features',
      items: [
        { label: 'Text to Braille', href: '/text-to-braille' },
        { label: 'Image to Braille', href: '/image-to-braille' },
        { label: 'Braille to Text', href: '/braille-to-text' },
        { label: 'Dashboard', href: '/dashboard' },
      ]
    },
    {
      title: 'Resources',
      items: [
        { label: 'Documentation', href: '#' },
        { label: 'API Reference', href: '#' },
        { label: 'Braille Guide', href: '#' },
        { label: 'Accessibility Tips', href: '#' },
      ]
    },
    {
      title: 'Legal',
      items: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
        { label: 'Cookie Policy', href: '#' },
        { label: 'GDPR', href: '#' },
      ]
    },
  ]

  const socials = [
    { icon: Github, label: 'GitHub', url: 'https://github.com' },
    { icon: Linkedin, label: 'LinkedIn', url: 'https://linkedin.com' },
    { icon: Mail, label: 'Email', url: 'mailto:support@brailleai.com' },
    { icon: Globe, label: 'Website', url: '#' },
  ]

  return (
    <footer className={`relative mt-20 ${
      settings.highContrast
        ? 'bg-black border-t-4 border-yellow-400'
        : 'border-t border-white/10'
    }`}>
      {/* Top gradient line */}
      {!settings.highContrast && (
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
      )}

      {/* Subtle background */}
      {!settings.highContrast && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(10,15,30,0.8)] pointer-events-none" />
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-5 group w-fit">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-violet-500/40 transition-all">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <span className={`font-black text-lg ${settings.highContrast ? 'text-yellow-400' : 'gradient-text'}`}>BrailleAI</span>
                <div className="text-[10px] text-violet-400/70 font-semibold -mt-0.5 tracking-widest uppercase">Conversion Tool</div>
              </div>
            </Link>

            <p className={`text-sm leading-relaxed mb-6 max-w-xs ${settings.highContrast ? 'text-yellow-100' : 'text-white/50'}`}>
              Making Braille accessible to everyone. Powered by AI, built for inclusivity. Free forever.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, label, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${
                    settings.highContrast
                      ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                      : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20'
                  }`}
                  aria-label={label}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className={`text-xs font-bold uppercase tracking-widest mb-4 ${
                settings.highContrast ? 'text-yellow-400' : 'text-white/40'
              }`}>
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className={`text-sm flex items-center gap-1 group transition-all ${
                        settings.highContrast
                          ? 'text-yellow-200 hover:text-yellow-400'
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      {item.label}
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className={`h-px w-full mb-8 ${
          settings.highContrast ? 'bg-yellow-400' : 'bg-white/10'
        }`} />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className={`text-xs flex items-center gap-1.5 ${settings.highContrast ? 'text-yellow-300' : 'text-white/40'}`}>
            Made with <Heart size={12} className="text-red-400 fill-current" /> for accessibility
            <span className="hidden sm:inline">· © {currentYear} BrailleAI · All rights reserved</span>
          </p>

          <div className={`flex items-center gap-4 text-xs ${settings.highContrast ? 'text-yellow-200' : 'text-white/30'}`}>
            <span>v1.0.0</span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer