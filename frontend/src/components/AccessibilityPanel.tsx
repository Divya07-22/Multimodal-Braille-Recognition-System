
import { motion, AnimatePresence } from 'framer-motion'
import { X, RotateCcw, Volume2, Eye, Zap, Keyboard, Sun } from 'lucide-react'
import { useAccessibility } from '../context/useAccessibility'

interface AccessibilityPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function AccessibilityPanel({
  isOpen,
  onClose,
}: AccessibilityPanelProps) {
  const {
    settings,
    toggleHighContrast,
    setFontSize,
    toggleScreenReader,
    toggleKeyboardNavigation,
    toggleReducedMotion,
    resetSettings,
  } = useAccessibility()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 320 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 320 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-gray-900 border-l border-white/10 shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-white font-bold text-lg">Accessibility</h2>
                <p className="text-gray-400 text-sm mt-0.5">
                  Customize your experience
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close accessibility panel"
              >
                <X size={20} />
              </button>
            </div>

            {/* Settings */}
            <div className="p-6 space-y-6">
              {/* High Contrast */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 rounded-lg bg-yellow-500/20">
                    <Sun size={16} className="text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      High Contrast
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Increase visual contrast
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleHighContrast}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                    settings.highContrast ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={settings.highContrast}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      settings.highContrast ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Font Size */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Eye size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Font Size</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {settings.fontSize}% of default
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFontSize(settings.fontSize - 10)}
                    disabled={settings.fontSize <= 80}
                    className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    A&minus;
                  </button>
                  <input
                    type="range"
                    min={80}
                    max={150}
                    step={10}
                    value={settings.fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="flex-1 accent-purple-500"
                    aria-label="Font size"
                  />
                  <button
                    onClick={() => setFontSize(settings.fontSize + 10)}
                    disabled={settings.fontSize >= 150}
                    className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* Screen Reader */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 rounded-lg bg-green-500/20">
                    <Volume2 size={16} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      Screen Reader Hints
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Enhanced ARIA labels
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleScreenReader}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                    settings.screenReaderEnabled ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={settings.screenReaderEnabled}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      settings.screenReaderEnabled
                        ? 'translate-x-5'
                        : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Keyboard Navigation */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 rounded-lg bg-orange-500/20">
                    <Keyboard size={16} className="text-orange-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      Keyboard Navigation
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Show focus indicators
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleKeyboardNavigation}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                    settings.keyboardNavigationEnabled
                      ? 'bg-purple-600'
                      : 'bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={settings.keyboardNavigationEnabled}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      settings.keyboardNavigationEnabled
                        ? 'translate-x-5'
                        : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 rounded-lg bg-red-500/20">
                    <Zap size={16} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      Reduced Motion
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Minimize animations
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleReducedMotion}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                    settings.reducedMotion ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={settings.reducedMotion}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      settings.reducedMotion ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Reset */}
            <div className="p-6 border-t border-white/10">
              <button
                onClick={resetSettings}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-white/20 text-gray-300 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors"
              >
                <RotateCcw size={15} />
                Reset to Defaults
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}