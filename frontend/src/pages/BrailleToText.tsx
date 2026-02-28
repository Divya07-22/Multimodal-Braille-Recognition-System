import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDownUp, Copy, RotateCcw, Zap } from 'lucide-react'
import { useBrailleToText } from '../hooks/useConversion'
import { useClipboard } from '../hooks/useClipboard'
import { useAccessibility } from '../context/useAccessibility'

const brailleExamples = ['⠓⠑⠇⠇⠕', '⠃⠗⠁⠊⠇⠇⠑', '⠓⠑⠇⠇⠕ ⠺⠕⠗⠇⠙']

export default function BrailleToText() {
  const [braille, setBraille] = useState('')
  const [grade, setGrade] = useState<1 | 2>(1)
  const { result, isLoading, error, progress, convert, reset } = useBrailleToText()
  const { copy, copied } = useClipboard()
  const { settings } = useAccessibility()

  const handleReset = () => { setBraille(''); reset() }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 ${
            settings.highContrast
              ? 'bg-yellow-400 text-black'
              : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
          }`}>
            <ArrowDownUp size={14} /> Braille to Text
          </div>
          <h1 className={`text-4xl md:text-5xl font-black mb-3 ${
            settings.highContrast ? 'text-yellow-400' : 'text-white'
          }`}>
            Decode Braille to Text
          </h1>
          <p className={`text-lg ${settings.highContrast ? 'text-yellow-100' : 'text-white/50'}`}>
            Paste Braille unicode and get readable text instantly
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-3xl border p-6 ${
              settings.highContrast
                ? 'border-yellow-400 bg-black'
                : 'border-white/10 bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`font-bold text-sm uppercase tracking-widest ${
                settings.highContrast ? 'text-yellow-400' : 'text-white/40'
              }`}>Braille Input</h2>
              <span className={`text-xs ${settings.highContrast ? 'text-yellow-300' : 'text-white/30'}`}>
                {braille.length} chars
              </span>
            </div>

            <textarea
              value={braille}
              onChange={e => setBraille(e.target.value)}
              placeholder="Paste Braille unicode here e.g. ⠓⠑⠇⠇⠕"
              rows={8}
              className={`w-full bg-transparent resize-none outline-none text-2xl leading-loose tracking-widest font-mono ${
                settings.highContrast
                  ? 'text-yellow-100 placeholder:text-yellow-400/40'
                  : 'text-white placeholder:text-white/20'
              }`}
              aria-label="Braille input for conversion"
            />

            {/* Examples */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
              <span className={`text-xs ${settings.highContrast ? 'text-yellow-300' : 'text-white/30'}`}>Examples:</span>
              {brailleExamples.map(ex => (
                <button
                  key={ex}
                  onClick={() => setBraille(ex)}
                  className={`text-sm px-3 py-1 rounded-full font-mono transition-all ${
                    settings.highContrast
                      ? 'bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400 hover:text-black border border-yellow-400'
                      : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {ex}
                </button>
              ))}
            </div>

            {/* Grade */}
            <div className="mt-4">
              <label className={`text-xs font-bold uppercase tracking-widest block mb-2 ${
                settings.highContrast ? 'text-yellow-400' : 'text-white/40'
              }`}>Braille Grade</label>
              <div className="flex gap-3">
                {([1, 2] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setGrade(g)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                      grade === g
                        ? settings.highContrast
                          ? 'bg-yellow-400 text-black border-yellow-400'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : settings.highContrast
                          ? 'border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10'
                          : 'border-white/10 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    Grade {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => convert(braille, { grade })}
                disabled={isLoading || !braille.trim()}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  settings.highContrast
                    ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02]'
                }`}
              >
                {isLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Decoding...</>
                ) : (
                  <><Zap size={16} /> Decode</>
                )}
              </button>
              <button
                onClick={handleReset}
                className={`px-4 py-3 rounded-2xl border transition-all ${
                  settings.highContrast
                    ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400/20'
                    : 'border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {isLoading && (
              <div className="mt-4">
                <div className={`h-1.5 rounded-full overflow-hidden ${settings.highContrast ? 'bg-yellow-400/20' : 'bg-white/10'}`}>
                  <motion.div
                    className={`h-full rounded-full ${settings.highContrast ? 'bg-yellow-400' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Output Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-3xl border p-6 ${
              settings.highContrast
                ? 'border-yellow-400 bg-black'
                : 'border-white/10 bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`font-bold text-sm uppercase tracking-widest ${
                settings.highContrast ? 'text-yellow-400' : 'text-white/40'
              }`}>Text Output</h2>

              {result?.text && (
                <button
                  onClick={() => copy(result.text || '')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    settings.highContrast
                      ? 'bg-yellow-400 text-black'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <Copy size={12} /> {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                {error}
              </div>
            )}

            {result ? (
              <div className="space-y-4">
                <div className={`p-6 rounded-2xl border min-h-[150px] ${
                  settings.highContrast
                    ? 'border-yellow-400 bg-yellow-400/10'
                    : 'border-white/10 bg-white/5'
                }`}>
                  <p className={`text-xl font-medium leading-relaxed ${
                    settings.highContrast ? 'text-yellow-100' : 'text-white'
                  }`}>
                    {result.text}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Characters', value: result.character_count || result.text?.length },
                    { label: 'Words', value: result.word_count || result.text?.split(' ').length },
                  ].map(s => (
                    <div
                      key={s.label}
                      className={`p-3 rounded-2xl text-center border ${
                        settings.highContrast
                          ? 'border-yellow-400 bg-yellow-400/10'
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <div className={`text-2xl font-black ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
                        {s.value}
                      </div>
                      <div className={`text-xs mt-1 ${settings.highContrast ? 'text-yellow-300' : 'text-white/40'}`}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center min-h-[250px] gap-4 ${
                settings.highContrast ? 'text-yellow-400/40' : 'text-white/20'
              }`}>
                <ArrowDownUp size={48} className="opacity-30" />
                <p className="text-sm">Decoded text will appear here</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}