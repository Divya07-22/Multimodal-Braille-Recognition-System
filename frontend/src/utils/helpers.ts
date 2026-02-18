// ============= LOCAL STORAGE HELPERS =============
export function setLocalStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error)
  }
}

export function getLocalStorage(key: string, defaultValue: any = null): any {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error getting localStorage key "${key}":`, error)
    return defaultValue
  }
}

export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error)
  }
}

export function clearLocalStorage(): void {
  try {
    localStorage.clear()
  } catch (error) {
    console.error('Error clearing localStorage:', error)
  }
}

// ============= SESSION STORAGE HELPERS =============
export function setSessionStorage(key: string, value: any): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error setting sessionStorage key "${key}":`, error)
  }
}

export function getSessionStorage(key: string, defaultValue: any = null): any {
  try {
    const item = sessionStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error getting sessionStorage key "${key}":`, error)
    return defaultValue
  }
}

export function removeSessionStorage(key: string): void {
  try {
    sessionStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing sessionStorage key "${key}":`, error)
  }
}

// ============= COOKIE HELPERS =============
export function setCookie(name: string, value: string, days: number = 7): void {
  const d = new Date()
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000)
  const expires = `expires=${d.toUTCString()}`
  document.cookie = `${name}=${value};${expires};path=/`
}

export function getCookie(name: string): string | null {
  const nameEQ = `${name}=`
  const cookies = document.cookie.split(';')
  for (let cookie of cookies) {
    cookie = cookie.trim()
    if (cookie.startsWith(nameEQ)) {
      return cookie.substring(nameEQ.length)
    }
  }
  return null
}

export function removeCookie(name: string): void {
  setCookie(name, '', -1)
}

// ============= URL HELPERS =============
export function getUrlParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search)
  const result: Record<string, string> = {}
  params.forEach((value, key) => {
    result[key] = value
  })
  return result
}

export function getUrlParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name)
}

export function updateUrlParam(name: string, value: string): void {
  const params = new URLSearchParams(window.location.search)
  params.set(name, value)
  window.history.replaceState({}, '', `?${params.toString()}`)
}

export function removeUrlParam(name: string): void {
  const params = new URLSearchParams(window.location.search)
  params.delete(name)
  window.history.replaceState({}, '', `?${params.toString()}`)
}

export function buildUrlParams(obj: Record<string, any>): string {
  const params = new URLSearchParams()
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      params.append(key, String(value))
    }
  })
  return params.toString()
}

// ============= ARRAY HELPERS =============
export function removeDuplicates<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

export function flattenArray<T>(arr: any[]): T[] {
  return arr.flat(Infinity)
}

export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const groupKey = String(item[key])
    if (!acc[groupKey]) {
      acc[groupKey] = []
    }
    acc[groupKey].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

export function sortBy<T>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...arr].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function sampleMany<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}

export function findMaxBy<T>(arr: T[], key: keyof T): T | undefined {
  return arr.reduce((max, item) => (item[key] > max[key] ? item : max))
}

export function findMinBy<T>(arr: T[], key: keyof T): T | undefined {
  return arr.reduce((min, item) => (item[key] < min[key] ? item : min))
}

// ============= OBJECT HELPERS =============
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export function merge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  return { ...target, ...source }
}

export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target }

  Object.entries(source).forEach(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key as keyof T] = deepMerge(target[key as keyof T] || {}, value)
    } else {
      result[key as keyof T] = value as any
    }
  })

  return result
}

export function pickBy<T extends Record<string, any>>(obj: T, keys: (keyof T)[]): Partial<T> {
  const result: Partial<T> = {}
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

export function omitBy<T extends Record<string, any>>(obj: T, keys: (keyof T)[]): Partial<T> {
  const result = { ...obj }
  keys.forEach(key => {
    delete result[key]
  })
  return result
}

export function invertObject<T extends Record<string, any>>(obj: T): Record<string, keyof T> {
  const result: Record<string, keyof T> = {}
  Object.entries(obj).forEach(([key, value]) => {
    result[String(value)] = key as keyof T
  })
  return result
}

// ============= DEBOUNCE & THROTTLE =============
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// ============= RETRY HELPER =============
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }

  throw lastError || new Error('Max retries exceeded')
}

// ============= PROMISE HELPERS =============
export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Promise timed out')), ms)
  )
  return Promise.race([promise, timeoutPromise])
}

export async function waitFor(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now()

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition')
    }
    await delay(interval)
  }
}

// ============= MATH HELPERS =============
export function clamp(num: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, num))
}

export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0)
}

export function average(arr: number[]): number {
  return sum(arr) / arr.length
}

export function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

// ============= TYPE CHECKING =============
export function isEmail(str: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)
}

export function isUrl(str: string): boolean {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

export function isPhone(str: string): boolean {
  return /^(\+\d{1,3}[- ]?)?\d{10}$/.test(str.replace(/\D/g, ''))
}

export function isIPAddress(str: string): boolean {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (!ipRegex.test(str)) return false
  return str.split('.').every(part => {
    const num = parseInt(part, 10)
    return num >= 0 && num <= 255
  })
}

export function isEmpty(val: any): boolean {
  return val === null || val === undefined || val === '' || (Array.isArray(val) && val.length === 0)
}

export function isObject(val: any): boolean {
  return val !== null && typeof val === 'object' && !Array.isArray(val)
}

// ============= LOGGING HELPERS =============
export function logError(message: string, error?: any): void {
  console.error(`[ERROR] ${message}`, error)
}

export function logWarn(message: string, data?: any): void {
  console.warn(`[WARN] ${message}`, data)
}

export function logInfo(message: string, data?: any): void {
  console.log(`[INFO] ${message}`, data)
}

export function logDebug(message: string, data?: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`, data)
  }
}

export function logPerformance(label: string, fn: () => void): void {
  const start = performance.now()
  fn()
  const end = performance.now()
  console.log(`[PERF] ${label}: ${(end - start).toFixed(2)}ms`)
}

export default {
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  clearLocalStorage,
  setSessionStorage,
  getSessionStorage,
  removeSessionStorage,
  setCookie,
  getCookie,
  removeCookie,
  getUrlParams,
  getUrlParam,
  updateUrlParam,
  removeUrlParam,
  buildUrlParams,
  removeDuplicates,
  flattenArray,
  groupBy,
  sortBy,
  chunk,
  shuffle,
  sample,
  sampleMany,
  findMaxBy,
  findMinBy,
  deepClone,
  merge,
  deepMerge,
  pickBy,
  omitBy,
  invertObject,
  debounce,
  throttle,
  retry,
  delay,
  timeout,
  waitFor,
  clamp,
  lerp,
  randomInt,
  randomFloat,
  sum,
  average,
  median,
  isEmail,
  isUrl,
  isPhone,
  isIPAddress,
  isEmpty,
  isObject,
  logError,
  logWarn,
  logInfo,
  logDebug,
  logPerformance,
}