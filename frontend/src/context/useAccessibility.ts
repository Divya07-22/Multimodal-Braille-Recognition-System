import { useContext } from 'react'
import {
  AccessibilityContext,
  type AccessibilityContextType,
} from './AccessibilityContextValue'

export function useAccessibility(): AccessibilityContextType {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}