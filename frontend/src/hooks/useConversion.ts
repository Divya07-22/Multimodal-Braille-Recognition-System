import { useState, useCallback } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

interface ConversionResult {
  braille?: string
  text?: string
  unicode?: string
  dots?: string
  confidence?: number
  processing_time?: number
  character_count?: number
  word_count?: number
}

interface ConversionState {
  result: ConversionResult | null
  isLoading: boolean
  error: string | null
  progress: number
}

type ApiError = { response?: { data?: { detail?: string } } }

// ---------------------------------------------------------------------------
// Text → Braille
// Backend route: POST /braille/translate  (accepts { braille_text, grade })
// For text-to-braille we encode client-side using the Unicode braille map and
// also hit /braille/translate to get a server-side confidence score.
// ---------------------------------------------------------------------------
const CHAR_TO_BRAILLE: Record<string, string> = {
  a: '⠁', b: '⠃', c: '⠉', d: '⠙', e: '⠑',
  f: '⠋', g: '⠛', h: '⠓', i: '⠊', j: '⠚',
  k: '⠅', l: '⠇', m: '⠍', n: '⠝', o: '⠕',
  p: '⠏', q: '⠟', r: '⠗', s: '⠎', t: '⠞',
  u: '⠥', v: '⠧', w: '⠺', x: '⠭', y: '⠽',
  z: '⠵', ' ': '⠀',
}

function textToBrailleUnicode(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((ch) => CHAR_TO_BRAILLE[ch] ?? ch)
    .join('')
}

export function useTextToBraille() {
  const [state, setState] = useState<ConversionState>({
    result: null,
    isLoading: false,
    error: null,
    progress: 0,
  })

  const convert = useCallback(
    async (
      text: string,
      options?: {
        grade?: 1 | 2
        language?: string
        include_dots?: boolean
      }
    ) => {
      if (!text.trim()) {
        toast.error('Please enter some text to convert')
        return
      }
      setState((prev) => ({ ...prev, isLoading: true, error: null, progress: 0 }))
      const progressInterval = setInterval(() => {
        setState((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 85),
        }))
      }, 150)
      try {
        // Convert locally for instant braille display
        const brailleUnicode = textToBrailleUnicode(text.trim())

        // Also call the backend braille translate endpoint:
        // POST /braille/translate expects { braille_text, grade }
        // Here we pass the converted unicode so the backend can confirm & score it
        const response = await api.post('/braille/translate', {
          braille_text: brailleUnicode,
          grade: options?.grade ?? 1,
        })

        clearInterval(progressInterval)
        const result: ConversionResult = {
          braille: brailleUnicode,
          unicode: brailleUnicode,
          text: text.trim(),
          confidence: response.data.confidence,
          word_count: text.trim().split(/\s+/).filter(Boolean).length,
          character_count: text.trim().length,
        }

        try {
          await api.post('/history', {
            conversion_type: 'text_to_braille',
            input_text: text.trim(),
            braille_output: brailleUnicode,
            output_text: brailleUnicode,
            processing_time_ms: 0
          })
        } catch (e) {
          console.error('Failed to save history', e)
        }

        setState({ result, isLoading: false, error: null, progress: 100 })
        toast.success('Conversion successful!')
        return result
      } catch (err: unknown) {
        clearInterval(progressInterval)
        const message =
          (err as ApiError)?.response?.data?.detail ||
          'Conversion failed. Please try again.'
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
          progress: 0,
        }))
        toast.error(message)
        throw err
      }
    },
    []
  )

  const reset = useCallback(() => {
    setState({ result: null, isLoading: false, error: null, progress: 0 })
  }, [])

  return { ...state, convert, reset }
}

