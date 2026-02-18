

// ============= EMAIL VALIDATION =============
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254 && email.length >= 5
}

// ============= PASSWORD VALIDATION (VERY STRICT) =============
export function validatePassword(password: string): boolean {
  // Minimum 8 characters
  if (password.length < 8) return false
  // Must contain uppercase
  if (!/[A-Z]/.test(password)) return false
  // Must contain lowercase
  if (!/[a-z]/.test(password)) return false
  // Must contain number
  if (!/[0-9]/.test(password)) return false
  // Must contain special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false
  // No common weak patterns
  if (/(123|456|789|000|111|222|333|444|555|666|777|888|999)/i.test(password)) return false
  // Not just repeated characters
  if (/(.)\1{4,}/.test(password)) return false
  return true
}

// ============= NAME VALIDATION =============
export function validateName(name: string): boolean {
  const nameRegex = /^[a-zA-Z\s\-']{3,100}$/
  const trimmedName = name.trim()
  return nameRegex.test(trimmedName) && trimmedName.split(' ').length >= 1
}

// ============= PASSWORD STRENGTH CHECKER =============
export interface PasswordStrength {
  score: number
  level: 'weak' | 'fair' | 'strong' | 'very-strong'
  percentage: number
  feedback: string[]
}

export function checkPasswordStrength(password: string): PasswordStrength {
  let score = 0
  const feedback: string[] = []

  // Length scoring
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (password.length >= 16) score++

  // Character variety scoring
  if (/[a-z]/.test(password)) {
    score++
  } else {
    feedback.push('Add lowercase letters')
  }

  if (/[A-Z]/.test(password)) {
    score++
  } else {
    feedback.push('Add uppercase letters')
  }

  if (/[0-9]/.test(password)) {
    score++
  } else {
    feedback.push('Add numbers')
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score++
  } else {
    feedback.push('Add special characters')
  }

  // Weakness detection
  if (/(123|456|789|000|111|222|333|444|555|666|777|888|999)/i.test(password)) {
    score = Math.max(0, score - 2)
    feedback.push('Avoid sequential numbers')
  }

  if (/(.)\1{3,}/.test(password)) {
    score = Math.max(0, score - 1)
    feedback.push('Avoid repeated characters')
  }

  // Determine level
  let level: 'weak' | 'fair' | 'strong' | 'very-strong' = 'weak'
  let percentage = 0

  if (score >= 2 && score < 4) {
    level = 'weak'
    percentage = 25
  } else if (score >= 4 && score < 6) {
    level = 'fair'
    percentage = 50
  } else if (score >= 6 && score < 8) {
    level = 'strong'
    percentage = 75
  } else if (score >= 8) {
    level = 'very-strong'
    percentage = 100
  }

  if (feedback.length === 0) {
    feedback.push('Strong password!')
  }

  return { score, level, percentage, feedback }
}

// ============= ENCRYPT PASSWORD (CLIENT-SIDE HASHING) =============
export async function encryptPassword(password: string): Promise<string> {
  try {
    // Use SubtleCrypto for browser-based hashing
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  } catch (error) {
    // Fallback to simple encoding if crypto not available
    return btoa(password)
  }
}

// ============= VALIDATE PHONE NUMBER =============
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

// ============= VALIDATE URL =============
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// ============= VALIDATE FILE SIZE =============
export function validateFileSize(size: number, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return size <= maxSizeBytes
}

// ============= VALIDATE FILE TYPE =============
export function validateFileType(
  file: File,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'application/pdf']
): boolean {
  return allowedTypes.includes(file.type)
}

// ============= SANITIZE INPUT (XSS PREVENTION) =============
export function sanitizeInput(input: string): string {
  const element = document.createElement('div')
  element.textContent = input
  return element.innerHTML
}

// ============= VALIDATE CREDIT CARD =============
export function validateCreditCard(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, '')
  
  // Check length
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false
  }

  // Luhn algorithm
  let sum = 0
  let isEven = false

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

// ============= VALIDATE DATE =============
export function validateDate(dateString: string, format: string = 'YYYY-MM-DD'): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateString)) return false

  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

// ============= VALIDATE BRAILLE =============
export function validateBraille(text: string): boolean {
  // Check if contains valid Braille Unicode characters
  const brailleRegex = /[\u2800-\u28FF]/
  return brailleRegex.test(text) || /^[a-z\s]*$/.test(text.toLowerCase())
}

// ============= CHECK PASSWORD BREACH =============
export async function checkPasswordBreach(password: string): Promise<boolean> {
  try {
    const hash = await encryptPassword(password)
    const hashPrefix = hash.substring(0, 5)

    const response = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`)
    const data = await response.text()

    const hashSuffix = hash.substring(5).toUpperCase()
    return data.includes(hashSuffix)
  } catch {
    return false
  }
}

// ============= GENERATE STRONG RANDOM STRING =============
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// ============= RATE LIMITING HELPER =============
export function isRateLimited(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 900000
): boolean {
  const now = Date.now()
  const storageKey = `rate_limit_${key}`
  const stored = localStorage.getItem(storageKey)

  if (!stored) {
    localStorage.setItem(storageKey, JSON.stringify([now]))
    return false
  }

  const attempts = JSON.parse(stored) as number[]
  const recentAttempts = attempts.filter(time => now - time < windowMs)

  if (recentAttempts.length >= maxAttempts) {
    return true
  }

  recentAttempts.push(now)
  localStorage.setItem(storageKey, JSON.stringify(recentAttempts))
  return false
}

// ============= FORMAT VALIDATORS =============
export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
  return usernameRegex.test(username)
}

export function validateIPAddress(ip: string): boolean {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (!ipRegex.test(ip)) return false

  const parts = ip.split('.')
  return parts.every(part => {
    const num = parseInt(part, 10)
    return num >= 0 && num <= 255
  })
}

// ============= FORM VALIDATION HELPERS =============
export function validateFormField(
  fieldName: string,
  value: string,
  type: 'email' | 'password' | 'name' | 'url' | 'phone' | 'text'
): string | null {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return `${fieldName} is required`
  }

  switch (type) {
    case 'email':
      if (!validateEmail(trimmedValue)) {
        return `${fieldName} is not valid`
      }
      break

    case 'password':
      if (!validatePassword(trimmedValue)) {
        return `${fieldName} must be at least 8 characters with uppercase, lowercase, number, and symbol`
      }
      break

    case 'name':
      if (!validateName(trimmedValue)) {
        return `${fieldName} must be at least 3 characters`
      }
      break

    case 'url':
      if (!validateUrl(trimmedValue)) {
        return `${fieldName} is not a valid URL`
      }
      break

    case 'phone':
      if (!validatePhoneNumber(trimmedValue)) {
        return `${fieldName} is not a valid phone number`
      }
      break

    case 'text':
      if (trimmedValue.length < 3) {
        return `${fieldName} must be at least 3 characters`
      }
      break
  }

  return null
}

export default {
  validateEmail,
  validatePassword,
  validateName,
  checkPasswordStrength,
  encryptPassword,
  validatePhoneNumber,
  validateUrl,
  validateFileSize,
  validateFileType,
  sanitizeInput,
  validateCreditCard,
  validateDate,
  validateBraille,
  checkPasswordBreach,
  generateSecureToken,
  isRateLimited,
  validateUsername,
  validateIPAddress,
  validateFormField,
}