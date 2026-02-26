import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowDownUp, Copy, Volume2, RefreshCw, Sparkles, CheckCircle, Info } from 'lucide-react'
import { brailleAPI } from '../services/api'
import { useAuthStore } from '../hooks/useAuth'
import { useAccessibility } from '../context/AccessibilityContext'
import toast from 'react-hot-toast'

const GRADE_OPTIONS = [
  { value: 'grade_1', label: 'Grade 1', desc: 'Uncontracted' },
  { value: 'grade_2', label: 'Grade 2', desc: 'Contracted' },
]

const SAMPLE_BRAILLE = [
  '⠓⠑⠇⠇⠕ ⠺⠕⠗⠇⠙',
  '⠁ ⠃ ⠉ ⠙ ⠑ ⠋ ⠛ ⠓ ⠊ ⠚',
  '⠃⠗⠁⠊⠇⠇⠑',
]

export default function BrailleToText() {
  const [brailleInput, setBrailleInput] = useState('')
  const [textOutput, setTextOutput] = useState('')
  const [grade, setGrade] = useState('grade_1')
  const [isConverting, setIsConverting] = useState(false)
  const [stats, setStats] = useState<{ processing_time_ms: number; confidence_score: number } | null>(null)
  const { isAuthenticated } = useAuthStore()
  const { settings } = useAccessibility()

  const handleConvert = useCallback(async () => {
    if (!brailleInput.trim()) { toast.error('Please enter Braille text'); return }
    if (!isAuthenticated) { toast.error('Please sign in to use this feature'); return }
    setIsConverting(true)
    setTextOutput('')
    setStats(null)
    try {
      const { data } = await brailleAPI.brailleToText({ braille_text: brailleInput, grade })
      setTextOutput(data.output_text)
      setStats({ processing_time_ms: data.processing_time_ms, confidence_score: data.confidence_score })
      toast.success(`Decoded in ${data.processing_time_ms}ms!`)
    } catch { /* handled */ }
    finally { setIsConverting(false) }
  }, [brailleInput, grade, isAuthenticated])

  const handleSpeak = () => {
    if (!textOutput) return
    const utterance = new SpeechSynthesisUtterance(textOutput)
    utterance.rate = 0.9
    speechSynthesis.speak(utterance)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(textOutput)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex items-center gap-2 badge badge-cyan mb-4">
          <ArrowDownUp size={14} /> Reverse Decoding
        </div>
        <h1 className={`page-title ${settings.highContrast ? 'text-yellow-400' : 'gradient-text-cyan'}`}>
          Braille to Text
        </h1>
        <p className={`text-lg max-w-2xl mx-auto ${settings.highContrast ? 'text-yellow-200' : 'text-white/60'}`}>
          Paste Braille Unicode and decode it back to readable English. Supports Grade 1 and Grade 2.
        </p>
      </motion.div>

      {/* Grade selector */}
      <div className="flex gap-3 justify-center mb-6 flex-wrap">
        {GRADE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setGrade(opt.value)}
            className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${grade === opt.value
                ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
              }`}
          >
            <span className="font-bold">{opt.label}</span>
            <span className="text-xs opacity-70 ml-2">({opt.desc})</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ArrowDownUp size={18} className="text-cyan-400" />
              <h2 className={`font-bold ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>Braille Input</h2>
            </div>
            <button onClick={() => { setBrailleInput(''); setTextOutput(''); setStats(null) }} className="btn-icon">
              <RefreshCw size={16} />
            </button>
          </div>

          <textarea
            value={brailleInput}
            onChange={e => setBrailleInput(e.target.value)}
            placeholder="Paste Braille Unicode here (⠓⠑⠇⠇⠕)…&#10;Braille characters are from Unicode block U+2800–U+28FF"
            className="input-field min-h-[240px] text-2xl"
            style={{ letterSpacing: '0.2em', lineHeight: '2' }}
            aria-label="Braille input"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <p className="text-xs text-white/40 w-full mb-1">Sample Braille:</p>
            {SAMPLE_BRAILLE.map((s, i) => (
              <button
                key={i}
                onClick={() => setBrailleInput(s)}
                className="text-sm px-3 py-1.5 rounded-lg border border-white/10 text-violet-300 hover:border-violet-500/50 transition-all"
                style={{ letterSpacing: '0.1em' }}
              >
                {s}
              </button>
            ))}
          </div>

          <motion.button
            onClick={handleConvert}
            disabled={isConverting || !brailleInput.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`btn-primary w-full mt-4 justify-center ${(isConverting || !brailleInput.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)' }}
          >
            {isConverting ? (
              <><div className="spinner !w-4 !h-4 !border-2 !border-t-cyan-400" /> Decoding…</>
            ) : (
              <><Sparkles size={18} /> Decode to Text</>
            )}
          </motion.button>
        </motion.div>

        {/* Output */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className={textOutput ? 'text-emerald-400' : 'text-white/30'} />
              <h2 className={`font-bold ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>Text Output</h2>
              {textOutput && <span className="badge badge-cyan text-xs">Decoded</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={handleSpeak} disabled={!textOutput} className="btn-icon" title="Read aloud">
                <Volume2 size={16} />
              </button>
              <button onClick={handleCopy} disabled={!textOutput} className="btn-icon" title="Copy">
                <Copy size={16} />
              </button>
            </div>
          </div>

          {textOutput ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className={`min-h-[200px] p-5 rounded-xl border text-lg leading-relaxed font-medium ${settings.highContrast
                  ? 'border-yellow-400 bg-black text-yellow-400'
                  : 'border-white/10 bg-white/5 text-white'
                }`}>
                {textOutput}
              </div>
              {stats && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-lg font-bold text-cyan-400">{stats.processing_time_ms}ms</div>
                    <div className="text-xs text-white/40">Decode Time</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-lg font-bold text-violet-400">{(stats.confidence_score * 100).toFixed(1)}%</div>
                    <div className="text-xs text-white/40">Confidence</div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="min-h-[240px] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <ArrowDownUp size={28} className="text-white/20" />
              </div>
              <p className="text-white/40 text-sm">Enter Braille characters and click Decode</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Info box */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-8 glass p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Info size={20} className="text-cyan-400" />
        </div>
        <div>
          <h3 className="font-bold text-white mb-1">About Braille Unicode</h3>
          <p className="text-white/50 text-sm leading-relaxed">
            Braille characters occupy Unicode codepoints <strong className="text-cyan-300">U+2800</strong> to <strong className="text-cyan-300">U+28FF</strong>.
            Each character represents a Braille cell of up to 6 dots arranged in a 2×3 grid.
            Grade 1 maps individual characters; Grade 2 uses contractions for efficiency.
          </p>
        </div>
      </motion.div>
    </div>
  )
}