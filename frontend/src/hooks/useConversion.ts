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
        const response = await api.post('/convert/text-to-braille', {
          text: text.trim(),
          grade: options?.grade || 1,
          language: options?.language || 'en',
          include_dots: options?.include_dots ?? true,
        })
        clearInterval(progressInterval)
        setState({
          result: response.data,
          isLoading: false,
          error: null,
          progress: 100,
        })
        toast.success('Conversion successful!')
        return response.data
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
        'image/gif',
      ]
      if (!allowedTypes.includes(file.type)) {
        toast.error('Unsupported file format. Please use JPEG, PNG, WebP or GIF.')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large. Maximum 10MB allowed.')
        return
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null, progress: 0 }))
      const progressInterval = setInterval(() => {
        setState((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 5, 80),
        }))
      }, 200)
      try {
        const formData = new FormData()
        formData.append('file', file)
        if (options?.grade) formData.append('grade', String(options.grade))
        if (options?.enhance !== undefined)
          formData.append('enhance', String(options.enhance))

        const response = await api.post('/convert/image-to-braille', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            if (e.total) {
              const percent = Math.round((e.loaded * 50) / e.total)
              setState((prev) => ({ ...prev, progress: percent }))
            }
          },
        })
        clearInterval(progressInterval)
        setState({
          result: response.data,
          isLoading: false,
          error: null,
          progress: 100,
        })
        toast.success('Image converted successfully!')
        return response.data
      } catch (err: unknown) {
        clearInterval(progressInterval)
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
        const response = await api.post('/convert/braille-to-text', {
          braille: braille.trim(),
          grade: options?.grade || 1,
          language: options?.language || 'en',
        })
        clearInterval(progressInterval)
        setState({
          result: response.data,
          isLoading: false,
          error: null,
          progress: 100,
        })
        toast.success('Braille decoded successfully!')
        return response.data
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