import  { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, BookOpen, Image, ArrowDownUp, Star,
  Trash2, Search, Filter, Download, AlertTriangle
} from 'lucide-react'
import { useHistory } from '../hooks/useHistory'
import { useClipboard } from '../hooks/useClipboard'
import { useAccessibility } from '../context/useAccessibility'
import toast from 'react-hot-toast'

const typeConfig: Record<string, { label: string; color: string; bg: string; icon: typeof BookOpen }> = {
  text_to_braille: {
    label: 'Text → Braille',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
    icon: BookOpen,
  },
  image_to_braille: {
    label: 'Image → Braille',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/20',
    icon: Image,
  },
  braille_to_text: {
    label: 'Braille → Text',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
    icon: ArrowDownUp,
  },
}

type FilterType = 'all' | 'text_to_braille' | 'image_to_braille' | 'braille_to_text' | 'favorites'

export default function History() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const { items, isLoading, hasMore, loadMore, deleteItem, toggleFavorite, clearAll } = useHistory()
  const { copy } = useClipboard()
  const { settings } = useAccessibility()

  const filtered = items.filter(item => {
    const matchesSearch =
      item.input_text?.toLowerCase().includes(search.toLowerCase()) ||
      item.output_text?.toLowerCase().includes(search.toLowerCase()) ||
      item.braille_output?.includes(search)

    const matchesFilter =
      filter === 'all' ||
      (filter === 'favorites' ? item.is_favorite : item.conversion_type === filter)

    return matchesSearch && matchesFilter
  })

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  const handleDownloadItem = (item: typeof items[0]) => {
    const content = [
      `Type: ${typeConfig[item.conversion_type]?.label}`,
      `Date: ${formatDate(item.created_at)}`,
      `Input: ${item.input_text || '(image)'}`,
      `Output: ${item.output_text || item.braille_output || ''}`,
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `braille-history-${item.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }

  const handleClearAll = async () => {
    await clearAll()
    setShowClearConfirm(false)
  }

  const filterButtons: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Text → Braille', value: 'text_to_braille' },
    { label: 'Image → Braille', value: 'image_to_braille' },
    { label: 'Braille → Text', value: 'braille_to_text' },
    { label: '★ Favorites', value: 'favorites' },
  ]

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
        >
          <div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-3 ${
              settings.highContrast
                ? 'bg-yellow-400 text-black'
                : 'bg-violet-500/10 border border-violet-500/20 text-violet-400'
            }`}>
              <Clock size={14} /> Conversion History
            </div>
            <h1 className={`text-4xl font-black ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
              Your History
            </h1>
            <p className={`mt-1 ${settings.highContrast ? 'text-yellow-200' : 'text-white/50'}`}>
              {items.length} total conversion{items.length !== 1 ? 's' : ''}
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border transition-all ${
                settings.highContrast
                  ? 'border-red-400 text-red-400 hover:bg-red-400/20'
                  : 'border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50'
              }`}
            >
              <Trash2 size={14} /> Clear All
            </button>
          )}
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 mb-8"
        >
          {/* Search */}
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${
            settings.highContrast
              ? 'border-yellow-400 bg-black'
              : 'border-white/10 bg-white/5'
          }`}>
            <Search size={16} className={settings.highContrast ? 'text-yellow-400' : 'text-white/30'} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversions..."
              className={`flex-1 bg-transparent outline-none text-sm ${
                settings.highContrast
                  ? 'text-yellow-100 placeholder:text-yellow-400/40'
                  : 'text-white placeholder:text-white/30'
              }`}
              aria-label="Search history"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className={`text-xs px-2 py-1 rounded-lg ${
                  settings.highContrast ? 'text-yellow-400 hover:bg-yellow-400/20' : 'text-white/40 hover:text-white hover:bg-white/10'
                }`}
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            <Filter size={14} className={`self-center ${settings.highContrast ? 'text-yellow-400' : 'text-white/30'}`} />
            {filterButtons.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  filter === value
                    ? settings.highContrast
                      ? 'bg-yellow-400 text-black border-yellow-400'
                      : 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                    : settings.highContrast
                      ? 'border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10'
                      : 'border-white/10 text-white/40 hover:text-white hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* List */}
        {isLoading && items.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 mx-auto border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4" />
            <p className={settings.highContrast ? 'text-yellow-300' : 'text-white/40'}>Loading history...</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-24 text-center"
          >
            <Clock size={48} className={`mx-auto mb-4 ${settings.highContrast ? 'text-yellow-400/30' : 'text-white/10'}`} />
            <p className={`text-lg font-black mb-2 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
              No conversions found
            </p>
            <p className={`text-sm ${settings.highContrast ? 'text-yellow-200' : 'text-white/40'}`}>
              {search ? 'Try a different search term' : 'Start converting to build your history'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((item, i) => {
                const cfg = typeConfig[item.conversion_type] || typeConfig.text_to_braille
                const Icon = cfg.icon

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`group rounded-2xl border p-5 transition-all ${
                      settings.highContrast
                        ? 'border-yellow-400 bg-black hover:bg-yellow-400/5'
                        : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${
                        settings.highContrast ? 'bg-yellow-400/20 border-yellow-400' : cfg.bg
                      }`}>
                        <Icon size={16} className={settings.highContrast ? 'text-yellow-400' : cfg.color} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`text-xs font-bold ${settings.highContrast ? 'text-yellow-400' : cfg.color}`}>
                            {cfg.label}
                          </span>
                          <span className={`text-xs ${settings.highContrast ? 'text-yellow-300' : 'text-white/30'}`}>
                            {formatDate(item.created_at)}
                          </span>
                          {item.processing_time && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              settings.highContrast ? 'bg-yellow-400/20 text-yellow-400' : 'bg-white/5 text-white/30'
                            }`}>
                              {Math.round(item.processing_time * 1000)}ms
                            </span>
                          )}
                        </div>

                        {/* Input */}
                        {item.input_text && (
                          <p className={`text-sm truncate mb-1 ${settings.highContrast ? 'text-yellow-100' : 'text-white/70'}`}>
                            <span className={`font-bold mr-1 ${settings.highContrast ? 'text-yellow-400' : 'text-white/30'}`}>In:</span>
                            {item.input_text}
                          </p>
                        )}

                        {/* Output */}
                        {(item.braille_output || item.output_text) && (
                          <p className={`text-sm truncate font-mono ${settings.highContrast ? 'text-yellow-200' : 'text-white/50'}`}>
                            <span className={`font-sans font-bold mr-1 ${settings.highContrast ? 'text-yellow-400' : 'text-white/30'}`}>Out:</span>
                            {item.braille_output || item.output_text}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => copy(item.braille_output || item.output_text || '', 'Copied!')}
                          className={`p-2 rounded-xl transition-all ${
                            settings.highContrast
                              ? 'text-yellow-400 hover:bg-yellow-400/20'
                              : 'text-white/30 hover:text-white hover:bg-white/10'
                          }`}
                          aria-label="Copy output"
                          title="Copy"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => handleDownloadItem(item)}
                          className={`p-2 rounded-xl transition-all ${
                            settings.highContrast
                              ? 'text-yellow-400 hover:bg-yellow-400/20'
                              : 'text-white/30 hover:text-white hover:bg-white/10'
                          }`}
                          aria-label="Download"
                          title="Download"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className={`p-2 rounded-xl transition-all ${
                            item.is_favorite
                              ? 'text-yellow-400'
                              : settings.highContrast
                                ? 'text-yellow-400/30 hover:text-yellow-400'
                                : 'text-white/20 hover:text-yellow-400 hover:bg-white/10'
                          }`}
                          aria-label="Toggle favorite"
                          title="Favorite"
                        >
                          <Star size={14} className={item.is_favorite ? 'fill-current' : ''} />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className={`p-2 rounded-xl transition-all ${
                            settings.highContrast
                              ? 'text-yellow-400/30 hover:text-red-400 hover:bg-red-400/10'
                              : 'text-white/20 hover:text-red-400 hover:bg-red-500/10'
                          }`}
                          aria-label="Delete"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* Load more */}
            {hasMore && (
              <div className="pt-4 text-center">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className={`px-6 py-3 rounded-2xl text-sm font-bold border transition-all disabled:opacity-50 ${
                    settings.highContrast
                      ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400/20'
                      : 'border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Clear confirm modal */}
        <AnimatePresence>
          {showClearConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowClearConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className={`w-full max-w-sm rounded-3xl border p-8 text-center ${
                  settings.highContrast
                    ? 'border-yellow-400 bg-black'
                    : 'border-white/10 bg-[#0d1626]'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={24} className="text-red-400" />
                </div>
                <h3 className={`text-xl font-black mb-2 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
                  Clear All History?
                </h3>
                <p className={`text-sm mb-6 ${settings.highContrast ? 'text-yellow-200' : 'text-white/50'}`}>
                  This will permanently delete all {items.length} conversions. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className={`flex-1 py-3 rounded-2xl font-bold border transition-all ${
                      settings.highContrast
                        ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400/20'
                        : 'border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="flex-1 py-3 rounded-2xl font-bold bg-red-500 text-white hover:bg-red-600 transition-all"
                  >
                    Clear All
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}