
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  BarChart3, BookOpen, Image, ArrowDownUp,
  Clock, Star, Trash2, ChevronRight, Zap
} from 'lucide-react'
import { useAuthStore } from '../hooks/useAuth'
import { useHistory } from '../hooks/useHistory'
import { useAccessibility } from '../context/useAccessibility'

const typeConfig: Record<string, { label: string; color: string; icon: typeof BookOpen }> = {
  text_to_braille: { label: 'Text → Braille', color: 'text-violet-400', icon: BookOpen },
  image_to_braille: { label: 'Image → Braille', color: 'text-pink-400', icon: Image },
  braille_to_text: { label: 'Braille → Text', color: 'text-cyan-400', icon: ArrowDownUp },
}

const quickLinks = [
  { to: '/text-to-braille', label: 'Text to Braille', icon: BookOpen, gradient: 'from-violet-500 to-purple-600' },
  { to: '/image-to-braille', label: 'Image to Braille', icon: Image, gradient: 'from-pink-500 to-rose-600' },
  { to: '/braille-to-text', label: 'Braille to Text', icon: ArrowDownUp, gradient: 'from-cyan-500 to-blue-600' },
]

export default function Dashboard() {
  const { user } = useAuthStore()
  const { items, total, isLoading, deleteItem, toggleFavorite } = useHistory()
  const { settings } = useAccessibility()

  const stats = [
    { label: 'Total Conversions', value: total, icon: BarChart3, color: 'text-violet-400' },
    { label: 'This Week', value: items.filter(i => {
      const d = new Date(i.created_at)
      const week = new Date(); week.setDate(week.getDate() - 7)
      return d > week
    }).length, icon: Clock, color: 'text-pink-400' },
    { label: 'Favorites', value: items.filter(i => i.is_favorite).length, icon: Star, color: 'text-yellow-400' },
  ]

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 ${
            settings.highContrast
              ? 'bg-yellow-400 text-black'
              : 'bg-violet-500/10 border border-violet-500/20 text-violet-400'
          }`}>
            <BarChart3 size={14} /> Dashboard
          </div>
          <h1 className={`text-4xl md:text-5xl font-black mb-2 ${
            settings.highContrast ? 'text-yellow-400' : 'text-white'
          }`}>
            Welcome back, {user?.full_name || user?.username}!
          </h1>
          <p className={settings.highContrast ? 'text-yellow-100' : 'text-white/50'}>
            Here's your Braille conversion activity
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {stats.map((s, i) => {
            const Icon = s.icon
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-2xl border ${
                  settings.highContrast
                    ? 'border-yellow-400 bg-yellow-400/5'
                    : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-medium ${settings.highContrast ? 'text-yellow-200' : 'text-white/50'}`}>
                    {s.label}
                  </span>
                  <Icon size={18} className={settings.highContrast ? 'text-yellow-400' : s.color} />
                </div>
                <div className={`text-4xl font-black ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
                  {s.value}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className={`text-lg font-black mb-4 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
            Quick Convert
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {quickLinks.map(({ to, label, icon: Icon, gradient }) => (
              <Link
                key={to}
                to={to}
                className={`group flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                  settings.highContrast
                    ? 'border-yellow-400 hover:bg-yellow-400/10 text-yellow-400'
                    : 'border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] text-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className="text-white" />
                </div>
                <span className="font-bold text-sm">{label}</span>
                <ChevronRight size={14} className="ml-auto opacity-40 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-black ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
              Recent Conversions
            </h2>
            <Link
              to="/history"
              className={`text-sm font-medium transition-all ${
                settings.highContrast
                  ? 'text-yellow-400 hover:text-yellow-300'
                  : 'text-violet-400 hover:text-violet-300'
              }`}
            >
              View All
            </Link>
          </div>

          <div className={`rounded-3xl border overflow-hidden ${
            settings.highContrast ? 'border-yellow-400' : 'border-white/10'
          }`}>
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 mx-auto border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-3" />
                <p className={settings.highContrast ? 'text-yellow-300' : 'text-white/40'}>Loading history...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="p-12 text-center">
                <Zap size={36} className={`mx-auto mb-3 ${settings.highContrast ? 'text-yellow-400' : 'text-violet-400/40'}`} />
                <p className={`font-bold mb-1 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>No conversions yet</p>
                <p className={`text-sm mb-4 ${settings.highContrast ? 'text-yellow-200' : 'text-white/40'}`}>Start converting to see your history here</p>
                <Link
                  to="/text-to-braille"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${
                    settings.highContrast
                      ? 'bg-yellow-400 text-black'
                      : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  }`}
                >
                  Start Converting
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {items.slice(0, 8).map((item, i) => {
                  const cfg = typeConfig[item.conversion_type] || typeConfig.text_to_braille
                  const Icon = cfg.icon
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-4 px-5 py-4 transition-all ${
                        settings.highContrast
                          ? 'hover:bg-yellow-400/10'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        settings.highContrast ? 'bg-yellow-400/20' : 'bg-white/5'
                      }`}>
                        <Icon size={16} className={settings.highContrast ? 'text-yellow-400' : cfg.color} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-bold mb-0.5 ${settings.highContrast ? 'text-yellow-400' : cfg.color}`}>
                          {cfg.label}
                        </div>
                        <div className={`text-sm truncate ${settings.highContrast ? 'text-yellow-100' : 'text-white/70'}`}>
                          {item.input_text || '(image input)'}
                        </div>
                      </div>

                      <div className={`text-xs flex-shrink-0 ${settings.highContrast ? 'text-yellow-300' : 'text-white/30'}`}>
                        {formatDate(item.created_at)}
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className={`p-1.5 rounded-lg transition-all ${
                            item.is_favorite
                              ? 'text-yellow-400'
                              : settings.highContrast
                                ? 'text-yellow-400/40 hover:text-yellow-400'
                                : 'text-white/20 hover:text-yellow-400'
                          }`}
                          aria-label="Toggle favorite"
                        >
                          <Star size={14} className={item.is_favorite ? 'fill-current' : ''} />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className={`p-1.5 rounded-lg transition-all ${
                            settings.highContrast
                              ? 'text-yellow-400/40 hover:text-red-400'
                              : 'text-white/20 hover:text-red-400'
                          }`}
                          aria-label="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}