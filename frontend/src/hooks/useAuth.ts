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
  login: (username: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  fetchProfile: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
}

interface RegisterData {
  username: string
  email: string
  password: string
  full_name?: string
}

type ApiError = { response?: { data?: { detail?: string }; status?: number } }

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username, password) => {
        set({ isLoading: true, error: null })
        try {
          const formData = new FormData()
          formData.append('username', username)
          formData.append('password', password)
          const response = await api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          })
          const { access_token } = response.data
          localStorage.setItem('token', access_token)
          set({ token: access_token, isAuthenticated: true, isLoading: false })
          await get().fetchProfile()
        } catch (err: unknown) {
          const message =
            (err as ApiError)?.response?.data?.detail ||
            'Login failed. Please try again.'
          set({ error: message, isLoading: false })
          throw new Error(message)
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          await api.post('/auth/register', data)
          await get().login(data.username, data.password)
        } catch (err: unknown) {
          const message =
            (err as ApiError)?.response?.data?.detail ||
            'Registration failed. Please try again.'
          set({ error: message, isLoading: false })
          throw new Error(message)
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await api.post('/auth/logout').catch(() => {})
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
          const response = await api.get('/auth/me')
          set({ user: response.data, isAuthenticated: true })
        } catch (err: unknown) {
          if ((err as ApiError)?.response?.status === 401) {
            localStorage.removeItem('token')
            set({ user: null, token: null, isAuthenticated: false })
          }
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

export function useAuth() {
  return useAuthStore()
}