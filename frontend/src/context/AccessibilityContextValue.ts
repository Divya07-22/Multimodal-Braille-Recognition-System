import { createContext } from 'react'

export interface AccessibilitySettings {
  highContrast: boolean
  fontSize: number
  screenReaderEnabled: boolean
  keyboardNavigationEnabled: boolean
  reducedMotion: boolean
}

export interface AccessibilityContextType {
  settings: AccessibilitySettings
  toggleHighContrast: () => void
  setFontSize: (size: number) => void
  toggleScreenReader: () => void
  toggleKeyboardNavigation: () => void
  toggleReducedMotion: () => void
  resetSettings: () => void
}

export const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  fontSize: 100,
  screenReaderEnabled: false,
  keyboardNavigationEnabled: false,
  reducedMotion: false,
}

export const AccessibilityContext = createContext<AccessibilityContextType | undefined>(
  undefined
)