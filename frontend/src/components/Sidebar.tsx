import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Home, BookOpen, Image, ArrowDownUp, Settings, BarChart3, HelpCircle, FileText } from 'lucide-react'
import { useAccessibility } from '../context/AccessibilityContext'

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()
  const { settings } = useAccessibility()

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: BookOpen, label: 'Text to Braille', path: '/text-to-braille' },
    { icon: Image, label: 'Image to Braille', path: '/image-to-braille' },
    { icon: ArrowDownUp, label: 'Braille to Text', path: '/braille-to-text' },
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Documentation', path: '#' },
    { icon: HelpCircle, label: 'Help & Support', path: '#' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <aside className={`${
      isCollapsed ? 'w-20' : 'w-64'
    } transition-all duration-300 ${
      settings.highContrast
        ? 'bg-black border-r-4 border-yellow-400'
        : 'bg-white/10 backdrop-blur border-r border-white/20'
    } h-screen sticky top-0 overflow-y-auto hidden md:block`}>
      <div className="p-4 space-y-4">
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full py-2 px-3 rounded-lg transition-all flex items-center justify-center ${
            settings.highContrast
              ? 'bg-yellow-400 text-black hover:bg-yellow-300'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {/* Menu Items */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  isActive(item.path)
                    ? settings.highContrast
                      ? 'bg-yellow-400 text-black'
                      : 'bg-white/20 text-white'
                    : settings.highContrast
                      ? 'text-yellow-300 hover:bg-yellow-400/10'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                title={item.label}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar