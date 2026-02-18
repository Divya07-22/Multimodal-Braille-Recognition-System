// ============= AUTH TYPES =============
export interface User {
  id: string
  email: string
  full_name: string
  created_at: string
  updated_at: string
  avatar_url?: string
}

export interface LoginRequest {
  email: string
  password: string
  device_fingerprint: string
  ip_address: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: User
  requires_2fa?: boolean
  session_token?: string
}

export interface RegisterRequest {
  full_name: string
  email: string
  password: string
  device_fingerprint: string
  terms_agreed: boolean
  privacy_agreed: boolean
}

export interface RegisterResponse {
  message: string
  user?: User
  access_token?: string
}

export interface Verify2FARequest {
  session_token: string
  code: string
  device_fingerprint: string
}

export interface VerifyEmailRequest {
  email: string
  code: string
}

// ============= BRAILLE CONVERSION TYPES =============
export interface TextToBrailleRequest {
  text: string
  grade: 'grade1' | 'grade2'
}

export interface TextToBrailleResponse {
  braille: string
  characters: number
  processing_time: number
}

export interface ImageToBrailleRequest {
  image: string // Base64 encoded
  process_type: 'braille' | 'text'
}

export interface ImageToBrailleResponse {
  braille?: string
  text?: string
  confidence: number
  processing_time: number
}

export interface BrailleToTextRequest {
  braille: string
}

export interface BrailleToTextResponse {
  text: string
  characters: number
  processing_time: number
}

export interface ConversionHistory {
  id: string
  user_id: string
  type: 'text_to_braille' | 'image_to_braille' | 'braille_to_text'
  input: string
  output: string
  processing_time: number
  created_at: string
}

// ============= API RESPONSE TYPES =============
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// ============= DASHBOARD TYPES =============
export interface DashboardStats {
  total_conversions: number
  total_characters: number
  average_speed: number
  uptime: number
  active_users: number
}

export interface ConversionStats {
  type: string
  count: number
  percentage: number
  trend: number
}

export interface DailyStats {
  date: string
  conversions: number
  users: number
  characters: number
}

export interface SystemService {
  name: string
  status: 'operational' | 'degraded' | 'offline'
  uptime: string
  response_time: string
}

// ============= FILE UPLOAD TYPES =============
export interface FileUploadRequest {
  file: File
  type: 'image' | 'pdf' | 'document'
}

export interface FileUploadResponse {
  file_id: string
  file_name: string
  file_size: number
  file_type: string
  url: string
}

// ============= NOTIFICATION TYPES =============
export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  created_at: string
}

export interface NotificationPreferences {
  email_notifications: boolean
  push_notifications: boolean
  conversion_alerts: boolean
  system_alerts: boolean
}

// ============= ACCESSIBILITY TYPES =============
export interface AccessibilitySettings {
  highContrast: boolean
  fontSize: number
  screenReaderEnabled: boolean
  keyboardNavigationEnabled: boolean
  darkMode: boolean
}

// ============= SECURITY TYPES =============
export interface SecurityEvent {
  type: string
  email: string
  timestamp: string
  user_agent: string
  ip_address?: string
  success: boolean
}

export interface SecurityLog {
  id: string
  event_type: string
  user_id: string
  details: Record<string, any>
  created_at: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetResponse {
  message: string
  reset_token?: string
}

export interface PasswordResetConfirm {
  reset_token: string
  new_password: string
}

// ============= USER PROFILE TYPES =============
export interface UserProfile extends User {
  bio?: string
  phone?: string
  location?: string
  website?: string
  conversions_count: number
  characters_processed: number
  joined_date: string
}

export interface UpdateProfileRequest {
  full_name?: string
  bio?: string
  phone?: string
  location?: string
  website?: string
  avatar_url?: string
}

export interface UpdateProfileResponse {
  message: string
  user: UserProfile
}

// ============= SESSION TYPES =============
export interface Session {
  id: string
  user_id: string
  device_name: string
  ip_address: string
  last_activity: string
  created_at: string
  expires_at: string
}

export interface SessionInfo {
  current_session_id: string
  sessions: Session[]
}

// ============= VALIDATION ERROR TYPES =============
export interface ValidationError {
  field: string
  message: string
}

export interface FormValidationResponse {
  valid: boolean
  errors: ValidationError[]
}

// ============= RATE LIMITING TYPES =============
export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
}

// ============= BRAILLE GRADE TYPES =============
export type BrailleGrade = 'grade1' | 'grade2'

export const BRAILLE_GRADES = {
  GRADE1: 'grade1' as BrailleGrade,
  GRADE2: 'grade2' as BrailleGrade,
}

// ============= CONVERSION TYPE =============
export type ConversionType = 'text_to_braille' | 'image_to_braille' | 'braille_to_text'

export const CONVERSION_TYPES = {
  TEXT_TO_BRAILLE: 'text_to_braille' as ConversionType,
  IMAGE_TO_BRAILLE: 'image_to_braille' as ConversionType,
  BRAILLE_TO_TEXT: 'braille_to_text' as ConversionType,
}

// ============= HTTP METHOD TYPES =============
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// ============= NOTIFICATION TYPE =============
export type NotificationType = 'info' | 'success' | 'warning' | 'error'

// ============= SERVICE STATUS TYPES =============
export type ServiceStatus = 'operational' | 'degraded' | 'offline' | 'maintenance'

// ============= THEME TYPES =============
export type Theme = 'light' | 'dark' | 'auto'

// ============= LANGUAGE TYPES =============
export type Language = 'en' | 'es' | 'fr' | 'de' | 'ja'

// ============= SORT ORDER TYPES =============
export type SortOrder = 'asc' | 'desc'

// ============= FILTER TYPES =============
export interface FilterOptions {
  search?: string
  sort_by?: string
  sort_order?: SortOrder
  page?: number
  per_page?: number
  date_from?: string
  date_to?: string
}

// ============= ROUTE TYPES =============
export interface RouteConfig {
  path: string
  element: React.ReactNode
  exact?: boolean
  requiresAuth?: boolean
  requiresAdmin?: boolean
  title?: string
}

// ============= FEATURE FLAGS =============
export interface FeatureFlags {
  enable_2fa: boolean
  enable_social_login: boolean
  enable_api: boolean
  enable_exports: boolean
  maintenance_mode: boolean
}

// ============= ANALYTICS TYPES =============
export interface AnalyticsEvent {
  event_name: string
  event_category: string
  event_label?: string
  value?: number
  timestamp: string
}

export interface PageView {
  page_title: string
  page_path: string
  referrer: string
  duration: number
  timestamp: string
}

// ============= CACHE TYPES =============
export interface CacheItem<T> {
  data: T
  timestamp: number
  expiry?: number
}

// ============= UPLOAD PROGRESS =============
export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

// ============= API CONFIG =============
export interface ApiConfig {
  baseURL: string
  timeout: number
  retries: number
  retryDelay: number
}

// ============= TOAST MESSAGE =============
export interface ToastMessage {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

// ============= DIALOG OPTIONS =============
export interface DialogOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
  type?: 'info' | 'warning' | 'error' | 'success'
}

export default {
  // Export all types
}