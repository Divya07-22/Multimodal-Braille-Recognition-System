// ─────────────── Auth ───────────────
export interface User {
  id: number
  username: string
  email: string
  full_name?: string
  is_active: boolean
  is_superuser?: boolean
  created_at: string
  updated_at?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  full_name?: string
}

export interface AuthResponse {
  access_token: string
  token_type: 'bearer'
  expires_in?: number
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

// ─────────────── Conversion ───────────────
export type ConversionType =
  | 'text_to_braille'
  | 'image_to_braille'
  | 'braille_to_text'

export type BrailleGrade = 1 | 2

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'ar'

export interface TextToBrailleRequest {
  text: string
  grade?: BrailleGrade
  language?: SupportedLanguage
  include_dots?: boolean
}

export interface BrailleToTextRequest {
  braille: string
  grade?: BrailleGrade
  language?: SupportedLanguage
}

export interface ConversionResult {
  braille?: string
  text?: string
  unicode?: string
  dots?: string
  confidence?: number
  processing_time?: number
  character_count?: number
  word_count?: number
  grade?: BrailleGrade
  language?: SupportedLanguage
}

// ─────────────── History ───────────────
export interface HistoryItem {
  id: number
  user_id: number
  conversion_type: ConversionType
  input_text?: string
  output_text?: string
  braille_output?: string
  image_url?: string
  processing_time?: number
  is_favorite: boolean
  grade?: BrailleGrade
  language?: SupportedLanguage
  created_at: string
  updated_at?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface HistoryFilters {
  type?: ConversionType
  favorites?: boolean
  search?: string
  page?: number
  limit?: number
}

// ─────────────── Accessibility ───────────────
export interface AccessibilitySettings {
  highContrast: boolean
  fontSize: number
  screenReaderEnabled: boolean
  keyboardNavigationEnabled: boolean
  reducedMotion: boolean
}

// ─────────────── API ───────────────
export interface ApiError {
  detail: string
  status_code?: number
  type?: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

// ─────────────── UI Components ───────────────
export interface SelectOption {
  label: string
  value: string | number
}

export interface TableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: T[keyof T], row: T) => React.ReactNode
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

// ─────────────── Stats ───────────────
export interface UserStats {
  total_conversions: number
  text_to_braille_count: number
  image_to_braille_count: number
  braille_to_text_count: number
  favorites_count: number
  this_week_count: number
  avg_processing_time: number
}

// ─────────────── Navigation ───────────────
export interface NavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
  requiresAuth?: boolean
  badge?: string
}

// ─────────────── File Upload ───────────────
export interface UploadedFile {
  file: File
  preview: string
  size: number
  type: string
  name: string
}

export type AllowedImageType = 'image/jpeg' | 'image/jpg' | 'image/png' | 'image/webp' | 'image/gif'

export const ALLOWED_IMAGE_TYPES: AllowedImageType[] = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]

export const MAX_FILE_SIZE_MB = 10
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024