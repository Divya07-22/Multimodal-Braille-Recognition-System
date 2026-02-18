import { useState, useCallback, useRef, useEffect } from 'react'
import { AxiosRequestConfig } from 'axios'
import api from '../services/api'
import toast from 'react-hot-toast'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  success: boolean
}

interface UseApiOptions extends AxiosRequestConfig {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  showNotification?: boolean
}

export function useApi<T = any>(
  url?: string,
  options?: UseApiOptions
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  const execute = useCallback(
    async (customUrl?: string, customOptions?: UseApiOptions) => {
      const finalUrl = customUrl || url
      const finalOptions = { ...options, ...customOptions }

      if (!finalUrl) {
        console.error('No URL provided')
        return null
      }

      abortControllerRef.current = new AbortController()

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
      }))

      try {
        const response = await api.get<T>(finalUrl, {
          ...finalOptions,
          signal: abortControllerRef.current.signal,
        })

        setState(prev => ({
          ...prev,
          data: response,
          loading: false,
          success: true,
        }))

        if (finalOptions.onSuccess) {
          finalOptions.onSuccess(response)
        }

        if (finalOptions.showNotification) {
          toast.success('Data loaded successfully')
        }

        return response
      } catch (error) {
        const err = error as Error
        setState(prev => ({
          ...prev,
          error: err,
          loading: false,
          success: false,
        }))

        if (finalOptions.onError) {
          finalOptions.onError(err)
        }

        if (finalOptions.showNotification) {
          toast.error(err.message || 'Failed to load data')
        }

        return null
      }
    },
    [url, options]
  )

  const mutate = useCallback(
    async (method: 'post' | 'put' | 'patch' | 'delete', data?: any, customOptions?: UseApiOptions) => {
      if (!url) {
        console.error('No URL provided')
        return null
      }

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
      }))

      try {
        let response: T

        switch (method) {
          case 'post':
            response = await api.post(url, data, customOptions)
            break
          case 'put':
            response = await api.put(url, data, customOptions)
            break
          case 'patch':
            response = await api.patch(url, data, customOptions)
            break
          case 'delete':
            response = await api.delete(url, customOptions)
            break
          default:
            throw new Error('Invalid method')
        }

        setState(prev => ({
          ...prev,
          data: response,
          loading: false,
          success: true,
        }))

        if (customOptions?.onSuccess) {
          customOptions.onSuccess(response)
        }

        if (customOptions?.showNotification) {
          toast.success('Operation completed successfully')
        }

        return response
      } catch (error) {
        const err = error as Error
        setState(prev => ({
          ...prev,
          error: err,
          loading: false,
          success: false,
        }))

        if (customOptions?.onError) {
          customOptions.onError(err)
        }

        if (customOptions?.showNotification) {
          toast.error(err.message || 'Operation failed')
        }

        return null
      }
    },
    [url]
  )

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    })
  }, [])

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  // Auto-fetch on mount if URL provided
  useEffect(() => {
    if (url && options?.autoFetch !== false) {
      execute()
    }

    return () => {
      cancel()
    }
  }, [url])

  return {
    ...state,
    execute,
    mutate,
    reset,
    cancel,
    post: (data?: any, customOptions?: UseApiOptions) => mutate('post', data, customOptions),
    put: (data?: any, customOptions?: UseApiOptions) => mutate('put', data, customOptions),
    patch: (data?: any, customOptions?: UseApiOptions) => mutate('patch', data, customOptions),
    delete: (customOptions?: UseApiOptions) => mutate('delete', undefined, customOptions),
  }
}

export default useApi