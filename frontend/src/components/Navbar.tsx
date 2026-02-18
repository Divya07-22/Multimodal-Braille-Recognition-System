import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Eye, Volume2, Settings, Home, BookOpen, Image as ImageIcon, ArrowDownUp, LogOut, Bell, User } from 'lucide-react'
import { useAccessibility } from '../context/AccessibilityContext'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showAccessibility, setShowAccessibility] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const location = useLocation()
  const { settings, toggleHighContrast, toggleScreenReader, setFontSize } = useAccessibility()

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Text to Braille', path: '/text-to-braille', icon: BookOpen },
    { name: 'Image to Braille', path: '/image-to-braille', icon: ImageIcon },
    { name: 'Braille to Text', path: '/braille-to-text', icon: ArrowDownUp },
    { name: 'Dashboard', path: '/dashboard', icon: Settings },
  ]

  const isActive = (path: string) => location.pathname === path

  const bgClass = settings.highContrast 
    ? 'bg-black border-b-4 border-yellow-400' 
    : 'bg-white/10 backdrop-blur-md border-b border-white/20'

  const textClass = settings.highContrast ? 'text-yellow-400' : 'text-white'

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_name')
    window.location.href = '/login'
  }

  return (
    <nav className={`${bgClass} sticky top-0 z-50 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className={`w-10 h-10 rounded-lg ${settings.highContrast ? 'bg-yellow-400' : 'bg-gradient-to-br from-pink-500 to-purple-600'} flex items-center justify-center transform group-hover:scale-110 transition-transform`}>
              <span className={`text-lg font-bold ${settings.highContrast ? 'text-black' : 'text-white'}`}>⠃</span>
            </div>
            <span className={`text-xl font-bold hidden sm:inline ${textClass}`}>Braille</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(link => {
              const Icon = link.icon
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                    isActive(link.path)
                      ? settings.highContrast 
                        ? 'bg-yellow-400 text-black font-bold'
                        : 'bg-white/20 text-white font-semibold'
                      : settings.highContrast
                        ? 'text-yellow-300 hover:bg-yellow-400 hover:text-black'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  aria-label={link.name}
                  title={link.name}
                >
                  <Icon size={18} />
                  <span className="hidden lg:inline">{link.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-lg transition-all relative ${
                  settings.highContrast 
                    ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {showNotifications && (
                <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg z-50 animate-fade-in ${
                  settings.highContrast
                    ? 'bg-black border-2 border-yellow-400'
                    : 'bg-white/20 backdrop-blur border border-white/20'
                }`}>
                  <div className="p-4">
                    <h3 className={`font-bold mb-3 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
                      Notifications
                    </h3>
                    <div className="space-y-2">
                      {[1, 2].map(i => (
                        <div key={i} className={`p-3 rounded ${
                          settings.highContrast
                            ? 'bg-yellow-400/10 border border-yellow-400'
                            : 'bg-white/10'
                        }`}>
                          <p className={`text-sm ${settings.highContrast ? 'text-yellow-300' : 'text-white'}`}>
                            Notification {i}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* High Contrast */}
            <button
              onClick={toggleHighContrast}
              className={`p-2 rounded-lg transition-all ${settings.highContrast ? 'bg-yellow-400 text-black' : 'bg-white/20 text-white hover:bg-white/30'}`}
              aria-label="Toggle high contrast mode"
              title="High Contrast"
            >
              <Eye size={20} />
            </button>

            {/* Screen Reader */}
            <button
              onClick={toggleScreenReader}
              className={`p-2 rounded-lg transition-all ${settings.screenReaderEnabled ? 'bg-green-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
              aria-label="Toggle screen reader"
              title="Screen Reader"
            >
              <Volume2 size={20} />
            </button>

            {/* Accessibility Settings */}
            <button
              onClick={() => setShowAccessibility(!showAccessibility)}
              className={`p-2 rounded-lg transition-all ${settings.highContrast ? 'bg-yellow-400 text-black' : 'bg-white/20 text-white hover:bg-white/30'}`}
              aria-label="Accessibility settings"
              title="Accessibility"
            >
              <Settings size={20} />
            </button>

            {/* User Menu */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`p-2 rounded-lg transition-all ${settings.highContrast ? 'bg-yellow-400 text-black' : 'bg-white/20 text-white hover:bg-white/30'}`}
                aria-label="User menu"
                title="User Menu"
              >
                <User size={20} />
              </button>

              {showUserMenu && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50 animate-fade-in ${
                  settings.highContrast
                    ? 'bg-black border-2 border-yellow-400'
                    : 'bg-white/20 backdrop-blur border border-white/20'
                }`}>
                  <div className="p-4 space-y-3">
                    <div className={`text-sm ${settings.highContrast ? 'text-yellow-300' : 'text-white/80'}`}>
                      <p className="font-semibold">{localStorage.getItem('user_name') || 'User'}</p>
                      <p className="text-xs">{localStorage.getItem('user_email') || 'user@example.com'}</p>
                    </div>
                    <hr className={settings.highContrast ? 'border-yellow-400' : 'border-white/20'} />
                    <button
                      onClick={handleLogout}
                      className={`w-full px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all text-sm ${
                        settings.highContrast
                          ? 'bg-red-400 text-black hover:bg-red-300'
                          : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                      }`}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`md:hidden p-2 rounded-lg transition-all ${settings.highContrast ? 'bg-yellow-400 text-black' : 'bg-white/20 text-white hover:bg-white/30'}`}
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Accessibility Panel */}
        {showAccessibility && (
          <div className={`border-t ${settings.highContrast ? 'border-yellow-400 bg-black' : 'border-white/20'} p-4 space-y-4 animate-fade-in`}>
            <h3 className={`font-bold ${textClass}`}>Accessibility Settings</h3>
            
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center space-x-2">
                <label htmlFor="font-size" className={`text-sm ${settings.highContrast ? 'text-yellow-300' : 'text-white/70'}`}>
                  Font Size:
                </label>
                <input
                  id="font-size"
                  type="range"
                  min="80"
                  max="150"
                  value={settings.fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-32 h-2 bg-white/30 rounded-lg appearance-none cursor-pointer"
                  aria-label="Adjust font size"
                />
                <span className={`text-sm font-bold ${textClass}`}>{settings.fontSize}%</span>
              </div>

              <button
                onClick={toggleHighContrast}
                className={`px-4 py-2 rounded text-sm font-bold transition-all ${settings.highContrast ? 'bg-yellow-400 text-black' : 'bg-white/20 text-white hover:bg-white/30'}`}
              >
                {settings.highContrast ? '✓ High Contrast' : 'High Contrast'}
              </button>

              <button
                onClick={toggleScreenReader}
                className={`px-4 py-2 rounded text-sm font-bold transition-all ${settings.screenReaderEnabled ? 'bg-green-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
              >
                {settings.screenReaderEnabled ? '✓ Screen Reader' : 'Screen Reader'}
              </button>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isOpen && (
          <div className={`md:hidden pb-4 space-y-2 animate-fade-in border-t ${settings.highContrast ? 'border-yellow-400' : 'border-white/20'} mt-4`}>
            {navLinks.map(link => {
              const Icon = link.icon
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    isActive(link.path)
                      ? settings.highContrast
                        ? 'bg-yellow-400 text-black font-bold'
                        : 'bg-white/20 text-white'
                      : settings.highContrast
                        ? 'text-yellow-300 hover:bg-yellow-400 hover:text-black'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={18} />
                  {link.name}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar