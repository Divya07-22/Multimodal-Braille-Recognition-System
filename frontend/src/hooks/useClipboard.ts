import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

export function useClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text: string, message?: string) => {
    if (!text) {
      toast.error('Nothing to copy')
      return false
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }

      setCopied(true)
      toast.success(message || 'Copied to clipboard!')

      setTimeout(() => setCopied(false), resetDelay)
      return true
    } catch {
      toast.error('Failed to copy. Please copy manually.')
      return false
    }
  }, [resetDelay])

  return { copied, copy }
}