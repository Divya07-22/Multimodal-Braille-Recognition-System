import  { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen, Image, ArrowDownUp, Zap, Shield, Globe,
  ChevronRight, Star, Users, BarChart3, Sparkles, ArrowRight
} from 'lucide-react'
import { useAccessibility } from '../context/useAccessibility'

const features = [
  {
    icon: BookOpen,
    title: 'Text to Braille',
    desc: 'Convert any text into Grade 1 or Grade 2 Braille instantly with our AI engine.',
    href: '/text-to-braille',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/25',
    badge: 'Most Popular',
  },
  {
    icon: Image,
    title: 'Image to Braille',
    desc: 'Upload images containing text and get accurate Braille conversion using OCR.',
    href: '/image-to-braille',
    gradient: 'from-pink-500 to-rose-600',
    glow: 'shadow-pink-500/25',
    badge: 'AI Powered',
  },
  {
    icon: ArrowDownUp,
    title: 'Braille to Text',
    desc: 'Decode Braille unicode back into readable text in seconds.',
    href: '/braille-to-text',
    gradient: 'from-cyan-500 to-blue-600',
    glow: 'shadow-cyan-500/25',
    badge: 'Instant',
  },
]

const stats = [
  { value: '99.9%', label: 'Accuracy Rate', icon: Star },
  { value: '50K+', label: 'Conversions Done', icon: BarChart3 },
  { value: '120+', label: 'Countries Served', icon: Globe },
  { value: '10K+', label: 'Active Users', icon: Users },
]

const whyUs = [
  { icon: Zap, title: 'Lightning Fast', desc: 'Results in under 2 seconds with our optimized AI pipeline.' },
  { icon: Shield, title: 'Privacy First', desc: 'Your data is never stored or shared. Fully secure.' },
  { icon: Globe, title: 'Multi-Language', desc: 'Supports English, Spanish, French and more.' },
  { icon: Sparkles, title: 'Grade 1 & 2', desc: 'Full support for contracted and uncontracted Braille.' },
]

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: 'easeOut' as const },
}

