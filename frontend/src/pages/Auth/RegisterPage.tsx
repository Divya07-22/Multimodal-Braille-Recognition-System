import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Eye, EyeOff, Mail, Lock, User, UserCheck, Zap, ArrowRight,
  CheckCircle, Shield
} from 'lucide-react'
import { useAuthStore } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'One uppercase letter required')
    .regex(/[0-9]/, 'One number required'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

const PasswordStrength = ({ password }: { password: string }) => {
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.ok).length
  const colors = ['bg-red-500', 'bg-amber-500', 'bg-yellow-500', 'bg-emerald-500']

  return password ? (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? colors[score] : 'bg-white/10'}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {checks.map(c => (
          <span key={c.label} className={`text-xs flex items-center gap-1 ${c.ok ? 'text-emerald-400' : 'text-white/30'}`}>
            <CheckCircle size={11} /> {c.label}
          </span>
        ))}
      </div>
    </div>
  ) : null
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const navigate = useNavigate()
  const { register: authRegister } = useAuthStore()
  const { register, handleSubmit, watch } = useForm<RegisterForm>()
  const password = watch('password', '')

  const onSubmit = async (data: RegisterForm) => {
    const result = registerSchema.safeParse(data)
    if (!result.success) {
      const errs = result.error.issues.reduce((acc, issue) => ({
        ...acc, [issue.path[0] as string]: issue.message
      }), {} as Record<string, string>)
      setErrors(errs)
      return
    }
    setErrors({})
    setIsLoading(true)
    try {
      await authRegister({
        email: data.email,
        username: data.username.toLowerCase(),
        password: data.password,
        full_name: data.full_name,
      })
      toast.success('Account created! Welcome to BrailleAI 🎉')
      navigate('/dashboard')
    } catch { /* handled */ }
    finally { setIsLoading(false) }
  }

  const fields = [
    { id: 'full_name', label: 'Full Name', type: 'text', icon: User, placeholder: 'Jane Doe', autocomplete: 'name' },
    { id: 'email', label: 'Email Address', type: 'email', icon: Mail, placeholder: 'jane@example.com', autocomplete: 'email' },
    { id: 'username', label: 'Username', type: 'text', icon: UserCheck, placeholder: 'jane_doe', autocomplete: 'username' },
  ]

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
      <div className="orb orb-1 opacity-20" />
      <div className="orb orb-2 opacity-15" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 mb-4 shadow-2xl">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Create Account</h1>
          <p className="text-white/50">Join BrailleAI — free forever</p>
        </div>

        <div className="glass-strong p-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {fields.map(f => {
              const Icon = f.icon
              return (
                <div key={f.id}>
                  <label className="block text-sm font-medium text-white/80 mb-1.5" htmlFor={f.id}>
                    {f.label}
                  </label>
                  <div className="relative">
                    <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      id={f.id}
                      type={f.type}
                      autoComplete={f.autocomplete}
                      {...register(f.id as keyof RegisterForm)}
                      className={`input-field pl-10 ${errors[f.id] ? 'error' : ''}`}
                      placeholder={f.placeholder}
                    />
                  </div>
                  {errors[f.id] && <p className="text-red-400 text-xs mt-1">{errors[f.id]}</p>}
                </div>
              )
            })}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('password')}
                  className={`input-field pl-10 pr-10 ${errors.password ? 'error' : ''}`}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              <PasswordStrength password={password} />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  className={`input-field pl-10 ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Repeat your password"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`btn-primary w-full justify-center mt-2 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <><div className="spinner !w-4 !h-4 !border-2" /> Creating Account…</>
              ) : (
                <>Create Account <ArrowRight size={18} /></>
              )}
            </motion.button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-white/50 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/30">
          <Shield size={12} className="text-violet-400" />
          Your data is encrypted · Never shared
        </div>
      </motion.div>
    </div>
  )
}