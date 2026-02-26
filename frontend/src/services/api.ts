/**
 * Braille Conversion API Service Layer
 * Centralized Axios client with JWT interceptors and error handling
 */
import axios, { AxiosError, type AxiosInstance } from 'axios'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

// ── Axios Instance ────────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request Interceptor - attach Bearer token ─────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor - handle 401, refresh token ─────────────────────────
let isRefreshing = false
let failedQueue: Array<{ resolve: Function; reject: Function }> = []

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token))
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        isRefreshing = false
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
          refresh_token: refreshToken,
        })
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`
        processQueue(null, data.access_token)
        return api(originalRequest)
      } catch (err) {
        processQueue(err as AxiosError, null)
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    // Error messages
    const message =
      (error.response?.data as any)?.detail ||
      (error.response?.data as any)?.message ||
      'An unexpected error occurred'

    if (error.response?.status !== 401) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

// ── Auth API ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: { email: string; username: string; password: string; full_name?: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  refresh: (refresh_token: string) =>
    api.post('/auth/refresh', { refresh_token }),

  logout: () => api.post('/auth/logout'),

  me: () => api.get('/auth/me'),

  changePassword: (data: { current_password: string; new_password: string }) =>
    api.put('/auth/change-password', data),
}

// ── Braille API ───────────────────────────────────────────────────────────────
export const brailleAPI = {
  textToBraille: (data: { text: string; grade: string; language?: string }) =>
    api.post('/braille/text-to-braille', data),

  brailleToText: (data: { braille_text: string; grade: string }) =>
    api.post('/braille/braille-to-text', data),

  getCellInfo: (char: string) =>
    api.get(`/braille/cell-info/${encodeURIComponent(char)}`),

  getHistory: (skip = 0, limit = 20) =>
    api.get(`/braille/history?skip=${skip}&limit=${limit}`),
}

// ── OCR / Upload API ──────────────────────────────────────────────────────────
export const ocrAPI = {
  uploadAndConvert: (file: File, grade = 'grade_1') => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/ocr/upload-and-convert?grade=${grade}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  detectDots: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/ocr/detect-dots', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ── Export API ────────────────────────────────────────────────────────────────
export const exportAPI = {
  exportJob: (job_id: number, formats: string[]) =>
    api.post('/export', { job_id, formats }),

  downloadFile: (filename: string) =>
    api.get(`/export/download/${filename}`, { responseType: 'blob' }),
}

// ── Users API ─────────────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: object) => api.put('/users/me', data),
  getStats: () => api.get('/users/me/stats'),
}

// ── Health API ────────────────────────────────────────────────────────────────
export const healthAPI = {
  check: () => api.get('/health'),
  dbCheck: () => api.get('/health/db'),
}

export default api