export default function Home() {
  const { settings } = useAccessibility()
  const featuresRef = useRef<HTMLDivElement>(null)

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-4 py-20">
        {/* Background blobs */}
        {!settings.highContrast && (
          <>
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />
          </>
        )}

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-semibold mb-8"
          >
            <Sparkles size={14} className="text-violet-400" />
            AI-Powered Braille Conversion Platform
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`text-5xl sm:text-6xl md:text-7xl font-black leading-tight mb-6 ${
              settings.highContrast ? 'text-yellow-400' : ''
            }`}
          >
            {settings.highContrast ? (
              'Bridging the Gap with Braille'
            ) : (
              <>
                Bridging the Gap<br />
                <span className="gradient-text">with Braille</span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${
              settings.highContrast ? 'text-yellow-100' : 'text-white/60'
            }`}
          >
            Convert text, images, and Braille instantly using advanced AI.
            Making accessibility seamless for everyone, everywhere.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link
              to="/text-to-braille"
              className={`group flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 ${
                settings.highContrast
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                  : 'bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:shadow-2xl hover:shadow-violet-500/40 hover:scale-105'
              }`}
            >
              Start Converting Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base border transition-all ${
                settings.highContrast
                  ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400/20'
                  : 'border-white/15 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/30'
              }`}
            >
              Explore Features
              <ChevronRight size={18} />
            </button>
          </motion.div>

          {/* Mini Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-6 mt-14"
          >
            {stats.map(({ value, label, icon: Icon }) => (
              <div
                key={label}
                className={`flex items-center gap-2 text-sm ${
                  settings.highContrast ? 'text-yellow-200' : 'text-white/50'
                }`}
              >
                <Icon size={14} className={settings.highContrast ? 'text-yellow-400' : 'text-violet-400'} />
                <span className={`font-black ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>{value}</span>
                {label}
              </div>
            ))}
          </motion.div>

          {/* Braille decoration */}
          {!settings.highContrast && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="flex justify-center gap-4 mt-10 opacity-15 select-none"
            >
              {['⠃', '⠗', '⠁', '⠊', '⠇', '⠇', '⠑'].map((c, i) => (
                <span
                  key={i}
                  className="text-4xl text-violet-300"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {c}
                </span>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Features ── */}
      <section ref={featuresRef} className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 ${
              settings.highContrast
                ? 'bg-yellow-400 text-black'
                : 'bg-violet-500/10 border border-violet-500/20 text-violet-400'
            }`}>
              <Zap size={13} /> Core Features
            </div>
            <h2 className={`text-4xl md:text-5xl font-black mb-4 ${
              settings.highContrast ? 'text-yellow-400' : 'text-white'
            }`}>
              Three Powerful Tools
            </h2>
            <p className={`text-lg max-w-xl mx-auto ${settings.highContrast ? 'text-yellow-100' : 'text-white/50'}`}>
              Everything you need for Braille conversion, built into one platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={f.title}
                  {...fadeUp}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link
                    to={f.href}
                    className={`group block h-full p-7 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
                      settings.highContrast
                        ? 'border-yellow-400 hover:bg-yellow-400/10'
                        : `border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] hover:shadow-2xl hover:${f.glow}`
                    }`}
                  >
                    {!settings.highContrast && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    )}

                    {f.badge && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold mb-4 ${
                        settings.highContrast
                          ? 'bg-yellow-400 text-black'
                          : `bg-gradient-to-r ${f.gradient} text-white`
                      }`}>
                        {f.badge}
                      </span>
                    )}

                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={26} className="text-white" />
                    </div>

                    <h3 className={`text-xl font-black mb-3 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
                      {f.title}
                    </h3>
                    <p className={`text-sm leading-relaxed mb-5 ${settings.highContrast ? 'text-yellow-100' : 'text-white/50'}`}>
                      {f.desc}
                    </p>

                    <div className={`flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all ${
                      settings.highContrast ? 'text-yellow-400' : 'text-violet-400'
                    }`}>
                      Try Now <ArrowRight size={14} />
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Why BrailleAI ── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-black mb-4 ${
              settings.highContrast ? 'text-yellow-400' : 'text-white'
            }`}>
              Why Choose BrailleAI?
            </h2>
            <p className={`text-lg max-w-xl mx-auto ${settings.highContrast ? 'text-yellow-100' : 'text-white/50'}`}>
              Built for speed, accuracy, and accessibility.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyUs.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  {...fadeUp}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className={`p-6 rounded-2xl border transition-all ${
                    settings.highContrast
                      ? 'border-yellow-400 bg-yellow-400/5'
                      : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center mb-4">
                    <Icon size={22} className={settings.highContrast ? 'text-yellow-400' : 'text-violet-400'} />
                  </div>
                  <h4 className={`font-black text-base mb-2 ${settings.highContrast ? 'text-yellow-400' : 'text-white'}`}>
                    {item.title}
                  </h4>
                  <p className={`text-sm leading-relaxed ${settings.highContrast ? 'text-yellow-100' : 'text-white/50'}`}>
                    {item.desc}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            {...fadeUp}
            className={`relative rounded-3xl p-10 md:p-16 text-center overflow-hidden ${
              settings.highContrast
                ? 'border-4 border-yellow-400 bg-black'
                : 'border border-white/10'
            }`}
          >
            {!settings.highContrast && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-pink-600/10 to-cyan-600/20" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
              </>
            )}
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-violet-500/30">
                <Zap size={28} className="text-white" />
              </div>
              <h2 className={`text-4xl md:text-5xl font-black mb-4 ${
                settings.highContrast ? 'text-yellow-400' : 'text-white'
              }`}>
                Start for Free Today
              </h2>
              <p className={`text-lg mb-8 max-w-xl mx-auto ${settings.highContrast ? 'text-yellow-100' : 'text-white/60'}`}>
                No credit card required. Instant access. Join thousands making Braille accessible.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  to="/register"
                  className={`group flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-all ${
                    settings.highContrast
                      ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                      : 'bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:shadow-2xl hover:shadow-violet-500/40 hover:scale-105'
                  }`}
                >
                  Create Free Account
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/text-to-braille"
                  className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base border transition-all ${
                    settings.highContrast
                      ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400/20'
                      : 'border-white/15 text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Try Without Account
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}