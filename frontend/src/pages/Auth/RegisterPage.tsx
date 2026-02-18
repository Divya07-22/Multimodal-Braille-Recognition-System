import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, Loader, ArrowRight, CheckCircle, AlertCircle, Shield, Check, X } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAccessibility } from '../../context/AccessibilityContext'
import { validateEmail, validatePassword, validateName, checkPasswordStrength } from '../../utils/validators'

interface RegisterFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  agreedToTerms: boolean
  agreedToPrivacy: boolean
}

interface PasswordStrength {
  score: number
  level: string
  percentage: number
  feedback: string[]
}

interface RegisterResponse {
  message: string
  access_token?: string
  user?: {
    id: string
    email: string
    full_name: string
  }
}

function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
    agreedToPrivacy: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null)
  const [step, setStep] = useState<'form' | 'verification' | 'success'>('form')
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationAttempts, setVerificationAttempts] = useState(0)
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)

  const navigate = useNavigate()
  const { settings } = useAccessibility()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // Check password strength in real-time
    if (name === 'password') {
      const strength = checkPasswordStrength(value)
      setPasswordStrength(strength)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (!validateName(formData.fullName)) {
      newErrors.fullName = 'Name must be at least 3 characters and contain only letters, spaces, and hyphens'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and symbol'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.agreedToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions'
    }

    if (!formData.agreedToPrivacy) {
      newErrors.privacy = 'You must agree to the privacy policy'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

      const response = await axios.post<RegisterResponse>(
        `${API_URL}/api/auth/register`,
        {
          full_name: formData.fullName.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          device_fingerprint: generateDeviceFingerprint(),
          terms_agreed: true,
          privacy_agreed: true,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': getCsrfToken(),
          },
          timeout: 10000,
        }
      )

      // Move to email verification step
      setStep('verification')
      toast.success('Registration successful! Check your email for verification code.')

      // Log security event
      logSecurityEvent('REGISTRATION_INITIATED', formData.email)
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Registration failed'

      if (error.response?.status === 409) {
        toast.error('This email is already registered')
      } else {
        toast.error(errorMessage)
      }

      logSecurityEvent('REGISTRATION_FAILED', formData.email, {
        reason: errorMessage,
      })

      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!verificationCode.trim() || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }

    setLoading(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

      const response = await axios.post<RegisterResponse>(
        `${API_URL}/api/auth/verify-email`,
        {
          email: formData.email.toLowerCase().trim(),
          code: verificationCode,
        }
      )

      setStep('success')
      logSecurityEvent('EMAIL_VERIFIED', formData.email)
      toast.success('✓ Email verified successfully!')

      // Auto redirect after 3 seconds
      setTimeout(() => navigate('/login'), 3000)
    } catch (error: any) {
      setVerificationAttempts(prev => prev + 1)

      if (verificationAttempts >= 5) {
        toast.error('Too many verification attempts. Please register again.')
        setStep('form')
      } else {
        toast.error('Invalid verification code')
      }

      logSecurityEvent('VERIFICATION_FAILED', formData.email, {
        attempt: verificationAttempts + 1,
      })

      console.error('Verification error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Success Step
  if (step === 'success') {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${
        settings.highContrast ? 'bg-black' : 'bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700'
      }`}>
        <div className="w-full max-w-md text-center animate-fade-in">
          <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
            settings.highContrast ? 'bg-yellow-400' : 'bg-green-500'
          }`}>
            <CheckCircle className={`${settings.highContrast ? 'text-black' : 'text-white'}`} size={48} />
          </div>

          <h1 className={`text-4xl font-black mb-4 ${
            settings.highContrast ? 'text-yellow-400' : 'text-white'
          }`}>
            Welcome!
          </h1>

          <p className={`text-lg mb-8 ${
            settings.highContrast ? 'text-yellow-200' : 'text-white/80'
          }`}>
            Your account has been created successfully. Redirecting to login...
          </p>

          <div className={`p-4 rounded-lg ${
            settings.highContrast ? 'bg-yellow-400/10 border-2 border-yellow-400' : 'bg-green-500/10 border border-green-400/30'
          }`}>
            <p className={`text-sm font-semibold ${
              settings.highContrast ? 'text-yellow-300' : 'text-green-300'
            }`}>
              🎉 Account activated and ready to use!
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Verification Step
  if (step === 'verification') {
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
              Verify Email
            </h1>
            <p className={`${settings.highContrast ? 'text-yellow-200' : 'text-white/80'}`}>
              Enter the 6-digit code sent to {formData.email}
            </p>
          </div>

          <form onSubmit={handleVerifyEmail} className={`p-8 rounded-2xl ${
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
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all text-center text-3xl tracking-widest font-mono ${
                  settings.highContrast
                    ? 'bg-black text-yellow-300 border-2 border-yellow-400 focus:ring-yellow-400'
                    : 'bg-white/20 text-white border border-white/30 focus:ring-pink-400'
                }`}
                aria-label="Verification code"
                required
              />
              <p className={`text-xs mt-2 ${
                settings.highContrast ? 'text-yellow-200' : 'text-white/60'
              }`}>
                Attempts remaining: {5 - verificationAttempts}
              </p>
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
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} /> Verifying...
                </>
              ) : (
                <>
                  <CheckCircle size={20} /> Verify Email
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

  // Registration Form Step
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
            Create Account
          </h1>
          <p className={`${settings.highContrast ? 'text-yellow-200' : 'text-white/80'}`}>
            Join thousands of users converting text to Braille
          </p>
        </div>

        <form onSubmit={handleRegister} className={`p-8 rounded-2xl ${
          settings.highContrast ? 'bg-black border-4 border-yellow-400' : 'bg-white/10 backdrop-blur border border-white/20'
        } space-y-5`}>
          {/* Full Name Field */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${
              settings.highContrast ? 'text-yellow-300' : 'text-white'
            }`}>
              Full Name
            </label>
            <div className="relative">
              <User className={`absolute left-4 top-3 ${
                settings.highContrast ? 'text-yellow-400' : 'text-white/50'
              }`} size={20} />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.fullName ? 'ring-2 ring-red-500' : ''
                } ${
                  settings.highContrast
                    ? 'bg-black text-yellow-300 border-2 border-yellow-400 focus:ring-yellow-400 placeholder-yellow-600'
                    : 'bg-white/20 text-white border border-white/30 focus:ring-pink-400 placeholder-white/50'
                }`}
                aria-label="Full name"
                autoComplete="name"
                required
              />
            </div>
            {errors.fullName && (
              <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.fullName}
              </p>
            )}
          </div>

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
                className={`w-full pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.email ? 'ring-2 ring-red-500' : ''
                } ${
                  settings.highContrast
                    ? 'bg-black text-yellow-300 border-2 border-yellow-400 focus:ring-yellow-400 placeholder-yellow-600'
                    : 'bg-white/20 text-white border border-white/30 focus:ring-pink-400 placeholder-white/50'
                }`}
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
              <button
                type="button"
                onClick={() => setShowPasswordRequirements(!showPasswordRequirements)}
                className={`text-xs font-semibold hover:underline ${
                  settings.highContrast ? 'text-yellow-400' : 'text-pink-400'
                }`}
              >
                Requirements
              </button>
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
                placeholder="Min 8 chars with uppercase, lowercase, number, symbol"
                className={`w-full pl-12 pr-12 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.password ? 'ring-2 ring-red-500' : ''
                } ${
                  settings.highContrast
                    ? 'bg-black text-yellow-300 border-2 border-yellow-400 focus:ring-yellow-400 placeholder-yellow-600'
                    : 'bg-white/20 text-white border border-white/30 focus:ring-pink-400 placeholder-white/50'
                }`}
                aria-label="Password"
                autoComplete="new-password"
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

            {/* Password Strength Indicator */}
            {formData.password && passwordStrength && (
              <div className="mt-3 space-y-2">
                <div className={`h-2 rounded-full overflow-hidden bg-white/20`}>
                  <div
                    className={`h-full transition-all ${
                      passwordStrength.level === 'weak'
                        ? 'bg-red-500 w-1/3'
                        : passwordStrength.level === 'fair'
                          ? 'bg-yellow-500 w-2/3'
                          : 'bg-green-500 w-full'
                    }`}
                  />
                </div>
                <p className={`text-xs font-semibold ${
                  passwordStrength.level === 'weak'
                    ? 'text-red-400'
                    : passwordStrength.level === 'fair'
                      ? 'text-yellow-400'
                      : 'text-green-400'
                }`}>
                  {passwordStrength.level.toUpperCase()} - {passwordStrength.feedback.join(', ')}
                </p>
              </div>
            )}

            {/* Password Requirements */}
            {showPasswordRequirements && (
              <div className={`mt-3 p-3 rounded-lg text-xs space-y-1 ${
                settings.highContrast
                  ? 'bg-yellow-400/10 border-2 border-yellow-400'
                  : 'bg-blue-500/10 border border-blue-400/30'
              }`}>
                <p className={`font-semibold ${settings.highContrast ? 'text-yellow-300' : 'text-blue-300'}`}>
                  Password must contain:
                </p>
                <div className="space-y-1">
                  <p className={formData.password.length >= 8 ? 'text-green-400' : 'text-white/60'}>
                    {formData.password.length >= 8 ? '✓' : '○'} At least 8 characters
                  </p>
                  <p className={/[A-Z]/.test(formData.password) ? 'text-green-400' : 'text-white/60'}>
                    {/[A-Z]/.test(formData.password) ? '✓' : '○'} Uppercase letter
                  </p>
                  <p className={/[a-z]/.test(formData.password) ? 'text-green-400' : 'text-white/60'}>
                    {/[a-z]/.test(formData.password) ? '✓' : '○'} Lowercase letter
                  </p>
                  <p className={/[0-9]/.test(formData.password) ? 'text-green-400' : 'text-white/60'}>
                    {/[0-9]/.test(formData.password) ? '✓' : '○'} Number
                  </p>
                  <p className={/[!@#$%^&*]/.test(formData.password) ? 'text-green-400' : 'text-white/60'}>
                    {/[!@#$%^&*]/.test(formData.password) ? '✓' : '○'} Special character (!@#$%^&*)
                  </p>
                </div>
              </div>
            )}

            {errors.password && (
              <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${
              settings.highContrast ? 'text-yellow-300' : 'text-white'
            }`}>
              Confirm Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-4 top-3 ${
                settings.highContrast ? 'text-yellow-400' : 'text-white/50'
              }`} size={20} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={`w-full pl-12 pr-12 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.confirmPassword ? 'ring-2 ring-red-500' : ''
                } ${
                  settings.highContrast
                    ? 'bg-black text-yellow-300 border-2 border-yellow-400 focus:ring-yellow-400 placeholder-yellow-600'
                    : 'bg-white/20 text-white border border-white/30 focus:ring-pink-400 placeholder-white/50'
                }`}
                aria-label="Confirm password"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute right-4 top-3 transition-colors ${
                  settings.highContrast
                    ? 'text-yellow-400 hover:text-yellow-300'
                    : 'text-white/50 hover:text-white'
                }`}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
              <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                <Check size={14} /> Passwords match
              </p>
            )}
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="space-y-3 pt-2">
            <label className={`flex items-start gap-3 cursor-pointer p-3 rounded transition-all ${
              settings.highContrast
                ? 'bg-yellow-400/10 border-2 border-yellow-400'
                : 'bg-white/10 border border-white/20'
            }`}>
              <input
                type="checkbox"
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={handleChange}
                className="w-5 h-5 mt-1 cursor-pointer flex-shrink-0"
                aria-label="Agree to terms and conditions"
                required
              />
              <span className={`text-sm ${
                settings.highContrast ? 'text-yellow-300' : 'text-white'
              }`}>
                I agree to the <a href="#" className={`font-bold hover:underline ${
                  settings.highContrast ? 'text-yellow-400' : 'text-pink-400'
                }`}>Terms and Conditions</a>
              </span>
            </label>
            {errors.terms && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle size={14} /> {errors.terms}
              </p>
            )}

            <label className={`flex items-start gap-3 cursor-pointer p-3 rounded transition-all ${
              settings.highContrast
                ? 'bg-yellow-400/10 border-2 border-yellow-400'
                : 'bg-white/10 border border-white/20'
            }`}>
              <input
                type="checkbox"
                name="agreedToPrivacy"
                checked={formData.agreedToPrivacy}
                onChange={handleChange}
                className="w-5 h-5 mt-1 cursor-pointer flex-shrink-0"
                aria-label="Agree to privacy policy"
                required
              />
              <span className={`text-sm ${
                settings.highContrast ? 'text-yellow-300' : 'text-white'
              }`}>
                I agree to the <a href="#" className={`font-bold hover:underline ${
                  settings.highContrast ? 'text-yellow-400' : 'text-pink-400'
                }`}>Privacy Policy</a>
              </span>
            </label>
            {errors.privacy && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle size={14} /> {errors.privacy}
              </p>
            )}
          </div>

          {/* Submit Button */}
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
            aria-label={loading ? 'Creating account...' : 'Create Account'}
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} /> Creating Account...
              </>
            ) : (
              <>
                Create Account <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className={`text-center mt-6 ${
          settings.highContrast ? 'text-yellow-200' : 'text-white/80'
        }`}>
          Already have an account?{' '}
          <Link to="/login" className={`font-bold hover:underline ${
            settings.highContrast ? 'text-yellow-400' : 'text-pink-400'
          }`}>
            Log in here
          </Link>
        </p>

        {/* Security Info */}
        <div className={`mt-6 p-4 rounded-lg text-center text-xs space-y-1 ${
          settings.highContrast ? 'bg-yellow-400/10 border-2 border-yellow-400 text-yellow-300' : 'bg-green-500/10 border border-green-400/30 text-green-200'
        }`}>
          <p className="font-semibold">🔐 Enterprise Security</p>
          <p>✓ AES-256 Encryption • ✓ 2FA Protection • ✓ Password Hashing (bcrypt)</p>
          <p>✓ Email Verification • ✓ Rate Limiting • ✓ CSRF Protection</p>
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

function logSecurityEvent(eventType: string, email: string, metadata?: any): void {
  const event = {
    type: eventType,
    email,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    ...metadata,
  }

  fetch('http://localhost:8000/api/security/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  }).catch(() => {})
}

export default RegisterPage