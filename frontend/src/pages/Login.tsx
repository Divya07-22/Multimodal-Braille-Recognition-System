import  { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap, ArrowRight, LogIn } from 'lucide-react'
import { useAuthStore } from '../hooks/useAuth'
import { useAccessibility } from '../context/useAccessibility'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, isAuthenticated, clearError } = useAuthStore()
  const { settings } = useAccessibility()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
    return () => clearError()
  }, [isAuthenticated, navigate, clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    try {
      await login(form.username, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch {
      // error handled in store
    }
  }

  const inputClass = `w-full px-4 py-3 rounded-2xl outline-none transition-all text-sm ${
    settings.highContrast
      ? 'bg-black border-2 border-yellow-400 text-yellow-100 placeholder:text-yellow-400/40 focus:border-yellow-300'
      : 'bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-violet-500/50 focus:bg-white/10'
  }`

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      {!settings.highContrast && (
        <>
          <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px] pointer-events-none" />
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`relative w-full max-w-md rounded-3xl border p-8 ${
          settings.highContrast
            ? 'border-yellow-400 bg-black'
            : 'border-white/10 bg-white/[0.04] backdrop-blur-2xl'
        }`}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-violet-500/30">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className={`text-3xl font-black mb-2 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
            Welcome Back
          </h1>
          <p className={settings.highContrast ? 'text-yellow-200' : 'text-white/50'}>
            Sign in to your BrailleAI account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${
              settings.highContrast ? 'text-yellow-400' : 'text-white/40'
            }`}>Username</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              placeholder="Enter your username"
              className={inputClass}
              aria-label="Username"
              autoComplete="username"
            />
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${
              settings.highContrast ? 'text-yellow-400' : 'text-white/40'
            }`}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Enter your password"
                className={`${inputClass} pr-12`}
                aria-label="Password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                  settings.highContrast
                    ? 'text-yellow-400 hover:bg-yellow-400/20'
                    : 'text-white/40 hover:text-white hover:bg-white/10'
                }`}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className={`text-xs font-medium transition-all ${
                settings.highContrast
                  ? 'text-yellow-400 hover:text-yellow-300'
                  : 'text-violet-400 hover:text-violet-300'
              }`}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 ${
              settings.highContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:shadow-2xl hover:shadow-violet-500/30 hover:scale-[1.02]'
            }`}
          >
            {isLoading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing In...</>
            ) : (
              <><LogIn size={16} /> Sign In</>
            )}
          </button>
        </form>

        <div className={`mt-8 pt-6 border-t text-center ${settings.highContrast ? 'border-yellow-400' : 'border-white/10'}`}>
          <p className={`text-sm ${settings.highContrast ? 'text-yellow-200' : 'text-white/50'}`}>
            Don't have an account?{' '}
            <Link
              to="/register"
              className={`font-bold transition-all ${
                settings.highContrast
                  ? 'text-yellow-400 hover:text-yellow-300'
                  : 'text-violet-400 hover:text-violet-300'
              }`}
            >
              Create Account <ArrowRight size={12} className="inline" />
            </Link>
          </p>
        </div>

        {/* Demo credentials hint */}
        <div className={`mt-4 p-3 rounded-2xl text-xs text-center ${
          settings.highContrast ? 'bg-yellow-400/10 text-yellow-300' : 'bg-white/5 text-white/30'
        }`}>
          💡 Try: username <span className="font-mono font-bold">demo</span> / password <span className="font-mono font-bold">demo123</span>
        </div>
      </motion.div>
    </div>
  )
}