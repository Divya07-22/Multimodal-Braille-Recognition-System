import  { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Copy, Download, RotateCcw, Zap, ChevronDown } from 'lucide-react'
import { useTextToBraille } from '../hooks/useConversion'
import { useClipboard } from '../hooks/useClipboard'
import { useAccessibility } from '../context/useAccessibility'

const exampleTexts = ['Hello World', 'I love you', 'Braille is beautiful', 'The quick brown fox']

export default function TextToBraille() {
  const [text, setText] = useState('')
  const [grade, setGrade] = useState<1 | 2>(1)
  const [showOptions, setShowOptions] = useState(false)
  const { result, isLoading, error, progress, convert, reset } = useTextToBraille()
  const { copy, copied } = useClipboard()
  const { settings } = useAccessibility()

  const handleConvert = () => convert(text, { grade })

  const handleDownload = () => {
    if (!result?.braille) return
    const blob = new Blob([result.braille], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'braille-output.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setText('')
    reset()
  }

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
              : 'bg-violet-500/10 border border-violet-500/20 text-violet-400'
          }`}>
            <BookOpen size={14} /> Text to Braille
          </div>
          <h1 className={`text-4xl md:text-5xl font-black mb-3 ${
            settings.highContrast ? 'text-yellow-400' : 'text-white'
          }`}>
            Convert Text to Braille
          </h1>
          <p className={`text-lg ${settings.highContrast ? 'text-yellow-100' : 'text-white/50'}`}>
            Type or paste any text and get instant Braille output
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
                : 'border-white/10 bg-white/[0.03] backdrop-blur-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`font-bold text-sm uppercase tracking-widest ${
                settings.highContrast ? 'text-yellow-400' : 'text-white/40'
              }`}>Input Text</h2>
              <span className={`text-xs ${settings.highContrast ? 'text-yellow-300' : 'text-white/30'}`}>
                {text.length} chars
              </span>
            </div>

            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type or paste text here..."
              rows={8}
              className={`w-full bg-transparent resize-none outline-none text-base leading-relaxed ${
                settings.highContrast
                  ? 'text-yellow-100 placeholder:text-yellow-400/40'
                  : 'text-white placeholder:text-white/20'
              }`}
              aria-label="Text input for Braille conversion"
            />

            {/* Example chips */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
              <span className={`text-xs ${settings.highContrast ? 'text-yellow-300' : 'text-white/30'}`}>Examples:</span>
              {exampleTexts.map(ex => (
                <button
                  key={ex}
                  onClick={() => setText(ex)}
                  className={`text-xs px-3 py-1 rounded-full transition-all ${
                    settings.highContrast
                      ? 'bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400 hover:text-black border border-yellow-400'
                      : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {ex}
                </button>
              ))}
            </div>

            {/* Options */}
            <div className="mt-4">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className={`flex items-center gap-2 text-sm font-medium transition-all ${
                  settings.highContrast ? 'text-yellow-400' : 'text-white/50 hover:text-white'
                }`}
              >
                <ChevronDown size={14} className={`transition-transform ${showOptions ? 'rotate-180' : ''}`} />
                Advanced Options
              </button>

              {showOptions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 p-4 rounded-2xl border border-white/10 bg-white/5"
                >
                  <label className={`text-xs font-bold uppercase tracking-widest block mb-2 ${
                    settings.highContrast ? 'text-yellow-400' : 'text-white/40'
                  }`}>
                    Braille Grade
                  </label>
                  <div className="flex gap-3">
                    {([1, 2] as const).map(g => (
                      <button
                        key={g}
                        onClick={() => setGrade(g)}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                          grade === g
                            ? settings.highContrast
                              ? 'bg-yellow-400 text-black border-yellow-400'
                              : 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                            : settings.highContrast
                              ? 'border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10'
                              : 'border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        Grade {g}
                        <div className={`text-xs font-normal mt-0.5 ${grade === g ? 'opacity-70' : 'opacity-50'}`}>
                          {g === 1 ? 'Uncontracted' : 'Contracted'}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleConvert}
                disabled={isLoading || !text.trim()}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  settings.highContrast
                    ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                    : 'bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:shadow-lg hover:shadow-violet-500/30 hover:scale-[1.02]'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Converting...
                  </>
                ) : (
                  <><Zap size={16} /> Convert</>
                )}
              </button>
              <button
                onClick={handleReset}
                className={`px-4 py-3 rounded-2xl border transition-all ${
                  settings.highContrast
                    ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400/20'
                    : 'border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                }`}
                aria-label="Reset"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {/* Progress */}
            {isLoading && (
              <div className="mt-4">
                <div className={`h-1.5 rounded-full overflow-hidden ${settings.highContrast ? 'bg-yellow-400/20' : 'bg-white/10'}`}>
                  <motion.div
                    className={`h-full rounded-full ${settings.highContrast ? 'bg-yellow-400' : 'bg-gradient-to-r from-violet-500 to-pink-500'}`}
                    initial={{ width: 0 }}
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
                : 'border-white/10 bg-white/[0.03] backdrop-blur-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`font-bold text-sm uppercase tracking-widest ${
                settings.highContrast ? 'text-yellow-400' : 'text-white/40'
              }`}>Braille Output</h2>

              {result && (
                <div className="flex gap-2">
                  <button
                    onClick={() => copy(result.braille || '')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      settings.highContrast
                        ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <Copy size={12} /> {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      settings.highContrast
                        ? 'border border-yellow-400 text-yellow-400 hover:bg-yellow-400/20'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <Download size={12} /> Save
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                {error}
              </div>
            )}

            {result ? (
              <div className="space-y-4">
                {/* Braille unicode display */}
                <div className={`p-5 rounded-2xl min-h-[120px] ${
                  settings.highContrast ? 'bg-yellow-400/10 border border-yellow-400' : 'bg-white/5 border border-white/10'
                }`}>
                  <p className={`text-3xl leading-loose tracking-widest font-mono break-all ${
                    settings.highContrast ? 'text-yellow-400' : 'text-white'
                  }`}>
                    {result.braille}
                  </p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Characters', value: result.character_count || text.length },
                    { label: 'Words', value: result.word_count || text.split(' ').length },
                    { label: 'Time (ms)', value: result.processing_time ? Math.round(result.processing_time * 1000) : '–' },
                  ].map(s => (
                    <div
                      key={s.label}
                      className={`p-3 rounded-2xl text-center border ${
                        settings.highContrast
                          ? 'border-yellow-400 bg-yellow-400/10'
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <div className={`text-xl font-black ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
                        {s.value}
                      </div>
                      <div className={`text-xs mt-1 ${settings.highContrast ? 'text-yellow-300' : 'text-white/40'}`}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dot notation */}
                {result.dots && (
                  <div className={`p-4 rounded-2xl border ${
                    settings.highContrast ? 'border-yellow-400' : 'border-white/10 bg-white/5'
                  }`}>
                    <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                      settings.highContrast ? 'text-yellow-400' : 'text-white/30'
                    }`}>Dot Notation</div>
                    <p className={`text-sm font-mono break-all ${settings.highContrast ? 'text-yellow-200' : 'text-white/60'}`}>
                      {result.dots}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center min-h-[250px] gap-4 ${
                settings.highContrast ? 'text-yellow-400/40' : 'text-white/20'
              }`}>
                <div className="text-6xl opacity-30 select-none">⠃⠗⠁</div>
                <p className="text-sm">Braille output will appear here</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}