import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader, ArrowRight, AlertCircle, CheckCircle, Shield } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAccessibility } from '../../context/AccessibilityContext'
import { validateEmail, validatePassword, encryptPassword } from '../../utils/validators'

interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

interface LoginResponse {
  access_token: string
  token_type: string
  user: {
    id: string
    email: string
    full_name: string
  }
  expires_in: number
}

function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [attemptCount, setAttemptCount] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutTime, setLockoutTime] = useState(0)
  const [showSecurityNotice, setShowSecurityNotice] = useState(true)
  const [twoFARequired, setTwoFARequired] = useState(false)
  const [twoFACode, setTwoFACode] = useState('')
  const [sessionToken, setSessionToken] = useState('')

  const navigate = useNavigate()
  const { settings } = useAccessibility()

  // Lockout timer
  useEffect(() => {
    if (isLocked && lockoutTime > 0) {
      const timer = setTimeout(() => {
        setLockoutTime(lockoutTime - 1)
      }, 1000)

      if (lockoutTime === 0) {
        setIsLocked(false)
        setAttemptCount(0)
        toast.success('Account unlocked. Please try again.')
      }

      return () => clearTimeout(timer)
    }
  }, [isLocked, lockoutTime])

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remembered_email')
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }))
    }
  }, [])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if account is locked
    if (isLocked) {
      toast.error(`Account locked. Try again in ${lockoutTime} seconds.`)
      return
    }

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

      // Hash password before sending
      const hashedPassword = await encryptPassword(formData.password)

      const response = await axios.post<LoginResponse>(
        `${API_URL}/api/auth/login`,
        {
          email: formData.email.toLowerCase().trim(),
          password: formData.password, // Send plain password, backend handles hashing
          device_fingerprint: generateDeviceFingerprint(),
          ip_address: await getClientIP(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': getCsrfToken(),
          },
          timeout: 10000,
        }
      )

      // Check if 2FA is required
      if (response.data.requires_2fa) {
        setSessionToken(response.data.session_token)
        setTwoFARequired(true)
        toast.success('Check your email for 2FA code')
        return
      }

      // Store token securely
      storeAuthToken(response.data.access_token, response.data.expires_in)

      // Store user data
      localStorage.setItem('user_email', response.data.user.email)
      localStorage.setItem('user_id', response.data.user.id)
      localStorage.setItem('user_name', response.data.user.full_name)

      // Store remembered email if checked
      if (formData.rememberMe) {
        localStorage.setItem('remembered_email', formData.email)
      } else {
        localStorage.removeItem('remembered_email')
      }

      // Log security event
      logSecurityEvent('LOGIN_SUCCESS', response.data.user.email)

      toast.success('✓ Logged in successfully!')

      if (settings.screenReaderEnabled) {
        const utterance = new SpeechSynthesisUtterance('Login successful, redirecting to dashboard')
        window.speechSynthesis.speak(utterance)
      }

      // Redirect after short delay
      setTimeout(() => navigate('/dashboard'), 500)
    } catch (error: any) {
      // Increment failed attempt count
      const newAttemptCount = attemptCount + 1
      setAttemptCount(newAttemptCount)

      // Lock account after 5 failed attempts
      if (newAttemptCount >= 5) {
        setIsLocked(true)
        setLockoutTime(900) // 15 minutes lockout
        logSecurityEvent('LOGIN_FAILED_LOCKOUT', formData.email)
        toast.error('❌ Too many failed attempts. Account locked for 15 minutes.')
        return
      }

      const errorMessage = error.response?.data?.detail || 'Login failed'
      toast.error(errorMessage)

      // Log failed login attempt
      logSecurityEvent('LOGIN_FAILED', formData.email, { attempt: newAttemptCount })

      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!twoFACode.trim() || twoFACode.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }

    setLoading(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

      const response = await axios.post<LoginResponse>(
        `${API_URL}/api/auth/verify-2fa`,
        {
          session_token: sessionToken,
          code: twoFACode,
          device_fingerprint: generateDeviceFingerprint(),
        }
      )

      storeAuthToken(response.data.access_token, response.data.expires_in)
      localStorage.setItem('user_email', response.data.user.email)
      localStorage.setItem('user_id', response.data.user.id)

      logSecurityEvent('2FA_VERIFIED', response.data.user.email)
      toast.success('✓ 2FA verified successfully!')

      setTimeout(() => navigate('/dashboard'), 500)
    } catch (error: any) {
      toast.error('Invalid 2FA code')
      logSecurityEvent('2FA_FAILED', formData.email)
      console.error('2FA error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (twoFARequired) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${
        settings.highContrast ? 'bg-black' : 'bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700'
      }`}>
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-lg ${
              settings.highContrast ? 'bg-yellow-400' : 'bg-gradient-to-br from-pink-500 to-purple-600'
            } flex items-center justify-center mx-auto mb-4`}>
              <Shield className={`${settings.highContrast ? 'text-black' : 'text-white'}`} size={32} />
            </div>
            <h1 className={`text-3xl md:text-4xl font-black mb-2 ${
              settings.highContrast ? 'text-yellow-400' : 'text-white'
            }`}>
              2FA Verification
            </h1>
            <p className={`${settings.highContrast ? 'text-yellow-200' : 'text-white/80'}`}>
              Enter the 6-digit code sent to your email
            </p>
          </div>

          <form onSubmit={handleVerify2FA} className={`p-8 rounded-2xl ${
            settings.highContrast ? 'bg-black border-4 border-yellow-400' : 'bg-white/10 backdrop-blur border border-white/20'
          } space-y-6`}>
            <div>
              <label className={`block text-sm font-semibold mb-3 ${
                settings.highContrast ? 'text-yellow-300' : 'text-white'
              }`}>
                Verification Code
              </label>
              <input
                type="text"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all text-center text-2xl tracking-widest font-mono ${
                  settings.highContrast
                    ? 'bg-black text-yellow-300 border-2 border-yellow-400 focus:ring-yellow-400'
                    : 'bg-white/20 text-white border border-white/30 focus:ring-pink-400'
                }`}
                aria-label="2FA code"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-lg ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg'
              } ${
                settings.highContrast
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
              }`}
              aria-label={loading ? 'Verifying...' : 'Verify Code'}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} /> Verifying...
                </>
              ) : (
                <>
                  <CheckCircle size={20} /> Verify Code
                </>
              )}
            </button>
          </form>

          <p className={`text-center mt-6 text-sm ${
            settings.highContrast ? 'text-yellow-200' : 'text-white/80'
          }`}>
            Didn't receive the code?{' '}
            <button className={`font-bold hover:underline ${
              settings.highContrast ? 'text-yellow-400' : 'text-pink-400'
            }`}>
              Resend
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${
      settings.highContrast ? 'bg-black' : 'bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700'
    }`}>
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-lg ${
            settings.highContrast ? 'bg-yellow-400' : 'bg-gradient-to-br from-pink-500 to-purple-600'
          } flex items-center justify-center mx-auto mb-4`}>
            <span className={`text-3xl font-bold ${settings.highContrast ? 'text-black' : 'text-white'}`}>⠃</span>
          </div>
          <h1 className={`text-3xl md:text-4xl font-black mb-2 ${
            settings.highContrast ? 'text-yellow-400' : 'text-white'
          }`}>
            Welcome Back
          </h1>
          <p className={`${settings.highContrast ? 'text-yellow-200' : 'text-white/80'}`}>
            Login to your Braille Conversion account
          </p>
        </div>

        {/* Security Notice */}
        {showSecurityNotice && (
          <div className={`mb-6 p-4 rounded-lg border-2 animate-fade-in ${
            settings.highContrast
              ? 'bg-yellow-400/10 border-yellow-400'
              : 'bg-blue-500/10 border-blue-400/30'
          }`}>
            <div className="flex items-start gap-3">
              <Shield className={`flex-shrink-0 ${
                settings.highContrast ? 'text-yellow-400' : 'text-blue-400'
              }`} size={20} />
              <div>
                <p className={`text-sm font-semibold ${
                  settings.highContrast ? 'text-yellow-300' : 'text-blue-300'
                }`}>
                  Security First
                </p>
                <p className={`text-xs mt-1 ${
                  settings.highContrast ? 'text-yellow-200' : 'text-blue-200'
                }`}>
                  We use bank-level encryption and 2FA protection
                </p>
              </div>
              <button
                onClick={() => setShowSecurityNotice(false)}
                className={`flex-shrink-0 ${
                  settings.highContrast ? 'text-yellow-400 hover:text-yellow-300' : 'text-blue-400 hover:text-blue-300'
                }`}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className={`p-8 rounded-2xl ${
          settings.highContrast ? 'bg-black border-4 border-yellow-400' : 'bg-white/10 backdrop-blur border border-white/20'
        } space-y-6`}>
          {/* Email Field */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${
              settings.highContrast ? 'text-yellow-300' : 'text-white'
            }`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className={`absolute left-4 top-3 ${
                settings.highContrast ? 'text-yellow-400' : 'text-white/50'
              }`} size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={isLocked}
                className={`w-full pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.email ? 'ring-2 ring-red-500' : ''
                } ${
                  settings.highContrast
                    ? 'bg-black text-yellow-300 border-2 border-yellow-400 focus:ring-yellow-400 placeholder-yellow-600'
                    : 'bg-white/20 text-white border border-white/30 focus:ring-pink-400 placeholder-white/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label="Email address"
                autoComplete="email"
                required
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className={`text-sm font-semibold ${
                settings.highContrast ? 'text-yellow-300' : 'text-white'
              }`}>
                Password
              </label>
              <a href="#" className={`text-xs font-semibold hover:underline ${
                settings.highContrast ? 'text-yellow-400' : 'text-pink-400'
              }`}>
                Forgot?
              </a>
            </div>
            <div className="relative">
              <Lock className={`absolute left-4 top-3 ${
                settings.highContrast ? 'text-yellow-400' : 'text-white/50'
              }`} size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={isLocked}
                className={`w-full pl-12 pr-12 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.password ? 'ring-2 ring-red-500' : ''
                } ${
                  settings.highContrast
                    ? 'bg-black text-yellow-300 border-2 border-yellow-400 focus:ring-yellow-400 placeholder-yellow-600'
                    : 'bg-white/20 text-white border border-white/30 focus:ring-pink-400 placeholder-white/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label="Password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-4 top-3 transition-colors ${
                  settings.highContrast
                    ? 'text-yellow-400 hover:text-yellow-300'
                    : 'text-white/50 hover:text-white'
                }`}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.password}
              </p>
            )}
          </div>

          {/* Lockout Warning */}
          {isLocked && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-400/30">
              <p className="text-red-300 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> Account locked. Try again in {lockoutTime}s
              </p>
            </div>
          )}

          {/* Remember Me & 2FA Notice */}
          <div className="space-y-3">
            <label className={`flex items-center gap-2 cursor-pointer ${
              settings.highContrast ? 'text-yellow-300' : 'text-white'
            }`}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm">Remember this device</span>
            </label>
            <p className={`text-xs ${
              settings.highContrast ? 'text-yellow-200' : 'text-white/60'
            }`}>
              🔒 2-factor authentication enabled for security
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || isLocked}
            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-lg ${
              loading || isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg'
            } ${
              settings.highContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
            }`}
            aria-label={loading ? 'Logging in...' : 'Log in'}
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} /> Logging in...
              </>
            ) : (
              <>
                Log In <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className={`text-center mt-6 ${
          settings.highContrast ? 'text-yellow-200' : 'text-white/80'
        }`}>
          Don't have an account?{' '}
          <Link to="/register" className={`font-bold hover:underline ${
            settings.highContrast ? 'text-yellow-400' : 'text-pink-400'
          }`}>
            Sign up here
          </Link>
        </p>

        {/* Security Info */}
        <div className={`mt-6 p-4 rounded-lg text-center text-xs ${
          settings.highContrast ? 'bg-yellow-400/10 border-2 border-yellow-400 text-yellow-300' : 'bg-green-500/10 border border-green-400/30 text-green-200'
        }`}>
          <p className="font-semibold mb-1">🔐 Security Features</p>
          <p>• Bank-level AES-256 encryption</p>
          <p>• 2FA protection</p>
          <p>• Account lockout after 5 failed attempts</p>
        </div>
      </div>
    </div>
  )
}

// ============= SECURITY HELPER FUNCTIONS =============

function generateDeviceFingerprint(): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return 'unknown'

  ctx.textBaseline = 'top'
  ctx.font = '32px Arial'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#f60'
  ctx.fillRect(125, 1, 62, 20)
  ctx.fillStyle = '#069'
  ctx.fillText('Browser Fingerprint', 2, 15)

  return canvas.toDataURL()
}

async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch {
    return 'unknown'
  }
}

function getCsrfToken(): string {
  const token = localStorage.getItem('csrf_token') || generateCsrfToken()
  localStorage.setItem('csrf_token', token)
  return token
}

function generateCsrfToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function storeAuthToken(token: string, expiresIn: number): void {
  const expirationTime = Date.now() + expiresIn * 1000
  localStorage.setItem('auth_token', token)
  localStorage.setItem('token_expiration', expirationTime.toString())
  
  // Set secure session storage
  sessionStorage.setItem('active_session', 'true')
}

function logSecurityEvent(eventType: string, email: string, metadata?: any): void {
  const event = {
    type: eventType,
    email,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    ...metadata,
  }

  // Send to backend for logging
  fetch('http://localhost:8000/api/security/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  }).catch(() => {}) // Silently fail if logging fails
}

export default LoginPage