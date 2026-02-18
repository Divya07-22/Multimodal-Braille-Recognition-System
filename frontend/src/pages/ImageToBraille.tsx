import React, { useState, useRef } from 'react'
import { Upload, Camera, Copy, Download, Loader, Trash2, Check, X as XIcon } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAccessibility } from '../context/AccessibilityContext'

function ImageToBraille() {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [brailleOutput, setBrailleOutput] = useState('')
  const [textOutput, setTextOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [processType, setProcessType] = useState<'braille' | 'text'>('braille')
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showCamera, setShowCamera] = useState(false)
  const { settings } = useAccessibility()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large! Maximum 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setImagePreview(result)
      setBrailleOutput('')
      setTextOutput('')
      toast.success('✓ Image loaded!')
    }
    reader.readAsDataURL(file)
  }

  const handleCameraCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const context = canvasRef.current.getContext('2d')
    if (!context) return

    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
    const imageData = canvasRef.current.toDataURL('image/png')
    setImagePreview(imageData)
    setBrailleOutput('')
    setTextOutput('')

    // Stop camera
    const stream = videoRef.current.srcObject as MediaStream
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    setShowCamera(false)

    toast.success('✓ Image captured!')
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setShowCamera(true)
      }
    } catch (error) {
      toast.error('❌ Camera access denied or not available')
      console.error(error)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      setShowCamera(false)
    }
  }

  const handleConvert = async () => {
    if (!imagePreview) {
      toast.error('Please upload or capture an image')
      return
    }

    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await axios.post(`${API_URL}/api/image-to-braille`, {
        image: imagePreview,
        process_type: processType,
      })

      if (processType === 'braille') {
        setBrailleOutput(response.data.braille)
        toast.success('✓ Conversion successful!')
      } else {
        setTextOutput(response.data.text)
        toast.success('✓ Text extracted successfully!')
      }

      if (settings.screenReaderEnabled) {
        const utterance = new SpeechSynthesisUtterance('Image processed successfully')
        window.speechSynthesis.speak(utterance)
      }
    } catch (error) {
      toast.error('❌ Conversion failed. Check backend connection.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('✓ Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = (text: string, filename: string) => {
    const element = document.createElement('a')
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' })
    element.href = URL.createObjectURL(file)
    element.download = filename
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success('✓ File downloaded!')
  }

  const handleClearImage = () => {
    setImagePreview(null)
    setBrailleOutput('')
    setTextOutput('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 animate-fade-in">
        <h1 className={`text-4xl md:text-5xl font-black mb-4 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
          Image to Braille
        </h1>
        <p className={`text-lg ${settings.highContrast ? 'text-yellow-200' : 'text-white/80'}`}>
          Upload or capture an image to extract text and convert it to Braille using advanced OCR.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Panel */}
        <div className={`p-8 rounded-2xl h-fit ${settings.highContrast ? 'bg-black border-4 border-yellow-400' : 'bg-white/10 backdrop-blur border border-white/20'} animate-fade-in`}>
          <h2 className={`text-2xl font-bold mb-6 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
            Upload Image
          </h2>

          {!showCamera ? (
            <>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                  settings.highContrast
                    ? 'border-yellow-400 hover:bg-yellow-400/10'
                    : 'border-white/30 hover:border-white/50 hover:bg-white/10'
                }`}
              >
                <Upload size={32} className={`${settings.highContrast ? 'text-yellow-400' : 'text-white/70'} mx-auto mb-2`} />
                <p className={`font-semibold ${settings.highContrast ? 'text-yellow-300' : 'text-white'}`}>
                  Click to upload
                </p>
                <p className={`text-sm ${settings.highContrast ? 'text-yellow-200' : 'text-white/50'}`}>
                  PNG, JPG, PDF (max 10MB)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Upload image file"
              />

              <button
                onClick={startCamera}
                className={`w-full mt-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 ${
                  settings.highContrast
                    ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                aria-label="Start camera"
              >
                <Camera size={20} /> Take Photo
              </button>
            </>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className={`w-full rounded-lg mb-4 ${settings.highContrast ? 'border-4 border-yellow-400' : 'border-2 border-white/20'}`}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCameraCapture}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                    settings.highContrast
                      ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                      : 'bg-green-500/80 text-white hover:bg-green-600'
                  }`}
                  aria-label="Capture photo"
                >
                  <Check size={20} /> Capture
                </button>
                <button
                  onClick={stopCamera}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                    settings.highContrast
                      ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                      : 'bg-red-500/80 text-white hover:bg-red-600'
                  }`}
                  aria-label="Cancel camera"
                >
                  <XIcon size={20} /> Cancel
                </button>
              </div>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" width={1280} height={720} />
        </div>

        {/* Preview Panel */}
        <div className={`p-8 rounded-2xl h-fit ${settings.highContrast ? 'bg-black border-4 border-yellow-400' : 'bg-white/10 backdrop-blur border border-white/20'} animate-fade-in`} style={{ animationDelay: '0.1s' }}>
          <h2 className={`text-2xl font-bold mb-4 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
            Preview
          </h2>

          {imagePreview ? (
            <>
              <img
                src={imagePreview}
                alt="Preview"
                className={`w-full rounded-lg mb-6 max-h-64 object-cover ${settings.highContrast ? 'border-4 border-yellow-400' : 'border-2 border-white/20'}`}
              />
              <div className="mb-6">
                <label className={`text-sm font-semibold block mb-3 ${settings.highContrast ? 'text-yellow-300' : 'text-white/70'}`}>
                  Process as:
                </label>
                <select
                  value={processType}
                  onChange={(e) => setProcessType(e.target.value as 'braille' | 'text')}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                    settings.highContrast
                      ? 'bg-yellow-400 text-black border-2 border-yellow-300 focus:ring-2 focus:ring-yellow-500'
                      : 'bg-white/20 text-white border border-white/30 focus:ring-2 focus:ring-pink-400'
                  }`}
                  aria-label="Select processing type"
                >
                  <option value="braille">Convert to Braille</option>
                  <option value="text">Extract Text Only</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleConvert}
                  disabled={loading}
                  className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                    settings.highContrast
                      ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                      : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg'
                  }`}
                  aria-label="Process image"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={20} /> Processing...
                    </>
                  ) : (
                    <>
                      <Check size={20} /> Process
                    </>
                  )}
                </button>
                <button
                  onClick={handleClearImage}
                  className={`py-3 px-4 rounded-lg font-bold transition-all ${
                    settings.highContrast
                      ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                      : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                  }`}
                  aria-label="Clear image"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className={`text-center py-16 ${settings.highContrast ? 'text-yellow-400' : 'text-white/40'}`}>
              <Upload size={48} className="mx-auto mb-4 opacity-50" />
              <p>No image selected</p>
            </div>
          )}
        </div>

        {/* Output Panel */}
        <div className={`p-8 rounded-2xl h-fit ${settings.highContrast ? 'bg-black border-4 border-yellow-400' : 'bg-white/10 backdrop-blur border border-white/20'} animate-fade-in`} style={{ animationDelay: '0.2s' }}>
          <h2 className={`text-2xl font-bold mb-4 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
            {processType === 'braille' ? 'Braille Output' : 'Text Output'}
          </h2>

          <div className={`w-full h-80 p-4 rounded-lg overflow-y-auto font-mono text-sm leading-relaxed ${
            settings.highContrast
              ? 'bg-black text-yellow-300 border-2 border-yellow-400'
              : 'bg-white/20 text-white border border-white/30'
          }`}
          role="region"
          aria-label="Processing output"
          aria-live="polite">
            {processType === 'braille' ? (
              brailleOutput || <span className={settings.highContrast ? 'text-yellow-600' : 'text-white/40'}>Output will appear here...</span>
            ) : (
              textOutput || <span className={settings.highContrast ? 'text-yellow-600' : 'text-white/40'}>Output will appear here...</span>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handleCopy(processType === 'braille' ? brailleOutput : textOutput)}
              disabled={!brailleOutput && !textOutput}
              className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm ${
                settings.highContrast
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              aria-label="Copy output"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied' : 'Copy'}
            </button>

            <button
              onClick={() => handleDownload(
                processType === 'braille' ? brailleOutput : textOutput,
                `output-${new Date().getTime()}.txt`
              )}
              disabled={!brailleOutput && !textOutput}
              className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm ${
                settings.highContrast
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              aria-label="Download output"
            >
              <Download size={18} /> Download
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageToBraille