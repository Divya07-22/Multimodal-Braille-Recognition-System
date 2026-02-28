import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, Zap, LogOut, Settings, History, ChevronDown,
  BookOpen, Image, ArrowDownUp, LayoutDashboard, User,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface NavLink {
  label: string
  path: string
  icon: React.ReactNode
  requiresAuth?: boolean
}

const navLinks: NavLink[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} />, requiresAuth: true },
  { label: 'Text to Braille', path: '/text-to-braille', icon: <BookOpen size={18} /> },
  { label: 'Image to Braille', path: '/image-to-braille', icon: <Image size={18} /> },
  { label: 'Braille to Text', path: '/braille-to-text', icon: <ArrowDownUp size={18} /> },
  { label: 'History', path: '/history', icon: <History size={18} />, requiresAuth: true },
]

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [prevPathname, setPrevPathname] = useState(location.pathname)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // React-recommended pattern: adjust state when a value changes during render
  // See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname)
    if (mobileOpen) setMobileOpen(false)
    if (userMenuOpen) setUserMenuOpen(false)
  }

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch {
      navigate('/')
    }
  }

  const visibleLinks = navLinks.filter(link => !link.requiresAuth || isAuthenticated)

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-white/10'
        : 'bg-gray-900/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl hover:opacity-80 transition-opacity">
            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
              <Zap size={24} className="text-purple-400" />
            </motion.div>
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              BrailleAI
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {visibleLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(prev => !prev)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.username?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <span className="text-sm font-medium">{user.username}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-gray-800 border border-white/10 rounded-xl shadow-xl overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-white text-sm font-semibold">{user.full_name ?? user.username}</p>
                        <p className="text-gray-400 text-xs truncate">{user.email}</p>
                      </div>
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 text-sm transition-colors">
                        <User size={15} /> Profile
                      </Link>
                      <Link to="/settings" className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 text-sm transition-colors">
                        <Settings size={15} /> Settings
                      </Link>
                      <div className="border-t border-white/10">
                        <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm transition-colors">
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(prev => !prev)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-white/10 bg-gray-900/98 backdrop-blur-md overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {visibleLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === link.path
                      ? 'bg-purple-600/30 text-purple-300'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}

              <div className="pt-3 border-t border-white/10 space-y-1">
                {isAuthenticated && user ? (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-white text-sm font-semibold">{user.full_name ?? user.username}</p>
                      <p className="text-gray-400 text-xs">{user.email}</p>
                    </div>
                    <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                      <User size={16} /> Profile
                    </Link>
                    <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                      <Settings size={16} /> Settings
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                      Sign In
                    </Link>
                    <Link to="/register" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-purple-600 hover:bg-purple-500 text-white transition-colors">
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}