// ---------------------------------------------------------------------------
// Image → Braille (runs full ML inference pipeline)
// Flow: POST /upload/image → { document_id } → POST /inference/run → result
// ---------------------------------------------------------------------------
export function useImageToBraille() {
  const [state, setState] = useState<ConversionState>({
    result: null,
    isLoading: false,
    error: null,
    progress: 0,
  })

  const convert = useCallback(
    async (
      file: File,
      options?: {
        grade?: 1 | 2
        enhance?: boolean
      }
    ) => {
      if (!file) {
        toast.error('Please select an image file')
        return
      }
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/bmp',
        'image/tiff',
      ]
      if (!allowedTypes.includes(file.type)) {
        toast.error('Unsupported file format. Please use JPEG, PNG, WebP, BMP or TIFF.')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large. Maximum 10MB allowed.')
        return
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null, progress: 0 }))

      try {
        // Step 1: Upload the file → POST /upload/image
        setState((prev) => ({ ...prev, progress: 10 }))
        const formData = new FormData()
        formData.append('file', file)

        const uploadResponse = await api.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            if (e.total) {
              const percent = Math.round((e.loaded * 40) / e.total) + 10
              setState((prev) => ({ ...prev, progress: percent }))
            }
          },
        })

        const { document_id } = uploadResponse.data
        if (!document_id) throw new Error('Upload did not return a document_id')

        setState((prev) => ({ ...prev, progress: 55 }))

        // Step 2: Run ML inference → POST /inference/run
        const inferenceResponse = await api.post('/inference/run', {
          document_id,
          use_onnx: false, // prefer PyTorch; falls back to CV-based detector if no weights
        })



        const data = inferenceResponse.data
        const result: ConversionResult = {
          text: data.recognized_text,
          confidence: data.confidence_score,
          processing_time: data.processing_time_ms,
          character_count: (data.recognized_text ?? '').length,
          word_count: (data.recognized_text ?? '').split(/\s+/).filter(Boolean).length,
        }

        try {
          await api.post('/history', {
            conversion_type: 'image_to_braille',
            document_id: document_id,
            output_text: data.recognized_text,
            processing_time_ms: data.processing_time_ms || 0
          })
        } catch (e) {
          console.error('Failed to save history', e)
        }

        setState({ result, isLoading: false, error: null, progress: 100 })
        toast.success('Image processed successfully!')
        return result
      } catch (err: unknown) {
        const message =
          (err as ApiError)?.response?.data?.detail ||
          'Image conversion failed. Please try again.'
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
          progress: 0,
        }))
        toast.error(message)
        throw err
      }
    },
    []
  )

  const reset = useCallback(() => {
    setState({ result: null, isLoading: false, error: null, progress: 0 })
  }, [])

  return { ...state, convert, reset }
}

// ---------------------------------------------------------------------------
// Braille → Text
// Backend route: POST /braille/translate  (accepts { braille_text, grade })
// ---------------------------------------------------------------------------
export function useBrailleToText() {
  const [state, setState] = useState<ConversionState>({
    result: null,
    isLoading: false,
    error: null,
    progress: 0,
  })

  const convert = useCallback(
    async (
      braille: string,
      options?: {
        grade?: 1 | 2
        language?: string
      }
    ) => {
      if (!braille.trim()) {
        toast.error('Please enter Braille characters to convert')
        return
      }
      setState((prev) => ({ ...prev, isLoading: true, error: null, progress: 0 }))
      const progressInterval = setInterval(() => {
        setState((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 15, 85),
        }))
      }, 100)
      try {
        // POST /braille/translate expects { braille_text: string, grade: number }
        const response = await api.post('/braille/translate', {
          braille_text: braille.trim(),
          grade: options?.grade ?? 1,
        })
        clearInterval(progressInterval)
        const data = response.data
        const result: ConversionResult = {
          text: data.translated,
          confidence: data.confidence,
          word_count: (data.translated ?? '').split(/\s+/).filter(Boolean).length,
          character_count: (data.translated ?? '').length,
        }

        try {
          await api.post('/history', {
            conversion_type: 'braille_to_text',
            input_text: braille.trim(),
            braille_output: braille.trim(),
            output_text: data.translated,
            processing_time_ms: 0
          })
        } catch (e) {
          console.error('Failed to save history', e)
        }

        setState({ result, isLoading: false, error: null, progress: 100 })
        toast.success('Braille decoded successfully!')
        return result
      } catch (err: unknown) {
        clearInterval(progressInterval)
        const message =
          (err as ApiError)?.response?.data?.detail ||
          'Braille decoding failed. Please try again.'
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
          progress: 0,
        }))
        toast.error(message)
        throw err
      }
    },
    []
  )

  const reset = useCallback(() => {
    setState({ result: null, isLoading: false, error: null, progress: 0 })
  }, [])

  return { ...state, convert, reset }
}