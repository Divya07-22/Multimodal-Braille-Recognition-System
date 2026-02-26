import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  BarChart2, BookOpen, Image, ArrowDownUp, Clock, TrendingUp,
  Zap, CheckCircle, Star, Download, RefreshCw
} from 'lucide-react'
import { useAuthStore } from '../hooks/useAuth'
import { usersAPI, brailleAPI } from '../services/api'
import { useAccessibility } from '../context/AccessibilityContext'

interface ConversionJob {
  id: number
  job_type: string
  status: string
  braille_grade: string
  input_text?: string
  processing_time_ms?: number
  character_count?: number
  created_at: string
}

interface Stats {
  total_conversions: number
  text_to_braille: number
  image_to_braille: number
  braille_to_text: number
  total_characters: number
  avg_processing_ms: number
}

const JOB_TYPE_LABEL: Record<string, string> = {
  text_to_braille: 'Text → Braille',
  image_to_braille: 'Image → Braille',
  braille_to_text: 'Braille → Text',
  pdf_to_braille: 'PDF → Braille',
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const { settings } = useAccessibility()
  const [stats, setStats] = useState<Stats | null>(null)
  const [history, setHistory] = useState<ConversionJob[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const [statsRes, historyRes] = await Promise.all([
          usersAPI.getStats(),
          brailleAPI.getHistory(0, 8),
        ])
        setStats(statsRes.data)
        setHistory(historyRes.data.items || historyRes.data || [])
      } catch { /* handled by interceptor */ }
      finally { setIsLoading(false) }
    }
    load()
  }, [])

  const statCards = [
    { label: 'Total Conversions', value: stats?.total_conversions ?? '—', icon: Zap, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
    { label: 'Text → Braille', value: stats?.text_to_braille ?? '—', icon: BookOpen, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
    { label: 'Image → Braille', value: stats?.image_to_braille ?? '—', icon: Image, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Avg Speed', value: stats ? `${stats.avg_processing_ms?.toFixed(0)}ms` : '—', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  ]

  const quickActions = [
    { to: '/text-to-braille', label: 'Convert Text', desc: 'Grade 1 & 2 Braille', icon: BookOpen, color: 'from-violet-500 to-pink-500' },
    { to: '/image-to-braille', label: 'Process Image', desc: 'OCR + Braille', icon: Image, color: 'from-pink-500 to-orange-500' },
    { to: '/braille-to-text', label: 'Decode Braille', desc: 'Unicode to text', icon: ArrowDownUp, color: 'from-cyan-500 to-violet-500' },
  ]

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 badge badge-violet mb-3">
              <Star size={12} /> Welcome back
            </div>
            <h1 className={`text-3xl font-black ${settings.highContrast ? 'text-yellow-400' : 'gradient-text'}`}>
              {user?.full_name || user?.username || 'User'}
            </h1>
            <p className={`mt-1 ${settings.highContrast ? 'text-yellow-200' : 'text-white/50'}`}>
              Here's your conversion activity at a glance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="pulse-dot" />
            <span className="text-xs text-emerald-400 font-medium">API Online</span>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`glass p-5 border ${s.bg}`}
          >
            {isLoading ? (
              <div className="space-y-2">
                <div className="shimmer h-6 w-16 rounded" />
                <div className="shimmer h-3 w-24 rounded" />
              </div>
            ) : (
              <>
                <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.value}</div>
                <div className={`text-xs font-medium flex items-center gap-1.5 ${settings.highContrast ? 'text-yellow-200' : 'text-white/50'}`}>
                  <s.icon size={12} /> {s.label}
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
        <h2 className={`text-lg font-bold mb-4 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map(a => (
            <Link
              key={a.to}
              to={a.to}
              className="glass glass-hover p-5 flex items-center gap-4 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <a.icon size={22} className="text-white" />
              </div>
              <div>
                <div className={`font-bold text-sm ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>{a.label}</div>
                <div className={`text-xs ${settings.highContrast ? 'text-yellow-200' : 'text-white/50'}`}>{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent history */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-bold ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>Recent Conversions</h2>
          <button onClick={() => window.location.reload()} className="btn-icon !p-2">
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="glass overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="shimmer h-14 rounded-xl" />)}
            </div>
          ) : history.length > 0 ? (
            <div className="divide-y divide-white/5">
              {history.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${job.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                    {job.status === 'completed' ? <CheckCircle size={16} /> : <Clock size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
                      {JOB_TYPE_LABEL[job.job_type] || job.job_type}
                    </div>
                    <div className="text-xs text-white/40 truncate">
                      {job.input_text?.slice(0, 50) || 'Image/PDF upload'}
                      {(job.input_text?.length || 0) > 50 ? '…' : ''}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="badge badge-violet text-xs">{job.braille_grade?.replace('_', ' ')}</div>
                    <div className="text-xs text-white/30 mt-1">
                      {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {job.processing_time_ms && (
                    <div className="text-xs text-cyan-400 flex-shrink-0 hidden sm:block">
                      {job.processing_time_ms.toFixed(0)}ms
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <BarChart2 size={40} className="text-white/20 mx-auto mb-3" />
              <p className={`text-sm ${settings.highContrast ? 'text-yellow-200' : 'text-white/40'}`}>
                No conversions yet. Try converting some text!
              </p>
              <Link to="/text-to-braille" className="btn-primary inline-flex mt-4 !py-2 !px-4 !text-sm">
                Start Converting
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}