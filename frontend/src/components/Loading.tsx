
import { useAccessibility } from '../context/useAccessibility'

function Loading() {
  const { settings } = useAccessibility()

  return (
    <div className={`flex items-center justify-center min-h-screen ${
      settings.highContrast ? 'bg-black' : ''
    }`}
      style={{ background: settings.highContrast ? '#000' : 'var(--gradient-hero)' }}
    >
      <div className="text-center">
        {/* Animated Braille dots */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 animate-spin" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-2 rounded-full border-2 border-pink-500/20 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />

          {/* Center logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-violet-500/50">
              <span className="text-white text-2xl font-black">⠃</span>
            </div>
          </div>

          {/* Orbiting dots */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute w-2.5 h-2.5 rounded-full"
              style={{
                background: i % 2 === 0 ? '#8b5cf6' : '#ec4899',
                top: '50%',
                left: '50%',
                transformOrigin: `${40}px 0`,
                animation: `spin ${1.5 + i * 0.3}s linear infinite`,
                animationDelay: `${i * 0.2}s`,
                transform: `rotate(${i * 90}deg) translateX(40px)`,
              }}
            />
          ))}
        </div>

        <div className="space-y-3">
          <h2 className={`text-2xl font-black ${settings.highContrast ? 'text-yellow-400' : 'gradient-text'}`}>
            BrailleAI
          </h2>
          <p className={`text-sm ${settings.highContrast ? 'text-yellow-200' : 'text-white/50'}`}>
            Loading your experience...
          </p>

          {/* Progress bar */}
          <div className={`w-48 h-1 mx-auto rounded-full overflow-hidden ${
            settings.highContrast ? 'bg-yellow-400/20' : 'bg-white/10'
          }`}>
            <div className={`h-full rounded-full animate-pulse ${
              settings.highContrast
                ? 'bg-yellow-400'
                : 'bg-gradient-to-r from-violet-500 to-pink-500'
            }`} style={{ width: '60%' }} />
          </div>
        </div>

        {/* Braille pattern decoration */}
        {!settings.highContrast && (
          <div className="flex justify-center gap-3 mt-8 opacity-20">
            {['⠓', '⠑', '⠇', '⠇', '⠕'].map((char, i) => (
              <span
                key={i}
                className="text-2xl text-violet-400"
                style={{
                  animation: `pulse 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`
                }}
              >
                {char}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Loading