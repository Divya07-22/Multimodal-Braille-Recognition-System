import React, { useState } from 'react'
import { X, RotateCcw, Volume2, Eye, Zap } from 'lucide-react'
import { useAccessibility } from '../context/AccessibilityContext'

interface AccessibilityPanelProps {
  isOpen: boolean
  onClose: () => void
}

function AccessibilityPanel({ isOpen, onClose }: AccessibilityPanelProps) {
  const { settings, toggleHighContrast, setFontSize, toggleScreenReader, toggleKeyboardNavigation, resetSettings } = useAccessibility()
  const [expandedSection, setExpandedSection] = useState<string | null>('visual')

  if (!isOpen) return null

  const sections = [
    {
      id: 'visual',
      title: '👁️ Visual',
      icon: Eye,
      items: [
        {
          label: 'High Contrast Mode',
          value: settings.highContrast,
          onChange: toggleHighContrast,
          description: 'Increases contrast for better visibility'
        }
      ]
    },
    {
      id: 'text',
      title: '📝 Text',
      icon: Zap,
      items: [
        {
          label: 'Font Size',
          type: 'slider',
          min: 80,
          max: 150,
          value: settings.fontSize,
          onChange: (value: number) => setFontSize(value),
          description: 'Adjust text size for easier reading'
        }
      ]
    },
    {
      id: 'audio',
      title: '🔊 Audio',
      icon: Volume2,
      items: [
        {
          label: 'Screen Reader',
          value: settings.screenReaderEnabled,
          onChange: toggleScreenReader,
          description: 'Enables audio feedback for navigation'
        }
      ]
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}>
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md ${
          settings.highContrast
            ? 'bg-black border-l-4 border-yellow-400'
            : 'bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur border-l border-white/20'
        } p-6 overflow-y-auto animate-slide-in-up`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${
            settings.highContrast ? 'text-yellow-400' : 'text-white'
          }`}>
            ♿ Accessibility
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all ${
              settings.highContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            aria-label="Close panel"
          >
            <X size={24} />
          </button>
        </div>

        {/* Info */}
        <p className={`text-sm mb-6 ${
          settings.highContrast ? 'text-yellow-200' : 'text-white/70'
        }`}>
          Customize the interface to suit your needs
        </p>

        {/* Sections */}
        <div className="space-y-4 mb-6">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <div key={section.id}>
                <button
                  onClick={() => setExpandedSection(
                    expandedSection === section.id ? null : section.id
                  )}
                  className={`w-full flex items-center justify-between p-4 rounded-lg transition-all ${
                    settings.highContrast
                      ? 'bg-yellow-400/10 border-2 border-yellow-400 hover:bg-yellow-400/20'
                      : 'bg-white/10 border border-white/20 hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={settings.highContrast ? 'text-yellow-400' : 'text-white'} size={20} />
                    <span className={`font-bold ${
                      settings.highContrast ? 'text-yellow-300' : 'text-white'
                    }`}>
                      {section.title}
                    </span>
                  </div>
                  <span className={settings.highContrast ? 'text-yellow-400' : 'text-white/60'}>
                    {expandedSection === section.id ? '−' : '+'}
                  </span>
                </button>

                {expandedSection === section.id && (
                  <div className="mt-3 ml-4 space-y-3 animate-fade-in">
                    {section.items.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <label className={`text-sm font-semibold cursor-pointer ${
                            settings.highContrast ? 'text-yellow-300' : 'text-white'
                          }`}>
                            {item.label}
                          </label>
                          {item.type === 'toggle' && (
                            <button
                              onClick={() => item.onChange()}
                              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                                item.value
                                  ? settings.highContrast
                                    ? 'bg-yellow-400 text-black'
                                    : 'bg-green-500/80 text-white'
                                  : settings.highContrast
                                    ? 'bg-yellow-400/20 text-yellow-300'
                                    : 'bg-white/10 text-white'
                              }`}
                            >
                              {item.value ? '✓ On' : '○ Off'}
                            </button>
                          )}
                        </div>

                        {item.type === 'slider' && (
                          <div className="space-y-2">
                            <input
                              type="range"
                              min={item.min}
                              max={item.max}
                              value={item.value}
                              onChange={(e) => item.onChange(Number(e.target.value))}
                              className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer"
                              aria-label={item.label}
                            />
                            <div className={`flex justify-between text-xs ${
                              settings.highContrast ? 'text-yellow-200' : 'text-white/60'
                            }`}>
                              <span>{item.min}%</span>
                              <span className="font-bold">{item.value}%</span>
                              <span>{item.max}%</span>
                            </div>
                          </div>
                        )}

                        {!item.type && (
                          <button
                            onClick={() => item.onChange()}
                            className={`w-full px-3 py-2 rounded text-sm font-bold transition-all ${
                              item.value
                                ? settings.highContrast
                                  ? 'bg-yellow-400 text-black'
                                  : 'bg-green-500/80 text-white'
                                : settings.highContrast
                                  ? 'bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30'
                                  : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            {item.value ? '✓ Enabled' : '○ Disabled'}
                          </button>
                        )}

                        {item.description && (
                          <p className={`text-xs mt-1 ${
                            settings.highContrast ? 'text-yellow-200' : 'text-white/60'
                          }`}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Reset Button */}
        <button
          onClick={resetSettings}
          className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
            settings.highContrast
              ? 'bg-yellow-400 text-black hover:bg-yellow-300'
              : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
          }`}
        >
          <RotateCcw size={18} /> Reset to Defaults
        </button>

        {/* Footer */}
        <p className={`text-xs mt-6 text-center ${
          settings.highContrast ? 'text-yellow-200' : 'text-white/60'
        }`}>
          Your accessibility settings are saved locally
        </p>
      </div>
    </div>
  )
}

export default AccessibilityPanel