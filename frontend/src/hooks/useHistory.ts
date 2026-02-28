import { useState, useCallback, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useAuthStore } from './useAuth'

interface HistoryItem {
  id: number
  conversion_type: 'text_to_braille' | 'image_to_braille' | 'braille_to_text'
  input_text?: string
  output_text?: string
  braille_output?: string
  created_at: string
  processing_time?: number
  is_favorite?: boolean
}

interface HistoryState {
  items: HistoryItem[]
  isLoading: boolean
  error: string | null
  total: number
  page: number
  hasMore: boolean
}

type ApiError = { response?: { data?: { detail?: string } } }

export function useHistory() {
  const { isAuthenticated } = useAuthStore()
  const [state, setState] = useState<HistoryState>({
    items: [],
    isLoading: false,
    error: null,
    total: 0,
    page: 1,
    hasMore: false,
  })

  const fetchHistory = useCallback(
    async (page = 1, limit = 10) => {
      if (!isAuthenticated) return
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      try {
        const response = await api.get('/history', { params: { page, limit } })
        const { items, total } = response.data
        setState((prev) => ({
          ...prev,
          items: page === 1 ? items : [...prev.items, ...items],
          total,
          page,
          hasMore: page * limit < total,
          isLoading: false,
        }))
      } catch (err: unknown) {
        const message =
          (err as ApiError)?.response?.data?.detail ||
          'Failed to fetch history. Please try again.'
        setState((prev) => ({ ...prev, isLoading: false, error: message }))
      }
    },
    [isAuthenticated]
  )

  const loadMore = useCallback(() => {
    void fetchHistory(state.page + 1)
  }, [fetchHistory, state.page])

  const deleteItem = useCallback(async (id: number) => {
    try {
      await api.delete(`/history/${id}`)
      setState((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
        total: prev.total - 1,
      }))
      toast.success('History item deleted successfully')
    } catch (err: unknown) {
      const message =
        (err as ApiError)?.response?.data?.detail ||
        'Failed to delete history item'
      toast.error(message)
    }
  }, [])

  const clearAll = useCallback(async () => {
    try {
      await api.delete('/history/clear')
      setState((prev) => ({ ...prev, items: [], total: 0 }))
      toast.success('History cleared successfully')
    } catch (err: unknown) {
      const message =
        (err as ApiError)?.response?.data?.detail || 'Failed to clear history'
      toast.error(message)
    }
  }, [])

  const toggleFavorite = useCallback(async (id: number) => {
    try {
      await api.patch(`/history/${id}/favorite`)
      setState((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === id ? { ...item, is_favorite: !item.is_favorite } : item
        ),
      }))
    } catch (err: unknown) {
      const message =
        (err as ApiError)?.response?.data?.detail ||
        'Failed to update favorite status'
      toast.error(message)
    }
  }, [])

  const refresh = useCallback(() => {
    void fetchHistory(1)
  }, [fetchHistory])

  useEffect(() => {
    if (isAuthenticated) {
      const load = async () => {
        await fetchHistory()
      }
      void load()
    }
  }, [isAuthenticated, fetchHistory])

  return {
    ...state,
    fetchHistory,
    loadMore,
    deleteItem,
    clearAll,
    toggleFavorite,
    refresh,
  }
}