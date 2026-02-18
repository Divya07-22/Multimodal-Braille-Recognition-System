import React from 'react'
import { Loader, Zap } from 'lucide-react'
import { useAccessibility } from '../context/AccessibilityContext'

function Loading() {
  const { settings } = useAccessibility()

  return (
    <div className={`flex items-center justify-center min-h-screen ${
      settings.highContrast ? 'bg-black' : 'bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700'
    }`}>
      <div className="text-center">
        <div className="mb-6 relative">
          <div className={`w-20 h-20 mx-auto relative ${
            settings.highContrast ? 'text-yellow-400' : 'text-white'
          }`}>
            <Loader className="w-full h-full animate-spin" />
            <Zap className="absolute inset-0 m-auto animate-pulse" size={40} />
          </div>
        </div>

        <p className={`text-xl font-semibold ${
          settings.highContrast ? 'text-yellow-300' : 'text-white'
        }`}>
          Loading...
        </p>

        <p className={`text-sm mt-3 ${
          settings.highContrast ? 'text-yellow-200' : 'text-white/70'
        }`}>
          Please wait while we prepare your experience
        </p>

        {/* Loading Bar */}
        <div className={`w-32 h-1 mx-auto mt-4 rounded-full overflow-hidden ${
          settings.highContrast ? 'bg-yellow-400/20' : 'bg-white/20'
        }`}>
          <div className={`h-full bg-gradient-to-r ${
            settings.highContrast
              ? 'from-yellow-400 to-yellow-300'
              : 'from-pink-500 to-purple-600'
          } w-full animate-pulse`} />
        </div>
      </div>
    </div>
  )
}

export default Loading