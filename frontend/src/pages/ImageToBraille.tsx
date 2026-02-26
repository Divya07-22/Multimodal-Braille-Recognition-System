import React, { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Image, Upload, Scan, Camera, X, CheckCircle, AlertCircle, Download, Zap } from 'lucide-react'
import { ocrAPI, exportAPI } from '../services/api'
import { useAuthStore } from '../hooks/useAuth'
import { useAccessibility } from '../context/AccessibilityContext'
import toast from 'react-hot-toast'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff', 'application/pdf']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export default function ImageToBraille() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ extracted_text: string; output_braille: string; job_id: number; ocr_confidence: number; total_processing_ms: number } | null>(null)
  const [grade, setGrade] = useState('grade_1')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const { isAuthenticated } = useAuthStore()
  const { settings } = useAccessibility()

  const handleFile = useCallback((f: File) => {
    if (!ACCEPTED_TYPES.includes(f.type)) { toast.error(`Unsupported file type: ${f.type}`); return }
    if (f.size > MAX_SIZE) { toast.error('File too large. Maximum 10MB allowed.'); return }
    setFile(f)
    setResult(null)
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f)
      setPreview(url)
    } else { setPreview(null) }
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }, [handleFile])

  const handleProcess = async () => {
    if (!file) { toast.error('Please upload an image first'); return }
    if (!isAuthenticated) { toast.error('Please sign in to process images'); return }
    setIsProcessing(true)
    try {
      const { data } = await ocrAPI.uploadAndConvert(file, grade)
      setResult(data)
      toast.success(`Processed in ${data.total_processing_ms?.toFixed(0)}ms!`)
    } catch { /* handled */ }
    finally { setIsProcessing(false) }
  }

  const handleExport = async (format: string) => {
    if (!result?.job_id) return
    try {
      const { data } = await exportAPI.exportJob(result.job_id, [format])
      const exportInfo = data.exports[0]
      if (exportInfo?.filename) {
        const blobRes = await exportAPI.downloadFile(exportInfo.filename)
        const url = URL.createObjectURL(blobRes.data)
        const a = document.createElement('a')
        a.href = url; a.download = exportInfo.filename; a.click()
        URL.revokeObjectURL(url)
        toast.success(`Downloaded ${format.toUpperCase()}!`)
      }
    } catch { /* handled */ }
  }

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex items-center gap-2 badge badge-pink mb-4">
          <Scan size={14} /> AI Vision Processing
        </div>
        <h1 className={`page-title ${settings.highContrast ? 'text-yellow-400' : 'gradient-text'}`}>
          Image to Braille
        </h1>
        <p className={`text-lg max-w-2xl mx-auto ${settings.highContrast ? 'text-yellow-200' : 'text-white/60'}`}>
          Upload any image or PDF. Our AI extracts text via OCR and converts it to Braille instantly.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left - Upload */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="space-y-4">
          {/* Grade selector */}
          <div className="glass p-4">
            <p className="text-sm font-medium text-white/70 mb-3">Braille Grade</p>
            <div className="flex gap-2">
              {['grade_1', 'grade_2'].map(g => (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${grade === g
                      ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                      : 'border-white/10 bg-white/5 text-white/50 hover:text-white'
                    }`}
                >{g === 'grade_1' ? 'Grade 1 (Uncontracted)' : 'Grade 2 (Contracted)'}</button>
              ))}
            </div>
          </div>

          {/* Drop zone */}
          <div
            className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
            onDrop={onDrop}
            onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
            aria-label="Upload file drop zone"
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={ACCEPTED_TYPES.join(',')}
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              aria-hidden="true"
            />
            <input
              ref={cameraInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              capture="environment"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              aria-hidden="true"
            />

            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center mx-auto border border-violet-500/30">
                <Upload size={28} className="text-violet-400" />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Drop your file here</p>
                <p className="text-white/40 text-sm">PNG, JPG, WEBP, PDF · Max 10MB</p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}
                  className="btn-secondary !py-2 !px-4 !text-sm"
                >
                  <Image size={16} /> Browse Files
                </button>
                <button
                  onClick={e => { e.stopPropagation(); cameraInputRef.current?.click() }}
                  className="btn-secondary !py-2 !px-4 !text-sm"
                >
                  <Camera size={16} /> Use Camera
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          {file && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <span className="text-sm font-medium text-white truncate max-w-[200px]">{file.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40">{(file.size / 1024).toFixed(1)} KB</span>
                  <button onClick={() => { setFile(null); setPreview(null); setResult(null) }} className="btn-icon !p-1">
                    <X size={14} />
                  </button>
                </div>
              </div>
              {preview && (
                <img src={preview} alt="Preview" className="w-full max-h-48 object-contain rounded-lg bg-black/30" />
              )}
            </motion.div>
          )}

          {/* Process button */}
          <motion.button
            onClick={handleProcess}
            disabled={!file || isProcessing}
            whileHover={{ scale: file && !isProcessing ? 1.02 : 1 }}
            whileTap={{ scale: file && !isProcessing ? 0.98 : 1 }}
            className={`btn-primary w-full justify-center ${(!file || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isProcessing ? (
              <><div className="spinner !w-4 !h-4 !border-2" /> Processing with AI…</>
            ) : (
              <><Zap size={18} /> Extract & Convert to Braille</>
            )}
          </motion.button>
        </motion.div>

        {/* Right - Results */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          {result ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'OCR Confidence', value: `${(result.ocr_confidence * 100).toFixed(1)}%`, color: 'text-emerald-400' },
                  { label: 'Processing Time', value: `${result.total_processing_ms?.toFixed(0)}ms`, color: 'text-cyan-400' },
                ].map(s => (
                  <div key={s.label} className="glass p-4 text-center">
                    <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-white/40 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Extracted text */}
              <div className="glass p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">Extracted Text (OCR)</h3>
                </div>
                <p className="text-white/70 text-sm leading-relaxed bg-white/5 p-3 rounded-lg">
                  {result.extracted_text}
                </p>
              </div>

              {/* Braille output */}
              <div className="glass p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-white text-sm">Braille Output</h3>
                  <button
                    onClick={() => { navigator.clipboard.writeText(result.output_braille); toast.success('Copied!') }}
                    className="btn-icon !p-1.5 text-xs"
                  >Copy</button>
                </div>
                <div className="braille-output text-xl">{result.output_braille}</div>
              </div>

              {/* Exports */}
              <div className="glass p-4">
                <p className="text-sm font-medium text-white/70 mb-3">Export</p>
                <div className="flex gap-2 flex-wrap">
                  {['brf', 'pdf', 'txt'].map(fmt => (
                    <button key={fmt} onClick={() => handleExport(fmt)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white/70 text-xs hover:border-violet-500/50 hover:text-white transition-all">
                      <Download size={12} /> {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="glass p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Scan size={36} className="text-white/20" />
              </div>
              <h3 className="text-white font-bold mb-2">No Results Yet</h3>
              <p className="text-white/40 text-sm">Upload an image and click process to see OCR results and Braille conversion</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}