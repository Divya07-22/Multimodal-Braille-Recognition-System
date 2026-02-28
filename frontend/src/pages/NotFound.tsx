import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Zap } from 'lucide-react'
import { useAccessibility } from '../context/useAccessibility'

const brailleChars = ['⠼', '⠙', '⠓', '⠲', '⠃', '⠗', '⠀', '⠊', '⠇']

const quickLinks = [
  { to: '/text-to-braille', label: 'Text to Braille' },
  { to: '/image-to-braille', label: 'Image to Braille' },
  { to: '/braille-to-text', label: 'Braille to Text' },
  { to: '/dashboard', label: 'Dashboard' },
]

export default function NotFound() {
  const { settings } = useAccessibility()
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {!settings.highContrast && (
        <>
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-violet-600/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-pink-600/15 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex justify-center gap-3 mb-8"
        >
          {brailleChars.map((c, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 0.15, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={`text-5xl select-none ${settings.highContrast ? 'text-yellow-400' : 'text-violet-300'}`}
            >
              {c}
            </motion.span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
          className="mb-6"
        >
          <div className={`text-[10rem] font-black leading-none ${
            settings.highContrast
              ? 'text-yellow-400'
              : 'bg-gradient-to-br from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent'
          }`}>
            404
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className={`text-3xl font-black mb-3 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
            Page Not Found
          </h1>
          <p className={`text-lg mb-2 ${settings.highContrast ? 'text-yellow-200' : 'text-white/60'}`}>
            Oops! This page doesn't exist or has been moved.
          </p>
          <p className={`text-sm mb-10 ${settings.highContrast ? 'text-yellow-300' : 'text-white/30'}`}>
            Redirecting to home in{' '}
            <span className={`font-black text-base ${settings.highContrast ? 'text-yellow-400' : 'text-violet-400'}`}>
              {countdown}s
            </span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-4 justify-center mb-12"
        >
          <Link
            to="/"
            className={`group flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold transition-all ${
              settings.highContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:shadow-xl hover:shadow-violet-500/30 hover:scale-105'
            }`}
          >
            <Home size={16} /> Go Home
          </Link>
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold border transition-all ${
              settings.highContrast
                ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400/20'
                : 'border-white/15 text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${
            settings.highContrast ? 'text-yellow-400' : 'text-white/30'
          }`}>
            Quick Links
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {quickLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                  settings.highContrast
                    ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400/20'
                    : 'border-white/10 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <Zap size={12} /> {label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}