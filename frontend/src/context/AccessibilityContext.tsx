import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'

interface AccessibilitySettings {
  highContrast: boolean
  fontSize: number
  screenReaderEnabled: boolean
  keyboardNavigationEnabled: boolean
  darkMode: boolean
}

interface AccessibilityContextType {
  settings: AccessibilitySettings
  toggleHighContrast: () => void
  setFontSize: (size: number) => void
  toggleScreenReader: () => void
  toggleKeyboardNavigation: () => void
  toggleDarkMode: () => void
  resetSettings: () => void
  importSettings: (settings: AccessibilitySettings) => void
  exportSettings: () => AccessibilitySettings
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  fontSize: 100,
  screenReaderEnabled: false,
  keyboardNavigationEnabled: false,
  darkMode: true,
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem('accessibilitySettings')
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  // Apply styles to document
  useEffect(() => {
    const root = document.documentElement
    root.style.fontSize = `${settings.fontSize}%`

    if (settings.highContrast) {
      document.body.classList.add('high-contrast')
      document.body.style.backgroundColor = '#000'
      document.body.style.color = '#ffff00'
    } else {
      document.body.classList.remove('high-contrast')
    }

    if (!settings.darkMode) {
      document.body.style.backgroundColor = '#fff'
      document.body.style.color = '#000'
    }

    // Save to storage
    try {
      localStorage.setItem('accessibilitySettings', JSON.stringify(settings))
    } catch (error) {
      console.error('Error saving accessibility settings:', error)
    }
  }, [settings])

  const toggleHighContrast = useCallback(() => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }))
  }, [])

  const setFontSize = useCallback((size: number) => {
    setSettings(prev => ({
      ...prev,
      fontSize: Math.max(80, Math.min(150, size)),
    }))
  }, [])

  const toggleScreenReader = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      screenReaderEnabled: !prev.screenReaderEnabled,
    }))

    // Announce change
    if (!settings.screenReaderEnabled) {
      const utterance = new SpeechSynthesisUtterance('Screen reader enabled')
      window.speechSynthesis.speak(utterance)
    }
  }, [settings.screenReaderEnabled])

  const toggleKeyboardNavigation = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      keyboardNavigationEnabled: !prev.keyboardNavigationEnabled,
    }))
  }, [])

  const toggleDarkMode = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      darkMode: !prev.darkMode,
    }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    try {
      localStorage.removeItem('accessibilitySettings')
    } catch (error) {
      console.error('Error resetting accessibility settings:', error)
    }
  }, [])

  const importSettings = useCallback((newSettings: AccessibilitySettings) => {
    setSettings(newSettings)
  }, [])

  const exportSettings = useCallback(() => {
    return { ...settings }
  }, [settings])

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        toggleHighContrast,
        setFontSize,
        toggleScreenReader,
        toggleKeyboardNavigation,
        toggleDarkMode,
        resetSettings,
        importSettings,
        exportSettings,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider')
  }
  return context
}

export default AccessibilityContext