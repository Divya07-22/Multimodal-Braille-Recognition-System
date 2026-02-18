import { useState, useCallback, useEffect, Dispatch, SetStateAction } from 'react'

interface UseLocalStorageOptions {
  serializer?: (value: any) => string
  deserializer?: (value: string) => any
  initializeWithValue?: boolean
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
): [T, Dispatch<SetStateAction<T>>, { remove: () => void; clear: () => void }] {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    initializeWithValue = true,
  } = options

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!initializeWithValue || typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      if (item === null) {
        return initialValue
      }
      return deserializer(item)
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    value => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, serializer(valueToStore))
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, serializer, storedValue]
  )

  const remove = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  const clear = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.clear()
      }
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }, [initialValue])

  // Sync across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(deserializer(e.newValue))
        } catch (error) {
          console.error(`Error syncing localStorage key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, deserializer])

  return [storedValue, setValue, { remove, clear }]
}

export default useLocalStorage