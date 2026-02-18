import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft, AlertTriangle, ChevronRight } from 'lucide-react'
import { useAccessibility } from '../context/AccessibilityContext'

function NotFound() {
  const { settings } = useAccessibility()

  const suggestions = [
    { title: 'Home', path: '/', icon: '🏠' },
    { title: 'Text to Braille', path: '/text-to-braille', icon: '📝' },
    { title: 'Image to Braille', path: '/image-to-braille', icon: '📷' },
    { title: 'Braille to Text', path: '/braille-to-text', icon: '🔄' },
  ]

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${
      settings.highContrast ? 'bg-black' : 'bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700'
    }`}>
      <div className="w-full max-w-4xl animate-fade-in">
        <div className="text-center mb-12">
          <div className={`mb-6 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
            <AlertTriangle size={80} className="mx-auto mb-4 animate-bounce" />
          </div>

          <h1 className={`text-7xl md:text-8xl font-black mb-4 ${
            settings.highContrast ? 'text-yellow-400' : 'text-white'
          }`}>
            404
          </h1>

          <p className={`text-3xl md:text-4xl font-bold mb-4 ${
            settings.highContrast ? 'text-yellow-300' : 'text-white'
          }`}>
            Page Not Found
          </p>

          <p className={`text-lg mb-8 max-w-2xl mx-auto ${
            settings.highContrast ? 'text-yellow-200' : 'text-white/80'
          }`}>
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or perhaps you mistyped the URL. Don't worry, we'll help you get back on track!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            to="/"
            className={`px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2 ${
              settings.highContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-2xl'
            }`}
          >
            <Home size={20} /> Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className={`px-8 py-4 rounded-lg font-bold text-lg transition-all border-2 ${
              settings.highContrast
                ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black'
                : 'border-white text-white hover:bg-white hover:text-purple-600'
            }`}
          >
            <ArrowLeft className="inline mr-2" size={20} /> Go Back
          </button>
        </div>

        {/* Suggested Links */}
        <div className={`p-8 rounded-2xl mb-8 ${
          settings.highContrast
            ? 'bg-black border-4 border-yellow-400'
            : 'bg-white/10 backdrop-blur border border-white/20'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 ${
            settings.highContrast ? 'text-yellow-400' : 'text-white'
          }`}>
            Here are some helpful links to get you started:
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((suggestion, idx) => (
              <Link
                key={idx}
                to={suggestion.path}
                className={`p-4 rounded-lg transition-all hover:scale-105 flex items-center justify-between group ${
                  settings.highContrast
                    ? 'bg-yellow-400/10 border-2 border-yellow-400 hover:bg-yellow-400/20'
                    : 'bg-white/10 border border-white/20 hover:bg-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{suggestion.icon}</span>
                  <span className={`font-semibold ${
                    settings.highContrast ? 'text-yellow-300' : 'text-white'
                  }`}>
                    {suggestion.title}
                  </span>
                </div>
                <ChevronRight className={`group-hover:translate-x-2 transition-transform ${
                  settings.highContrast ? 'text-yellow-400' : 'text-white/60'
                }`} size={20} />
              </Link>
            ))}
          </div>
        </div>

        {/* Support Box */}
        <div className={`p-6 rounded-lg text-center ${
          settings.highContrast
            ? 'bg-yellow-400/10 border-2 border-yellow-400'
            : 'bg-blue-500/10 border border-blue-400/30'
        }`}>
          <p className={`text-sm mb-4 ${
            settings.highContrast ? 'text-yellow-300' : 'text-blue-200'
          }`}>
            Still having trouble? We're here to help!
          </p>
          <a
            href="mailto:support@braille.com"
            className={`font-bold hover:underline ${
              settings.highContrast ? 'text-yellow-400' : 'text-blue-300'
            }`}
          >
            Contact our support team →
          </a>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 text-center">
          <p className={`text-sm ${settings.highContrast ? 'text-yellow-200' : 'text-white/50'}`}>
            Error Code: 404 Not Found | Status: Lost in Translation
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound