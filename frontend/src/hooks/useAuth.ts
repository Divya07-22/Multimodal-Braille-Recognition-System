import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

interface User {
  id: number
  username: string
  email: string
  full_name?: string
  is_active: boolean
  created_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  fetchProfile: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
  // New methods required by ForgotPassword, ResetPassword, VerifyEmail, ResendVerification, ProtectedRoute
  forgotPassword: (email: string) => Promise<string>
  resetPassword: (token: string, newPassword: string) => Promise<string>
  verifyEmail: (token: string) => Promise<string>
  resendVerification: (email: string) => Promise<string>
  loadFromStorage: () => void
}

interface RegisterData {
  username: string
  email: string
  password: string
  full_name?: string
}

type ApiError = {
  response?: { data?: { detail?: string | any[] }; status?: number },
  message?: string
}

const parseApiError = (err: unknown, defaultMsg: string): string => {
  const apiErr = err as ApiError;
  const detail = apiErr?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail[0].msg?.replace(/^Value error, /, '') || defaultMsg;
  }
  return apiErr?.message || defaultMsg;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/login', { email, password })
          const { access_token } = response.data
          localStorage.setItem('token', access_token)
          set({ token: access_token, isAuthenticated: true, isLoading: false })
          await get().fetchProfile()
        } catch (err: unknown) {
          const message = parseApiError(err, 'Login failed. Please try again.')
          set({ error: message, isLoading: false })
          throw new Error(message)
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          await api.post('/auth/register', data)
          await get().login(data.email, data.password)
        } catch (err: unknown) {
          const message = parseApiError(err, 'Registration failed. Please try again.')
          set({ error: message, isLoading: false })
          throw new Error(message)
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await api.post('/auth/logout').catch(() => { })
        } finally {
          localStorage.removeItem('token')
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      fetchProfile: async () => {
        try {
          const response = await api.get('/users/me')
          set({ user: response.data, isAuthenticated: true })
        } catch (err: unknown) {
          if ((err as ApiError)?.response?.status === 401) {
            localStorage.removeItem('token')
            set({ user: null, token: null, isAuthenticated: false })
          }
        }
      },

      /**
       * Loads auth state from localStorage on app boot.
       * Used by ProtectedRoute to re-hydrate auth state.
       */
      loadFromStorage: () => {
        const token = localStorage.getItem('token')
        if (token && !get().isAuthenticated) {
          set({ token, isAuthenticated: true })
          // Kick off a profile fetch to populate the user object
          get().fetchProfile().catch(() => {
            localStorage.removeItem('token')
            set({ token: null, isAuthenticated: false })
          })
        }
      },

      /**
       * Sends a password reset email to the given address.
       * Backend route: POST /auth/forgot-password
       */
      forgotPassword: async (email: string): Promise<string> => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/forgot-password', { email })
          return response.data?.message || 'Password reset email sent.'
        } catch (err: unknown) {
          const message = parseApiError(err, 'Failed to send reset email. Please try again.')
          set({ error: message })
          throw new Error(message)
        } finally {
          set({ isLoading: false })
        }
      },

      /**
       * Resets the password using the token from the reset email.
       * Backend route: POST /auth/reset-password
       */
      resetPassword: async (token: string, newPassword: string): Promise<string> => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/reset-password', {
            token,
            new_password: newPassword,
          })
          return response.data?.message || 'Password reset successfully.'
        } catch (err: unknown) {
          const message = parseApiError(err, 'Failed to reset password. The link may have expired.')
          set({ error: message })
          throw new Error(message)
        } finally {
          set({ isLoading: false })
        }
      },

      /**
       * Verifies the user's email address using a token from the verification email.
       * Backend route: POST /auth/verify-email
       */
      verifyEmail: async (token: string): Promise<string> => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/verify-email', { token })
          return response.data?.message || 'Email verified successfully.'
        } catch (err: unknown) {
          const message = parseApiError(err, 'Email verification failed. The link may have expired.')
          set({ error: message })
          throw new Error(message)
        } finally {
          set({ isLoading: false })
        }
      },

      /**
       * Resends the email verification link.
       * Backend route: POST /auth/resend-verification
       */
      resendVerification: async (email: string): Promise<string> => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/resend-verification', { email })
          return response.data?.message || 'Verification email sent.'
        } catch (err: unknown) {
          const message = parseApiError(err, 'Failed to resend verification email.')
          set({ error: message })
          throw new Error(message)
        } finally {
          set({ isLoading: false })
        }
      },

      clearError: () => set({ error: null }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
)

// Named export for components using useAuth (not useAuthStore)
export function useAuth() {
  return useAuthStore()
}

// Default export for backward compatibility with the newly uncommented pages
export default useAuthStore