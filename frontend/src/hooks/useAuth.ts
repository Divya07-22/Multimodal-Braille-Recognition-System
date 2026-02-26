/**
 * Zustand global auth store with localStorage persistence
 */
import { create } from 'zustand'
import { authAPI, usersAPI } from '../services/api'

export interface User {
    id: number
    email: string
    username: string
    full_name?: string
    role: string
    is_active: boolean
    is_verified: boolean
    avatar_url?: string
    high_contrast: boolean
    font_size: string
    created_at: string
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    token: string | null

    login: (email: string, password: string) => Promise<void>
    register: (data: { email: string; username: string; password: string; full_name?: string }) => Promise<void>
    logout: () => Promise<void>
    fetchMe: () => Promise<void>
    updateUser: (updates: Partial<User>) => void
    initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null,

    initialize: async () => {
        const token = localStorage.getItem('access_token')
        if (token) {
            try {
                await get().fetchMe()
            } catch {
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                set({ isAuthenticated: false, user: null, isLoading: false })
            }
        } else {
            set({ isLoading: false })
        }
    },

    login: async (email, password) => {
        const { data } = await authAPI.login({ email, password })
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        set({ token: data.access_token, isAuthenticated: true })
        await get().fetchMe()
    },

    register: async (userData) => {
        await authAPI.register(userData)
        await get().login(userData.email, userData.password)
    },

    logout: async () => {
        try { await authAPI.logout() } catch { /* ignore */ }
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, isAuthenticated: false, token: null })
    },

    fetchMe: async () => {
        const { data } = await authAPI.me()
        set({ user: data, isAuthenticated: true, isLoading: false })
    },

    updateUser: (updates) => {
        const current = get().user
        if (current) {
            set({ user: { ...current, ...updates } })
        }
    },
}))
