import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  TextToBrailleRequest,
  TextToBrailleResponse,
  ImageToBrailleRequest,
  ImageToBrailleResponse,
  BrailleToTextRequest,
  BrailleToTextResponse,
  ConversionHistory,
  DashboardStats,
  ConversionStats,
  UserProfile,
  UpdateProfileRequest,
  UpdateProfileResponse,
  Session,
  SessionInfo,
  ApiResponse,
  PaginatedResponse,
  Verify2FARequest,
  VerifyEmailRequest,
} from '../types'

class ApiService {
  private api: AxiosInstance
  private baseURL: string
  private timeout: number

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    this.timeout = 30000

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.api.interceptors.request.use(
      config => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      error => Promise.reject(error)
    )

    // Response interceptor
    this.api.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // ============= AUTH ENDPOINTS =============
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.api.post<ApiResponse<LoginResponse>>('/api/auth/login', data)
    return response.data.data || response.data as any
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await this.api.post<ApiResponse<RegisterResponse>>('/api/auth/register', data)
    return response.data.data || response.data as any
  }

  async verify2FA(data: Verify2FARequest): Promise<LoginResponse> {
    const response = await this.api.post<ApiResponse<LoginResponse>>('/api/auth/verify-2fa', data)
    return response.data.data || response.data as any
  }

  async verifyEmail(data: VerifyEmailRequest): Promise<RegisterResponse> {
    const response = await this.api.post<ApiResponse<RegisterResponse>>('/api/auth/verify-email', data)
    return response.data.data || response.data as any
  }

  async logout(): Promise<void> {
    await this.api.post('/api/auth/logout')
    localStorage.removeItem('auth_token')
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await this.api.post<ApiResponse<{ message: string }>>('/api/auth/forgot-password', { email })
    return response.data.data || response.data as any
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await this.api.post<ApiResponse<{ message: string }>>('/api/auth/reset-password', { token, password })
    return response.data.data || response.data as any
  }

  // ============= TEXT TO BRAILLE ENDPOINTS =============
  async textToBraille(data: TextToBrailleRequest): Promise<TextToBrailleResponse> {
    const response = await this.api.post<ApiResponse<TextToBrailleResponse>>('/api/text-to-braille', data)
    return response.data.data || response.data as any
  }

  // ============= IMAGE TO BRAILLE ENDPOINTS =============
  async imageToBraille(data: ImageToBrailleRequest): Promise<ImageToBrailleResponse> {
    const response = await this.api.post<ApiResponse<ImageToBrailleResponse>>('/api/image-to-braille', data)
    return response.data.data || response.data as any
  }

  // ============= BRAILLE TO TEXT ENDPOINTS =============
  async brailleToText(data: BrailleToTextRequest): Promise<BrailleToTextResponse> {
    const response = await this.api.post<ApiResponse<BrailleToTextResponse>>('/api/braille-to-text', data)
    return response.data.data || response.data as any
  }

  // ============= CONVERSION HISTORY ENDPOINTS =============
  async getConversionHistory(page: number = 1, per_page: number = 10): Promise<PaginatedResponse<ConversionHistory>> {
    const response = await this.api.get<ApiResponse<PaginatedResponse<ConversionHistory>>>(
      `/api/conversions/history?page=${page}&per_page=${per_page}`
    )
    return response.data.data || response.data as any
  }

  async deleteConversionHistory(id: string): Promise<{ message: string }> {
    const response = await this.api.delete<ApiResponse<{ message: string }>>(`/api/conversions/history/${id}`)
    return response.data.data || response.data as any
  }

  async clearConversionHistory(): Promise<{ message: string }> {
    const response = await this.api.delete<ApiResponse<{ message: string }>>('/api/conversions/history')
    return response.data.data || response.data as any
  }

  // ============= DASHBOARD ENDPOINTS =============
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.api.get<ApiResponse<DashboardStats>>('/api/dashboard/stats')
    return response.data.data || response.data as any
  }

  async getConversionStats(): Promise<ConversionStats[]> {
    const response = await this.api.get<ApiResponse<ConversionStats[]>>('/api/dashboard/conversion-stats')
    return response.data.data || response.data as any
  }

  // ============= USER PROFILE ENDPOINTS =============
  async getUserProfile(): Promise<UserProfile> {
    const response = await this.api.get<ApiResponse<UserProfile>>('/api/user/profile')
    return response.data.data || response.data as any
  }

  async updateUserProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    const response = await this.api.put<ApiResponse<UpdateProfileResponse>>('/api/user/profile', data)
    return response.data.data || response.data as any
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await this.api.put<ApiResponse<{ message: string }>>('/api/user/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
    return response.data.data || response.data as any
  }

  // ============= SESSION ENDPOINTS =============
  async getSessions(): Promise<SessionInfo> {
    const response = await this.api.get<ApiResponse<SessionInfo>>('/api/user/sessions')
    return response.data.data || response.data as any
  }

  async logoutSession(sessionId: string): Promise<{ message: string }> {
    const response = await this.api.post<ApiResponse<{ message: string }>>('/api/user/sessions/logout', { session_id: sessionId })
    return response.data.data || response.data as any
  }

  async logoutAllSessions(): Promise<{ message: string }> {
    const response = await this.api.post<ApiResponse<{ message: string }>>('/api/user/sessions/logout-all')
    return response.data.data || response.data as any
  }

  // ============= SETTINGS ENDPOINTS =============
  async enable2FA(): Promise<{ secret: string; qr_code: string }> {
    const response = await this.api.post<ApiResponse<{ secret: string; qr_code: string }>>('/api/user/2fa/enable')
    return response.data.data || response.data as any
  }

  async disable2FA(password: string): Promise<{ message: string }> {
    const response = await this.api.post<ApiResponse<{ message: string }>>('/api/user/2fa/disable', { password })
    return response.data.data || response.data as any
  }

  // ============= HEALTH CHECK =============
  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await this.api.get('/health')
      return response.data
    } catch {
      return { status: 'unhealthy' }
    }
  }

  // ============= GENERIC METHODS =============
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config)
    return response.data
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config)
    return response.data
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.patch<T>(url, data, config)
    return response.data
  }

  // ============= UTILITY METHODS =============
  setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token)
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  getAuthToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  clearAuthToken(): void {
    localStorage.removeItem('auth_token')
    delete this.api.defaults.headers.common['Authorization']
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken()
  }

  setBaseURL(url: string): void {
    this.baseURL = url
    this.api.defaults.baseURL = url
  }

  getBaseURL(): string {
    return this.baseURL
  }
}

// Export singleton instance
export default new ApiService()