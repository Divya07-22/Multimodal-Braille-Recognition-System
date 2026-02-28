import  { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap, ArrowRight, UserPlus, Check } from 'lucide-react'
import { useAuthStore } from '../hooks/useAuth'
import { useAccessibility } from '../context/useAccessibility'
import toast from 'react-hot-toast'

const passwordChecks = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Contains uppercase', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Contains number', test: (p: string) => /\d/.test(p) },
]

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', full_name: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const { register, isLoading, isAuthenticated, clearError } = useAuthStore()
  const { settings } = useAccessibility()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
    return () => clearError()
  }, [isAuthenticated, navigate, clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password) {
      toast.error('Please fill in all required fields')
      return
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    try {
      await register({ username: form.username, email: form.email, password: form.password, full_name: form.full_name })
      toast.success('Account created! Welcome to BrailleAI 🎉')
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
            Create Account
          </h1>
          <p className={settings.highContrast ? 'text-yellow-200' : 'text-white/50'}>
            Join BrailleAI — free forever
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${
                settings.highContrast ? 'text-yellow-400' : 'text-white/40'
              }`}>Username *</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                placeholder="johndoe"
                className={inputClass}
                aria-label="Username"
                autoComplete="username"
              />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${
                settings.highContrast ? 'text-yellow-400' : 'text-white/40'
              }`}>Full Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                placeholder="John Doe"
                className={inputClass}
                aria-label="Full name"
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${
              settings.highContrast ? 'text-yellow-400' : 'text-white/40'
            }`}>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="john@example.com"
              className={inputClass}
              aria-label="Email"
              autoComplete="email"
            />
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${
              settings.highContrast ? 'text-yellow-400' : 'text-white/40'
            }`}>Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Create a strong password"
                className={`${inputClass} pr-12`}
                aria-label="Password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                  settings.highContrast
                    ? 'text-yellow-400 hover:bg-yellow-400/20'
                    : 'text-white/40 hover:text-white hover:bg-white/10'
                }`}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password strength */}
            {form.password && (
              <div className="mt-2 space-y-1">
                {passwordChecks.map(({ label, test }) => {
                  const passed = test(form.password)
                  return (
                    <div key={label} className={`flex items-center gap-2 text-xs ${passed ? 'text-emerald-400' : settings.highContrast ? 'text-yellow-400/50' : 'text-white/30'}`}>
                      <Check size={11} className={passed ? 'opacity-100' : 'opacity-30'} />
                      {label}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${
              settings.highContrast ? 'text-yellow-400' : 'text-white/40'
            }`}>Confirm Password *</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.confirm}
              onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
              placeholder="Repeat your password"
              className={`${inputClass} ${
                form.confirm && form.confirm !== form.password
                  ? 'border-red-500/50'
                  : ''
              }`}
              aria-label="Confirm password"
              autoComplete="new-password"
            />
            {form.confirm && form.confirm !== form.password && (
              <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
            )}
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
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating Account...</>
            ) : (
              <><UserPlus size={16} /> Create Account</>
            )}
          </button>

          <p className={`text-xs text-center ${settings.highContrast ? 'text-yellow-300' : 'text-white/30'}`}>
            By signing up, you agree to our{' '}
            <Link to="#" className={settings.highContrast ? 'text-yellow-400' : 'text-violet-400'}>Terms</Link>
            {' '}and{' '}
            <Link to="#" className={settings.highContrast ? 'text-yellow-400' : 'text-violet-400'}>Privacy Policy</Link>
          </p>
        </form>

        <div className={`mt-6 pt-6 border-t text-center ${settings.highContrast ? 'border-yellow-400' : 'border-white/10'}`}>
          <p className={`text-sm ${settings.highContrast ? 'text-yellow-200' : 'text-white/50'}`}>
            Already have an account?{' '}
            <Link
              to="/login"
              className={`font-bold transition-all ${
                settings.highContrast
                  ? 'text-yellow-400 hover:text-yellow-300'
                  : 'text-violet-400 hover:text-violet-300'
              }`}
            >
              Sign In <ArrowRight size={12} className="inline" />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}