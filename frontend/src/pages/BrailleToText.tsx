import React, { useState } from 'react'
import { Copy, Download, Loader, Check, Trash2 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAccessibility } from '../context/AccessibilityContext'

function BrailleToText() {
  const [brailleInput, setBrailleInput] = useState('')
  const [textOutput, setTextOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<Array<{ braille: string; text: string; date: string }>>([])
  const { settings } = useAccessibility()

  const handleConvert = async () => {
    if (!brailleInput.trim()) {
      toast.error('Please enter Braille text')
      return
    }

    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await axios.post(`${API_URL}/api/braille-to-text`, {
        braille: brailleInput,
      })
      setTextOutput(response.data.text)

      // Add to history
      setHistory([
        {
          braille: brailleInput,
          text: response.data.text,
          date: new Date().toLocaleTimeString(),
        },
        ...history.slice(0, 9),
      ])

      toast.success('✓ Conversion successful!')

      if (settings.screenReaderEnabled) {
        const utterance = new SpeechSynthesisUtterance('Braille converted to text')
        window.speechSynthesis.speak(utterance)
      }
    } catch (error) {
      toast.error('❌ Conversion failed. Check backend connection.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(textOutput)
    setCopied(true)
    toast.success('✓ Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([textOutput], { type: 'text/plain;charset=utf-8' })
    element.href = URL.createObjectURL(file)
    element.download = `text-${new Date().getTime()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success('✓ File downloaded!')
  }

  const handleClear = () => {
    setBrailleInput('')
    setTextOutput('')
  }

  const handleHistoryClick = (item: any) => {
    setBrailleInput(item.braille)
    setTextOutput(item.text)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 animate-fade-in">
        <h1 className={`text-4xl md:text-5xl font-black mb-4 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
          Braille to Text
        </h1>
        <p className={`text-lg ${settings.highContrast ? 'text-yellow-200' : 'text-white/80'}`}>
          Convert Braille patterns back into readable English text for translation and reference.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <div className={`lg:col-span-2 p-8 rounded-2xl ${settings.highContrast ? 'bg-black border-4 border-yellow-400' : 'bg-white/10 backdrop-blur border border-white/20'} animate-fade-in`}>
          <h2 className={`text-2xl font-bold mb-4 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
            Braille Input
          </h2>

          <textarea
            value={brailleInput}
            onChange={(e) => setBrailleInput(e.target.value)}
            placeholder="Paste Braille patterns here... (e.g., ⠓⠑⠇⠇⠕)"
            className={`w-full h-80 p-4 rounded-lg focus:outline-none focus:ring-2 transition-all resize-none font-mono text-lg leading-loose ${
              settings.highContrast
                ? 'bg-black text-yellow-300 border-2 border-yellow-400 focus:ring-yellow-400 placeholder-yellow-600'
                : 'bg-white/20 text-white border border-white/30 focus:ring-pink-400 placeholder-white/50'
            }`}
            aria-label="Braille input area"
          />

          <div className="mt-6 space-y-3">
            <button
              onClick={handleConvert}
              disabled={loading || !brailleInput.trim()}
              className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-lg ${
                loading || !brailleInput.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg'
              } ${
                settings.highContrast
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
              }`}
              aria-label={loading ? 'Converting...' : 'Convert to Text'}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} /> Converting...
                </>
              ) : (
                <>
                  <Check size={20} /> Convert to Text
                </>
              )}
            </button>

            <button
              onClick={handleClear}
              disabled={!brailleInput && !textOutput}
              className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                !brailleInput && !textOutput ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg'
              } ${
                settings.highContrast
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                  : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
              }`}
              aria-label="Clear all"
            >
              <Trash2 size={20} /> Clear
            </button>
          </div>

          {brailleInput && (
            <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${settings.highContrast ? 'bg-yellow-400/20 text-yellow-300 border-2 border-yellow-400' : 'bg-blue-500/20 text-blue-200 border border-blue-400/30'}`}>
              📝 {brailleInput.length} characters entered
            </div>
          )}
        </div>

        {/* Output Panel */}
        <div className={`p-8 rounded-2xl h-fit ${settings.highContrast ? 'bg-black border-4 border-yellow-400' : 'bg-white/10 backdrop-blur border border-white/20'} animate-fade-in`} style={{ animationDelay: '0.1s' }}>
          <h2 className={`text-2xl font-bold mb-4 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
            Text Output
          </h2>

          <div className={`w-full h-80 p-4 rounded-lg overflow-y-auto ${
            settings.highContrast
              ? 'bg-black text-yellow-300 border-2 border-yellow-400'
              : 'bg-white/20 text-white border border-white/30'
          }`}
          role="region"
          aria-label="Text output"
          aria-live="polite">
            {textOutput || <span className={settings.highContrast ? 'text-yellow-600' : 'text-white/40'}>Text output will appear here...</span>}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleCopy}
              disabled={!textOutput}
              className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                settings.highContrast
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              aria-label="Copy to clipboard"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>

            <button
              onClick={handleDownload}
              disabled={!textOutput}
              className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                settings.highContrast
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              aria-label="Download as file"
            >
              <Download size={20} /> Download
            </button>
          </div>

          {textOutput && (
            <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${settings.highContrast ? 'bg-yellow-400/20 text-yellow-300 border-2 border-yellow-400' : 'bg-green-500/20 text-green-200 border border-green-400/30'}`}>
              ✓ {textOutput.length} characters converted
            </div>
          )}
        </div>
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className={`mt-12 p-8 rounded-2xl ${settings.highContrast ? 'bg-black border-4 border-yellow-400' : 'bg-white/10 backdrop-blur border border-white/20'}`}>
          <h3 className={`text-2xl font-bold mb-6 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
            Recent Conversions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleHistoryClick(item)}
                className={`p-4 rounded-lg text-left transition-all hover:scale-105 ${
                  settings.highContrast
                    ? 'bg-yellow-400/10 border-2 border-yellow-400 hover:bg-yellow-400/20'
                    : 'bg-white/10 border border-white/20 hover:bg-white/20'
                }`}
              >
                <p className={`text-sm font-semibold mb-2 ${settings.highContrast ? 'text-yellow-300' : 'text-white/70'}`}>
                  {item.date}
                </p>
                <p className={`text-sm mb-2 line-clamp-1 font-mono ${settings.highContrast ? 'text-yellow-200' : 'text-white'}`}>
                  {item.braille}
                </p>
                <p className={`text-xs ${settings.highContrast ? 'text-yellow-400' : 'text-pink-400'}`}>
                  → {item.text.substring(0, 30)}...
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default BrailleToText