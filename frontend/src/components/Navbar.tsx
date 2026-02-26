import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, Zap, User, LogOut, Settings, History,
  ChevronDown, Eye, BookOpen, Image, ArrowDownUp, LayoutDashboard
} from 'lucide-react'
import { useAuthStore } from '../hooks/useAuth'
import { useAccessibility } from '../context/AccessibilityContext'
import toast from 'react-hot-toast'

const navLinks = [
  { to: '/text-to-braille', label: 'Text → Braille', icon: BookOpen },
  { to: '/image-to-braille', label: 'Image → Braille', icon: Image },
  { to: '/braille-to-text', label: 'Braille → Text', icon: ArrowDownUp },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { settings } = useAccessibility()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-[rgba(10,15,30,0.95)] backdrop-blur-xl border-b border-white/10 shadow-2xl'
          : 'bg-transparent'
        } ${settings.highContrast ? '!bg-black !border-yellow-400' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" aria-label="Braille Tool Home">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-violet-500/40 transition-shadow">
                <Zap size={20} className="text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0a0f1e] animate-pulse" />
            </div>
            <div>
              <span className={`font-black text-lg tracking-tight ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
                BrailleAI
              </span>
              <div className="text-[10px] text-violet-400 font-semibold -mt-1 tracking-widest uppercase">
                Conversion Tool
              </div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive(to)
                    ? settings.highContrast
                      ? 'bg-yellow-400 text-black'
                      : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                    : settings.highContrast
                      ? 'text-yellow-400 hover:bg-yellow-400 hover:text-black'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Dashboard link */}
                <Link
                  to="/dashboard"
                  className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive('/dashboard')
                      ? 'bg-violet-500/20 text-violet-300'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                    } ${settings.highContrast ? 'text-yellow-400 hover:bg-yellow-400 hover:text-black' : ''}`}
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${settings.highContrast
                        ? 'border-yellow-400 text-yellow-400'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 text-white'
                      }`}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium hidden sm:block max-w-[80px] truncate">
                      {user?.username}
                    </span>
                    <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute right-0 top-full mt-2 w-52 rounded-xl border shadow-2xl overflow-hidden ${settings.highContrast
                            ? 'bg-black border-yellow-400'
                            : 'bg-[#0d1626] border-white/10 backdrop-blur-xl'
                          }`}
                      >
                        <div className={`px-4 py-3 border-b ${settings.highContrast ? 'border-yellow-400' : 'border-white/10'}`}>
                          <div className={`text-sm font-semibold ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
                            {user?.full_name || user?.username}
                          </div>
                          <div className="text-xs text-white/40 truncate">{user?.email}</div>
                        </div>
                        {[
                          { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                          { to: '/history', icon: History, label: 'History' },
                          { to: '/profile', icon: Settings, label: 'Settings' },
                        ].map(({ to, icon: Icon, label }) => (
                          <Link
                            key={to}
                            to={to}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${settings.highContrast
                                ? 'text-yellow-400 hover:bg-yellow-400 hover:text-black'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                              }`}
                          >
                            <Icon size={15} />
                            {label}
                          </Link>
                        ))}
                        <div className={`border-t ${settings.highContrast ? 'border-yellow-400' : 'border-white/10'}`}>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <LogOut size={15} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${settings.highContrast ? 'text-yellow-400 hover:bg-yellow-400 hover:text-black' : 'text-white/70 hover:text-white'
                  }`}>
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary !py-2 !px-4 !text-sm">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden btn-icon"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`md:hidden overflow-hidden border-t ${settings.highContrast
                ? 'bg-black border-yellow-400'
                : 'bg-[rgba(10,15,30,0.98)] border-white/10 backdrop-blur-xl'
              }`}
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(to)
                      ? settings.highContrast
                        ? 'bg-yellow-400 text-black'
                        : 'bg-violet-500/20 text-violet-300'
                      : settings.highContrast
                        ? 'text-yellow-400 hover:bg-yellow-400 hover:text-black'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white">
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut size={18} /> Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" className="flex-1 text-center py-2.5 rounded-xl border border-white/10 text-white/70 text-sm">Sign In</Link>
                  <Link to="/register" className="flex-1 text-center py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 text-white text-sm font-medium">Register</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}