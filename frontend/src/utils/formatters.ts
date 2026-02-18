// ============= DATE FORMATTERS =============
export function formatDate(date: Date | string, format: string = 'MMM DD, YYYY'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date'
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const daysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const year = dateObj.getFullYear()
  const month = dateObj.getMonth()
  const day = dateObj.getDate()
  const dayOfWeek = dateObj.getDay()
  const hours = dateObj.getHours()
  const minutes = dateObj.getMinutes()
  const seconds = dateObj.getSeconds()

  const pad = (n: number) => String(n).padStart(2, '0')

  const replacements: { [key: string]: string } = {
    'YYYY': String(year),
    'YY': String(year).slice(-2),
    'MMMM': months[month],
    'MMM': monthsShort[month],
    'MM': pad(month + 1),
    'M': String(month + 1),
    'DD': pad(day),
    'D': String(day),
    'dddd': daysFull[dayOfWeek],
    'ddd': daysShort[dayOfWeek],
    'HH': pad(hours),
    'H': String(hours),
    'hh': pad(hours % 12 || 12),
    'h': String(hours % 12 || 12),
    'mm': pad(minutes),
    'm': String(minutes),
    'ss': pad(seconds),
    's': String(seconds),
    'A': hours >= 12 ? 'PM' : 'AM',
    'a': hours >= 12 ? 'pm' : 'am',
  }

  let result = format
  Object.entries(replacements).forEach(([key, value]) => {
    result = result.replace(new RegExp(key, 'g'), value)
  })

  return result
}

export function formatTime(date: Date | string, includeSeconds: boolean = false): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return 'Invalid time'
  }

  const hours = dateObj.getHours()
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')
  const seconds = String(dateObj.getSeconds()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12

  if (includeSeconds) {
    return `${displayHours}:${minutes}:${seconds} ${ampm}`
  }
  return `${displayHours}:${minutes} ${ampm}`
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date'
  }

  const now = new Date()
  const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  let interval = Math.floor(seconds / 31536000)
  if (interval >= 1) {
    return `${interval} year${interval > 1 ? 's' : ''} ago`
  }

  interval = Math.floor(seconds / 2592000)
  if (interval >= 1) {
    return `${interval} month${interval > 1 ? 's' : ''} ago`
  }

  interval = Math.floor(seconds / 86400)
  if (interval >= 1) {
    return `${interval} day${interval > 1 ? 's' : ''} ago`
  }

  interval = Math.floor(seconds / 3600)
  if (interval >= 1) {
    return `${interval} hour${interval > 1 ? 's' : ''} ago`
  }

  interval = Math.floor(seconds / 60)
  if (interval >= 1) {
    return `${interval} minute${interval > 1 ? 's' : ''} ago`
  }

  if (seconds < 10) {
    return 'just now'
  }

  return `${Math.floor(seconds)} seconds ago`
}

// ============= NUMBER FORMATTERS =============
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatPercent(num: number, decimals: number = 0): string {
  return `${formatNumber(num, decimals)}%`
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// ============= STRING FORMATTERS =============
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (!match) return phone
  return `(${match[1]}) ${match[2]}-${match[3]}`
}

export function formatCreditCard(card: string): string {
  const cleaned = card.replace(/\D/g, '')
  const groups = cleaned.match(/\d{4}/g) || []
  return groups.join(' ')
}

export function formatSSN(ssn: string): string {
  const cleaned = ssn.replace(/\D/g, '')
  if (cleaned.length !== 9) return ssn
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function capitalizeEachWord(str: string): string {
  return str
    .split(' ')
    .map(word => capitalize(word))
    .join(' ')
}

export function truncate(str: string, length: number = 50, suffix: string = '...'): string {
  if (str.length <= length) return str
  return str.slice(0, length - suffix.length) + suffix
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function camelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase()
    })
    .replace(/\s+/g, '')
}

export function pascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+/g, '')
}

export function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()
}

export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

// ============= TEXT FORMATTERS =============
export function stripHtml(html: string): string {
  const element = document.createElement('div')
  element.innerHTML = html
  return element.textContent || element.innerText || ''
}

export function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export function formatJson(obj: any, indent: number = 2): string {
  return JSON.stringify(obj, null, indent)
}

export function parseJson(json: string): any {
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

// ============= WORD COUNT & CHARACTER COUNT =============
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

export function countCharacters(text: string, includeSpaces: boolean = true): number {
  if (includeSpaces) {
    return text.length
  }
  return text.replace(/\s/g, '').length
}

export function estimateReadingTime(text: string, wordsPerMinute: number = 200): number {
  const words = countWords(text)
  return Math.ceil(words / wordsPerMinute)
}

export function formatReadingTime(text: string, wordsPerMinute: number = 200): string {
  const minutes = estimateReadingTime(text, wordsPerMinute)
  if (minutes < 1) return 'Less than 1 min read'
  return `${minutes} min read`
}

// ============= BRAILLE FORMATTER =============
export function formatBrailleOutput(text: string, groupSize: number = 8): string {
  const groups = text.match(new RegExp(`.{1,${groupSize}}`, 'g')) || []
  return groups.join('\n')
}

export function formatBraillePreview(braille: string, maxLength: number = 100): string {
  if (braille.length <= maxLength) return braille
  return braille.slice(0, maxLength) + '...'
}

// ============= OBJECT & ARRAY FORMATTERS =============
export function formatObject(obj: any, indent: number = 2): string {
  const spaces = ' '.repeat(indent)
  const entries = Object.entries(obj)
    .map(([key, value]) => {
      const formattedValue = typeof value === 'string' ? `"${value}"` : JSON.stringify(value)
      return `${spaces}${key}: ${formattedValue}`
    })
    .join(',\n')

  return `{\n${entries}\n}`
}

export function joinArray(arr: any[], separator: string = ', ', finalSeparator: string = ' and '): string {
  if (arr.length === 0) return ''
  if (arr.length === 1) return String(arr[0])
  if (arr.length === 2) return `${arr[0]}${finalSeparator}${arr[1]}`

  return arr
    .slice(0, -1)
    .join(separator)
    .concat(`${finalSeparator}${arr[arr.length - 1]}`)
}

// ============= TEMPLATE LITERALS =============
export function formatTemplate(template: string, variables: Record<string, any>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match
  })
}

// ============= HIGHLIGHT FORMATTER =============
export function highlightText(text: string, query: string, className: string = 'highlight'): string {
  if (!query) return escapeHtml(text)

  const regex = new RegExp(`(${query})`, 'gi')
  return escapeHtml(text).replace(regex, `<span class="${className}">$1</span>`)
}

// ============= MARKDOWN-LIKE FORMATTER =============
export function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/__(.*?)__/g, '<u>$1</u>')
    .replace(/~~(.*?)~~/g, '<strike>$1</strike>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
}

export default {
  formatDate,
  formatTime,
  formatRelativeTime,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatBytes,
  formatPhoneNumber,
  formatCreditCard,
  formatSSN,
  capitalize,
  capitalizeEachWord,
  truncate,
  slugify,
  camelCase,
  pascalCase,
  snakeCase,
  kebabCase,
  stripHtml,
  escapeHtml,
  formatJson,
  parseJson,
  countWords,
  countCharacters,
  estimateReadingTime,
  formatReadingTime,
  formatBrailleOutput,
  formatBraillePreview,
  formatObject,
  joinArray,
  formatTemplate,
  highlightText,
  formatMarkdown,
}