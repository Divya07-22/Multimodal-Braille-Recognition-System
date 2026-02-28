import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, Home, BookOpen, Image,
  ArrowDownUp, BarChart3, HelpCircle, FileText, Zap
} from 'lucide-react'
import { useAccessibility } from '../context/useAccessibility'

const menuItems = [
  { icon: Home, label: 'Home', path: '/', color: 'text-white' },
  { icon: BookOpen, label: 'Text to Braille', path: '/text-to-braille', color: 'text-violet-400' },
  { icon: Image, label: 'Image to Braille', path: '/image-to-braille', color: 'text-pink-400' },
  { icon: ArrowDownUp, label: 'Braille to Text', path: '/braille-to-text', color: 'text-cyan-400' },
  { icon: BarChart3, label: 'Dashboard', path: '/dashboard', color: 'text-emerald-400' },
  { icon: FileText, label: 'Documentation', path: '#', color: 'text-amber-400' },
  { icon: HelpCircle, label: 'Help & Support', path: '#', color: 'text-blue-400' },
]

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()
  const { settings } = useAccessibility()
  const isActive = (path: string) => location.pathname === path

  return (
    <aside className={`${isCollapsed ? 'w-[72px]' : 'w-64'} transition-all duration-300 ease-in-out hidden md:flex flex-col h-screen sticky top-0 ${
      settings.highContrast
        ? 'bg-black border-r-4 border-yellow-400'
        : 'bg-[rgba(10,15,30,0.8)] backdrop-blur-xl border-r border-white/10'
    }`}>

      {/* Logo area */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b ${
        settings.highContrast ? 'border-yellow-400' : 'border-white/10'
      }`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        {!isCollapsed && (
          <span className={`font-black text-sm ${settings.highContrast ? 'text-yellow-400' : 'gradient-text'}`}>
            BrailleAI
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                active
                  ? settings.highContrast
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gradient-to-r from-violet-500/20 to-pink-500/10 text-white border border-violet-500/30'
                  : settings.highContrast
                    ? 'text-yellow-300 hover:bg-yellow-400/20'
                    : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {active && !settings.highContrast && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-violet-500 to-pink-500" />
              )}
              <Icon size={18} className={`flex-shrink-0 ${active ? (settings.highContrast ? 'text-black' : item.color) : item.color}`} />
              {!isCollapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}

              {/* Tooltip when collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-[#0d1626] border border-white/10 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                  {item.label}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className={`p-2 border-t ${settings.highContrast ? 'border-yellow-400' : 'border-white/10'}`}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium ${
            settings.highContrast
              ? 'bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20 border border-yellow-400'
              : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border border-white/10'
          }`}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed
            ? <ChevronRight size={16} />
            : <><ChevronLeft size={16} /> <span>Collapse</span></>
          }
        </button>
      </div>
    </aside>
  )
}

export default Sidebar