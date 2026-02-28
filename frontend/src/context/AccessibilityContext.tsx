import { useState, useEffect, type ReactNode } from 'react'
import {
  type AccessibilitySettings,
  AccessibilityContext,
  defaultSettings,
} from './AccessibilityContextValue'

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const stored = localStorage.getItem('accessibility-settings')
      return stored
        ? { ...defaultSettings, ...(JSON.parse(stored) as AccessibilitySettings) }
        : defaultSettings
    } catch {
      return defaultSettings
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('accessibility-settings', JSON.stringify(settings))
    } catch {
      console.warn('Failed to persist accessibility settings')
    }
  }, [settings])

  useEffect(() => {
    document.documentElement.style.fontSize = `${settings.fontSize}%`
  }, [settings.fontSize])

  useEffect(() => {
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [settings.highContrast])

  useEffect(() => {
    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduce-motion')
    } else {
      document.documentElement.classList.remove('reduce-motion')
    }
  }, [settings.reducedMotion])

  useEffect(() => {
    if (settings.keyboardNavigationEnabled) {
      document.documentElement.classList.add('keyboard-navigation')
    } else {
      document.documentElement.classList.remove('keyboard-navigation')
    }
  }, [settings.keyboardNavigationEnabled])

  const toggleHighContrast = () =>
    setSettings((prev) => ({ ...prev, highContrast: !prev.highContrast }))

  const setFontSize = (size: number) =>
    setSettings((prev) => ({
      ...prev,
      fontSize: Math.min(150, Math.max(80, size)),
    }))

  const toggleScreenReader = () =>
    setSettings((prev) => ({
      ...prev,
      screenReaderEnabled: !prev.screenReaderEnabled,
    }))

  const toggleKeyboardNavigation = () =>
    setSettings((prev) => ({
      ...prev,
      keyboardNavigationEnabled: !prev.keyboardNavigationEnabled,
    }))

  const toggleReducedMotion = () =>
    setSettings((prev) => ({ ...prev, reducedMotion: !prev.reducedMotion }))

  const resetSettings = () => {
    setSettings(defaultSettings)
    try {
      localStorage.removeItem('accessibility-settings')
    } catch {
      console.warn('Failed to remove accessibility settings')
    }
  }

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        toggleHighContrast,
        setFontSize,
        toggleScreenReader,
        toggleKeyboardNavigation,
        toggleReducedMotion,
        resetSettings,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}