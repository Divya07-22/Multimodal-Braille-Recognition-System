import React from 'react'
import { Github, Linkedin, Mail, Heart, Globe, ExternalLink } from 'lucide-react'
import { useAccessibility } from '../context/AccessibilityContext'
import { Link } from 'react-router-dom'

function Footer() {
  const { settings } = useAccessibility()

  const currentYear = new Date().getFullYear()

  const links = [
    { icon: Github, label: 'GitHub', url: 'https://github.com/Divya07-22' },
    { icon: Linkedin, label: 'LinkedIn', url: 'https://linkedin.com/in/divya' },
    { icon: Mail, label: 'Email', url: 'mailto:divya@braille.com' },
    { icon: Globe, label: 'Website', url: 'https://braille.com' },
  ]

  const footerSections = [
    {
      title: 'About',
      items: [
        { label: 'About Us', href: '#' },
        { label: 'Our Mission', href: '#' },
        { label: 'Team', href: '#' },
        { label: 'Blog', href: '#' },
      ]
    },
    {
      title: 'Features',
      items: [
        { label: 'Text to Braille', href: '/text-to-braille' },
        { label: 'Image Recognition', href: '/image-to-braille' },
        { label: 'PDF Support', href: '#' },
        { label: 'Accessibility', href: '#' },
      ]
    },
    {
      title: 'Legal',
      items: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
        { label: 'Cookie Policy', href: '#' },
        { label: 'GDPR Compliance', href: '#' },
      ]
    },
    {
      title: 'Support',
      items: [
        { label: 'Help Center', href: '#' },
        { label: 'Contact Us', href: '#' },
        { label: 'FAQ', href: '#' },
        { label: 'Community', href: '#' },
      ]
    }
  ]

  return (
    <footer className={`${settings.highContrast ? 'bg-black border-t-4 border-yellow-400' : 'bg-white/10 backdrop-blur-md border-t border-white/20'} text-white py-16 mt-16`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className={`w-12 h-12 rounded-lg ${settings.highContrast ? 'bg-yellow-400' : 'bg-gradient-to-br from-pink-500 to-purple-600'} flex items-center justify-center mb-3`}>
              <span className={`text-xl font-bold ${settings.highContrast ? 'text-black' : 'text-white'}`}>⠃</span>
            </div>
            <h3 className={`text-lg font-bold mb-3 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
              Braille Tool
            </h3>
            <p className={`${settings.highContrast ? 'text-yellow-100' : 'text-white/70'} text-sm leading-relaxed`}>
              Making accessibility easy for everyone. Convert text to Braille instantly with AI-powered technology.
            </p>
          </div>

          {/* Links Sections */}
          {footerSections.map((section, idx) => (
            <div key={idx}>
              <h4 className={`text-sm font-bold mb-4 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
                {section.title}
              </h4>
              <ul className={`space-y-2 text-sm ${settings.highContrast ? 'text-yellow-100' : 'text-white/70'}`}>
                {section.items.map((item, i) => (
                  <li key={i}>
                    <a href={item.href} className={`hover:${settings.highContrast ? 'text-yellow-300' : 'text-white'} transition-colors inline-flex items-center gap-1`}>
                      {item.label}
                      <ExternalLink size={12} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Links */}
        <div className={`mb-8 pb-8 border-b ${settings.highContrast ? 'border-yellow-400' : 'border-white/20'}`}>
          <h4 className={`text-sm font-bold mb-4 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
            Follow Us
          </h4>
          <div className="flex space-x-4">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-lg transition-all ${
                    settings.highContrast 
                      ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  aria-label={link.label}
                  title={link.label}
                >
                  <Icon size={20} />
                </a>
              )
            })}
          </div>
        </div>

        {/* Bottom Info */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className={`${settings.highContrast ? 'text-yellow-300' : 'text-white/70'} text-sm flex items-center gap-2`}>
            Made with <Heart size={16} className="text-red-400" /> for accessibility by Divya07-22
          </p>
          <p className={`${settings.highContrast ? 'text-yellow-300' : 'text-white/70'} text-sm mt-4 md:mt-0`}>
            © {currentYear} Automated Braille Conversion Tool. All rights reserved.
          </p>
        </div>

        {/* Version Info */}
        <div className={`mt-6 pt-6 text-center text-xs ${settings.highContrast ? 'text-yellow-200 border-t border-yellow-400' : 'text-white/50 border-t border-white/20'}`}>
          <p>Version 1.0.0 • Last Updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer