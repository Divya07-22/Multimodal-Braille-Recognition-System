import  { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Image, Upload, X, Copy, Download, Zap, FileImage } from 'lucide-react'
import { useImageToBraille } from '../hooks/useConversion'
import { useClipboard } from '../hooks/useClipboard'
import { useAccessibility } from '../context/useAccessibility'

export default function ImageToBraille() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [grade, setGrade] = useState<1 | 2>(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { result, isLoading, error, progress, convert, reset } = useImageToBraille()
  const { copy, copied } = useClipboard()
  const { settings } = useAccessibility()

  const handleFile = useCallback(
    (f: File) => {
      setFile(f)
      reset()
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(f)
    },
    [reset]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const f = e.dataTransfer.files[0]
      if (f) handleFile(f)
    },
    [handleFile]
  )

  const handleRemove = () => {
    setFile(null)
    setPreview(null)
    reset()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleConvert = () => {
    if (file) void convert(file, { grade })
  }

  const handleDownload = () => {
    if (!result?.braille) return
    const blob = new Blob([result.braille], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'image-braille-output.txt'
    a.click()
    URL.revokeObjectURL(url)
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
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 ${
              settings.highContrast
                ? 'bg-yellow-400 text-black'
                : 'bg-pink-500/10 border border-pink-500/20 text-pink-400'
            }`}
          >
            <Image size={14} /> Image to Braille
          </div>
          <h1
            className={`text-4xl md:text-5xl font-black mb-3 ${
              settings.highContrast ? 'text-yellow-400' : 'text-white'
            }`}
          >
            Convert Image to Braille
          </h1>
          <p
            className={`text-lg ${
              settings.highContrast ? 'text-yellow-100' : 'text-white/50'
            }`}
          >
            Upload an image with text — our AI will extract and convert it
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* Upload Panel */}
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
            <h2
              className={`font-bold text-sm uppercase tracking-widest mb-4 ${
                settings.highContrast ? 'text-yellow-400' : 'text-white/40'
              }`}
            >
              Upload Image
            </h2>

            {/* Drop zone */}
            {!preview ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  isDragging
                    ? settings.highContrast
                      ? 'border-yellow-400 bg-yellow-400/20'
                      : 'border-pink-500 bg-pink-500/10'
                    : settings.highContrast
                      ? 'border-yellow-400/40 hover:border-yellow-400 hover:bg-yellow-400/10'
                      : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFile(e.target.files[0])
                  }}
                />
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                    settings.highContrast
                      ? 'bg-yellow-400/20 border-2 border-yellow-400'
                      : 'bg-pink-500/15 border border-pink-500/20'
                  }`}
                >
                  <Upload
                    size={28}
                    className={
                      settings.highContrast ? 'text-yellow-400' : 'text-pink-400'
                    }
                  />
                </div>
                <p
                  className={`font-bold text-base mb-1 ${
                    settings.highContrast ? 'text-yellow-400' : 'text-white'
                  }`}
                >
                  {isDragging ? 'Drop it here!' : 'Drag & drop or click to upload'}
                </p>
                <p
                  className={`text-sm ${
                    settings.highContrast ? 'text-yellow-300' : 'text-white/40'
                  }`}
                >
                  JPG, PNG, WebP, GIF · Max 10MB
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-white/10">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full max-h-64 object-contain bg-black/30"
                  />
                  <button
                    onClick={handleRemove}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/80 flex items-center justify-center text-white hover:bg-red-500 transition-all"
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    settings.highContrast
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <FileImage
                    size={18}
                    className={
                      settings.highContrast ? 'text-yellow-400' : 'text-pink-400'
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm font-medium truncate ${
                        settings.highContrast ? 'text-yellow-400' : 'text-white'
                      }`}
                    >
                      {file?.name}
                    </div>
                    <div
                      className={`text-xs ${
                        settings.highContrast ? 'text-yellow-300' : 'text-white/40'
                      }`}
                    >
                      {file ? (file.size / 1024).toFixed(1) : 0} KB
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Grade option */}
            <div className="mt-5">
              <label
                className={`text-xs font-bold uppercase tracking-widest block mb-2 ${
                  settings.highContrast ? 'text-yellow-400' : 'text-white/40'
                }`}
              >
                Braille Grade
              </label>
              <div className="flex gap-3">
                {([1, 2] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGrade(g)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                      grade === g
                        ? settings.highContrast
                          ? 'bg-yellow-400 text-black border-yellow-400'
                          : 'bg-pink-500/20 text-pink-300 border-pink-500/40'
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

            {/* Convert Button */}
            <button
              onClick={handleConvert}
              disabled={isLoading || !file}
              className={`w-full mt-5 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                settings.highContrast
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg hover:shadow-pink-500/30 hover:scale-[1.02]'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap size={16} /> Convert Image
                </>
              )}
            </button>

            {/* Progress */}
            {isLoading && (
              <div className="mt-3">
                <div
                  className={`flex justify-between text-xs mb-1 ${
                    settings.highContrast ? 'text-yellow-300' : 'text-white/40'
                  }`}
                >
                  <span>Processing...</span>
                  <span>{progress}%</span>
                </div>
                <div
                  className={`h-1.5 rounded-full overflow-hidden ${
                    settings.highContrast ? 'bg-yellow-400/20' : 'bg-white/10'
                  }`}
                >
                  <motion.div
                    className={`h-full rounded-full ${
                      settings.highContrast
                        ? 'bg-yellow-400'
                        : 'bg-gradient-to-r from-pink-500 to-rose-500'
                    }`}
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
              <h2
                className={`font-bold text-sm uppercase tracking-widest ${
                  settings.highContrast ? 'text-yellow-400' : 'text-white/40'
                }`}
              >
                Output
              </h2>
              {result && (
                <div className="flex gap-2">
                  <button
                    onClick={() => void copy(result.braille ?? '')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      settings.highContrast
                        ? 'bg-yellow-400 text-black'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <Copy size={12} /> {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      settings.highContrast
                        ? 'border border-yellow-400 text-yellow-400'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
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
                {result.text && (
                  <div
                    className={`p-4 rounded-2xl border ${
                      settings.highContrast
                        ? 'border-yellow-400 bg-yellow-400/10'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div
                      className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                        settings.highContrast ? 'text-yellow-400' : 'text-white/30'
                      }`}
                    >
                      Extracted Text
                    </div>
                    <p
                      className={`text-sm leading-relaxed ${
                        settings.highContrast ? 'text-yellow-100' : 'text-white/80'
                      }`}
                    >
                      {result.text}
                    </p>
                  </div>
                )}

                <div
                  className={`p-5 rounded-2xl border ${
                    settings.highContrast
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div
                    className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                      settings.highContrast ? 'text-yellow-400' : 'text-white/30'
                    }`}
                  >
                    Braille Output
                  </div>
                  <p
                    className={`text-3xl leading-loose tracking-widest font-mono break-all ${
                      settings.highContrast ? 'text-yellow-400' : 'text-white'
                    }`}
                  >
                    {result.braille}
                  </p>
                </div>

                {result.confidence && (
                  <div
                    className={`p-4 rounded-2xl border ${
                      settings.highContrast
                        ? 'border-yellow-400'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span
                        className={`text-xs font-bold ${
                          settings.highContrast ? 'text-yellow-400' : 'text-white/40'
                        }`}
                      >
                        OCR Confidence
                      </span>
                      <span
                        className={`text-sm font-black ${
                          settings.highContrast
                            ? 'text-yellow-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {Math.round(result.confidence * 100)}%
                      </span>
                    </div>
                    <div
                      className={`h-2 rounded-full overflow-hidden ${
                        settings.highContrast ? 'bg-yellow-400/20' : 'bg-white/10'
                      }`}
                    >
                      <div
                        className={`h-full rounded-full ${
                          settings.highContrast ? 'bg-yellow-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${result.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`flex flex-col items-center justify-center min-h-[300px] gap-4 ${
                  settings.highContrast ? 'text-yellow-400/40' : 'text-white/20'
                }`}
              >
                <Image size={48} className="opacity-30" />
                <p className="text-sm">Upload an image to see results</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}